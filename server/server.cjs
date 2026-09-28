require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
// In production, set ALLOWED_ORIGINS="https://yourdomain.com" in your .env
// Multiple origins: "https://yourdomain.com,https://www.yourdomain.com"
const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).concat(defaultOrigins)
  : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, same-origin Nginx proxy)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());

// ── Health check (Docker HEALTHCHECK + load balancers) ───────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ── Auth routes ──────────────────────────────────────────────────────────────
const authRoutes = require('./AuthRoutes');
app.use('/api/auth', authRoutes);

// ── Field service (PostgreSQL DB + reverse geocoding + JSON sync) ───────────
const fieldService = require('./fieldService');

// ── ML service base URL ───────────────────────────────────────────────────────
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml-service:8000';

// Configure multer for image uploads with plant name-based storage
const diseaseUploadDir = path.join(__dirname, 'crop_imgs', 'disease');
const diseaseResultsDir = path.join(__dirname, 'detect_results', 'disease');

// Ensure folders exist
if (!fs.existsSync(diseaseUploadDir)) fs.mkdirSync(diseaseUploadDir, { recursive: true });
if (!fs.existsSync(diseaseResultsDir)) fs.mkdirSync(diseaseResultsDir, { recursive: true });

// Multer diskStorage - use temporary filename first
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, diseaseUploadDir);
  },
  filename: (req, file, cb) => {
    // Use temporary filename with timestamp
    const tempName = `temp_${Date.now()}.png`;
    cb(null, tempName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Serve static files for detection results
app.use('/detect_results', express.static(path.join(__dirname, 'detect_results')));
app.use('/crop_imgs', express.static(path.join(__dirname, 'crop_imgs')));

// Serve crop recommendation output.json via API
app.get('/api/crop/output', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'crop_prediction', 'crop_data', 'output.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'output.json not found' });
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    return res.status(200).json(json);
  } catch (error) {
    console.error('Error serving /api/crop/output:', error);
    return res.status(500).json({ success: false, message: 'Failed to read output.json' });
  }
});

// Create directory for field coordinates if it doesn't exist
const fieldCoordsDir = path.join(__dirname, 'Field_co-ordinates');
if (!fs.existsSync(fieldCoordsDir)) {
  fs.mkdirSync(fieldCoordsDir, { recursive: true });
}

// Directory for disease detection results is already created above

