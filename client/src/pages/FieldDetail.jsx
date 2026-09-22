import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faArrowLeft, faEdit, faTrash, faSpinner, faExclamationTriangle, faSeedling } from '@fortawesome/free-solid-svg-icons';
import { API_URLS } from '../config';
import googleMapsLoader from '../utils/googleMapsLoader';
import '../components/fields/Fields.css';

const FieldDetail = () => {
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [polygon, setPolygon] = useState(null);

  useEffect(() => {
    fetchFieldDetails();
  }, [id]);

  const fetchFieldDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URLS.FIELDS}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch field details: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.field) {
        setField(result.field);
      } else {
        setError('Field not found or invalid server response');
      }
    } catch (error) {
      console.error('Error fetching field details:', error);
      setError(`Failed to load field details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize the Google Maps when field data is available
  useEffect(() => {
    if (!field || !field.coordinates || field.coordinates.length < 3) return;

    const loadMaps = async () => {
      try {
        await googleMapsLoader.loadGoogleMaps(['geometry']);
        initMap();
      } catch (error) {
        setError("Failed to load Google Maps. Please check your internet connection.");
      }
    };

    loadMaps();
  }, [field]);

  const initMap = () => {
    if (!mapRef.current || !field || !field.coordinates || field.coordinates.length < 3) return;
    
    // Calculate the center of the polygon
    const bounds = new window.google.maps.LatLngBounds();
    field.coordinates.forEach(coord => {
      bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
    });
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: bounds.getCenter(),
      zoom: 15,
      mapTypeId: 'hybrid',
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });
    
    // Create the polygon from field coordinates
    const polygonPath = field.coordinates.map(coord => ({
      lat: coord.lat,
      lng: coord.lng
    }));
    
    const fieldPolygon = new window.google.maps.Polygon({
      paths: polygonPath,
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#2563eb',
      fillOpacity: 0.35,
      editable: false
    });
    
    fieldPolygon.setMap(mapInstance);
    mapInstance.fitBounds(bounds);
    
    setMap(mapInstance);
    setPolygon(fieldPolygon);
  };

  // Calculate field area in hectares
  const calculateFieldArea = (coordinates) => {
    if (!coordinates || coordinates.length < 3) return 0;

    // Implementation of the Shoelace formula to calculate polygon area
    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i].lat * coordinates[j].lng;
      area -= coordinates[j].lat * coordinates[i].lng;
    }

    area = Math.abs(area) / 2;
    
    // Convert square degrees to hectares (very approximate, varies by latitude)
    const degreeToMeter = 111319.9; // At equator, varies by latitude
    const squareMetersToHectares = 0.0001;
    
    return area * Math.pow(degreeToMeter, 2) * squareMetersToHectares;
  };

  return (
    <div className="field-detail-page bg-white rounded-lg shadow-md">
      {loading ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-green-600 mb-4" />
          <p>Loading field details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl mr-4" />
          <div>
            <h2 className="font-bold mb-1">Error</h2>
            <p>{error}</p>
            <Link to="/field-list" className="text-red-700 font-medium mt-2 inline-block hover:underline">
              &larr; Back to fields list
            </Link>
          </div>
        </div>
      ) : field ? (
        <>
          <div className="field-header p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link to="/field-list" className="mr-4 text-gray-500 hover:text-gray-700">
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{field.name}</h1>
                  <p className="text-gray-600">{field.location}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link 
                  to={`/edit-field/${field.id}`}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded flex items-center"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-1" />
                  Edit
                </Link>
                <button 
                  className="btn bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded flex items-center"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this field?')) {
                      // Implement delete functionality here
                      window.location.href = '/field-list';
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          <div className="field-body grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className="field-info lg:col-span-1 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg text-gray-800 mb-3">Field Information</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm text-gray-500">Field Name</h3>
                    <p className="font-medium">{field.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Location</h3>
                    <p className="font-medium">{field.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Created Date</h3>
                    <p className="font-medium">{new Date(field.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Field Size</h3>
                    <p className="font-medium">{calculateFieldArea(field.coordinates).toFixed(2)} hectares</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500">Crop</h3>
                    <p className="font-medium">{field.crop || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg text-gray-800 mb-3">Coordinates</h2>
                <div className="overflow-y-auto max-h-56">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Point</th>
                        <th className="text-left py-2">Latitude</th>
                        <th className="text-left py-2">Longitude</th>
                      </tr>
                    </thead>
                    <tbody>
                      {field.coordinates.map((point, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{index + 1}</td>
                          <td className="py-2">{point.lat.toFixed(6)}</td>
                          <td className="py-2">{point.lng.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="field-map lg:col-span-2">
              <div 
                ref={mapRef} 
                className="w-full h-96 lg:h-full min-h-[500px] rounded-lg shadow-inner"
              ></div>
            </div>
          </div>
          
          <div className="field-footer p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <Link to="/field-list" className="text-green-600 hover:text-green-700 font-medium">
                  &larr; Back to All Fields
                </Link>
              </div>
              <div>
                <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
                  View in Dashboard
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default FieldDetail;
