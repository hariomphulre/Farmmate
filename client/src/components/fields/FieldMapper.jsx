import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faSave, faEraser, faExclamationTriangle, faSeedling } from '@fortawesome/free-solid-svg-icons';
import { API_URLS } from '../../config';
import googleMapsLoader from '../../utils/googleMapsLoader';
import './FieldMapper.css';

const FieldMapper = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldLocation, setFieldLocation] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [coordinates, setCoordinates] = useState([]);
  const [message, setMessage] = useState({ show: false, text: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [coordinatesforweather, setCoordinatesforweather] = useState([]);
  
  // List of major crops grown in India
  const cropOptions = [
    'Rice', 'Wheat', 'Maize', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)', 
    'Cotton', 'Sugarcane', 'Pulses', 'Groundnut', 'Mustard', 
    'Soybean', 'Sunflower', 'Jute', 'Coffee', 'Tea', 
    'Rubber', 'Tobacco', 'Onion', 'Potato', 'Tomato'
  ];



  // Initialize the Google Maps and drawing tools
  useEffect(() => {
    const loadMaps = async () => {
      try {
        await googleMapsLoader.loadGoogleMaps(['drawing', 'geometry']);
        initMap();
      } catch (error) {
        setMessage({
          show: true,
          text: "Failed to load Google Maps. Please check your internet connection.",
          type: 'error'
        });
      }
    };

    loadMaps();
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    
    // Check if Google Maps API is properly loaded
    if (!window.google || !window.google.maps) {
      setMessage({
        show: true,
        text: "Google Maps API not loaded properly. Please refresh the page.",
        type: 'error'
      });
      return;
    }
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 }, // Center on India
      zoom: 5,
      mapTypeId: 'hybrid',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });
    
    // Check if drawing library is loaded
    if (!window.google.maps.drawing || !window.google.maps.drawing.DrawingManager) {
      setMessage({
        show: true,
        text: "Google Maps Drawing library not loaded. Please refresh the page.",
        type: 'error'
      });
      return;
    }
    
    const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon']
      },
      polygonOptions: {
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.35,
        editable: true
      }
    });
    
    drawingManagerInstance.setMap(mapInstance);
    
    window.google.maps.event.addListener(
      drawingManagerInstance, 
      'polygoncomplete', 
      (polygon) => handlePolygonComplete(polygon)
    );
    
    setMap(mapInstance);
    setDrawingManager(drawingManagerInstance);
  };

  const handlePolygonComplete = (polygon) => {
    // Remove previous polygon if it exists
    if (currentPolygon) {
      currentPolygon.setMap(null);
    }
    
    setCurrentPolygon(polygon);
    
    // Turn off drawing mode
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
    
    // Get coordinates from polygon
    const coords = getPolygonCoordinates(polygon);
    setCoordinates(coords);
    setCoordinatesforweather(coords);
    // Auto-populate location from backend using centroid
    updateLocationFromBackend(coords);

    const updatePolygonStates = () => {
      const newCoords = getPolygonCoordinates(polygon);
      setCoordinates(newCoords);
      setCoordinatesforweather(newCoords);
      updateLocationFromBackend(newCoords);
    };
    
    window.google.maps.event.addListener(polygon.getPath(), 'set_at', updatePolygonStates);
    window.google.maps.event.addListener(polygon.getPath(), 'insert_at', updatePolygonStates);

  };

  const getPolygonCoordinates = (polygon) => {
    if (!polygon) return [];
    
    const path = polygon.getPath();
    const coords = [];
    
    path.forEach(latLng => {
      coords.push({ lat: latLng.lat(), lng: latLng.lng() });
    });
    
    return coords;
  };

  //get centrod by coordinates
  function getCentroid(points) {
    const n = points.length;
    let latSum = 0;
    let lngSum = 0;
  
    points.forEach(({ lat, lng }) => {
      latSum += lat;
      lngSum += lng;
    });
  
    return {
      lat: latSum / n,
      lng: lngSum / n
    };
  }
  
  // Fetch backend-derived location (e.g., nearest place name) using centroid
  const updateLocationFromBackend = async (points) => {
    try {
      if (!points || points.length === 0) return;
      const centroid = getCentroid(points);
      const res = await fetch(API_URLS.WEATHER_COORDINATES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([centroid])
      });
      const json = await res.json();
      if (res.ok && json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        const first = json.data[0];
        const backendName = first?.raw?.name;
        if (backendName && typeof backendName === 'string' && backendName.trim().length > 0) {
          setFieldLocation(backendName);
        } else {
          setFieldLocation(`${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`);
        }
      } else {
        setFieldLocation(`${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`);
      }
    } catch (err) {
      const centroid = getCentroid(points);
      setFieldLocation(`${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`);
    }
  };


  const handleClearAll = () => {
    if (currentPolygon) {
      currentPolygon.setMap(null);
      setCurrentPolygon(null);
    }
    
    setCoordinates([]);
    setFieldName('');
    setFieldLocation('');
    setSelectedCrop('');
    
    if (drawingManager) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
    
    setMessage({
      show: true,
      text: "Map cleared. You can draw a new field.",
      type: 'info'
    });
    
    // Auto-hide message after 3 seconds
    setTimeout(() => setMessage({ show: false, text: '', type: 'info' }), 3000);
  };

  const handleSaveField = async () => {
    // Validate input
    if (!fieldName.trim()) {
      setMessage({
        show: true,
        text: "Please enter a field name.",
        type: 'error'
      });
      return;
    }

    if (!fieldLocation.trim()) {
      setMessage({
        show: true,
        text: "Please enter a field location.",
        type: 'error'
      });
      return;
    }
    
    if (!selectedCrop) {
      setMessage({
        show: true,
        text: "Please select a crop for this field.",
        type: 'error'
      });
      return;
    }
    
    if (!coordinates || coordinates.length < 3) {
      setMessage({
        show: true,
        text: "Please draw a polygon with at least 3 points.",
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate a unique ID using timestamp + random
      const fieldId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Create field data object
      const fieldData = {
        id: fieldId,
        name: fieldName,
        location: fieldLocation,
        crop: selectedCrop,
        coordinates: coordinates,
        createdAt: new Date().toISOString()
      };
      
      console.log('Sending field data to server:', fieldData);
      console.log("this are weather coordinates", coordinatesforweather)
      // Save to server
      const response = await fetch(API_URLS.FIELDS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fieldData),
      });
      
      const centroid = getCentroid(coordinatesforweather);
      const response2 = await fetch(API_URLS.WEATHER_COORDINATES,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([centroid])
      })
      
      const responseText = await response.text();
      console.log('Server response:', response.status, responseText);

      const responseText2 = await response2.text();
      console.log('Server response:', response2.status, responseText2);
      
      let result;
      try {
        // Try to parse as JSON
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        result = { success: false, message: 'Invalid server response' };
      }
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save field data');
      }
      
      // Also update manipal.json with the new field coordinates
      try {
        console.log('Updating manipal.json with field ID:', fieldId);
        const manipalResponse = await fetch(API_URLS.UPDATE_MANIPAL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fieldId }),
        });
        
        if (manipalResponse.ok) {
          const manipalResult = await manipalResponse.json();
          console.log('manipal.json updated successfully:', manipalResult);
        } else {
          console.warn('Failed to update manipal.json, but field was saved successfully');
        }
      } catch (manipalError) {
        console.warn('Error updating manipal.json (field still saved):', manipalError);
      }
      
      setMessage({
        show: true,
        text: `Field "${fieldName}" saved successfully!`,
        type: 'success'
      });
      
      // Clear form after successful save
      handleClearAll();
      
    } catch (error) {
      console.error('Error saving field:', error);
      setMessage({
        show: true,
        text: `Error: ${error.message}. Please try again.`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="field-mapper">
      <div className="field-mapper-header">
        <h2>
          <FontAwesomeIcon icon={faMap} className="mr-2" />
          Plot New Field
        </h2>
        <p>Draw a polygon on the map to mark a new field and save it with a unique name.</p>
      </div>
      
      <div className="field-mapper-container">
        <div 
          ref={mapRef} 
          className="map-container"
          style={{ height: '500px', width: '100%' }}
        ></div>
        
        <div className="field-details">
          <h3>Field Details</h3>
          
          <div className="field-form">
            <div className="form-group">
              <label htmlFor="fieldNameInput">Field Name</label>
              <input 
                type="text" 
                id="fieldNameInput" 
                className="form-control"
                placeholder="Enter Field Name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="fieldLocation">Location</label>
              <input 
                type="text" 
                id="fieldLocation" 
                className="form-control"
                placeholder="Field Location"
                value={fieldLocation}
                onChange={(e) => setFieldLocation(e.target.value)}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="cropSelect" className="flex items-center">
                <FontAwesomeIcon icon={faSeedling} className="mr-2 text-green-600" />
                Select Crop
              </label>
              <select
                id="cropSelect"
                className="form-control"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Select Crop --</option>
                {cropOptions.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Select the crop you are planning to grow in this field
              </div>
            </div>
          </div>
          
          {coordinates.length > 0 && (
            <div className="coordinates-table">
              <h4>Coordinates</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Point</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinates.map((point, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{point.lat.toFixed(6)}</td>
                        <td>{point.lng.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="button-group">
            <button 
              className="btn btn-save" 
              onClick={handleSaveField}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {loading ? 'Saving...' : 'Save'}
            </button>
            
            <button 
              className="btn btn-clear" 
              onClick={handleClearAll}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faEraser} className="mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {message.show && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'error' && (
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          )}
          {message.text}
          <button 
            className="alert-close" 
            onClick={() => setMessage({ show: false, text: '', type: 'info' })}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default FieldMapper;
