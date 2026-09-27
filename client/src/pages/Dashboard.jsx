import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  FileText,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Leaf,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  User,
} from 'lucide-react';
import {
  AREA_464,
  AREA_465,
  ESRI_SATELLITE,
  MAP_CENTER,
  MAP_ZOOM,
  OSM_STREETS,
  ZONES,
} from '../data/zoneMap';
import { boundsFromPolygon, createNdviDataUrl } from '../utils/ndviCanvas';
import './Dashboard.css';

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



const Dashboard = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const miniRef = useRef(null);
  const mapObj = useRef(null);
  const ndviLayer = useRef(null);
  const satLayer = useRef(null);
  const streetLayer = useRef(null);

  const [tab, setTab] = useState('zone');
  const [showAlert, setShowAlert] = useState(true);
  const [showNdvi, setShowNdvi] = useState(true);
  const [baseLayer, setBaseLayer] = useState('satellite');
  const [zoom, setZoom] = useState(MAP_ZOOM);
  const [activeZone, setActiveZone] = useState('zone-3');
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showParams, setShowParams] = useState(false);


  const filteredZones = ZONES.filter((zone) =>
    `${zone.name} ${zone.disturbance}`.toLowerCase().includes(query.toLowerCase())
  );

  const flyToZone = (zone) => {
    setActiveZone(zone.id);
    setShowAlert(true);
    mapObj.current?.flyTo(zone.center, 16, { duration: 0.7 });
  };

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
    });
    mapObj.current = map;
    map.on("zoomend", () => setZoom(map.getZoom()));

    satLayer.current = L.tileLayer(ESRI_SATELLITE, {
      attribution: 'Tiles © Esri',
      maxZoom: 19,
    }).addTo(map);

    streetLayer.current = L.tileLayer(OSM_STREETS, {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    });

    L.polygon(AREA_464, {
      color: '#ffffff',
      weight: 2,
      fill: false,
    }).addTo(map);

    L.polygon(AREA_465, {
      color: '#ffffff',
      weight: 3,
      fillColor: '#ffffff',
      fillOpacity: 0.04,
    }).addTo(map);

    const ndviUrl = createNdviDataUrl(AREA_465);
    ndviLayer.current = L.imageOverlay(ndviUrl, boundsFromPolygon(AREA_465), {
      opacity: 0.88,
      interactive: false,
    }).addTo(map);

    L.tooltip({ permanent: true, direction: 'center', className: 'field-label' })
      .setLatLng([30.8964, 75.8432])
      .setContent('Agricultural Area 464')
      .addTo(map);

    L.tooltip({ permanent: true, direction: 'center', className: 'field-label' })
      .setLatLng([30.8934, 75.8658])
      .setContent('Agricultural Area 465')
      .addTo(map);

    ZONES.forEach((zone) => {
      L.polygon(zone.polygon, {
        color: zone.color,
        weight: 1,
        fillOpacity: 0.08,
      })
        .on('click', () => flyToZone(zone))
        .addTo(map);
    });

    map.on('zoomend', () => setZoom(map.getZoom()));

    let mini;
    if (miniRef.current) {
      const miniContainer = document.createElement('div');
      miniContainer.style.width = '100%';
      miniContainer.style.height = '100%';
      miniRef.current.appendChild(miniContainer);
      mini = L.map(miniContainer, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM - 3,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });
      L.tileLayer(ESRI_SATELLITE, { maxZoom: 19 }).addTo(mini);
      const rect = L.rectangle(map.getBounds(), {
        color: '#fff',
        weight: 2,
        fillOpacity: 0.08,
      }).addTo(mini);

      const syncMini = () => {
        rect.setBounds(map.getBounds());
        mini.setView(map.getCenter(), Math.max(map.getZoom() - 3, 11), { animate: false });
      };
      map.on('move', syncMini);
      map.on('zoom', syncMini);
      miniRef.current.addEventListener('click', () => {
        map.setView(MAP_CENTER, MAP_ZOOM);
      });
    }

    const resize = () => map.invalidateSize();
    const ro = new ResizeObserver(resize);
    ro.observe(mapRef.current);
    setTimeout(resize, 200);

    return () => {
      ro.disconnect();
      if (mini) {
        mini.remove();
        if (miniRef.current) miniRef.current.innerHTML = '';
      }
      map.remove();
      if (mapRef.current) mapRef.current.innerHTML = '';
      mapObj.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ndviLayer.current) return;
    if (showNdvi) {
      ndviLayer.current.addTo(mapObj.current);
    } else {
      mapObj.current?.removeLayer(ndviLayer.current);
    }
  }, [showNdvi]);

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

  const activeZoneData = ZONES.find((zone) => zone.id === activeZone) || ZONES[2];

  return (
    <div className="zm-page -mx-3 -mb-3 sm:-mx-4 sm:-mb-4 md:-mx-6 md:-mb-6 h-[calc(100vh-72px)] bg-[#dfe3e8] p-2 md:p-3">
      <div className="zm-shell">


        <section className="zm-map">
          <div ref={mapRef} className="absolute inset-0" />

          <div className="map-tools">
            <button
              type="button"
              className={`map-tool ${showAlert ? 'active' : ''}`}
              aria-label="Analytics"
              onClick={() => setShowAlert((v) => !v)}
            >
              <BarChart3 size={16} />
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
            <button type="button" onClick={() => setZoomLevel(Math.min(19, zoom + 1))} aria-label="Zoom in">
              <Plus size={12} />
            </button>
            <div className="zoom-track">
              <input
                type="range"
                min="12"
                max="19"
                step="1"
                value={zoom}
                onChange={(e) => setZoomLevel(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Map zoom"
                style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              />
              <span className="zoom-thumb" style={{ top: `${((19 - zoom) / 7) * 100}%` }} />
            </div>
          </div>

          <div className="minimap" ref={miniRef} />

          {showAlert && (
            <div className="alert-card">
              <div className="mb-1 flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">
                  <AlertTriangle size={16} />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">Crop Health Alert</h3>
                  <p className="text-xs text-gray-400">Agricultural Area 465 · {activeZoneData.name}</p>
                </div>
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <CalendarDays size={13} />
                Identified: 02 - 05 December 2025
              </p>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-sky-50 text-sky-600">≡</span>
                  Possible Water Deficit
                </span>
                <span className="grid h-5 w-5 place-items-center rounded-full border border-gray-200 text-[10px] text-gray-400">
                  i
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Parameters <span className="ml-1 font-medium text-gray-800">1.4 - 1.8 T/ac</span>
                </span>
                <span className="flex items-center gap-1 font-medium text-rose-500">
                  ▦ NDVI: {activeZoneData.ndvi.toFixed(2)}
                </span>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAlert(false)}
                  className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowAlert(false)}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="zm-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-white">
                <LayoutGrid size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Result Automation</p>
                <p className="text-[11px] text-gray-400">Agricultural Area 465</p>
              </div>
            </div>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100"
              aria-label="Search"
              onClick={() => setShowSearch((v) => !v)}
            >
              <Search size={16} />
            </button>
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
      </div>
    </div>
  );
};

export default Dashboard;
