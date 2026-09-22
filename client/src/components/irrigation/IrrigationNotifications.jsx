import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell,
  faBellSlash,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faWater,
  faThermometerHalf,
  faTint,
  faLeaf,
  faCog,
  faRobot,
  faUser,
  faCalendarAlt,
  faTrash,
  faEye,
  faEyeSlash,
  faFilter,
  faSync,
  faVolumeUp,
  faVolumeMute,
  faMobile,
  faEnvelope,
  faDesktop
} from '@fortawesome/free-solid-svg-icons';

/**
 * Irrigation Notifications Component
 * 
 * This component manages real-time notifications and alerts
 * for the irrigation system with comprehensive delivery options.
 * 
 * Features:
 * - Real-time notification feed
 * - Multiple notification types (alerts, updates, confirmations)
 * - Delivery method configuration (push, email, SMS)
 * - Notification filtering and search
 * - Mark as read/unread functionality
 * - Sound and visual alert settings
 * - Notification history and archive
 */
const IrrigationNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    read: 'all',
    source: 'all'
  });
  const [settings, setSettings] = useState({
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '06:00'
    }
  });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Text constants for translation support
  const TEXT_CONSTANTS = {
    TITLE: 'Irrigation Notifications',
    SUBTITLE: 'Real-time alerts and system updates',
    FILTERS: {
      TYPE: 'Type',
      PRIORITY: 'Priority',
      READ_STATUS: 'Status',
      SOURCE: 'Source'
    },
    TYPES: {
      ALERT: 'Alert',
      UPDATE: 'Update',
      CONFIRMATION: 'Confirmation',
      WARNING: 'Warning',
      INFO: 'Information',
      ERROR: 'Error'
    },
    PRIORITIES: {
      HIGH: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
      CRITICAL: 'Critical'
    },
    SOURCES: {
      SYSTEM: 'System',
      SENSOR: 'Sensor',
      WEATHER: 'Weather',
      USER: 'User Action',
      AUTOMATION: 'Automation',
      MAINTENANCE: 'Maintenance'
    },
    ACTIONS: {
      MARK_READ: 'Mark as Read',
      MARK_UNREAD: 'Mark as Unread',
      DELETE: 'Delete',
      DELETE_SELECTED: 'Delete Selected',
      MARK_ALL_READ: 'Mark All as Read',
      REFRESH: 'Refresh',
      SETTINGS: 'Settings',
      CLEAR_ALL: 'Clear All'
    },
    SETTINGS: {
      SOUND: 'Sound Notifications',
      DESKTOP: 'Desktop Notifications',
      EMAIL: 'Email Notifications',
      SMS: 'SMS Notifications',
      PUSH: 'Push Notifications',
      QUIET_HOURS: 'Quiet Hours',
      QUIET_START: 'Start Time',
      QUIET_END: 'End Time'
    }
  };

  useEffect(() => {
    loadNotifications();
    // Set up real-time notification polling
    const interval = setInterval(loadNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateUnreadCount();
  }, [notifications]);

  /**
   * Load notifications from backend
   * TODO: Connect to real-time notification service
   */
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual WebSocket or SSE connection
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      // setNotifications(data);
      
      // Mock notifications with real-time simulation
      const mockNotifications = [
        {
          id: 1,
          type: 'alert',
          priority: 'high',
          title: 'East Zone Irrigation Started',
          message: 'Scheduled irrigation for East zone has begun. Duration: 20 minutes.',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          source: 'automation',
          zone: 'east',
          read: false,
          actionRequired: false,
          category: 'irrigation'
        },
        {
          id: 2,
          type: 'warning',
          priority: 'critical',
          title: 'Low Water Pressure Alert',
          message: 'Water pressure has dropped to 15 PSI. Irrigation effectiveness may be compromised.',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          source: 'sensor',
          zone: 'all',
          read: false,
          actionRequired: true,
          category: 'system'
        },
        {
          id: 3,
          type: 'confirmation',
          priority: 'medium',
          title: 'Schedule Updated Successfully',
          message: 'Morning irrigation schedule for North zone has been updated to 06:30 AM.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          source: 'user',
          zone: 'north',
          read: true,
          actionRequired: false,
          category: 'schedule'
        },
        {
          id: 4,
          type: 'info',
          priority: 'low',
          title: 'Weather Update',
          message: 'Rain probability increased to 60% for tomorrow. Consider adjusting irrigation schedule.',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          source: 'weather',
          zone: 'all',
          read: true,
          actionRequired: false,
          category: 'weather'
        },
        {
          id: 5,
          type: 'update',
          priority: 'medium',
          title: 'Soil Moisture Sensors Updated',
          message: 'All soil moisture sensors have completed their hourly readings. Average moisture: 58%.',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          source: 'sensor',
          zone: 'all',
          read: false,
          actionRequired: false,
          category: 'sensors'
        },
        {
          id: 6,
          type: 'error',
          priority: 'high',
          title: 'South Zone Communication Error',
          message: 'Failed to communicate with South zone controller. Last successful contact: 2 hours ago.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: 'system',
          zone: 'south',
          read: false,
          actionRequired: true,
          category: 'system'
        },
        {
          id: 7,
          type: 'confirmation',
          priority: 'low',
          title: 'West Zone Irrigation Completed',
          message: 'Irrigation cycle for West zone completed successfully. Water used: 125L, Duration: 18 minutes.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          source: 'automation',
          zone: 'west',
          read: true,
          actionRequired: false,
          category: 'irrigation'
        },
        {
          id: 8,
          type: 'info',
          priority: 'medium',
          title: 'Weekly Report Available',
          message: 'Your weekly irrigation report is ready. Total water usage: 2,250L, Cost savings: $45.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          source: 'system',
          zone: 'all',
          read: false,
          actionRequired: false,
          category: 'reports'
        }
      ];

      setNotifications(mockNotifications);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update unread count
   */
  const updateUnreadCount = () => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  /**
   * Mark notification as read/unread
   */
  const toggleReadStatus = async (notificationId, read = true) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/notifications/${notificationId}/read`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ read })
      // });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read } : n
      ));
      
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  /**
   * Delete selected notifications
   */
  const deleteSelected = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/notifications/bulk-delete', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ids: selectedNotifications })
      // });
      
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
      
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  /**
   * Update notification settings
   */
  const updateSettings = async (newSettings) => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/user/notification-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // });
      
      setSettings(newSettings);
      
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  /**
   * Get filtered notifications
   */
  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      if (filters.type !== 'all' && notification.type !== filters.type) return false;
      if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
      if (filters.read === 'read' && !notification.read) return false;
      if (filters.read === 'unread' && notification.read) return false;
      if (filters.source !== 'all' && notification.source !== filters.source) return false;
      return true;
    });
  };

  /**
   * Get notification icon
   */
  const getNotificationIcon = (type, priority) => {
    if (priority === 'critical') return faExclamationTriangle;
    
    switch (type) {
      case 'alert': return faBell;
      case 'warning': return faExclamationTriangle;
      case 'error': return faTimesCircle;
      case 'confirmation': return faCheckCircle;
      case 'update': return faSync;
      case 'info': return faInfoCircle;
      default: return faBell;
    }
  };

  /**
   * Get notification color classes
   */
  const getNotificationColors = (type, priority, read) => {
    const baseClasses = read ? 'bg-gray-50' : 'bg-white';
    const borderClasses = read ? 'border-gray-200' : 'border-l-4';
    
    let colorClasses = '';
    if (priority === 'critical') {
      colorClasses = 'border-l-red-500 text-red-700';
    } else {
      switch (type) {
        case 'alert':
        case 'warning':
          colorClasses = 'border-l-yellow-500 text-yellow-700';
          break;
        case 'error':
          colorClasses = 'border-l-red-500 text-red-700';
          break;
        case 'confirmation':
          colorClasses = 'border-l-green-500 text-green-700';
          break;
        case 'update':
          colorClasses = 'border-l-blue-500 text-blue-700';
          break;
        case 'info':
          colorClasses = 'border-l-gray-500 text-gray-700';
          break;
        default:
          colorClasses = 'border-l-gray-500 text-gray-700';
      }
    }
    
    return `${baseClasses} ${read ? 'border-gray-200' : borderClasses} ${read ? '' : colorClasses}`;
  };

  /**
   * Get relative time
   */
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) return `${Math.floor(diffHours / 24)} days ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
            {TEXT_CONSTANTS.TITLE}
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <p className="text-gray-600">{TEXT_CONSTANTS.SUBTITLE}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            {TEXT_CONSTANTS.ACTIONS.MARK_ALL_READ}
          </button>
          <button
            onClick={loadNotifications}
            disabled={isLoading}
            className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
          >
            <FontAwesomeIcon 
              icon={faSync} 
              className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} 
            />
            {TEXT_CONSTANTS.ACTIONS.REFRESH}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="alert">Alerts</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
            <option value="confirmation">Confirmations</option>
            <option value="update">Updates</option>
            <option value="info">Information</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filters.read}
            onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          
          <select
            value={filters.source}
            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="system">System</option>
            <option value="sensor">Sensors</option>
            <option value="weather">Weather</option>
            <option value="user">User</option>
            <option value="automation">Automation</option>
          </select>
          
          {selectedNotifications.length > 0 && (
            <button
              onClick={deleteSelected}
              className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              Delete ({selectedNotifications.length})
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 transition-all hover:shadow-sm ${getNotificationColors(notification.type, notification.priority, notification.read)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotifications(prev => [...prev, notification.id]);
                      } else {
                        setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                      }
                    }}
                    className="mt-1 mr-3"
                  />
                  
                  <FontAwesomeIcon
                    icon={getNotificationIcon(notification.type, notification.priority)}
                    className="mt-1 mr-3 text-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                        {notification.type}
                      </span>
                      {notification.priority === 'critical' && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                          Critical
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{getRelativeTime(notification.timestamp)}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{notification.source}</span>
                      {notification.zone !== 'all' && (
                        <>
                          <span className="mx-2">•</span>
                          <FontAwesomeIcon icon={faWater} className="mr-1" />
                          <span className="capitalize">{notification.zone} zone</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleReadStatus(notification.id, !notification.read)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title={notification.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    <FontAwesomeIcon icon={notification.read ? faEyeSlash : faEye} />
                  </button>
                  
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Delete notification"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faBell} className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? 'No notifications have been received yet.' 
                : 'No notifications match your current filters.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings Modal - Simple inline version */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="text-lg font-medium mb-4 flex items-center">
          <FontAwesomeIcon icon={faCog} className="mr-2" />
          Notification Settings
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Delivery Methods</h5>
            
            {Object.entries({
              desktopNotifications: { label: TEXT_CONSTANTS.SETTINGS.DESKTOP, icon: faDesktop },
              emailNotifications: { label: TEXT_CONSTANTS.SETTINGS.EMAIL, icon: faEnvelope },
              smsNotifications: { label: TEXT_CONSTANTS.SETTINGS.SMS, icon: faMobile },
              pushNotifications: { label: TEXT_CONSTANTS.SETTINGS.PUSH, icon: faBell },
              soundEnabled: { label: TEXT_CONSTANTS.SETTINGS.SOUND, icon: faVolumeUp }
            }).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={config.icon} className="mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{config.label}</span>
                </div>
                <button
                  onClick={() => updateSettings({
                    ...settings,
                    [key]: !settings[key]
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900">Quiet Hours</h5>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">Enable Quiet Hours</span>
              <button
                onClick={() => updateSettings({
                  ...settings,
                  quietHours: { ...settings.quietHours, enabled: !settings.quietHours.enabled }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => updateSettings({
                      ...settings,
                      quietHours: { ...settings.quietHours, start: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => updateSettings({
                      ...settings,
                      quietHours: { ...settings.quietHours, end: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationNotifications;