// API endpoint for plant disease detection
app.post('/api/upload-disease-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Get plant name from request body
    const plantName = req.body.plantName || 'unknown_plant';
    const sanitizedPlantName = plantName.toLowerCase().replace(/\s+/g, '_');
    
    // Create the final filename with plant name
    const finalFilename = `${sanitizedPlantName}.png`;
    const finalPath = path.join(diseaseUploadDir, finalFilename);
    
    // Rename the temporary file to the plant name
    fs.renameSync(req.file.path, finalPath);
    
    console.log(`Image uploaded and renamed successfully: ${finalPath}`);

    // Create result filename with plant name
    const resultFilename = `${sanitizedPlantName}.png`;
    const resultImagePath = path.join(diseaseResultsDir, resultFilename);
    console.log(`[Disease] Image saved: ${finalFilename}, plant: ${plantName}`);

    // Call ML service
    let mlResult;
    try {
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(finalPath);
      formData.append('image', fileBuffer, { filename: finalFilename, contentType: 'image/png' });
      formData.append('plant_name', plantName);

      const axios = require('axios');
      
      const payloadBuffer = formData.getBuffer();
      const headers = formData.getHeaders();
      headers['Content-Length'] = payloadBuffer.length;

      const axiosConfig = {
        headers: headers,
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      };
      
      let mlResponse;
      try {
        mlResponse = await axios.post(`${ML_SERVICE_URL}/api/disease-detect`, payloadBuffer, axiosConfig);
      } catch (err) {
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'EAI_AGAIN') {
          console.log('[Disease] ML_SERVICE_URL failed, falling back to localhost:8000');
          mlResponse = await axios.post(`http://localhost:8000/api/disease-detect`, payloadBuffer, axiosConfig);
        } else {
          throw err;
        }
      }
      mlResult = mlResponse.data;
    } catch (mlErr) {
      console.error('[Disease] ML service error:', mlErr.message);
      return res.status(500).json({
        success: false,
        message: 'ML service is currently unavailable or failed to process the image: ' + mlErr.message
      });
    }

    if (!mlResult.success) {
      return res.status(500).json({
        success: false,
        message: mlResult.message || mlResult.error || 'ML model failed to analyze the image'
      });
    }

    // Simulate disease detection processing
    setTimeout(() => {
      try {
        // Copy uploaded image to result path as demo processed output
        fs.copyFileSync(finalPath, resultImagePath);
        console.log('Disease detection completed, result saved to:', resultImagePath);
      } catch (error) {
        console.error('Error creating result image:', error);
      }
    }, 1000);

    const mockDiseaseInfo = {
      name: 'Analysis Complete',
      description: 'The leaf image has been processed successfully. Check the result image for detailed analysis.',
      treatment: 'Based on the analysis, consider the following: 1) Ensure proper watering schedule, 2) Check for pest infestation, 3) Apply appropriate organic fungicides if needed, 4) Maintain proper soil nutrition levels.',
      confidence: '87%'
    };

    const isHealthy = topDetection ? topDetection.class.toLowerCase().includes('healthy') : true;

    // Load disease info from JSON if available
    let customDescription = null;
    let customTreatment = null;
    if (topDetection && !isHealthy) {
      try {
        const infoPath = path.join(__dirname, '../ml-service/crop_disease_info.json');
        if (fs.existsSync(infoPath)) {
          const diseaseData = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
          
          // Try exact match or case-insensitive match
          let plantData = diseaseData[plantName];
          if (!plantData) {
             const key = Object.keys(diseaseData).find(k => k.toLowerCase() === plantName.toLowerCase());
             if (key) plantData = diseaseData[key];
          }
          
          if (plantData) {
            let diseaseKey = topDetection.class;
            if (!plantData[diseaseKey]) {
              diseaseKey = Object.keys(plantData).find(k => k.toLowerCase() === topDetection.class.toLowerCase());
            }
            if (diseaseKey && plantData[diseaseKey]) {
              const info = plantData[diseaseKey];
              
              // Build description
              let descParts = [];
              const whatIsKey = Object.keys(info).find(k => k.startsWith('What is'));
              if (whatIsKey && info[whatIsKey]) {
                descParts.push(info[whatIsKey]);
              }
              if (info['Why & How this happen']) {
                descParts.push('Cause: ' + info['Why & How this happen']);
              }
              if (descParts.length > 0) {
                customDescription = descParts.join('\n\n');
              }
              
              // Build treatment
              let treatParts = [];
              if (info['Steps to cure'] && Array.isArray(info['Steps to cure'])) {
                treatParts.push('Steps to cure:\n' + info['Steps to cure'].join('\n'));
              }
              if (info['Recommended Pesticites/Fungicides/Bactericides/etc... '] && Array.isArray(info['Recommended Pesticites/Fungicides/Bactericides/etc... '])) {
                treatParts.push('Recommended Treatments:\n' + info['Recommended Pesticites/Fungicides/Bactericides/etc... '].join('\n'));
              }
              if (treatParts.length > 0) {
                customTreatment = treatParts.join('\n\n');
              }
            }
          }
        }
      } catch (e) {
        console.error('[Disease] Failed to load crop_disease_info.json:', e);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Image uploaded and analyzed successfully',
      diseaseInfo: mockDiseaseInfo,
      resultImagePath: `/detect_results/disease/${resultFilename}`,
      uploadedAs: finalFilename
      message: 'Disease detection completed',
      diseaseInfo: {
        name: topDetection && !isHealthy ? topDetection.class : 'No disease detected',
        description: customDescription 
          ? customDescription 
          : (topDetection && !isHealthy
              ? `Detected ${topDetection.class} in ${plantName} leaf with ${(topDetection.confidence * 100).toFixed(1)}% confidence.`
              : `No significant disease patterns were detected in the ${plantName} leaf image. The plant appears healthy.`),
        treatment: customTreatment 
          ? customTreatment 
          : (topDetection && !isHealthy
              ? `Disease "${topDetection.class}" detected. Consult an agricultural expert for specific treatment. General recommendations: 1) Isolate affected plants, 2) Remove infected leaves, 3) Apply appropriate fungicide/pesticide, 4) Improve air circulation.`
              : 'No treatment required. Continue regular care and monitoring.'),
        confidence: topDetection ? `${(topDetection.confidence * 100).toFixed(1)}%` : 'N/A',
      },
      detections: detections,
      totalDetections: mlResult.total_detections || 0,
      plant: plantName,
      imageUrl: `/crop_imgs/disease/${finalFilename}`,
    });

  } catch (error) {
    console.error('Error processing disease detection:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during disease detection: ' + error.message
    });
  }
});

