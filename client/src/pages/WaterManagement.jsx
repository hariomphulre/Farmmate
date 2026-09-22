import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWater, 
  faCalendarAlt, 
  faGaugeHigh,
  faCog,
  faHistory,
  faExclamationTriangle,
  faBell
} from '@fortawesome/free-solid-svg-icons';

// Import irrigation components
import ZoneControlDashboard from '../components/irrigation/ZoneControlDashboard';
import IrrigationScheduler from '../components/irrigation/IrrigationScheduler';
import SensorDashboard from '../components/irrigation/SensorDashboard';
import IrrigationHistory from '../components/irrigation/IrrigationHistory';
import SmartSuggestions from '../components/irrigation/SmartSuggestions';
import IrrigationNotifications from '../components/irrigation/IrrigationNotifications';

/**
 * Water Management Main Component
 * 
 * This component serves as the main dashboard for irrigation and water management.
 * It provides zone-based field control, scheduling, sensor monitoring, and smart suggestions.
 * 
 * Features:
 * - 4-zone field control (North, South, East, West)
 * - Irrigation scheduling and automation
 * - Real-time sensor monitoring
 * - Smart watering suggestions based on weather and soil conditions
 * - Historical irrigation logs
 * - Notifications and alerts
 */
const WaterManagement = () => {
  const [activeTab, setActiveTab] = useState('control');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Text constants for translation support
  const TEXT_CONSTANTS = {
    TITLE: 'Water Management & Irrigation Control',
    SUBTITLE: 'Smart irrigation system with zone-based control and automated scheduling',
    TABS: {
      CONTROL: 'Zone Control',
      SCHEDULE: 'Schedule',
      SENSORS: 'Sensors',
      HISTORY: 'History',
      SUGGESTIONS: 'Smart Suggestions',
      NOTIFICATIONS: 'Notifications'
    },
    NOTIFICATIONS: {
      IRRIGATION_STARTED: 'Irrigation started successfully',
      IRRIGATION_STOPPED: 'Irrigation stopped',
      SCHEDULE_UPDATED: 'Irrigation schedule updated',
      SENSOR_WARNING: 'Sensor reading requires attention',
      SYSTEM_ERROR: 'System error occurred'
    }
  };

  useEffect(() => {
    // Initialize component data
    loadInitialData();
  }, []);

  /**
   * Load initial data for the water management system
   * TODO: Connect to backend API endpoints for real data
   */
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      // await Promise.all([
      //   fetchZoneStatus(),
      //   fetchSensorData(),
      //   fetchIrrigationSchedule(),
      //   fetchIrrigationHistory(),
      //   fetchWeatherData()
      // ]);
      
      // Mock delay for loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading irrigation data:', error);
      addNotification('error', TEXT_CONSTANTS.NOTIFICATIONS.SYSTEM_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add notification to the notification system
   * @param {string} type - Notification type (success, warning, error, info)
   * @param {string} message - Notification message
   */
  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep last 10 notifications
  };

  /**
   * Handle irrigation zone activation
   * @param {string} zone - Zone identifier (north, south, east, west)
   * @param {number} duration - Irrigation duration in minutes
   */
  const handleZoneIrrigation = async (zone, duration) => {
    try {
      setIsLoading(true);
      
      // TODO: Connect to backend irrigation API
      // const response = await irrigationAPI.activateZone(zone, duration);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification('success', `${TEXT_CONSTANTS.NOTIFICATIONS.IRRIGATION_STARTED} for ${zone} zone`);
    } catch (error) {
      console.error('Error activating irrigation:', error);
      addNotification('error', TEXT_CONSTANTS.NOTIFICATIONS.SYSTEM_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle schedule updates
   * @param {Object} scheduleData - Updated schedule configuration
   */
  const handleScheduleUpdate = async (scheduleData) => {
    try {
      setIsLoading(true);
      
      // TODO: Connect to backend schedule API
      // const response = await irrigationAPI.updateSchedule(scheduleData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification('success', TEXT_CONSTANTS.NOTIFICATIONS.SCHEDULE_UPDATED);
    } catch (error) {
      console.error('Error updating schedule:', error);
      addNotification('error', TEXT_CONSTANTS.NOTIFICATIONS.SYSTEM_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && activeTab === 'control') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading irrigation system...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{TEXT_CONSTANTS.TITLE}</h1>
        <p className="text-blue-100 text-lg">{TEXT_CONSTANTS.SUBTITLE}</p>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faWater} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Zones</p>
              <p className="text-lg font-semibold">2/4</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled Today</p>
              <p className="text-lg font-semibold">6</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faGaugeHigh} className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Soil Moisture</p>
              <p className="text-lg font-semibold">68%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Alerts</p>
              <p className="text-lg font-semibold">{notifications.filter(n => n.type === 'warning' || n.type === 'error').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'control', label: TEXT_CONSTANTS.TABS.CONTROL, icon: faWater },
              { id: 'schedule', label: TEXT_CONSTANTS.TABS.SCHEDULE, icon: faCalendarAlt },
              { id: 'sensors', label: TEXT_CONSTANTS.TABS.SENSORS, icon: faGaugeHigh },
              { id: 'history', label: TEXT_CONSTANTS.TABS.HISTORY, icon: faHistory },
              { id: 'suggestions', label: TEXT_CONSTANTS.TABS.SUGGESTIONS, icon: faExclamationTriangle },
              { id: 'notifications', label: TEXT_CONSTANTS.TABS.NOTIFICATIONS, icon: faBell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'control' && (
            <ZoneControlDashboard 
              onZoneIrrigation={handleZoneIrrigation}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'schedule' && (
            <IrrigationScheduler 
              onScheduleUpdate={handleScheduleUpdate}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'sensors' && (
            <SensorDashboard />
          )}
          {activeTab === 'history' && (
            <IrrigationHistory />
          )}
          {activeTab === 'suggestions' && (
            <SmartSuggestions 
              onSuggestionAction={(action) => addNotification('info', `Applied suggestion: ${action}`)}
            />
          )}
          {activeTab === 'notifications' && (
            <IrrigationNotifications 
              notifications={notifications}
              onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterManagement;
