import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSave, 
  faTrash, 
  faSpinner, 
  faExclamationTriangle, 
  faSeedling, 
  faCheckCircle,
  faLayerGroup,
  faLocationDot,
  faUndo,
  faPlus,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { API_URLS } from '../config';
import { useAppContext } from '../context/AppContext';
import { DATASET_SOIL_COLORS, getSoilHex } from '../components/fields/FieldMapper';
import { updateField } from '../services/dataService';
import '../components/fields/Fields.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const GOOGLE_HYBRID = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

const cropOptions = [
  'Rice', 'Wheat', 'Maize', 'Chickpea', 'Kidneybeans', 'Pigeonpeas', 
  'Mothbeans', 'Mungbean', 'Blackgram', 'Lentil', 'Pomegranate', 
  'Banana', 'Mango', 'Grapes', 'Watermelon', 'Muskmelon', 'Apple', 
  'Orange', 'Papaya', 'Coconut', 'Cotton', 'Jute', 'Coffee',
  'Sugarcane', 'Groundnut', 'Mustard', 'Soybean', 'Sunflower', 
  'Tea', 'Onion', 'Potato', 'Tomato'
];

const fieldStateOptions = [
  'Cultivated/Crop Field',
  'Fallow Land',
  'Preparing for Sowing',
  'Post-Harvest / Stubble'
];