// API endpoint for reverse geocoding coordinates to a precise place name
app.post('/api/fields/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng, coordinates } = req.body;
    let targetLat = lat;
    let targetLng = lng;

    if ((targetLat === undefined || targetLng === undefined) && Array.isArray(coordinates) && coordinates.length > 0) {
      const centroid = fieldService.calculateCentroid(coordinates);
      if (centroid) {
        targetLat = centroid.lat;
        targetLng = centroid.lng;
      }
    }

    if (targetLat === undefined || targetLng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat/lng or coordinates array is required'
      });
    }

    const geoResult = await fieldService.reverseGeocode(Number(targetLat), Number(targetLng));
    return res.status(200).json({
      success: true,
      location: geoResult.locationName,
      details: geoResult.details,
      coordinates: { lat: Number(targetLat), lng: Number(targetLng) }
    });
  } catch (error) {
    console.error('Error in reverse-geocode endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode location: ' + error.message
    });
  }
});

// API endpoint to save field coordinates
app.post('/api/fields', async (req, res) => {
  try {
    console.log('Received field data request:', req.body);
    const fieldData = req.body;
    
    // Validate required fields
    if (!fieldData.name || !fieldData.crop || !fieldData.coordinates || fieldData.coordinates.length < 3) {
      console.log('Validation failed:', { 
        name: !!fieldData.name, 
        crop: !!fieldData.crop,
        coordinates: fieldData.coordinates ? fieldData.coordinates.length : 0 
      });
      
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid field data. Name, crop, and at least 3 coordinates are required.' 
      });
    }
    
    if (!fieldData.id) {
      fieldData.id = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
    
    // Save via fieldService (handles precise reverse geocoding + DB & JSON file persistence)
    const savedField = await fieldService.saveField(fieldData);
    console.log('Field saved successfully with location:', savedField.location);
    
    return res.status(201).json({
      success: true,
      message: 'Field data saved successfully',
      field: savedField
    });
    
  } catch (error) {
    console.error('Error saving field data:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Server error while saving field data: ${error.message}`
    });
  }
});

// API endpoint to get all saved fields
app.get('/api/fields', async (req, res) => {
  try {
    const fields = await fieldService.getAllFields();
    return res.status(200).json({
      success: true,
      fields: fields
    });
  } catch (error) {
    console.error('Error getting fields:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while getting fields'
    });
  }
});

// API endpoint to get a specific field by ID
app.get('/api/fields/:id', async (req, res) => {
  try {
    const fieldId = req.params.id;
    const field = await fieldService.getFieldById(fieldId);
    
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      field: field
    });
  } catch (error) {
    console.error('Error getting field:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while getting field'
    });
  }
});

