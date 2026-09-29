import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMap, 
  faSave, 
  faEraser, 
  faExclamationTriangle, 
  faSeedling, 
  faLocationDot, 
  faSpinner, 
  faSearch, 
  faCrosshairs, 
  faDrawPolygon, 
  faPalette, 
  faCheckCircle,
  faRulerCombined,
  faInfoCircle,
  faCheck,
  faEye,
  faEyeSlash,
  faUndo,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { API_URLS } from '../../config';
import { useAppContext } from '../../context/AppContext';
import googleMapsLoader from '../../utils/googleMapsLoader';
import './FieldMapper.css';

// 14 Official soil colors and associated soil types from crop_recommendation_dataset.csv
export const DATASET_SOIL_COLORS = [
  { color: 'Black', hex: '#1C1917', soilType: 'Black Soil (Regur)', desc: 'Kali Mitti — Cotton, Chickpea, Pigeonpeas' },
  { color: 'Dark Brown', hex: '#452C1E', soilType: 'Forest / Mountain Soil', desc: 'Humus rich — Maize, Apple, Coffee' },
  { color: 'Brown', hex: '#6E472B', soilType: 'Loamy Soil', desc: 'Balanced Loam — Maize, Chickpea, Mungbean' },
  { color: 'Light Brown', hex: '#B88A64', soilType: 'Sandy Loam Soil', desc: 'Sandy Loam — Maize, Grapes, Papaya' },
  { color: 'Red', hex: '#B91C1C', soilType: 'Red Soil', desc: 'Iron oxide — Chickpea, Kidneybeans, Millets' },
  { color: 'Reddish Brown', hex: '#88301B', soilType: 'Laterite Soil', desc: 'Laterite — Coconut, Mango, Coffee' },
  { color: 'Reddish Yellow', hex: '#D97746', soilType: 'Red & Yellow Soil', desc: 'Porous — Rice, Mothbeans, Pigeonpeas' },
  { color: 'Yellowish Brown', hex: '#B58532', soilType: 'Arid / Desert Soil', desc: 'Arid — Lentil, Mothbeans' },
  { color: 'Pale Yellow', hex: '#E4CE88', soilType: 'Sandy Soil', desc: 'Sandy — Watermelon, Muskmelon, Mungbean' },
  { color: 'Dark Grey', hex: '#4B5563', soilType: 'Clayey Soil', desc: 'Clayey — Rice, Wetland Paddy' },
  { color: 'Light Grey', hex: '#9CA3AF', soilType: 'Alluvial Soil', desc: 'River Alluvium — Rice, Maize, Chickpea' },
  { color: 'Greyish Black', hex: '#33383F', soilType: 'Black & Alluvial Soil', desc: 'Heavy Alluvial — Chickpea, Cotton' },
  { color: 'Greyish Brown', hex: '#625950', soilType: 'Clay Loam Soil', desc: 'Clay Loam — Pigeonpeas, Pulses' },
  { color: 'Blackish Brown', hex: '#261E1A', soilType: 'Peaty / Marshy Soil', desc: 'Peaty / Marshy — Rice' },
];

export const getSoilHex = (colorName) => {
  if (!colorName) return '#16a34a';
  const match = DATASET_SOIL_COLORS.find(
    s => s.color.toLowerCase() === String(colorName).trim().toLowerCase()
  );
  return match ? match.hex : '#16a34a';
};

