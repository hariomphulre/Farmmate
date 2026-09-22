import { parseCSV } from '../utils/dataUtils';
import { API_URLS } from '../config';
// This service fetches data from our APIs

// Function to fetch vegetation indices data
export const fetchVegetationIndices = async (indexName) => {
  try {
    // In a real application, this would be an API call
    // For now, we'll simulate loading a CSV file
    const response = await fetch(`/local_csv/${indexName}.csv`);
    const csvData = await response.text();
    return parseCSV(csvData);
  } catch (error) {
    console.error(`Error loading ${indexName} data:`, error);
    return [];
  }
};

// Backend-based weather fetch using centroid coordinates
export const fetchWeatherByCoordinates = async ({ lat, lng }) => {
  try {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('Invalid coordinates');
    }
    const response = await fetch(API_URLS.WEATHER_COORDINATES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ lat, lng }])
    });
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const json = await response.json();
    const first = Array.isArray(json?.data) ? json.data[0] : null;
    if (!first) return null;
    const raw = first.raw || {};
    const simplified = first.simplified || {};
    return {
      place: raw.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      country: raw.sys?.country || '',
      weather: simplified.weather,
      temperature: simplified.temperature,
      feels_like: simplified.feels_like,
      humidity: simplified.humidity,
      wind_speed: simplified.wind_speed,
    };
  } catch (error) {
    console.error('Weather fetch (coordinates) error:', error);
    return null;
  }
};

export const fetchWeatherByLocation = async (location) => {
  try {
    if (!location || typeof location !== 'string') return null;
    const response = await fetch(API_URLS.WEATHER_LOCATION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location })
    });
    if (!response.ok) return null;
    const json = await response.json();
    const payload = json?.data;
    if (!payload) return null;
    const raw = payload.raw || {};
    const simplified = payload.simplified || {};
    return {
      place: raw.name || location,
      country: raw.sys?.country || '',
      weather: simplified.weather,
      temperature: simplified.temperature,
      feels_like: simplified.feels_like,
      humidity: simplified.humidity,
      wind_speed: simplified.wind_speed,
    };
  } catch (error) {
    console.error('Weather fetch (location) error:', error);
    return null;
  }
};

export async function getWeatherByCoordinates(lat, lng, startDate, endDate) {
  try {
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new Error("Invalid coordinates");
    }

    const response = await fetch(
      `http://localhost:5000/api/weather-for-farmer?lat=${lat}&lng=${lng}&start=${startDate}&end=${endDate}`
    );    

    if (!response.ok) {
      throw new Error(`Weather API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("hello", data); // <-- this is the correct data object

    return {
      temperature: data.temperature || [],
      humidity: data.humidity || [],
      rainfall: data.rainfall || []
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      temperature: [],
      humidity: [],
      rainfall: []
    };
  }
}


// Function to fetch all fields
export const fetchFields = async () => {
  try {
    const response = await fetch(API_URLS.FIELDS);
    
    if (!response.ok) {
      throw new Error(`Error fetching fields: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.fields)) {
      throw new Error('Invalid response format');
    }
    
    return data.fields;
  } catch (error) {
    console.warn('API not available, using fallback field data:', error.message);
    
    // Return mock data when API is not available
    return [
      {
        id: 1,
        name: "North Field",
        crop: "Wheat",
        area: 5.2,
        status: "Active",
        lastIrrigated: "2025-09-07",
        soilMoisture: 68,
        coordinates: [
          { lat: 28.6139, lng: 77.2090 },
          { lat: 28.6149, lng: 77.2090 },
          { lat: 28.6149, lng: 77.2110 },
          { lat: 28.6139, lng: 77.2110 }
        ]
      },
      {
        id: 2,
        name: "South Field",
        crop: "Rice",
        area: 3.8,
        status: "Active",
        lastIrrigated: "2025-09-06",
        soilMoisture: 72,
        coordinates: [
          { lat: 28.6120, lng: 77.2090 },
          { lat: 28.6130, lng: 77.2090 },
          { lat: 28.6130, lng: 77.2110 },
          { lat: 28.6120, lng: 77.2110 }
        ]
      }
    ];
  }
};

// Function to fetch a specific field by ID
export const fetchFieldData = async (fieldId) => {
  try {
    const response = await fetch(`${API_URLS.FIELDS}/${fieldId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching field data: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.field) {
      throw new Error('Invalid response format');
    }
    
    // Calculate field size in acres from coordinates
    const fieldSize = calculateFieldArea(data.field.coordinates);
    
    // Add additional properties needed for the dashboard
    // Handle the field with crop data
    const crop = data.field.crop || 'Not specified';
    
    return {
      ...data.field,
      size: fieldSize.toFixed(2), // converted to acres
      crops: [crop], // Use the crop from the field data
      mainCrop: crop, // Add main crop directly for easy access
      soilType: 'Clay Loam',
      plantingDate: '2025-06-10',
      ndviHistory: [
        { date: '2025-07-15', value: 0.65 },
        { date: '2025-07-22', value: 0.68 },
        { date: '2025-07-29', value: 0.72 },
        { date: '2025-08-05', value: 0.75 },
        { date: '2025-08-12', value: 0.78 },
      ]
    };
  } catch (error) {
    console.warn('API not available for field update:', error.message);
    
    // Return mock success response when API is not available
    return {
      id: fieldId,
      name: `Field ${fieldId}`,
      size: 20, // acres
      location: 'Unknown',
      crop: 'Wheat', // Default crop
      crops: ['Wheat'],
      mainCrop: 'Wheat',
      soilType: 'Clay Loam',
      plantingDate: '2025-06-10',
      ndviHistory: [
        { date: '2025-07-15', value: 0.65 },
        { date: '2025-07-22', value: 0.68 },
        { date: '2025-07-29', value: 0.72 },
        { date: '2025-08-05', value: 0.75 },
        { date: '2025-08-12', value: 0.78 },
      ]
    };
  }
};

// Function to update manipal.json with coordinates from a selected field
export const updateManipalCoordinates = async (fieldId) => {
  try {
    if (!fieldId) {
      console.warn('Field ID is required to update manipal.json');
      return { success: false, message: 'Field ID is required' };
    }
    
    const response = await fetch(API_URLS.UPDATE_MANIPAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fieldId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error updating manipal.json: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to update manipal.json');
    }
    
    console.log('manipal.json updated successfully with coordinates for field:', fieldId);
    return data;
  } catch (error) {
    console.warn('API not available, using fallback for manipal.json update:', error.message);
    // Return success in offline mode to prevent error propagation
    return { 
      success: true, 
      message: 'API unavailable - manipal.json update skipped (offline mode)',
      offline: true 
    };
  }
};

// Helper function to calculate field area in acres from coordinates
function calculateFieldArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return 0;

  // Implementation of the Shoelace formula to calculate polygon area
  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i].lat * coordinates[j].lng;
    area -= coordinates[j].lat * coordinates[i].lng;
  }

  area = Math.abs(area) / 2;
  
  // Convert square degrees to hectares
  const degreeToMeter = 111319.9; // At equator, varies by latitude
  const squareMetersToHectares = 0.0001;
  const hectaresToAcres = 2.47105;
  
  return area * Math.pow(degreeToMeter, 2) * squareMetersToHectares * hectaresToAcres;
};