// Delete a field
app.delete('/api/fields/:id', async (req, res) => {
  try {
    const fieldId = req.params.id;
    await fieldService.deleteField(fieldId);
    return res.status(200).json({
      success: true,
      message: 'Field deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting field:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting field'
    });
  }
});

// API endpoint to update manipal.json with coordinates from a selected field
app.post('/api/update-manipal', async (req, res) => {
  try {
    const { fieldId } = req.body;
    console.log("from manipal route", req.body);
    if (!fieldId) {
      return res.status(400).json({
        success: false,
        message: 'Field ID is required'
      });
    }
    
    // Find the field
    const fieldData = await fieldService.getFieldById(fieldId);
    
    if (!fieldData) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }
    
    if (!fieldData.coordinates || fieldData.coordinates.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Field has invalid or insufficient coordinates'
      });
    }
    
    // Transform the coordinates to the required format for manipal.json
    // Format: { "1": [longitude, latitude], "2": [longitude, latitude], ... }
    const manipalCoordinates = {};
    
    fieldData.coordinates.forEach((coord, index) => {
      // The field has coordinates in { lat, lng } format
      // We need to convert to [longitude, latitude]
      manipalCoordinates[(index + 1).toString()] = [coord.lng, coord.lat];
    });
    
    // Write to manipal.json in the field_corrdinates folder
    const manipalPath = path.join(__dirname, 'field_corrdinates', 'manipal.json');
    fs.writeFileSync(manipalPath, JSON.stringify(manipalCoordinates, null, 2));
    
    return res.status(200).json({
      success: true,
      message: 'manipal.json updated successfully',
      coordinates: manipalCoordinates
    });
    
  } catch (error) {
    console.error('Error updating manipal.json:', error);
    return res.status(500).json({
      success: false,
      message: `Server error while updating manipal.json: ${error.message}`
    });
  }
});