const FieldMapper = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const currentPolygonRef = useRef(null);
  const previewPolygonRef = useRef(null);
  const drawMarkersRef = useRef([]);
  const drawPointsRef = useRef([]);
  const existingPolygonsRef = useRef([]);
  const activeInfoWindowRef = useRef(null);
  const activeSoilRef = useRef(DATASET_SOIL_COLORS[0]);
  const isDrawingModeRef = useRef(false);
  const initialBoundsFittedRef = useRef(false);

  const [map, setMap] = useState(null);
  const [currentPolygon, setCurrentPolygon] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showExistingFields, setShowExistingFields] = useState(true);
  const [fieldName, setFieldName] = useState('');
  const [fieldLocation, setFieldLocation] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSoilColor, setSelectedSoilColor] = useState(DATASET_SOIL_COLORS[0].color);
  const [coordinates, setCoordinates] = useState([]);
  const [fieldArea, setFieldArea] = useState({ acres: '0.00', hectares: '0.00' });
  const [message, setMessage] = useState({ show: false, text: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingPlace, setSearchingPlace] = useState(false);

  const { fields = [], refreshFields, setSelectedField, setSelectedLocation } = useAppContext() || {};

  // Active soil object
  const activeSoil = DATASET_SOIL_COLORS.find(s => s.color === selectedSoilColor) || DATASET_SOIL_COLORS[0];
  activeSoilRef.current = activeSoil;

  // Crops list including official dataset crops
  const cropOptions = [
    'Rice', 'Wheat', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 
    'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate', 
    'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon', 'Apple', 
    'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee',
    'Sugarcane', 'Groundnut', 'Mustard', 'Soybean', 'Sunflower', 
    'Tea', 'Onion', 'Potato', 'Tomato'
  ];

  // Compute polygon area in acres and hectares
  const calculateArea = (coords) => {
    if (!coords || coords.length < 3) return { acres: '0.00', hectares: '0.00' };

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i].lat * coords[j].lng;
      area -= coords[j].lat * coords[i].lng;
    }
    area = Math.abs(area) / 2;

    const degreeToMeter = 111319.9;
    const squareMeters = area * Math.pow(degreeToMeter, 2);
    const hectares = (squareMeters * 0.0001).toFixed(2);
    const acres = (squareMeters * 0.000247105).toFixed(2);

    return { acres, hectares };
  };

  const getCentroid = (points) => {
    if (!points || points.length === 0) return { lat: 20.5937, lng: 78.9629 };
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

  // Reverse geocode to get precise place name
  const updateLocationFromBackend = async (points) => {
    try {
      if (!points || points.length === 0) return;
      setIsGeocoding(true);
      const centroid = getCentroid(points);
      
      // Use OpenStreetMap Nominatim with zoom=18 (street/building level) for maximum precision
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${centroid.lat}&lon=${centroid.lng}&zoom=18&addressdetails=1`, {
        headers: {
          'User-Agent': 'SmartAgri-ExFarmer/1.0',
          'Accept-Language': 'en'
        }
      });
      
      const json = await res.json();
      if (res.ok && json && json.display_name) {
        // Use the full precise display name provided by Nominatim
        // It usually includes street, locality, district, state, and pin code
        // We'll strip the country (usually the last comma-separated item) for better readability
        let preciseLocation = json.display_name;
        const parts = preciseLocation.split(', ');
        if (parts.length > 1) {
          parts.pop(); // Remove country
          preciseLocation = parts.join(', ');
        }
        setFieldLocation(preciseLocation);
      } else {
        setFieldLocation(`${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`);
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
      if (points && points.length > 0) {
        const centroid = getCentroid(points);
        setFieldLocation(`${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`);
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Clear temporary marker pins used during click-to-draw mode
  const clearTempMarkers = () => {
    drawMarkersRef.current.forEach(m => m.setMap(null));
    drawMarkersRef.current = [];
  };

  // Clear all drawing points and preview overlay
  const clearDrawingPoints = () => {
    clearTempMarkers();
    if (previewPolygonRef.current) {
      previewPolygonRef.current.setMap(null);
      previewPolygonRef.current = null;
    }
    drawPointsRef.current = [];
  };

  // Plot all existing fields from database on the map
  const plotExistingFields = useCallback((mapInstance, fieldsList, showFields) => {
    // Clear previously plotted polygons and labels
    existingPolygonsRef.current.forEach(item => {
      if (item.polygon) item.polygon.setMap(null);
      if (item.marker) item.marker.setMap(null);
      if (item.infoWindow) item.infoWindow.close();
    });
    existingPolygonsRef.current = [];

    if (!mapInstance || !window.google?.maps || !Array.isArray(fieldsList) || fieldsList.length === 0) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    let validFieldCount = 0;

    fieldsList.forEach((field) => {
      if (!Array.isArray(field.coordinates) || field.coordinates.length < 3) return;

      const validCoords = [];
      field.coordinates.forEach(c => {
        const lat = typeof c.lat === 'number' ? c.lat : parseFloat(c.lat);
        const lng = typeof c.lng === 'number' ? c.lng : parseFloat(c.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          validCoords.push({ lat, lng });
          bounds.extend(new window.google.maps.LatLng(lat, lng));
        }
      });

      if (validCoords.length < 3) return;
      validFieldCount++;

      const soilHex = getSoilHex(field.soil_color || field.soilColor);

      // Create existing field polygon
      const polygon = new window.google.maps.Polygon({
        paths: validCoords,
        map: showFields ? mapInstance : null,
        strokeColor: '#15803d',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: soilHex,
        fillOpacity: 0.28,
        zIndex: 2,
        clickable: true
      });

      // Centroid for label
      const centroid = getCentroid(validCoords);

      // Centroid label marker
      const marker = new window.google.maps.Marker({
        position: centroid,
        map: showFields ? mapInstance : null,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 4,
          fillColor: '#15803d',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1.5
        },
        label: {
          text: field.name || 'Field',
          color: '#14532d',
          fontSize: '11px',
          fontWeight: '700'
        },
        title: `${field.name} (${field.crop || 'Field'})`
      });

      const infoContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px 8px; min-width: 190px; color: #1f2937;">
          <div style="font-weight: 700; font-size: 14px; color: #15803d; border-bottom: 1.5px solid #dcfce7; padding-bottom: 4px; margin-bottom: 6px;">
            🌾 ${field.name}
          </div>
          <div style="font-size: 12px; margin-bottom: 3px;">
            <strong style="color: #4b5563;">Crop:</strong> <span style="font-weight: 600; color: #111827;">${field.crop || 'N/A'}</span>
          </div>
          <div style="font-size: 12px; margin-bottom: 3px;">
            <strong style="color: #4b5563;">Location:</strong> ${field.location || 'N/A'}
          </div>
          <div style="font-size: 12px; margin-bottom: 3px; display: flex; align-items: center; gap: 4px;">
            <strong style="color: #4b5563;">Soil:</strong> 
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${soilHex}; border:1px solid #9ca3af;"></span>
            <span>${field.soil_color || field.soilColor || 'Standard'}</span>
          </div>
          <div style="font-size: 12px;">
            <strong style="color: #4b5563;">Area:</strong> <span style="color: #166534; font-weight: 600;">${field.area ? field.area + ' Acres' : 'N/A'}</span>
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      });

      const openInfoWindow = (e) => {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }
        infoWindow.setPosition(e?.latLng || centroid);
        infoWindow.open(mapInstance);
        activeInfoWindowRef.current = infoWindow;
      };

      polygon.addListener('click', openInfoWindow);
      marker.addListener('click', openInfoWindow);

      existingPolygonsRef.current.push({
        id: field.id,
        polygon,
        marker,
        infoWindow
      });
    });

    // Auto-fit bounds once on initial load if fields exist
    if (!initialBoundsFittedRef.current && validFieldCount > 0 && mapInstance) {
      initialBoundsFittedRef.current = true;
      mapInstance.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      const listener = window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > 17) {
          mapInstance.setZoom(17);
        }
      });
    }
  }, []);

  // Initialize Google Maps and Drawing Manager
  useEffect(() => {
    let isMounted = true;

    const loadMaps = async () => {
      try {
        await googleMapsLoader.loadGoogleMaps(['drawing', 'geometry', 'places']);
        if (isMounted) {
          initMap();
        }
      } catch (error) {
        if (isMounted) {
          setMessage({
            show: true,
            text: "Failed to load Google Maps. Please check your internet connection.",
            type: 'error'
          });
        }
      }
    };

    loadMaps();

    return () => {
      isMounted = false;
      clearDrawingPoints();
      if (currentPolygonRef.current) {
        currentPolygonRef.current.setMap(null);
      }
    };
  }, []);

  // Update existing fields on map when fields context changes or map becomes ready
  useEffect(() => {
    if (mapInstanceRef.current && window.google?.maps) {
      plotExistingFields(mapInstanceRef.current, fields, showExistingFields);
    }
  }, [map, fields, showExistingFields, plotExistingFields]);

  // Update active polygon fill color when soil color changes
  useEffect(() => {
    const currentHex = activeSoil.hex || '#16a34a';
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setOptions({
        fillColor: currentHex
      });
    }
    if (previewPolygonRef.current) {
      previewPolygonRef.current.setOptions({
        fillColor: currentHex
      });
    }
  }, [activeSoil]);

  // Initialize Map
  const initMap = () => {
    if (!mapRef.current) return;
    
    if (!window.google || !window.google.maps) {
      setMessage({
        show: true,
        text: "Google Maps API not loaded properly. Please refresh the page.",
        type: 'error'
      });
      return;
    }
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 }, // Center on India initially
      zoom: 5,
      mapTypeId: 'hybrid',
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      streetViewControl: false,
      fullscreenControl: false
    });
    
    mapInstanceRef.current = mapInstance;
    setMap(mapInstance);

    // Map Click Listener for Direct Vertex Placement
    mapInstance.addListener('click', handleMapClick);

    // Initialize Google Maps DrawingManager if library is available
    if (window.google.maps.drawing && window.google.maps.drawing.DrawingManager) {
      const dm = new window.google.maps.drawing.DrawingManager({
        drawingMode: null, // inactive until user activates
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['polygon']
        },
        polygonOptions: {
          strokeColor: '#15803d',
          strokeOpacity: 0.95,
          strokeWeight: 2.5,
          fillColor: activeSoilRef.current.hex || '#16a34a',
          fillOpacity: 0.35,
          editable: true,
          zIndex: 10
        }
      });
      
      dm.setMap(mapInstance);
      drawingManagerRef.current = dm;

      window.google.maps.event.addListener(dm, 'polygoncomplete', (polygon) => {
        handlePolygonComplete(polygon);
      });
    }

    // Plot initial fields if already loaded
    if (fields.length > 0) {
      plotExistingFields(mapInstance, fields, true);
    }
  };

  // Map Click Handler: interactive boundary point placement
  const handleMapClick = (e) => {
    if (!isDrawingModeRef.current || !mapInstanceRef.current) return;

    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    drawPointsRef.current.push(latLng);

    const pointIndex = drawPointsRef.current.length;

    // Create a draggable numbered vertex marker
    const marker = new window.google.maps.Marker({
      position: latLng,
      map: mapInstanceRef.current,
      draggable: true,
      label: {
        text: String(pointIndex),
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 'bold'
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: pointIndex === 1 ? '#dc2626' : '#15803d',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      title: pointIndex === 1 ? 'Point 1: Click here or "Complete Boundary" when done' : `Vertex #${pointIndex} (Drag to adjust)`,
      zIndex: 25
    });

    // Clicking point 1 when >= 3 points completes boundary
    marker.addListener('click', () => {
      if (pointIndex === 1 && drawPointsRef.current.length >= 3) {
        completeBoundary();
      }
    });

    // Dragging marker updates vertex position and preview in real time
    marker.addListener('drag', () => {
      const newPos = marker.getPosition();
      drawPointsRef.current[pointIndex - 1] = { lat: newPos.lat(), lng: newPos.lng() };
      if (previewPolygonRef.current) {
        previewPolygonRef.current.setPaths([...drawPointsRef.current]);
      }
      const updated = [...drawPointsRef.current];
      setCoordinates(updated);
      setFieldArea(calculateArea(updated));
    });

    drawMarkersRef.current.push(marker);

    // Update / create live preview polygon
    if (drawPointsRef.current.length >= 3) {
      if (!previewPolygonRef.current) {
        previewPolygonRef.current = new window.google.maps.Polygon({
          paths: [...drawPointsRef.current],
          map: mapInstanceRef.current,
          strokeColor: '#15803d',
          strokeOpacity: 0.95,
          strokeWeight: 2.5,
          fillColor: activeSoilRef.current.hex || '#16a34a',
          fillOpacity: 0.35,
          zIndex: 10
        });
      } else {
        previewPolygonRef.current.setPaths([...drawPointsRef.current]);
      }
    }

    const currentPoints = [...drawPointsRef.current];
    setCoordinates(currentPoints);
    setFieldArea(calculateArea(currentPoints));
  };

  // Complete Boundary and convert into final editable polygon
  const completeBoundary = () => {
    const pts = [...drawPointsRef.current];
    if (pts.length < 3) {
      setMessage({
        show: true,
        text: "Please click on the map to place at least 3 boundary vertices before completing.",
        type: 'error'
      });
      return;
    }

    // Clean up temporary markers & preview
    clearTempMarkers();
    if (previewPolygonRef.current) {
      previewPolygonRef.current.setMap(null);
      previewPolygonRef.current = null;
    }

    // Create finalized editable polygon
    const polygon = new window.google.maps.Polygon({
      paths: pts,
      map: mapInstanceRef.current,
      strokeColor: '#15803d',
      strokeOpacity: 0.95,
      strokeWeight: 2.5,
      fillColor: activeSoilRef.current.hex || '#16a34a',
      fillOpacity: 0.35,
      editable: true,
      zIndex: 10
    });

    currentPolygonRef.current = polygon;
    setCurrentPolygon(polygon);

    // Turn off drawing mode
    setIsDrawingMode(false);
    isDrawingModeRef.current = false;
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }

    // Update states
    setCoordinates(pts);
    const area = calculateArea(pts);
    setFieldArea(area);
    updateLocationFromBackend(pts);

    // Attach path listeners so dragging vertices on final polygon updates coordinates & area
    const path = polygon.getPath();
    const onPathChange = () => {
      const newCoords = getPolygonCoordinates(polygon);
      drawPointsRef.current = newCoords;
      setCoordinates(newCoords);
      setFieldArea(calculateArea(newCoords));
      updateLocationFromBackend(newCoords);
    };

    path.addListener('set_at', onPathChange);
    path.addListener('insert_at', onPathChange);
    path.addListener('remove_at', onPathChange);

    setMessage({
      show: true,
      text: `Boundary completed! Plotted ${pts.length} vertices (${area.acres} Acres). Location auto-detected.`,
      type: 'success'
    });
  };

  // Handle polygon completion from Google Maps native DrawingManager
  const handlePolygonComplete = (polygon) => {
    clearTempMarkers();
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
    }
    if (previewPolygonRef.current) {
      previewPolygonRef.current.setMap(null);
      previewPolygonRef.current = null;
    }

    polygon.setOptions({
      strokeColor: '#15803d',
      strokeOpacity: 0.95,
      strokeWeight: 2.5,
      fillColor: activeSoilRef.current.hex || '#16a34a',
      fillOpacity: 0.35,
      editable: true,
      zIndex: 10
    });

    currentPolygonRef.current = polygon;
    setCurrentPolygon(polygon);
    setIsDrawingMode(false);
    isDrawingModeRef.current = false;

    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }

    const coords = getPolygonCoordinates(polygon);
    drawPointsRef.current = coords;
    setCoordinates(coords);
    const area = calculateArea(coords);
    setFieldArea(area);
    updateLocationFromBackend(coords);

    const onPathChange = () => {
      const newCoords = getPolygonCoordinates(polygon);
      drawPointsRef.current = newCoords;
      setCoordinates(newCoords);
      setFieldArea(calculateArea(newCoords));
      updateLocationFromBackend(newCoords);
    };

    const path = polygon.getPath();
    path.addListener('set_at', onPathChange);
    path.addListener('insert_at', onPathChange);
    path.addListener('remove_at', onPathChange);

    setMessage({
      show: true,
      text: `Boundary completed! (${area.acres} Acres). Location auto-detected.`,
      type: 'success'
    });
  };

  // Toggle or start drawing mode
  const handleToggleDrawingMode = () => {
    if (isDrawingMode) {
      // If already drawing and has points, complete boundary
      if (drawPointsRef.current.length >= 3) {
        completeBoundary();
      } else {
        // Cancel drawing mode
        clearDrawingPoints();
        setIsDrawingMode(false);
        isDrawingModeRef.current = false;
        if (drawingManagerRef.current) {
          drawingManagerRef.current.setDrawingMode(null);
        }
        setMessage({
          show: true,
          text: "Boundary drawing canceled.",
          type: 'info'
        });
        setTimeout(() => setMessage({ show: false, text: '', type: 'info' }), 2500);
      }
    } else {
      // Start fresh drawing mode
      if (currentPolygonRef.current) {
        currentPolygonRef.current.setMap(null);
        currentPolygonRef.current = null;
        setCurrentPolygon(null);
      }
      clearDrawingPoints();
      setCoordinates([]);
      setFieldArea({ acres: '0.00', hectares: '0.00' });

      setIsDrawingMode(true);
      isDrawingModeRef.current = true;

      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      }

      setMessage({
        show: true,
        text: "Boundary drawing active! Click anywhere on the map to drop boundary points. Click point #1 or 'Complete Boundary' when finished.",
        type: 'info'
      });
    }
  };

  // Undo last drawn point
  const handleUndoPoint = () => {
    if (drawPointsRef.current.length === 0) return;

    // Pop coordinate
    drawPointsRef.current.pop();

    // Pop marker
    const lastMarker = drawMarkersRef.current.pop();
    if (lastMarker) {
      lastMarker.setMap(null);
    }

    // Update preview polygon
    if (previewPolygonRef.current) {
      if (drawPointsRef.current.length >= 3) {
        previewPolygonRef.current.setPaths([...drawPointsRef.current]);
      } else {
        previewPolygonRef.current.setMap(null);
        previewPolygonRef.current = null;
      }
    }

    const updated = [...drawPointsRef.current];
    setCoordinates(updated);
    setFieldArea(calculateArea(updated));
  };

  // Toggle existing fields visibility
  const handleToggleExistingFields = () => {
    const nextState = !showExistingFields;
    setShowExistingFields(nextState);
    existingPolygonsRef.current.forEach(item => {
      if (item.polygon) item.polygon.setMap(nextState ? mapInstanceRef.current : null);
      if (item.marker) item.marker.setMap(nextState ? mapInstanceRef.current : null);
    });
  };

  // Place search on map
  const handleSearchPlace = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    setSearchingPlace(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, 
        {
          headers: { 'User-Agent': 'SmartAgri-ExFarmer/1.0', 'Accept-Language': 'en' },
          signal: AbortSignal.timeout(6000)
        }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        mapInstanceRef.current.setCenter({ lat, lng: lon });
        mapInstanceRef.current.setZoom(16);
      } else {
        setMessage({
          show: true,
          text: `Could not locate "${searchQuery}". Please specify state/district.`,
          type: 'info'
        });
      }
    } catch (err) {
      console.warn('Place search error:', err);
    } finally {
      setSearchingPlace(false);
    }
  };

  // Locate current GPS position
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setMessage({ show: true, text: "Geolocation is not supported by your browser.", type: 'error' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
          mapInstanceRef.current.setZoom(17);
        }
      },
      (err) => {
        setMessage({ show: true, text: `Could not get current location: ${err.message}`, type: 'error' });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Clear all
  const handleClearAll = () => {
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
      currentPolygonRef.current = null;
      setCurrentPolygon(null);
    }
    clearDrawingPoints();
    setIsDrawingMode(false);
    isDrawingModeRef.current = false;
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }
    
    setCoordinates([]);
    setFieldArea({ acres: '0.00', hectares: '0.00' });
    setFieldName('');
    setFieldLocation('');
    setSelectedCrop('');
    
    setMessage({
      show: true,
      text: "Form and plotted boundary cleared. You can draw a new field.",
      type: 'info'
    });
    
    setTimeout(() => setMessage({ show: false, text: '', type: 'info' }), 3000);
  };

  // Save Field to Database
  const handleSaveField = async () => {
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
        text: "Please enter or identify a field location.",
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
        text: "Please plot a boundary polygon with at least 3 points on the map.",
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const fieldId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Store exact dataset soil_color string for ML model compatibility
      const fieldData = {
        id: fieldId,
        name: fieldName.trim(),
        location: fieldLocation.trim(),
        crop: selectedCrop,
        soil_color: activeSoil.color,
        soilColor: activeSoil.color,
        coordinates: coordinates,
        area: parseFloat(fieldArea.acres) || 0,
        location_details: {
          soil_type: activeSoil.soilType,
          soil_color: activeSoil.color,
          soil_hex: activeSoil.hex
        },
        createdAt: new Date().toISOString()
      };

      const response = await fetch(API_URLS.FIELDS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData),
      });
      
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { success: false, message: 'Invalid server response' };
      }
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save field data');
      }

      const finalSavedLocation = result.field?.location || fieldLocation;
      
      // Update manipal.json
      try {
        await fetch(API_URLS.UPDATE_MANIPAL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fieldId }),
        });
      } catch (manipalError) {
        console.warn('Error updating manipal.json (field still saved):', manipalError);
      }
      
      // Refresh fields context so Navbar and map immediately reflect the newly saved field
      if (typeof refreshFields === 'function') {
        await refreshFields();
      }
      if (typeof setSelectedField === 'function') {
        setSelectedField(fieldId);
      }
      if (typeof setSelectedLocation === 'function' && finalSavedLocation) {
        setSelectedLocation(finalSavedLocation);
      }

      setMessage({
        show: true,
        text: `Field "${fieldName}" saved successfully with soil color "${activeSoil.color}" (${activeSoil.soilType}) in ${finalSavedLocation}!`,
        type: 'success'
      });
      
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
      {/* Header */}
      <div className="field-mapper-header">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2>
              <FontAwesomeIcon icon={faMap} className="mr-3 text-green-700" />
              Plot & Register New Farm Field
            </h2>
            <p>
              Draw boundary on the satellite map, assign planned crop and official dataset soil color, and register in database.
            </p>
          </div>
          {fields.length > 0 && (
            <div className="existing-count-badge">
              <FontAwesomeIcon icon={faLayerGroup} className="text-green-600 mr-1.5" />
              <span>{fields.length} Existing Field{fields.length > 1 ? 's' : ''} on Map</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="field-mapper-container">
        {/* Map Card with Integrated Toolbar */}
        <div className="map-card">
          <div className="map-toolbar">
            {/* Quick Location Search */}
            <form onSubmit={handleSearchPlace} className="map-search-form">
              <input 
                type="text" 
                className="map-search-input"
                placeholder="Search village, district, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="map-search-btn" 
                title="Search location"
                disabled={searchingPlace}
              >
                <FontAwesomeIcon icon={searchingPlace ? faSpinner : faSearch} spin={searchingPlace} />
              </button>
            </form>

            {/* Quick Actions */}
            <div className="map-tools-group">
              <button 
                type="button" 
                className="map-tool-btn" 
                onClick={handleLocateMe}
                title="Zoom to my GPS location"
              >
                <FontAwesomeIcon icon={faCrosshairs} className="text-green-600" />
                <span>My Location</span>
              </button>

              {fields.length > 0 && (
                <button 
                  type="button" 
                  className={`map-tool-btn ${showExistingFields ? 'active-filter' : ''}`}
                  onClick={handleToggleExistingFields}
                  title={showExistingFields ? "Hide existing fields" : "Show existing fields on map"}
                >
                  <FontAwesomeIcon icon={showExistingFields ? faEye : faEyeSlash} className="text-green-600" />
                  <span>Fields ({fields.length})</span>
                </button>
              )}

              {/* Main Draw Boundary Action */}
              <button 
                type="button" 
                className={`map-tool-btn ${isDrawingMode ? 'drawing-active' : ''}`}
                onClick={handleToggleDrawingMode}
                title="Click on map to drop polygon boundary points"
              >
                <FontAwesomeIcon icon={faDrawPolygon} className={isDrawingMode ? 'text-white' : 'text-green-600'} />
                <span>{isDrawingMode ? 'Drawing Active' : 'Draw Boundary'}</span>
              </button>

              {/* Undo Last Point button when drawing */}
              {isDrawingMode && coordinates.length > 0 && (
                <button 
                  type="button" 
                  className="map-tool-btn" 
                  onClick={handleUndoPoint}
                  title="Undo last placed point"
                >
                  <FontAwesomeIcon icon={faUndo} className="text-amber-600" />
                  <span>Undo</span>
                </button>
              )}

              {/* Complete Boundary button */}
              {isDrawingMode && coordinates.length >= 3 && (
                <button 
                  type="button" 
                  className="map-tool-btn btn-complete" 
                  onClick={completeBoundary}
                  title="Complete boundary polygon"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                  <span>Finish Boundary</span>
                </button>
              )}

              {(coordinates.length > 0 || currentPolygon) && (
                <button 
                  type="button" 
                  className="map-tool-btn text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={handleClearAll}
                  title="Clear plotted polygon"
                >
                  <FontAwesomeIcon icon={faEraser} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Map View */}
          <div 
            ref={mapRef} 
            className="map-container"
          ></div>

          {/* Map Status Bar */}
          <div className="map-status-bar">
            <div className="flex items-center gap-2">
              <span className={`map-status-pill ${isDrawingMode ? 'highlight-pulse' : ''}`}>
                <FontAwesomeIcon icon={faInfoCircle} className={isDrawingMode ? 'text-green-700' : 'text-green-600'} />
                {isDrawingMode ? (
                  coordinates.length === 0 ? (
                    'Click anywhere on the map to place vertex #1.'
                  ) : coordinates.length < 3 ? (
                    `Placed ${coordinates.length} point${coordinates.length > 1 ? 's' : ''}. Need at least 3 points.`
                  ) : (
                    `Placed ${coordinates.length} points. Click Point #1 or "Finish Boundary" when done.`
                  )
                ) : coordinates.length >= 3 ? (
                  'Boundary plotted. Drag vertices on map to adjust edges.'
                ) : (
                  'Click "Draw Boundary" to plot your farm. Existing fields are plotted with soil colors.'
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`map-status-pill ${coordinates.length >= 3 ? 'highlight' : ''}`}>
                Points: {coordinates.length}
              </span>
              {coordinates.length >= 3 && (
                <span className="map-status-pill highlight">
                  Area: {fieldArea.acres} Acres ({fieldArea.hectares} ha)
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Field Details Form Panel */}
        <div className="field-details">
          <h3>
            <FontAwesomeIcon icon={faSeedling} className="mr-2 text-green-600" />
            Field Info
          </h3>
          
          <div className="field-form">
            {/* Field Name */}
            <div className="form-group">
              <label htmlFor="fieldNameInput">Field Name *</label>
              <input 
                type="text" 
                id="fieldNameInput" 
                className="form-control"
                placeholder="e.g., North Orchard, Plot 4"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                disabled={loading}
              />
            </div>
            
            {/* Field Location (Reverse-geocoded) */}
            <div className="form-group">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="fieldLocation" className="text-sm font-semibold text-gray-700">
                  Location (Auto-detected) *
                </label>
                {isGeocoding && (
                  <span className="text-xs text-green-700 font-medium flex items-center">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                    Identifying place...
                  </span>
                )}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  id="fieldLocation" 
                  className="form-control"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="Draw boundary on map to auto-identify location..."
                  value={fieldLocation}
                  onChange={(e) => setFieldLocation(e.target.value)}
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none">
                  <FontAwesomeIcon icon={faLocationDot} />
                </span>
              </div>
            </div>

            {/* Crop Selection */}
            <div className="form-group">
              <label htmlFor="cropSelect" className="flex items-center">
                Selected Crop *
              </label>
              <select
                id="cropSelect"
                className="form-control"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Choose Crop to Grow --</option>
                {cropOptions.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil Color Selection — Strict 14 Dataset Colors */}
            <div className="soil-color-section">
              <div className="soil-color-header">
                <label className="text-sm font-semibold text-gray-800 flex items-center">
                  Soil Color *
                </label>
                
                {/* Active Selection Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-green-300 text-xs shadow-xs">
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-gray-400 flex-shrink-0"
                    style={{ backgroundColor: activeSoil.hex }}
                  ></span>
                  <span className="font-bold text-gray-800">
                    {activeSoil.color}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-green-700 font-medium">
                    {activeSoil.soilType}
                  </span>
                </div>
              </div>

              {/* 14 Dataset Soil Color Grid */}
              <div className="soil-color-grid">
                {DATASET_SOIL_COLORS.map((soil) => {
                  const isSelected = selectedSoilColor === soil.color;
                  return (
                    <button
                      key={soil.color}
                      type="button"
                      className={`soil-chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSoilColor(soil.color)}
                    >
                      <span 
                        className="soil-color-dot"
                        style={{ backgroundColor: soil.hex }}
                      ></span>
                      <div className="soil-chip-info">
                        <div className="flex items-center justify-between w-full">
                          <span className="soil-chip-name">{soil.color}</span>
                          {isSelected && (
                            <FontAwesomeIcon icon={faCheck} className="text-green-600 text-xs ml-1 flex-shrink-0" />
                          )}
                        </div>
                        <span className="soil-chip-desc">{soil.soilType}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calculated Area Metric Cards */}
            {coordinates.length >= 3 && (
              <div className="area-metrics-grid">
                <div className="area-metric-card">
                  <div className="area-metric-val">{fieldArea.acres}</div>
                  <div className="area-metric-label">Acres</div>
                </div>
                <div className="area-metric-card">
                  <div className="area-metric-val">{fieldArea.hectares}</div>
                  <div className="area-metric-label">Hectares</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Coordinates Table */}
          {coordinates.length > 0 && (
            <div className="coordinates-table">
              <h4>
                <FontAwesomeIcon icon={faRulerCombined} className="mr-2 text-green-600" />
                Boundary Coordinates ({coordinates.length} vertices)
              </h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinates.map((point, index) => (
                      <tr key={index}>
                        <td className="font-semibold text-green-700">{index + 1}</td>
                        <td>{point.lat.toFixed(6)}</td>
                        <td>{point.lng.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="button-group">
            <button 
              className="btn btn-save" 
              onClick={handleSaveField}
              disabled={loading}
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faSave} spin={loading} className="mr-2" />
              {loading ? 'Saving to Database...' : 'Save Field to Database'}
            </button>
            
            <button 
              className="btn btn-clear" 
              onClick={handleClearAll}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faEraser} className="mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Alert Messages */}
      {message.show && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'error' && (
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          )}
          {message.type === 'success' && (
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-600" />
          )}
          <span>{message.text}</span>
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