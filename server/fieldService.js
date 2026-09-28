const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const fieldCoordsDir = path.join(__dirname, 'Field_co-ordinates');
if (!fs.existsSync(fieldCoordsDir)) {
  fs.mkdirSync(fieldCoordsDir, { recursive: true });
}

// Setup PostgreSQL pool if DATABASE_URL is present
let pool = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool in fieldService:', err.message);
  }
}

// Initialize database table
async function initDatabase() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS farm_fields (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(500) NOT NULL,
          crop VARCHAR(255),
          soil_color VARCHAR(150),
          coordinates JSONB,
          location_details JSONB,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE farm_fields ADD COLUMN IF NOT EXISTS soil_color VARCHAR(150);
      `);
      console.log('PostgreSQL: farm_fields table verified/created with soil_color column.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('PostgreSQL table init failed (operating in fallback file mode):', err.message);
  }
}

// Calculate centroid from array of coordinates
function calculateCentroid(points) {
  if (!Array.isArray(points) || points.length === 0) return null;
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  points.forEach(point => {
    let lat, lng;
    if (typeof point === 'object' && point !== null) {
      lat = Number(point.lat !== undefined ? point.lat : point[0]);
      lng = Number(point.lng !== undefined ? point.lng : point[1]);
    }
    if (!isNaN(lat) && !isNaN(lng)) {
      latSum += lat;
      lngSum += lng;
      count++;
    }
  });

  if (count === 0) return null;
  return { lat: latSum / count, lng: lngSum / count };
}

// Precise reverse geocoding from coordinates
async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return { locationName: '', details: {} };
  }

  // 1. Nominatim (OpenStreetMap) with zoom=18 for village/hamlet/subdistrict precision
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SmartAgri-ExFarmer/1.0 (agri-location@smartagri.farm)',
        'Accept-Language': 'en'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const locality = addr.village || addr.hamlet || addr.suburb || addr.town || addr.city || addr.neighbourhood || addr.road;
      const subdistrict = addr.county || addr.subdistrict;
      const district = addr.state_district || addr.district;
      const state = addr.state;

      const parts = [locality, district || subdistrict, state].filter(Boolean);
      const uniqueParts = [...new Set(parts)];
      if (uniqueParts.length > 0) {
        return {
          locationName: uniqueParts.join(', '),
          details: { ...addr, displayName: data.display_name }
        };
      }
      if (data.display_name) {
        const shortName = data.display_name.split(',').slice(0, 3).map(s => s.trim()).join(', ');
        return {
          locationName: shortName,
          details: addr
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode error:', err.message);
  }

  // 2. Fallback to BigDataCloud
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const bdcRes = await fetch(bdcUrl, { signal: AbortSignal.timeout(5000) });
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const parts = [
        bdcData.locality || bdcData.city,
        bdcData.principalSubdivision
      ].filter(Boolean);
      if (parts.length > 0) {
        return {
          locationName: parts.join(', '),
          details: bdcData
        };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode error:', err.message);
  }

  return {
    locationName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    details: {}
  };
}

// Save field to database (PostgreSQL + JSON filesystem)
async function saveField(fieldData) {
  // Ensure we have a valid centroid and precise location
  const centroid = calculateCentroid(fieldData.coordinates);
  
  // If location is missing or only raw numbers (e.g., "19.944, 80.925"), reverse-geocode
  const isRawCoordinates = !fieldData.location || /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(String(fieldData.location).trim());
  if (isRawCoordinates && centroid) {
    const geo = await reverseGeocode(centroid.lat, centroid.lng);
    if (geo.locationName) {
      fieldData.location = geo.locationName;
      fieldData.location_details = geo.details;
    }
  }

  // If still no location, use centroid coords
  if (!fieldData.location && centroid) {
    fieldData.location = `${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`;
  }

  // Ensure soil_color is formatted
  const soilColor = fieldData.soil_color || fieldData.soilColor || '';
  fieldData.soil_color = soilColor;
  fieldData.soilColor = soilColor;

  // 1. Write to JSON file in Field_co-ordinates
  const sanitizedName = (fieldData.name || 'field').replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
  const filename = `${sanitizedName}_${fieldData.id}.json`;
  const filePath = path.join(fieldCoordsDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(fieldData, null, 2));

  // 2. Write to PostgreSQL if database connection is available
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          INSERT INTO farm_fields (id, name, location, crop, soil_color, coordinates, location_details, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            location = EXCLUDED.location,
            crop = EXCLUDED.crop,
            soil_color = EXCLUDED.soil_color,
            coordinates = EXCLUDED.coordinates,
            location_details = EXCLUDED.location_details,
            updated_at = NOW();
        `, [
          String(fieldData.id),
          fieldData.name,
          fieldData.location,
          fieldData.crop || '',
          soilColor,
          JSON.stringify(fieldData.coordinates || []),
          JSON.stringify(fieldData.location_details || {}),
          fieldData.createdAt ? new Date(fieldData.createdAt) : new Date()
        ]);
        console.log(`Field ${fieldData.id} saved to PostgreSQL farm_fields successfully with soil_color: "${soilColor}".`);
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('Error saving field to PostgreSQL (saved to JSON file successfully):', err.message);
    }
  }

  return fieldData;
}