// API endpoint to get soil and land data for a field
app.get('/api/soil/:fieldId', (req, res) => {
  try {
    const fieldId = req.params.fieldId;
    
    // Here we would typically fetch soil data from a database based on the field ID
    // For now, we'll generate realistic mock data with some randomness but consistency
    
    // Use the field ID as a seed for randomness to ensure the same field gets consistent data
    const fieldSeed = fieldId ? fieldId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Math.floor(Math.random() * 1000);
    const randomWithSeed = (min, max, seed = fieldSeed) => {
      const x = Math.sin(seed++) * 10000;
      const r = x - Math.floor(x);
      return min + (max - min) * r;
    };
    
    // Generate values based on the field seed
    const phValue = parseFloat((6.5 + randomWithSeed(-0.5, 1.0)).toFixed(1));
    const nitrogenValue = parseFloat((randomWithSeed(40, 60)).toFixed(1));
    const phosphorusValue = parseFloat((randomWithSeed(25, 40)).toFixed(1));
    const potassiumValue = parseFloat((randomWithSeed(150, 200)).toFixed(1));
    const organicMatterValue = parseFloat((randomWithSeed(2.0, 3.5)).toFixed(1));
    
    const soilData = {
      soilType: ['Clay Loam', 'Sandy Loam', 'Silt Loam', 'Loamy Sand', 'Clay'][Math.floor(randomWithSeed(0, 5))],
      ph: phValue,
      // Primary macronutrients (NPK)
      nitrogen: nitrogenValue,
      phosphorus: phosphorusValue,
      potassium: potassiumValue,
      // Secondary macronutrients
      calcium: parseFloat((randomWithSeed(1000, 1500)).toFixed(1)),
      magnesium: parseFloat((randomWithSeed(45, 65)).toFixed(1)),
      sulfur: parseFloat((randomWithSeed(10, 20)).toFixed(1)),
      // Micronutrients
      zinc: parseFloat((randomWithSeed(1, 3)).toFixed(1)),
      iron: parseFloat((randomWithSeed(15, 25)).toFixed(1)),
      manganese: parseFloat((randomWithSeed(5, 10)).toFixed(1)),
      copper: parseFloat((randomWithSeed(1, 2)).toFixed(1)),
      boron: parseFloat((randomWithSeed(0.5, 1.0)).toFixed(2)),
      molybdenum: parseFloat((randomWithSeed(0.1, 0.2)).toFixed(2)),
      // Physical properties
      organicMatter: organicMatterValue,
      cec: parseFloat((randomWithSeed(12, 17)).toFixed(1)), // Cation Exchange Capacity
      waterCapacity: parseFloat((randomWithSeed(0.15, 0.25)).toFixed(2)),
      soilTemperature: parseFloat((randomWithSeed(20, 25)).toFixed(1)),
      soilCompaction: parseFloat((randomWithSeed(1.1, 1.3)).toFixed(1)),
      // Soil composition
      sandPercentage: Math.floor(randomWithSeed(30, 40)),
      siltPercentage: Math.floor(randomWithSeed(35, 45)),
      clayPercentage: Math.floor(randomWithSeed(20, 30)),
      // Historical data
      history: [
        {
          date: '2025-02-15',
          ph: parseFloat((phValue - 0.2).toFixed(1)),
          organicMatter: parseFloat((organicMatterValue - 0.3).toFixed(1)),
          nitrogen: parseFloat((nitrogenValue - 5).toFixed(1))
        },
        {
          date: '2024-08-10',
          ph: parseFloat((phValue - 0.4).toFixed(1)),
          organicMatter: parseFloat((organicMatterValue - 0.6).toFixed(1)),
          nitrogen: parseFloat((nitrogenValue - 8).toFixed(1))
        }
      ],
      // Recommendations based on soil test
      recommendations: [
        {
          nutrient: 'Nitrogen',
          current: `${nitrogenValue} kg/ha`,
          recommendation: `Apply ${Math.max(0, Math.round(60 - nitrogenValue))} kg/ha of nitrogen-rich fertilizer before next planting`,
          fertilizers: ['Urea (46-0-0)', 'Ammonium Nitrate (34-0-0)']
        },
        {
          nutrient: 'Phosphorus',
          current: `${phosphorusValue} kg/ha`,
          recommendation: `Apply ${Math.max(0, Math.round(40 - phosphorusValue))} kg/ha of phosphatic fertilizer to improve root development`,
          fertilizers: ['Triple Superphosphate (0-46-0)', 'DAP (18-46-0)']
        },
        {
          nutrient: 'Potassium',
          current: `${potassiumValue} kg/ha`,
          recommendation: `Apply ${Math.max(0, Math.round(200 - potassiumValue))} kg/ha of potassium fertilizer for drought resistance`,
          fertilizers: ['Potassium Chloride (0-0-60)', 'Potassium Sulfate (0-0-50)']
        }
      ],
      // pH management
      phManagement: phValue < 5.5 ? {
        action: 'Increase pH',
        amount: '50 kg/ha',
        material: 'agricultural lime',
        benefit: 'Improve nutrient availability and microbial activity'
      } : phValue > 7.5 ? {
        action: 'Decrease pH',
        amount: '30 kg/ha',
        material: 'elemental sulfur',
        benefit: 'Improve nutrient availability, especially phosphorus and micronutrients'
      } : null,
      // Soil management practices
      managementPractices: [
        {
          practice: 'Apply Organic Matter',
          description: 'Add compost or manure to improve soil structure and water retention',
          priority: 'high',
          schedule: 'Fall 2025'
        },
        {
          practice: 'Implement Crop Rotation',
          description: 'Alternate different crop families to prevent nutrient depletion',
          priority: 'medium',
          schedule: 'Next planting season'
        },
        {
          practice: 'Use Cover Crops',
          description: 'Plant legumes or grasses during off-seasons to prevent erosion',
          priority: 'high',
          schedule: 'After harvest'
        }
      ],
      // Metadata
      lastUpdated: new Date().toISOString(),
      source: 'SmartAgri Soil Analysis API'
    };
    
    return res.status(200).json({
      success: true,
      data: soilData
    });
  } catch (error) {
    console.error('Error getting soil data:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting soil data'
    });
  }
});

