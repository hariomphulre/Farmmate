import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGaugeHigh,
  faThermometerHalf,
  faDroplet,
  faSeedling,
  faWind,
  faBolt,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faRefresh,
  faWifi,
  faBatteryFull,
  faBatteryHalf,
  faBatteryEmpty,
  faSignal,
  faFlask
} from '@fortawesome/free-solid-svg-icons';

/**
 * Sensor Dashboard Component
 * 
 * This component displays real-time sensor data and device status
 * for irrigation monitoring and control.
 * 
 * Features:
 * - Real-time soil moisture readings per zone
 * - Environmental sensor data (temperature, humidity, light)
 * - Valve and device status monitoring
 * - Sensor health and connectivity status
 * - Data visualization and alerts
 */
const SensorDashboard = () => {
  const [sensorData, setSensorData] = useState({});
  const [deviceStatus, setDeviceStatus] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Text constants for translation support
  const TEXT_CONSTANTS = {
    TITLE: 'Sensor Dashboard',
    SUBTITLE: 'Real-time monitoring of field sensors and irrigation devices',
    SECTIONS: {
      SOIL_MOISTURE: 'Soil Moisture Sensors',
      ENVIRONMENTAL: 'Environmental Sensors',
      DEVICE_STATUS: 'Device Status',
      CONNECTIVITY: 'Connectivity & Health'
    },
    SENSORS: {
      SOIL_MOISTURE: 'Soil Moisture',
      TEMPERATURE: 'Temperature',
      HUMIDITY: 'Humidity',
      LIGHT_INTENSITY: 'Light Intensity',
      PH_LEVEL: 'pH Level',
      CONDUCTIVITY: 'Electrical Conductivity'
    },
    DEVICES: {
      VALVE: 'Irrigation Valve',
      PUMP: 'Water Pump',
      CONTROLLER: 'Zone Controller',
      SENSOR_NODE: 'Sensor Node'
    },
    STATUS: {
      ONLINE: 'Online',
      OFFLINE: 'Offline',
      WARNING: 'Warning',
      ERROR: 'Error',
      NORMAL: 'Normal',
      CRITICAL: 'Critical',
      LOW_BATTERY: 'Low Battery'
    },
    UNITS: {
      PERCENTAGE: '%',
      CELSIUS: '°C',
      LUX: 'lux',
      SIEMENS: 'µS/cm'
    },
    BUTTONS: {
      REFRESH: 'Refresh Data',
      VIEW_HISTORY: 'View History',
      CALIBRATE: 'Calibrate',
      RESET: 'Reset'
    }
  };

  // Mock sensor data - TODO: Replace with actual API calls
  const mockSensorData = {
    soilMoisture: {
      north: { value: 45, status: 'low', lastUpdate: '2024-09-08T10:30:00Z', trend: 'decreasing' },
      south: { value: 72, status: 'optimal', lastUpdate: '2024-09-08T10:30:00Z', trend: 'stable' },
      east: { value: 38, status: 'critical', lastUpdate: '2024-09-08T10:29:00Z', trend: 'decreasing' },
      west: { value: 68, status: 'optimal', lastUpdate: '2024-09-08T10:30:00Z', trend: 'increasing' }
    },
    environmental: {
      temperature: { value: 28.5, status: 'normal', unit: '°C', lastUpdate: '2024-09-08T10:30:00Z' },
      humidity: { value: 65, status: 'normal', unit: '%', lastUpdate: '2024-09-08T10:30:00Z' },
      lightIntensity: { value: 45000, status: 'normal', unit: 'lux', lastUpdate: '2024-09-08T10:30:00Z' },
      phLevel: { value: 6.8, status: 'normal', unit: 'pH', lastUpdate: '2024-09-08T10:29:00Z' },
      conductivity: { value: 1.2, status: 'normal', unit: 'mS/cm', lastUpdate: '2024-09-08T10:30:00Z' }
    }
  };

  const mockDeviceStatus = {
    valves: {
      north: { status: 'closed', connectivity: 'online', battery: 85, lastCommunication: '2024-09-08T10:30:00Z' },
      south: { status: 'open', connectivity: 'online', battery: 92, lastCommunication: '2024-09-08T10:30:00Z' },
      east: { status: 'closed', connectivity: 'warning', battery: 23, lastCommunication: '2024-09-08T10:25:00Z' },
      west: { status: 'open', connectivity: 'online', battery: 78, lastCommunication: '2024-09-08T10:30:00Z' }
    },
    controllers: {
      main: { status: 'online', temperature: 45, uptime: '15 days', errors: 0 },
      backup: { status: 'standby', temperature: 42, uptime: '15 days', errors: 0 }
    },
    pump: {
      status: 'running',
      pressure: 2.3,
      flowRate: 150,
      powerConsumption: 1.2,
      temperature: 55,
      runTime: '2h 15m'
    }
  };

  useEffect(() => {
    // Initial data load
    fetchSensorData();
    
    // Set up real-time updates
    const interval = setInterval(fetchSensorData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Fetch sensor data from backend
   * TODO: Connect to actual sensor API endpoints
   */
  const fetchSensorData = async () => {
    try {
      setIsRefreshing(true);
      
      // TODO: Replace with actual API calls
      // const [sensorResponse, deviceResponse] = await Promise.all([
      //   fetch('/api/irrigation/sensors/data'),
      //   fetch('/api/irrigation/devices/status')
      // ]);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSensorData(mockSensorData);
      setDeviceStatus(mockDeviceStatus);
      setLastUpdate(new Date().toISOString());
      
      // Generate alerts based on sensor data
      generateAlerts(mockSensorData, mockDeviceStatus);
      
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Generate alerts based on sensor readings and device status
   */
  const generateAlerts = (sensors, devices) => {
    const newAlerts = [];
    
    // Check soil moisture levels
    Object.entries(sensors.soilMoisture).forEach(([zone, data]) => {
      if (data.status === 'critical') {
        newAlerts.push({
          id: `moisture-${zone}`,
          type: 'error',
          message: `Critical soil moisture in ${zone} zone: ${data.value}%`,
          zone,
          timestamp: new Date().toISOString()
        });
      } else if (data.status === 'low') {
        newAlerts.push({
          id: `moisture-${zone}`,
          type: 'warning',
          message: `Low soil moisture in ${zone} zone: ${data.value}%`,
          zone,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Check device connectivity
    Object.entries(devices.valves).forEach(([zone, valve]) => {
      if (valve.connectivity === 'warning') {
        newAlerts.push({
          id: `connectivity-${zone}`,
          type: 'warning',
          message: `Connection issues with ${zone} zone valve`,
          zone,
          timestamp: new Date().toISOString()
        });
      }
      
      if (valve.battery < 30) {
        newAlerts.push({
          id: `battery-${zone}`,
          type: 'warning',
          message: `Low battery in ${zone} zone valve: ${valve.battery}%`,
          zone,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  /**
   * Get color class based on sensor status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal':
      case 'normal':
        return 'text-green-600 bg-green-100';
      case 'low':
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get battery icon based on level
   */
  const getBatteryIcon = (level) => {
    if (level > 60) return faBatteryFull;
    if (level > 30) return faBatteryHalf;
    return faBatteryEmpty;
  };

  /**
   * Format timestamp for display
   */
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{TEXT_CONSTANTS.TITLE}</h3>
          <p className="text-gray-600">{TEXT_CONSTANTS.SUBTITLE}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Last updated: {formatLastUpdate(lastUpdate)}
          </span>
          <button
            onClick={fetchSensorData}
            disabled={isRefreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <FontAwesomeIcon 
              icon={faRefresh} 
              className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            {TEXT_CONSTANTS.BUTTONS.REFRESH}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center mb-2">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mr-2" />
            <h4 className="text-sm font-medium text-yellow-800">Sensor Alerts</h4>
          </div>
          <div className="space-y-1">
            {alerts.map((alert) => (
              <p key={alert.id} className="text-sm text-yellow-700">{alert.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Soil Moisture Sensors */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{TEXT_CONSTANTS.SECTIONS.SOIL_MOISTURE}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sensorData.soilMoisture && Object.entries(sensorData.soilMoisture).map(([zone, data]) => (
            <div key={zone} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 capitalize">{zone} Zone</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faDroplet} className="text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{data.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.value < 30 ? 'bg-red-500' :
                    data.value < 50 ? 'bg-yellow-500' :
                    data.value < 70 ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${data.value}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                Updated: {formatLastUpdate(data.lastUpdate)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Sensors */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{TEXT_CONSTANTS.SECTIONS.ENVIRONMENTAL}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {sensorData.environmental && Object.entries(sensorData.environmental).map(([sensor, data]) => {
            const sensorIcons = {
              temperature: faThermometerHalf,
              humidity: faDroplet,
              lightIntensity: faSeedling,
              phLevel: faFlask,
              conductivity: faBolt
            };
            
            return (
              <div key={sensor} className="bg-gray-50 rounded-lg p-4 text-center">
                <FontAwesomeIcon 
                  icon={sensorIcons[sensor]} 
                  className="text-blue-600 text-2xl mb-2" 
                />
                <h6 className="font-medium text-gray-900 text-sm mb-1">
                  {sensor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h6>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {data.value} {data.unit}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Device Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valve Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Irrigation Valves</h4>
          <div className="space-y-3">
            {deviceStatus.valves && Object.entries(deviceStatus.valves).map(([zone, valve]) => (
              <div key={zone} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    valve.connectivity === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h6 className="font-medium text-gray-900 capitalize">{zone} Valve</h6>
                    <p className="text-sm text-gray-500">
                      Status: {valve.status} | Last: {formatLastUpdate(valve.lastCommunication)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon 
                    icon={getBatteryIcon(valve.battery)} 
                    className={`${valve.battery < 30 ? 'text-red-600' : 'text-green-600'}`} 
                  />
                  <span className="text-sm font-medium">{valve.battery}%</span>
                  <FontAwesomeIcon 
                    icon={faWifi} 
                    className={`${valve.connectivity === 'online' ? 'text-green-600' : 'text-red-600'}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">System Status</h4>
          <div className="space-y-4">
            {/* Pump Status */}
            {deviceStatus.pump && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-900">Water Pump</h6>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    deviceStatus.pump.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {deviceStatus.pump.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Pressure: {deviceStatus.pump.pressure} bar</div>
                  <div>Flow: {deviceStatus.pump.flowRate} L/min</div>
                  <div>Power: {deviceStatus.pump.powerConsumption} kW</div>
                  <div>Runtime: {deviceStatus.pump.runTime}</div>
                </div>
              </div>
            )}

            {/* Controllers */}
            {deviceStatus.controllers && Object.entries(deviceStatus.controllers).map(([name, controller]) => (
              <div key={name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="font-medium text-gray-900 capitalize">{name} Controller</h6>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(controller.status)}`}>
                    {controller.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Temperature: {controller.temperature}°C</div>
                  <div>Uptime: {controller.uptime}</div>
                  <div>Errors: {controller.errors}</div>
                  <div>
                    <FontAwesomeIcon 
                      icon={controller.errors === 0 ? faCheckCircle : faTimesCircle} 
                      className={`mr-1 ${controller.errors === 0 ? 'text-green-600' : 'text-red-600'}`} 
                    />
                    {controller.errors === 0 ? 'Healthy' : 'Issues Detected'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDashboard;