// Get all fields
async function getAllFields() {
  const fieldsMap = new Map();

  // 1. Read from PostgreSQL if available
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM farm_fields ORDER BY created_at DESC');
        result.rows.forEach(row => {
          fieldsMap.set(String(row.id), {
            id: row.id,
            name: row.name,
            location: row.location,
            crop: row.crop,
            soil_color: row.soil_color || '',
            soilColor: row.soil_color || '',
            coordinates: row.coordinates,
            location_details: row.location_details,
            createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString()
          });
        });
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('Error fetching fields from PostgreSQL, falling back to JSON files:', err.message);
    }
  }

  // 2. Read from JSON files and merge
  try {
    const files = fs.readdirSync(fieldCoordsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(fieldCoordsDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          if (data && data.id) {
            const key = String(data.id);
            if (!fieldsMap.has(key)) {
              fieldsMap.set(key, {
                ...data,
                soil_color: data.soil_color || data.soilColor || '',
                soilColor: data.soil_color || data.soilColor || ''
              });
            }
          }
        } catch (readErr) {
          console.error(`Error reading ${file}:`, readErr.message);
        }
      }
    }
  } catch (err) {
    console.error('Error reading field directory:', err.message);
  }

  return Array.from(fieldsMap.values());
}

// Get specific field by ID
async function getFieldById(fieldId) {
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM farm_fields WHERE id = $1', [String(fieldId)]);
        if (result.rows.length > 0) {
          const row = result.rows[0];
          return {
            id: row.id,
            name: row.name,
            location: row.location,
            crop: row.crop,
            soil_color: row.soil_color || '',
            soilColor: row.soil_color || '',
            coordinates: row.coordinates,
            location_details: row.location_details,
            createdAt: row.created_at ? row.created_at.toISOString() : new Date().toISOString()
          };
        }
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('Error getting field by ID from PostgreSQL:', err.message);
    }
  }

  // Fallback to files
  const files = fs.readdirSync(fieldCoordsDir);
  const fieldFile = files.find(file => file.includes(String(fieldId)) && file.endsWith('.json'));
  if (!fieldFile) return null;
  const filePath = path.join(fieldCoordsDir, fieldFile);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

// Delete field
async function deleteField(fieldId) {
  // Delete from PostgreSQL
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query('DELETE FROM farm_fields WHERE id = $1', [String(fieldId)]);
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('Error deleting field from PostgreSQL:', err.message);
    }
  }

  // Delete from filesystem
  const files = fs.readdirSync(fieldCoordsDir);
  const fieldFile = files.find(file => file.includes(String(fieldId)) && file.endsWith('.json'));
  if (fieldFile) {
    const filePath = path.join(fieldCoordsDir, fieldFile);
    fs.unlinkSync(filePath);
  }
}

// Run initial migration for existing JSON files without proper location names
async function autoMigrateLocations() {
  try {
    const files = fs.readdirSync(fieldCoordsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(fieldCoordsDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          const needsGeo = !data.location || 
            data.location === 'pune' || 
            /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(String(data.location).trim());
          
          if (needsGeo && Array.isArray(data.coordinates) && data.coordinates.length > 0) {
            const centroid = calculateCentroid(data.coordinates);
            if (centroid) {
              const geo = await reverseGeocode(centroid.lat, centroid.lng);
              if (geo.locationName && geo.locationName !== data.location) {
                console.log(`Auto-migrated location for ${data.name || file}: "${data.location}" -> "${geo.locationName}"`);
                data.location = geo.locationName;
                data.location_details = geo.details;
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                if (pool) {
                  await saveField(data);
                }
              }
            }
          } else if (pool && data && data.id) {
            // Ensure synced to DB
            await saveField(data);
          }
        } catch (e) {
          // ignore single file error
        }
      }
    }
  } catch (err) {
    console.warn('Auto-migration error:', err.message);
  }
}

// Auto initialize
initDatabase().then(() => {
  autoMigrateLocations();
});

module.exports = {
  reverseGeocode,
  calculateCentroid,
  saveField,
  getAllFields,
  getFieldById,
  deleteField,
  initDatabase,
  autoMigrateLocations
};