function normalizeCoordinates(coords) {
  if (!Array.isArray(coords)) return [];
  return coords
    .map((c) => {
      if (Array.isArray(c) && c.length >= 2) {
        return { lat: Number(c[0]), lng: Number(c[1]) };
      }
      if (c && typeof c === 'object') {
        const lat = Number(c.lat ?? c.latitude);
        const lng = Number(c.lng ?? c.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      return null;
    })
    .filter(Boolean);
}

function calculateAreaHectares(coords) {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += coords[i].lat * coords[j].lng;
    area -= coords[j].lat * coords[i].lng;
  }
  area = Math.abs(area) / 2;
  const degreeToMeter = 111319.9;
  const squareMetersToHectares = 0.0001;
  return area * Math.pow(degreeToMeter, 2) * squareMetersToHectares;
}

const EditField = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshFields } = useAppContext() || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [crop, setCrop] = useState('');
  const [fieldState, setFieldState] = useState(fieldStateOptions[0]);
  const [soilColor, setSoilColor] = useState(DATASET_SOIL_COLORS[0].color);
  const [coordinates, setCoordinates] = useState([]);
  const [originalCoords, setOriginalCoords] = useState([]);

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch field details
  useEffect(() => {
    const fetchField = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URLS.FIELDS}/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to load field (${res.status})`);
        }
        const data = await res.json();
        if (!data.success || !data.field) {
          throw new Error('Field not found');
        }

        const f = data.field;
        setName(f.name || '');
        setLocation(f.location || '');
        setCrop(f.crop || '');
        setFieldState(f.field_state || fieldStateOptions[0]);
        setSoilColor(f.soil_color || f.soilColor || DATASET_SOIL_COLORS[0].color);

        const norm = normalizeCoordinates(f.coordinates);
        setCoordinates(norm);
        setOriginalCoords(norm);
      } catch (err) {
        console.error('Error fetching field for edit:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchField();
  }, [id]);

  // Redraw polygon and vertex markers on map
  const syncMapElements = useCallback((coordsList, color) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing vertex markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Clear existing polygon
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    if (!coordsList || coordsList.length === 0) return;

    const latLngs = coordsList.map((c) => [c.lat, c.lng]);
    const soilHex = getSoilHex(color);

    if (coordsList.length >= 3) {
      const poly = L.polygon(latLngs, {
        color: '#16a34a',
        weight: 3,
        fillColor: soilHex,
        fillOpacity: 0.35,
      }).addTo(map);

      polygonRef.current = poly;
    }

    // Add draggable vertex markers
    coordsList.forEach((pt, index) => {
      const customMarker = L.circleMarker([pt.lat, pt.lng], {
        radius: 7,
        fillColor: '#ffffff',
        color: '#15803d',
        weight: 3,
        fillOpacity: 1,
        className: 'cursor-grab',
      }).addTo(map);

      customMarker.bindTooltip(`Point ${index + 1} (Drag to adjust)`, {
        direction: 'top',
        className: 'text-xs',
      });

      // Simple click to remove point if more than 3
      customMarker.on('contextmenu', (e) => {
        L.DomEvent.stopPropagation(e);
        if (coordsList.length <= 3) {
          alert('A field boundary requires at least 3 points.');
          return;
        }
        setCoordinates((prev) => prev.filter((_, i) => i !== index));
      });

      markersRef.current.push(customMarker);
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (loading || error || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
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

      // Map click adds a new point
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setCoordinates((prev) => [...prev, { lat, lng }]);
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    syncMapElements(coordinates, soilColor);

    if (coordinates.length >= 3) {
      const bounds = L.latLngBounds(coordinates.map((c) => [c.lat, c.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
      }
    } else if (coordinates.length > 0) {
      map.setView([coordinates[0].lat, coordinates[0].lng], 16);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [loading, error]);

  // Sync elements when coordinates or soilColor state changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      syncMapElements(coordinates, soilColor);
    }
  }, [coordinates, soilColor, syncMapElements]);

  // Cleanup map
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleResetCoordinates = () => {
    setCoordinates([...originalCoords]);
    if (mapInstanceRef.current && originalCoords.length >= 3) {
      const bounds = L.latLngBounds(originalCoords.map((c) => [c.lat, c.lng]));
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  };

  const handleRemovePoint = (index) => {
    if (coordinates.length <= 3) {
      alert('A field polygon must have at least 3 points.');
      return;
    }
    setCoordinates(coordinates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a field name.');
      return;
    }
    if (!location.trim()) {
      alert('Please enter a location.');
      return;
    }
    if (coordinates.length < 3) {
      alert('Please ensure the field has at least 3 boundary points.');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);

    const hectares = calculateAreaHectares(coordinates);
    const acres = hectares * 2.47105;

    const payload = {
      name: name.trim(),
      location: location.trim(),
      crop: crop.trim(),
      field_state: fieldState,
      soil_color: soilColor,
      soilColor: soilColor,
      coordinates: coordinates,
      area: parseFloat(acres.toFixed(2)),
      location_details: {
        soil_type: DATASET_SOIL_COLORS.find((s) => s.color === soilColor)?.soilType || '',
        soil_color: soilColor,
        soil_hex: getSoilHex(soilColor),
      },
    };

    try {
      await updateField(id, payload);

      if (refreshFields) {
        await refreshFields();
      }

      setSuccessMessage('Field updated successfully!');
      setTimeout(() => {
        navigate(`/field-detail/${id}`);
      }, 1200);
    } catch (err) {
      alert(`Error updating field: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const haArea = calculateAreaHectares(coordinates);
  const acArea = haArea * 2.47105;

  return (
    <div className="edit-field-page max-w-7xl mx-auto my-4 px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/field-list')}
              className="text-gray-500 hover:text-gray-800 transition-colors p-1"
              title="Back to fields"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faLayerGroup} className="text-emerald-600" />
                Edit Field: {name || 'Loading...'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Update field details, crop selection, and adjust boundary polygon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/field-detail/${id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <FontAwesomeIcon icon={saving ? faSpinner : faSave} spin={saving} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-sm font-medium">
            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-600 text-base" />
            {successMessage}
          </div>
        )}

        {error ? (
          <div className="m-6 p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-xl mt-0.5" />
            <div>
              <h3 className="font-semibold text-base mb-1">Could not load field</h3>
              <p className="text-sm">{error}</p>
              <Link to="/field-list" className="inline-block mt-3 text-sm text-red-700 font-medium underline">
                &larr; Back to My Fields
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-emerald-600 mb-3" />
            <p className="text-sm text-gray-600">Loading field data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-emerald-600" />
                  Field Attributes
                </h2>

                {/* Field Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. North Acre Wheat Farm"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Location / Village *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Field State */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Field Condition / State
                  </label>
                  <select
                    value={fieldState}
                    onChange={(e) => setFieldState(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    {fieldStateOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crop */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Current Crop
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="">-- Select Crop --</option>
                    {cropOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Soil Color */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Soil Type & Color
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                    {DATASET_SOIL_COLORS.map((item) => (
                      <label
                        key={item.color}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          soilColor === item.color
                            ? 'border-emerald-600 bg-emerald-50/60 font-semibold'
                            : 'border-gray-200 hover:bg-gray-100/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="soilColor"
                          value={item.color}
                          checked={soilColor === item.color}
                          onChange={() => setSoilColor(item.color)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: item.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 block truncate">{item.color}</span>
                          <span className="text-[10px] text-gray-500 block truncate">{item.soilType}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Boundary Summary Card */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 text-xs text-gray-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-emerald-900">Calculated Field Area:</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {haArea.toFixed(2)} ha / {acArea.toFixed(2)} acres
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Boundary Points:</span>
                  <span className="font-semibold">{coordinates.length} vertices</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleResetCoordinates}
                    className="px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faUndo} /> Reset Boundary
                  </button>
                </div>
              </div>

              {/* Coordinates table */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-between">
                  <span>Coordinates List</span>
                  <span className="text-[10px] text-gray-400">Click map to add points</span>
                </h3>
                <div className="max-h-40 overflow-y-auto rounded border border-gray-200 bg-white">
                  <table className="w-full text-[11px]">
                    <thead className="bg-gray-100 text-gray-600 border-b">
                      <tr>
                        <th className="py-1 px-2 text-left">#</th>
                        <th className="py-1 px-2 text-left">Lat</th>
                        <th className="py-1 px-2 text-left">Lng</th>
                        <th className="py-1 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {coordinates.map((pt, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-1 px-2 text-gray-400">{i + 1}</td>
                          <td className="py-1 px-2 font-mono text-gray-700">{pt.lat.toFixed(6)}</td>
                          <td className="py-1 px-2 font-mono text-gray-700">{pt.lng.toFixed(6)}</td>
                          <td className="py-1 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemovePoint(i)}
                              className="text-red-500 hover:text-red-700 px-1"
                              title="Delete point"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Map */}
            <div className="lg:col-span-7 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>
                  Interactive Boundary Editor: Click on the map to add points, right-click marker to delete.
                </span>
                <span className="font-semibold text-emerald-700">
                  {coordinates.length} points
                </span>
              </div>
              <div
                ref={mapContainerRef}
                className="w-full h-[520px] rounded-xl overflow-hidden border border-gray-300 shadow-inner z-0"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditField;
