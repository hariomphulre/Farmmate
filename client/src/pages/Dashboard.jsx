import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { LuSquareSplitHorizontal } from "react-icons/lu";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Leaf,
  LocateFixed,
  MoreHorizontal,
  PanelRight,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {
  AREA_464,
  AREA_465,
  GOOGLE_HYBRID,
  GOOGLE_STREETS,
  MAP_CENTER,
  MAP_ZOOM,
  ZONES,
} from '../data/zoneMap';
import { boundsFromPolygon, createNdviDataUrl } from '../utils/ndviCanvas';
import './Dashboard.css';
import { MdDashboard, MdSpaceDashboard } from 'react-icons/md';

const thisMonth = [0.74, 0.88, 0.84, 0.52, 0.46, 0.58];
const lastMonth = [0.6, 0.54, 0.48, 0.56, 0.72, 0.7];
const axes = ['Soil pH', 'Nitrogen', 'Potassium', 'Organic', 'Moisture', 'Aeration'];

function polarPoint(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function polygonFromValues(values, cx, cy, maxR) {
  return values
    .map((v, i) => polarPoint(cx, cy, maxR * v, i * 60).join(','))
    .join(' ');
}

function RadarChart() {
  const cx = 105;
  const cy = 92;
  const maxR = 58;
  const thisPoly = polygonFromValues(thisMonth, cx, cy, maxR);
  const lastPoly = polygonFromValues(lastMonth, cx, cy, maxR);

  return (
    <svg viewBox="0 0 210 186" className="radar-wrap">
      {[0.33, 0.66, 1].map((scale) => (
        <polygon
          key={scale}
          points={polygonFromValues([1, 1, 1, 1, 1, 1], cx, cy, maxR * scale)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}
      {axes.map((label, i) => {
        const [x, y] = polarPoint(cx, cy, maxR, i * 60);
        const [lx, ly] = polarPoint(cx, cy, maxR + 18, i * 60);
        return (
          <g key={label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#9ca3af">
              {label}
            </text>
          </g>
        );
      })}
      <polygon points={lastPoly} fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.6" />
      <polygon points={thisPoly} fill="rgba(16,185,129,0.16)" stroke="#10b981" strokeWidth="1.8" />
      {thisMonth.map((v, i) => {
        const [x, y] = polarPoint(cx, cy, maxR * v, i * 60);
        return <circle key={`t-${i}`} cx={x} cy={y} r="2.4" fill="#10b981" />;
      })}
      {lastMonth.map((v, i) => {
        const [x, y] = polarPoint(cx, cy, maxR * v, i * 60);
        return <circle key={`l-${i}`} cx={x} cy={y} r="2.2" fill="#f97316" />;
      })}
    </svg>
  );
}



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

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedField, fields } = useAppContext();
  const activeField =
    fields?.find((f) => String(f.id) === String(selectedField)) ||
    (fields?.length > 0 ? fields[0] : null);

  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const shellRef = useRef(null);
  const fieldAoiLayerRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  const satLayer = useRef(null);
  const streetLayer = useRef(null);

  const [tab, setTab] = useState('zone');
  const [showNdvi, setShowNdvi] = useState(true);
  const [baseLayer, setBaseLayer] = useState('satellite');
  const [zoom, setZoom] = useState(MAP_ZOOM);
  const [activeZone, setActiveZone] = useState('zone-3');
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showParams, setShowParams] = useState(false);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1000 : true
  );

  const [panelWidth, setPanelWidth] = useState(480);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [navHeight, setNavHeight] = useState(53);

  useEffect(() => {
    const updateNavHeight = () => {
      const nav = document.getElementById('top-bar') || document.querySelector('nav');
      if (nav) {
        setNavHeight(nav.offsetHeight);
      }
    };
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    const nav = document.getElementById('top-bar') || document.querySelector('nav');
    let ro;
    if (nav && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateNavHeight);
      ro.observe(nav);
    }
    return () => {
      window.removeEventListener('resize', updateNavHeight);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      if (w < 1000) {
        setIsPanelOpen(false);
      } else {
        const maxW = Math.max(340, w - 280);
        setPanelWidth((prev) => Math.min(prev, maxW));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      mapObj.current?.invalidateSize();
    }, 320);
    return () => clearTimeout(timer);
  }, [isPanelOpen]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onPointerMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const shell = shellRef.current;
      if (!shell) return;
      const shellRect = shell.getBoundingClientRect();
      const newWidth = shellRect.right - moveEvent.clientX;
      const minW = 340;
      const maxW = Math.max(minW, shellRect.width - 280);
      const clampedWidth = Math.min(Math.max(newWidth, minW), maxW);
      setPanelWidth(Math.round(clampedWidth));
      mapObj.current?.invalidateSize();
    };

    const onPointerUp = () => {
      setIsDragging(false);
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      setTimeout(() => {
        mapObj.current?.invalidateSize();
      }, 50);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleDoubleClick = () => {
    setPanelWidth(480);
    setTimeout(() => {
      mapObj.current?.invalidateSize();
    }, 50);
  };


  const filteredZones = ZONES.filter((zone) =>
    `${zone.name} ${zone.disturbance}`.toLowerCase().includes(query.toLowerCase())
  );

  const flyToZone = (zone) => {
    setActiveZone(zone.id);
    mapObj.current?.flyTo(zone.center, 16, { duration: 0.7 });
  };

  const renderUserLocation = useCallback((lat, lng, accuracy = 30) => {
    if (!userLocationLayerRef.current) return;
    userLocationLayerRef.current.clearLayers();

    const accuracyCircle = L.circle([lat, lng], {
      radius: Math.max(accuracy, 25),
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.16,
      weight: 1.5,
    });

    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#ffffff',
      weight: 3,
      fillColor: '#2563eb',
      fillOpacity: 1,
    });

    marker.bindTooltip('Your Location', {
      permanent: false,
      direction: 'top',
      className: 'field-label',
    });

    accuracyCircle.addTo(userLocationLayerRef.current);
    marker.addTo(userLocationLayerRef.current);
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        renderUserLocation(latitude, longitude, accuracy);
        if (mapObj.current) {
          mapObj.current.flyTo([latitude, longitude], Math.max(mapObj.current.getZoom(), 16), {
            duration: 1.2,
          });
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation error:', err.message);
        if (err.code === 1) {
          alert('Location access was denied. Please allow location permissions in your browser.');
        } else {
          alert('Could not determine your location. Please check your network or GPS connection.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    if (navigator?.permissions?.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude, accuracy } = pos.coords;
              setUserLocation({ lat: latitude, lng: longitude, accuracy });
              renderUserLocation(latitude, longitude, accuracy);
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
          );
        }
      }).catch(() => {});
    }
  }, [renderUserLocation]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Create a fresh div for the main map to avoid React 18 strict mode Leaflet bugs
    const mapContainer = document.createElement('div');
    mapContainer.className = 'absolute inset-0';
    mapRef.current.appendChild(mapContainer);

    const map = L.map(mapContainer, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 20,
    });
    mapObj.current = map;
    map.on("zoomend", () => setZoom(map.getZoom()));

    satLayer.current = L.tileLayer(GOOGLE_HYBRID, {
      attribution: 'Map data © Google',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    streetLayer.current = L.tileLayer(GOOGLE_STREETS, {
      attribution: 'Map data © Google',
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });

    fieldAoiLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);

    const resize = () => map.invalidateSize();
    const ro = new ResizeObserver(resize);
    ro.observe(mapRef.current);
    setTimeout(resize, 200);

    return () => {
      ro.disconnect();
      map.remove();
      if (mapRef.current) mapRef.current.innerHTML = '';
      mapObj.current = null;
      fieldAoiLayerRef.current = null;
      userLocationLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapObj.current || !fieldAoiLayerRef.current) return;

    fieldAoiLayerRef.current.clearLayers();

    let targetPolygon = null;
    let targetName = '';

    if (activeField?.coordinates && Array.isArray(activeField.coordinates) && activeField.coordinates.length >= 3) {
      targetPolygon = normalizeCoordinates(activeField.coordinates);
      targetName = activeField.name || 'Selected Field';
    } else if (!fields || fields.length === 0) {
      targetPolygon = AREA_465;
      targetName = 'Agricultural Area 465';
    }

    if (targetPolygon && targetPolygon.length >= 3) {
      const aoiPoly = L.polygon(targetPolygon, {
        color: '#10b981',
        weight: 3,
        fillColor: '#10b981',
        fillOpacity: 0.12,
      }).addTo(fieldAoiLayerRef.current);

      L.polygon(targetPolygon, {
        color: '#ffffff',
        weight: 1.5,
        dashArray: '5, 5',
        fill: false,
        interactive: false,
      }).addTo(fieldAoiLayerRef.current);

      aoiPoly.bindTooltip(targetName, {
        permanent: true,
        direction: 'center',
        className: 'field-label',
      });

      if (showNdvi) {
        try {
          const ndviUrl = createNdviDataUrl(targetPolygon);
          L.imageOverlay(ndviUrl, boundsFromPolygon(targetPolygon), {
            opacity: 0.88,
            interactive: false,
          }).addTo(fieldAoiLayerRef.current);
        } catch (err) {
          console.error('Failed to generate NDVI overlay:', err);
        }
      }

      try {
        const bounds = aoiPoly.getBounds();
        if (bounds.isValid()) {
          mapObj.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 18,
            animate: true,
          });
        }
      } catch (err) {
        console.warn('Could not fit bounds for AOI:', err);
      }
    }
  }, [selectedField, fields, showNdvi, activeField]);

  const setZoomLevel = (value) => {
    const next = Number(value);
    setZoom(next);
    mapObj.current?.setZoom(next);
  };

  const toggleBaseLayer = () => {
    if (!mapObj.current) return;
    if (baseLayer === 'satellite') {
      mapObj.current.removeLayer(satLayer.current);
      streetLayer.current.addTo(mapObj.current);
      setBaseLayer('streets');
    } else {
      mapObj.current.removeLayer(streetLayer.current);
      satLayer.current.addTo(mapObj.current);
      setBaseLayer('satellite');
    }
  };

  return (
    <div
      className="zm-page -mx-3 -mb-3 sm:-mx-4 sm:-mb-4 md:-mx-6 md:-mb-6 bg-[#ffffff]"
      style={{
        marginTop: `${-(60 - navHeight)}px`,
        height: `calc(100vh - ${navHeight}px)`
      }}
    >
      <div className="zm-shell" ref={shellRef}>


        <section className="zm-map">
          <div ref={mapRef} className="absolute inset-0" />

          <div className="map-tools">
            <button
              type="button"
              className={`map-tool ${isPanelOpen ? 'active' : ''}`}
              aria-label="Result Automation"
              title={isPanelOpen ? 'Close Result Automation' : 'Open Result Automation'}
              onClick={() => setIsPanelOpen((v) => !v)}
            >
              <LuSquareSplitHorizontal size={16} />
            </button>
            <button
              type="button"
              className={`map-tool ${userLocation ? 'active' : ''}`}
              aria-label="Locate me"
              title="Locate me"
              onClick={handleLocateMe}
            >
              <LocateFixed size={18} className={locating ? 'text-blue-400' : ''} />
            </button>
            <button
              type="button"
              className="map-tool"
              aria-label="Edit field"
              onClick={() => navigate('/create-field')}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className={`map-tool ${showNdvi ? 'active' : ''}`}
              aria-label="Map layers"
              onClick={() => setShowNdvi((v) => !v)}
            >
              <Layers size={16} />
            </button>
          </div>

          <div className="zoom-rail">
            <button type="button" onClick={() => setZoomLevel(Math.min(20, zoom + 1))} aria-label="Zoom in">
              <Plus size={12} />
            </button>
            <div className="zoom-track">
              <input
                type="range"
                min="12"
                max="20"
                step="1"
                value={zoom}
                onChange={(e) => setZoomLevel(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Map zoom"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
              <span className="zoom-thumb" style={{ top: `${((20 - zoom) / 8) * 100}%` }} />
            </div>
          </div>
        </section>

        {isPanelOpen && windowWidth >= 1000 && (
          <div
            className={`zm-resizer ${isDragging ? 'dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onDoubleClick={handleDoubleClick}
            title="Drag to resize panel, double-click to reset"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize Result Automation panel"
          >
            <div className="zm-resizer-line" />
            <div className="zm-resizer-handle">
              <span className="zm-grip-dot" />
              <span className="zm-grip-dot" />
              <span className="zm-grip-dot" />
            </div>
          </div>
        )}

        <aside
          className={`zm-panel ${isPanelOpen ? 'open' : 'closed'} ${isDragging ? 'dragging' : ''}`}
          style={isPanelOpen && windowWidth >= 1000 ? { width: `${panelWidth}px` } : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-semibold leading-tight">Result Automation</p>
                <p className="text-[11px] text-gray-400">{activeField?.name || 'Agricultural Area 465'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                aria-label="Search"
                onClick={() => setShowSearch((v) => !v)}
              >
                <Search size={16} />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Close Panel"
                title="Close Result Automation"
                onClick={() => setIsPanelOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {showSearch && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search zones..."
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          )}

          <h1 className="text-[28px] font-semibold tracking-tight text-gray-900">Zone Management</h1>

          <div className="flex items-center gap-1">
            {['zone', 'community', 'gardening'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`zm-tab ${tab === id ? 'active' : ''}`}
              >
                {id[0].toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} /> Data
              <span className="ml-1 font-medium text-gray-700">08 December 2025</span>
            </span>
            <button type="button" className="flex items-center gap-1 text-gray-500" onClick={() => setShowParams((v) => !v)}>
              <SlidersHorizontal size={13} /> Parameters
            </button>
          </div>

          {showParams && (
            <div className="rounded-xl border border-gray-100 p-3 text-xs text-gray-600">
              <p>Potential yield 1.4 - 1.8 T/ac · NDVI overlay {showNdvi ? 'on' : 'off'}</p>
              <button type="button" className="mt-2 font-medium text-emerald-700" onClick={toggleBaseLayer}>
                Map base: {baseLayer} (switch)
              </button>
            </div>
          )}

          {tab === 'zone' && (
            <>
              <div>
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">Soil Health Suggestion</h2>
                    <p className="text-xs text-gray-400">
                      Your Potential : <span className="text-gray-600">1.4 - 1.8 T/ac</span>
                    </p>
                  </div>
                  <MoreHorizontal size={16} className="text-gray-400" />
                </div>
                <RadarChart />
                <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500" /> This month
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-orange-500" /> Last month
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/vegetation')}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-100 px-3 py-3 text-left shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-100 text-lime-700">
                    <Leaf size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-gray-800">Plant Stress</span>
                    <span className="block text-xs text-gray-400">Growth Monitoring & Environmental</span>
                  </span>
                </span>
                <ArrowUpRight size={16} className="text-gray-400" />
              </button>

              <div>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">Product: Urea Detected</h2>
                    <p className="text-xs text-gray-400">
                      Priority <span className="font-medium text-gray-700">241 ac</span>
                    </p>
                  </div>
                  <MoreHorizontal size={16} className="text-gray-400" />
                </div>
                <div className="grid grid-cols-[1.1fr_0.6fr_1.2fr_0.5fr] gap-y-2 text-[11px] text-gray-400">
                  <span>Zone</span>
                  <span>Goal</span>
                  <span>Disturbance</span>
                  <span>RX</span>
                  {filteredZones.map((zone) => (
                    <div key={zone.name} className="contents text-[12px] text-gray-700">
                      <button
                        type="button"
                        className={`zone-pill w-fit ${activeZone === zone.id ? 'active-zone' : ''}`}
                        style={{ background: zone.color }}
                        onClick={() => flyToZone(zone)}
                      >
                        {zone.name}
                      </button>
                      <span className="flex items-center">{zone.goal}</span>
                      <span className="flex items-center">{zone.disturbance}</span>
                      <span className="flex items-center">{zone.rx}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'community' && (
            <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
              Community notes for Agricultural Area 465: share irrigation windows and pest sightings with neighboring farms.
            </div>
          )}

          {tab === 'gardening' && (
            <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-600">
              Gardening tasks: apply urea on Zone 1 and Zone 4 after the next irrigation cycle.
            </div>
          )}
        </aside>

        {/* Mobile backdrop when Result Automation panel is open */}
        {isPanelOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-[950] md:hidden backdrop-blur-[1px] transition-opacity"
            onClick={() => setIsPanelOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