const weatherapikey = process.env.OPENWEATHER_API_KEY;
// WeatherAPI.com key for historical weather data
const new_weather_api = process.env.WEATHER_API_KEY || '';

// Helper: generate an array of date strings between start and end (inclusive)
function getDatesBetween(start, end) {
  const dates = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

app.post("/api/weather-coordinates", async (req, res) => {
  try {
    const coordinates = req.body; 

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({ message: "Coordinates array is required" });
    }

    // Fetch weather data for each coordinate
    const weatherDataPromises = coordinates.map(async ({ lat, lng }) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weatherapikey}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();

      // Return only useful info
      return {
        simplified: {
          lat,
          lng,
          weather: data.weather[0].description,
          temperature: data.main.temp,
          feels_like: data.main.feels_like,
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
        },
        raw: data
      };      
    });

    const allWeatherData = await Promise.all(weatherDataPromises);
    res.status(200).json({
      success: true,
      data: allWeatherData,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching weather data",
    });
  }
});

// API endpoint: weather by location name (keeps API key on server)
app.post("/api/weather-location", async (req, res) => {
  try {
    const { location } = req.body || {};
    if (!location || typeof location !== 'string') {
      return res.status(400).json({ success: false, message: "location string is required" });
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherapikey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: data?.message || 'weather fetch failed' });
    }
    const simplified = {
      weather: data.weather?.[0]?.description,
      temperature: data.main?.temp,
      feels_like: data.main?.feels_like,
      humidity: data.main?.humidity,
      wind_speed: data.wind?.speed,
    };
    return res.status(200).json({ success: true, data: { simplified} });
  } catch (error) {
    console.error('Error fetching weather by location:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching weather by location' });
  }
});


app.get("/api/agri-news", async (req, res) => {
  console.log("📩 Incoming request:", req.query);

  try {
    const { state, type } = req.query;
    console.log("🔍 Fetching news for:", state, type);

    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${type}&country=in&language=en`
    );
    const data = await response.json();
    
    console.log("📰 Raw API response:", data);

    if (!data || data.status === "error") {
      return res.json({ status: "error", results: data });
    }

    return res.json({ status: "success", results: data });
  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }

});

app.get("/api/weather-for-farmer", async (req, res) => {
  try {
    const { lat, lng, start, end } = req.query; // GET uses req.query

    if (!lat || !lng || !start || !end) {
      return res.status(400).json({ error: "lat, lon, start, and end are required" });
    }

    const dates = getDatesBetween(start, end);
    const results = [];

    for (const date of dates) {
      const response = await fetch(
        `http://api.weatherapi.com/v1/history.json?key=${new_weather_api}&q=${lat},${lng}&dt=${date}`
      );
      const data = await response.json();

      if (data.forecast) {
        const day = data.forecast.forecastday[0].day;

        results.push({
          date,
          value: day.avgtemp_c, // simplified structure
          humidity: day.avghumidity,
          rainfall: day.totalprecip_mm,
        });
      }
    }
    console.log(results);
    res.json({
      temperature: results.map(r => ({ date: r.date, value: r.value })),
      humidity: results.map(r => ({ date: r.date, value: r.humidity })),
      rainfall: results.map(r => ({ date: r.date, value: r.rainfall })),
    });
  } catch (err) {
    console.error("Error fetching weather:", err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Serve static files from public directory for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

const traderRoutes = require('./TraderRoutes/Trader.js');

app.use("/api/trader", traderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
