import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWater, 
  faStop,
  faPlay,
  faPause,
  faCompass,
  faClock,
  faDroplet,
  faThermometerHalf,
  faWind,
  faEye,
  faSpinner,
  faLeaf,
  faTimes,
  faCog
} from '@fortawesome/free-solid-svg-icons';

/**
 * Zone Control Dashboard Component
 * 
 * This component provides visual field zone display and irrigation control.
 * Features:
 * - 4-zone field visualization (North, South, East, West)
 * - Individual zone irrigation controls
 * - Real-time zone status monitoring
 * - Manual irrigation triggers with duration control
 * - Visual feedback for active irrigation zones
 */
const ZoneControlDashboard = ({ onZoneIrrigation, isLoading }) => {
  const [zoneStatus, setZoneStatus] = useState({
    north: { active: false, lastIrrigated: null, soilMoisture: 45, valveStatus: 'closed' },
    south: { active: false, lastIrrigated: null, soilMoisture: 62, valveStatus: 'closed' },
    east: { active: true, lastIrrigated: new Date().toISOString(), soilMoisture: 78, valveStatus: 'open' },
    west: { active: false, lastIrrigated: null, soilMoisture: 51, valveStatus: 'closed' }
  });

  const [irrigationProgress, setIrrigationProgress] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [manualDuration, setManualDuration] = useState(15);

  // Text constants for translation support
  const TEXT_CONSTANTS = {
    TITLE: 'Zone Control Dashboard',
    SUBTITLE: 'Monitor and control irrigation zones with real-time status',
    ZONES: {
      NORTH: 'North Zone',
      SOUTH: 'South Zone',
      EAST: 'East Zone',
      WEST: 'West Zone'
    },
    CONTROLS: {
      START: 'Start Irrigation',
      STOP: 'Stop Irrigation',
      PAUSE: 'Pause',
      RESUME: 'Resume',
      VIEW_DETAILS: 'View Details',
      DURATION: 'Duration (minutes)',
      MANUAL_CONTROL: 'Manual Control'
    },
    STATUS: {
      ACTIVE: 'Active',
      INACTIVE: 'Inactive',
      PAUSED: 'Paused',
      ERROR: 'Error',
      IRRIGATING: 'Irrigating...'
    }
  };

  useEffect(() => {
    // Fetch initial zone status from backend
    fetchZoneStatus();
    
    // Set up real-time status updates
    const statusInterval = setInterval(fetchZoneStatus, 30000); // Update every 30 seconds
    
    return () => clearInterval(statusInterval);
  }, []);

  /**
   * Fetch current zone status from backend
   * TODO: Connect to actual backend API
   */
  const fetchZoneStatus = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/irrigation/zones/status');
      // const data = await response.json();
      // setZoneStatus(data);
      
      // Mock API response for development - reduced logging
      if (process.env.NODE_ENV === 'development') {
        console.debug('Zone status updated (mock data)');
      }
    } catch (error) {
      console.error('Error fetching zone status:', error);
    }
  };

  /**
   * Handle individual zone irrigation
   * @param {string} zone - Zone identifier (north, south, east, west)
   */
  const handleZoneIrrigation = async (zone, action = 'start') => {
    try {
      if (action === 'start') {
        // Start irrigation for specified duration
        setZoneStatus(prev => ({
          ...prev,
          [zone]: { 
            ...prev[zone], 
            active: true, 
            lastIrrigated: new Date().toISOString(),
            valveStatus: 'open'
          }
        }));

        // Start progress tracking
        setIrrigationProgress(prev => ({ ...prev, [zone]: 0 }));
        
        // Simulate irrigation progress
        const progressInterval = setInterval(() => {
          setIrrigationProgress(prev => {
            const newProgress = (prev[zone] || 0) + (100 / (manualDuration * 60)); // Progress per second
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              stopZoneIrrigation(zone);
              return { ...prev, [zone]: 100 };
            }
            return { ...prev, [zone]: newProgress };
          });
        }, 1000);

        // TODO: Replace with actual API call
        // await fetch(`/api/irrigation/zones/${zone}/start`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ duration: manualDuration })
        // });

        if (onZoneIrrigation) {
          onZoneIrrigation(zone, 'start', manualDuration);
        }

      } else if (action === 'stop') {
        stopZoneIrrigation(zone);
      }
    } catch (error) {
      console.error(`Error ${action}ing irrigation for ${zone} zone:`, error);
    }
  };

  /**
   * Stop irrigation for a specific zone
   */
  const stopZoneIrrigation = async (zone) => {
    try {
      setZoneStatus(prev => ({
        ...prev,
        [zone]: { 
          ...prev[zone], 
          active: false,
          valveStatus: 'closed'
        }
      }));

      setIrrigationProgress(prev => ({ ...prev, [zone]: 0 }));

      // TODO: Replace with actual API call
      // await fetch(`/api/irrigation/zones/${zone}/stop`, { method: 'POST' });

      if (onZoneIrrigation) {
        onZoneIrrigation(zone, 'stop');
      }
    } catch (error) {
      console.error(`Error stopping irrigation for ${zone} zone:`, error);
    }
  };

  /**
   * Get color class based on soil moisture level
   */
  const getMoistureColor = (moisture) => {
    if (moisture < 30) return 'text-red-600 bg-red-100';
    if (moisture < 50) return 'text-yellow-600 bg-yellow-100';
    if (moisture < 70) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  /**
   * Get valve status color
   */
  const getValveStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Format last irrigated time
   */
  const formatLastIrrigated = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Recently';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading zone control...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{TEXT_CONSTANTS.TITLE}</h3>
        <p className="text-gray-600">{TEXT_CONSTANTS.SUBTITLE}</p>
      </div>

      {/* Manual Control Panel */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{TEXT_CONSTANTS.CONTROLS.MANUAL_CONTROL}</h4>
        <div className="flex items-center space-x-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TEXT_CONSTANTS.CONTROLS.DURATION}
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={manualDuration}
              onChange={(e) => setManualDuration(parseInt(e.target.value))}
              className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            Set irrigation duration for manual zone control
          </div>
        </div>
      </div>

      {/* Field Visualization Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Field Zone Layout</h4>
        
        {/* 3x3 Grid representing field sections */}
        <div className="grid grid-cols-3 gap-2 mb-6 max-w-md mx-auto">
          {/* North Zone */}
          <div className="col-start-2">
            <div 
              className={`relative aspect-square rounded-lg border-2 p-4 text-center cursor-pointer transition-all ${
                zoneStatus.north.active 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setSelectedZone('north')}
            >
              <FontAwesomeIcon icon={faLeaf} className="text-green-600 text-3xl mb-2" />
              <div className="text-sm font-medium text-gray-900">North</div>
              {zoneStatus.north.active && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWater} className="text-blue-500 text-2xl animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* West Zone */}
          <div className="col-start-1 row-start-2">
            <div 
              className={`relative aspect-square rounded-lg border-2 p-4 text-center cursor-pointer transition-all ${
                zoneStatus.west.active 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setSelectedZone('west')}
            >
              <FontAwesomeIcon icon={faLeaf} className="text-green-600 text-3xl mb-2" />
              <div className="text-sm font-medium text-gray-900">West</div>
              {zoneStatus.west.active && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWater} className="text-blue-500 text-2xl animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Center (Control Center) */}
          <div className="col-start-2 row-start-2">
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 p-4 text-center flex items-center justify-center">
              <div>
                <FontAwesomeIcon icon={faCog} className="text-gray-600 text-2xl mb-1" />
                <div className="text-xs text-gray-600">Control Center</div>
              </div>
            </div>
          </div>

          {/* East Zone */}
          <div className="col-start-3 row-start-2">
            <div 
              className={`relative aspect-square rounded-lg border-2 p-4 text-center cursor-pointer transition-all ${
                zoneStatus.east.active 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setSelectedZone('east')}
            >
              <FontAwesomeIcon icon={faLeaf} className="text-green-600 text-3xl mb-2" />
              <div className="text-sm font-medium text-gray-900">East</div>
              {zoneStatus.east.active && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWater} className="text-blue-500 text-2xl animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* South Zone */}
          <div className="col-start-2 row-start-3">
            <div 
              className={`relative aspect-square rounded-lg border-2 p-4 text-center cursor-pointer transition-all ${
                zoneStatus.south.active 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => setSelectedZone('south')}
            >
              <FontAwesomeIcon icon={faLeaf} className="text-green-600 text-3xl mb-2" />
              <div className="text-sm font-medium text-gray-900">South</div>
              {zoneStatus.south.active && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWater} className="text-blue-500 text-2xl animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 mb-4">
          Click on a zone to view details and control irrigation
        </div>
      </div>

      {/* Zone Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(zoneStatus).map(([zoneName, status]) => (
          <div key={zoneName} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Zone Header */}
            <div className={`p-4 ${status.active ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <h5 className="font-semibold text-gray-900 capitalize">{zoneName} Zone</h5>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  status.active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {status.active ? TEXT_CONSTANTS.STATUS.ACTIVE : TEXT_CONSTANTS.STATUS.INACTIVE}
                </div>
              </div>
            </div>

            {/* Zone Stats */}
            <div className="p-4 space-y-3">
              {/* Soil Moisture */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Soil Moisture</span>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faDroplet} className="text-blue-500" />
                  <span className={`text-sm font-medium px-2 py-1 rounded ${getMoistureColor(status.soilMoisture)}`}>
                    {status.soilMoisture}%
                  </span>
                </div>
              </div>

              {/* Valve Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valve Status</span>
                <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${getValveStatusColor(status.valveStatus)}`}>
                  {status.valveStatus}
                </span>
              </div>

              {/* Last Irrigated */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Irrigated</span>
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
                  <span className="text-sm text-gray-900">{formatLastIrrigated(status.lastIrrigated)}</span>
                </div>
              </div>

              {/* Progress Bar for Active Irrigation */}
              {status.active && irrigationProgress[zoneName] !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{Math.round(irrigationProgress[zoneName] || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${irrigationProgress[zoneName] || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Zone Controls */}
            <div className="px-4 pb-4">
              {status.active ? (
                <button
                  onClick={() => handleZoneIrrigation(zoneName, 'stop')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faStop} className="mr-2" />
                  {TEXT_CONSTANTS.CONTROLS.STOP}
                </button>
              ) : (
                <button
                  onClick={() => handleZoneIrrigation(zoneName, 'start')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  {TEXT_CONSTANTS.CONTROLS.START}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Zone Detail Panel */}
      {selectedZone && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 capitalize">
              {selectedZone} Zone Details
            </h4>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Status */}
            <div className="space-y-3">
              <h6 className="font-medium text-gray-900">Current Status</h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${zoneStatus[selectedZone]?.active ? 'text-blue-600' : 'text-gray-600'}`}>
                    {zoneStatus[selectedZone]?.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Soil Moisture:</span>
                  <span className="font-medium">{zoneStatus[selectedZone]?.soilMoisture}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valve:</span>
                  <span className="font-medium capitalize">{zoneStatus[selectedZone]?.valveStatus}</span>
                </div>
              </div>
            </div>

            {/* Environmental Data */}
            <div className="space-y-3">
              <h6 className="font-medium text-gray-900">Environmental</h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-medium">24°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Humidity:</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wind Speed:</span>
                  <span className="font-medium">12 km/h</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h6 className="font-medium text-gray-900">Quick Actions</h6>
              <div className="space-y-2">
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  View History
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                  <FontAwesomeIcon icon={faCog} className="mr-2" />
                  Configure Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneControlDashboard;
