import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faEdit, 
  faTrash, 
  faSpinner, 
  faExclamationTriangle, 
  faSeedling,
  faLocationDot,
  faCalendarDays,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { API_URLS } from '../config';
import { useAppContext } from '../context/AppContext';
import { getSoilHex } from '../components/fields/FieldMapper';
import '../components/fields/Fields.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const GOOGLE_HYBRID = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

function normalizeCoordinates(coords) {
  if (!Array.isArray(coords)) return [];
  return coords
    .map((c) => {
      if (Array.isArray(c) && c.length >= 2) {
        return [Number(c[0]), Number(c[1])];
      }
      if (c && typeof c === 'object') {
        const lat = Number(c.lat ?? c.latitude);
        const lng = Number(c.lng ?? c.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      }
      return null;
    })
    .filter(Boolean);
}

const FieldDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshFields } = useAppContext() || {};

  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);

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
    } catch (err) {
      console.error('Error fetching field details:', err);
      setError(`Failed to load field details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and update Leaflet map when field is loaded
  useEffect(() => {
    if (!field || !mapRef.current) return;

    // Create Leaflet map if not created yet
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        maxZoom: 20,
      });

      L.tileLayer(GOOGLE_HYBRID, {
        attribution: 'Map data © Google',
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
      }).addTo(map);

      mapInstanceRef.current = map;
      polygonLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = polygonLayerRef.current;
    layerGroup.clearLayers();

    const normalizedCoords = normalizeCoordinates(field.coordinates);

    if (normalizedCoords.length >= 3) {
      const soilHex = getSoilHex(field.soil_color || field.soilColor);

      const poly = L.polygon(normalizedCoords, {
        color: '#16a34a',
        weight: 3,
        fillColor: soilHex,
        fillOpacity: 0.35,
      }).addTo(layerGroup);

      // Inner dashed accent
      L.polygon(normalizedCoords, {
        color: '#ffffff',
        weight: 1.5,
        dashArray: '5, 5',
        fill: false,
        interactive: false,
      }).addTo(layerGroup);

      poly.bindTooltip(field.name || 'Field Boundary', {
        permanent: true,
        direction: 'center',
        className: 'bg-white px-2 py-1 text-xs font-semibold rounded shadow-sm text-gray-800 border border-gray-200',
      });

      try {
        const bounds = poly.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        }
      } catch (err) {
        console.warn('Could not fit bounds on field polygon:', err);
      }
    } else if (normalizedCoords.length > 0) {
      // If single point or invalid polygon
      const [lat, lng] = normalizedCoords[0];
      L.marker([lat, lng]).addTo(layerGroup).bindPopup(field.name);
      map.setView([lat, lng], 15);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Leave map instance cleanup to component unmount
    };
  }, [field]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleDeleteField = async () => {
    if (!window.confirm(`Are you sure you want to delete "${field.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`${API_URLS.FIELDS}/${field.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`Failed to delete field: ${res.statusText}`);
      }

      if (refreshFields) {
        await refreshFields();
      }

      navigate('/field-list');
    } catch (err) {
      alert(`Error deleting field: ${err.message}`);
      setDeleting(false);
    }
  };

  // Calculate field area in hectares
  const calculateFieldArea = (coordinates) => {
    const coords = normalizeCoordinates(coordinates);
    if (!coords || coords.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }

    area = Math.abs(area) / 2;
    const degreeToMeter = 111319.9;
    const squareMetersToHectares = 0.0001;
    return area * Math.pow(degreeToMeter, 2) * squareMetersToHectares;
  };

  return (
    <div className="field-detail-page bg-white rounded-lg shadow-md max-w-7xl mx-auto my-4">
      {loading ? (
        <div className="text-center py-16">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-green-600 mb-4" />
          <p className="text-gray-600">Loading field details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-8 rounded-lg flex items-start gap-4 m-6 border border-red-200">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-500 mt-1" />
          <div>
            <h2 className="font-bold text-lg mb-1">Field Not Found</h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Link to="/field-list" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to My Fields
            </Link>
          </div>
        </div>
      ) : field ? (
        <>
          <div className="field-header p-6 border-b border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center">
                <Link to="/field-list" className="mr-4 text-gray-500 hover:text-gray-700 text-lg transition-colors" title="Back to fields">
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                    <FontAwesomeIcon icon={faLocationDot} className="text-gray-400" />
                    {field.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/edit-field/${field.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Edit Field</span>
                </Link>
                <button 
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteField}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={deleting ? faSpinner : faTrash} spin={deleting} />
                  <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="field-body grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className="field-info lg:col-span-1 space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h2 className="font-semibold text-base text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLayerGroup} className="text-emerald-600" />
                  Field Information
                </h2>
                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Field Name</span>
                    <span className="font-semibold text-gray-900">{field.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Location</span>
                    <span className="font-medium text-gray-800">{field.location}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Primary Crop</span>
                    <span className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-semibold text-xs border border-emerald-200">
                      <FontAwesomeIcon icon={faSeedling} className="text-emerald-600" />
                      {field.crop || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Field State</span>
                    <span className="font-medium text-gray-800">{field.field_state || 'Standard Farm Field'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Field Area</span>
                    <span className="font-semibold text-gray-900 text-base">
                      {calculateFieldArea(field.coordinates).toFixed(2)} ha
                      <span className="text-xs font-normal text-gray-500 ml-1.5">
                        ({(calculateFieldArea(field.coordinates) * 2.47105).toFixed(2)} acres)
                      </span>
                    </span>
                  </div>
                  {field.soil_color && (
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Soil Color & Type</span>
                      <div className="flex items-center mt-1.5 gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-xs flex-shrink-0" 
                          style={{ backgroundColor: getSoilHex(field.soil_color) }}
                        />
                        <span className="font-medium text-gray-800">{field.soil_color}</span>
                      </div>
                    </div>
                  )}
                  {field.createdAt && (
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Created On</span>
                      <span className="text-gray-600 flex items-center gap-1.5 mt-0.5">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-gray-400 text-xs" />
                        {new Date(field.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h2 className="font-semibold text-base text-gray-800 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLocationDot} className="text-blue-600" />
                  Boundary Coordinates ({normalizeCoordinates(field.coordinates).length} points)
                </h2>
                <div className="overflow-y-auto max-h-56 rounded-lg border border-gray-200 bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold">#</th>
                        <th className="text-left py-2 px-3 font-semibold">Latitude</th>
                        <th className="text-left py-2 px-3 font-semibold">Longitude</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {normalizeCoordinates(field.coordinates).map(([lat, lng], index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium text-gray-400">{index + 1}</td>
                          <td className="py-2 px-3 text-gray-700 font-mono">{lat.toFixed(6)}</td>
                          <td className="py-2 px-3 text-gray-700 font-mono">{lng.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="field-map lg:col-span-2 flex flex-col">
              <div 
                ref={mapRef} 
                className="w-full h-96 lg:h-full min-h-[500px] rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0"
              />
            </div>
          </div>
          
          <div className="field-footer p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-lg">
            <Link to="/field-list" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to All Fields
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View on Dashboard &rarr;
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default FieldDetail;