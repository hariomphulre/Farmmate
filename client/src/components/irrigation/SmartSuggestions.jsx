import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb,
  faBrain,
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faCloudRain,
  faThermometerHalf,
  faTint,
  faLeaf,
  faWater,
  faCalendarAlt,
  faRobot,
  faCog,
  faEye,
  faEyeSlash,
  faBell,
  faBellSlash,
  faRefresh,
  faCloud,
  faSun,
  faSnowflake
} from '@fortawesome/free-solid-svg-icons';

/**
 * Smart Suggestions & Warnings Component
 * 
 * This component provides AI-powered irrigation recommendations
 * and warnings based on real-time data analysis.
 * 
 * Features:
 * - Weather-based irrigation suggestions
 * - Soil moisture optimization recommendations
 * - Crop-specific watering guidance
 * - Emergency alerts and warnings
 * - Predictive analytics insights
 * - Customizable notification preferences
 */
const SmartSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    enableWeatherAlerts: true,
    enableSoilAlerts: true,
    enableCropAlerts: true,
    enableSystemAlerts: true,
    alertFrequency: 'immediate'
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState('suggestions');

  // Text constants for translation support
  const TEXT_CONSTANTS = {
    TITLE: 'Smart Suggestions & Warnings',
    SUBTITLE: 'AI-powered irrigation recommendations and alerts',
    TABS: {
      SUGGESTIONS: 'Suggestions',
      WARNINGS: 'Warnings',
      PREFERENCES: 'Preferences'
    },
    SUGGESTION_TYPES: {
      WEATHER: 'Weather-Based',
      SOIL: 'Soil Optimization',
      CROP: 'Crop Care',
      SYSTEM: 'System Efficiency',
      ENERGY: 'Energy Saving',
      PREDICTION: 'Predictive'
    },
    WARNING_TYPES: {
      EMERGENCY: 'Emergency',
      CRITICAL: 'Critical',
      WARNING: 'Warning',
      INFO: 'Information'
    },
    ACTIONS: {
      APPLY: 'Apply Suggestion',
      DISMISS: 'Dismiss',
      VIEW_DETAILS: 'View Details',
      REFRESH: 'Refresh',
      CONFIGURE: 'Configure'
    },
    PREFERENCES: {
      WEATHER_ALERTS: 'Weather Alerts',
      SOIL_ALERTS: 'Soil Moisture Alerts',
      CROP_ALERTS: 'Crop Health Alerts',
      SYSTEM_ALERTS: 'System Alerts',
      FREQUENCY: 'Alert Frequency'
    }
  };

  useEffect(() => {
    loadSuggestions();
    // Set up auto-refresh every 15 minutes
    const interval = setInterval(loadSuggestions, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Load suggestions and warnings from AI service
   * TODO: Connect to actual AI/ML backend
   */
  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual AI service API calls
      // const [suggestionsRes, warningsRes] = await Promise.all([
      //   fetch('/api/ai/suggestions'),
      //   fetch('/api/ai/warnings')
      // ]);
      // const suggestionsData = await suggestionsRes.json();
      // const warningsData = await warningsRes.json();
      
      // Mock AI suggestions
      const mockSuggestions = [
        {
          id: 1,
          type: 'weather',
          priority: 'high',
          title: 'Rain Expected Tomorrow',
          description: 'Weather forecast shows 15mm rainfall expected tomorrow morning. Consider reducing irrigation schedule by 40% for all zones.',
          confidence: 92,
          impact: 'Water savings: ~180L, Cost reduction: $12',
          recommendation: 'Delay morning irrigation cycle by 24 hours',
          zone: 'all',
          timestamp: new Date().toISOString(),
          source: 'Weather AI Model',
          actionable: true,
          estimatedSavings: { water: 180, cost: 12 }
        },
        {
          id: 2,
          type: 'soil',
          priority: 'medium',
          title: 'Optimize North Zone Watering',
          description: 'North zone soil moisture has been consistently high. Reduce watering frequency from daily to every 2 days.',
          confidence: 87,
          impact: 'Better root development, 25% water savings',
          recommendation: 'Adjust schedule: Every 2 days, 18 minutes duration',
          zone: 'north',
          timestamp: new Date().toISOString(),
          source: 'Soil Analytics Engine',
          actionable: true,
          estimatedSavings: { water: 225, cost: 15 }
        },
        {
          id: 3,
          type: 'crop',
          priority: 'low',
          title: 'Growth Stage Optimization',
          description: 'Tomatoes in South zone entering flowering stage. Increase watering duration by 15% for optimal fruit development.',
          confidence: 78,
          impact: 'Improved yield potential: +12%',
          recommendation: 'Increase South zone duration to 23 minutes',
          zone: 'south',
          timestamp: new Date().toISOString(),
          source: 'Crop Development Model',
          actionable: true,
          estimatedSavings: { water: -30, yield: 12 }
        },
        {
          id: 4,
          type: 'system',
          priority: 'medium',
          title: 'Energy Cost Optimization',
          description: 'Peak electricity rates from 2-6 PM. Schedule irrigation during off-peak hours for 30% cost savings.',
          confidence: 95,
          impact: 'Monthly savings: $45',
          recommendation: 'Shift afternoon cycles to 12-2 PM',
          zone: 'all',
          timestamp: new Date().toISOString(),
          source: 'Energy Optimization AI',
          actionable: true,
          estimatedSavings: { cost: 45 }
        },
        {
          id: 5,
          type: 'prediction',
          priority: 'low',
          title: 'Heat Wave Preparation',
          description: 'Weather models predict temperature spike next week (35°C+). Prepare by increasing soil moisture reserves.',
          confidence: 73,
          impact: 'Stress prevention, crop protection',
          recommendation: 'Deep watering session recommended for weekend',
          zone: 'all',
          timestamp: new Date().toISOString(),
          source: 'Predictive Weather Model',
          actionable: true,
          estimatedSavings: { yield: 8 }
        }
      ];

      const mockWarnings = [
        {
          id: 1,
          type: 'emergency',
          severity: 'critical',
          title: 'East Zone Valve Malfunction',
          description: 'East zone valve not responding to control signals. Manual inspection required immediately.',
          zone: 'east',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          source: 'Hardware Monitor',
          acknowledged: false,
          autoResolution: false
        },
        {
          id: 2,
          type: 'warning',
          severity: 'high',
          title: 'Low Water Pressure Detected',
          description: 'Water pressure in main line has dropped to 18 PSI. Normal range is 25-35 PSI.',
          zone: 'all',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: 'Pressure Sensor',
          acknowledged: false,
          autoResolution: false
        },
        {
          id: 3,
          type: 'info',
          severity: 'medium',
          title: 'Soil Moisture Sensor Calibration',
          description: 'West zone soil sensor readings may be inaccurate. Last calibration was 6 months ago.',
          zone: 'west',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          source: 'Sensor Diagnostics',
          acknowledged: true,
          autoResolution: false
        },
        {
          id: 4,
          type: 'info',
          severity: 'low',
          title: 'Weather Station Offline',
          description: 'Local weather station connection lost. Using regional weather data as backup.',
          zone: 'all',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          source: 'Weather Service',
          acknowledged: false,
          autoResolution: true
        }
      ];

      setSuggestions(mockSuggestions);
      setWarnings(mockWarnings);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply a suggestion automatically
   * TODO: Connect to irrigation control API
   */
  const applySuggestion = async (suggestion) => {
    try {
      // TODO: Replace with actual API call to apply suggestion
      // await fetch('/api/irrigation/apply-suggestion', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ suggestionId: suggestion.id })
      // });
      
      console.log('Applying suggestion:', suggestion.title);
      
      // Remove applied suggestion from list
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  /**
   * Dismiss a suggestion
   */
  const dismissSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  /**
   * Acknowledge a warning
   */
  const acknowledgeWarning = async (warningId) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/warnings/${warningId}/acknowledge`, { method: 'POST' });
      
      setWarnings(prev => prev.map(w => 
        w.id === warningId ? { ...w, acknowledged: true } : w
      ));
      
    } catch (error) {
      console.error('Error acknowledging warning:', error);
    }
  };

  /**
   * Update notification preferences
   */
  const updatePreferences = async (newPreferences) => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newPreferences)
      // });
      
      setPreferences(newPreferences);
      
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  /**
   * Get icon for suggestion type
   */
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'weather': return faCloudRain;
      case 'soil': return faTint;
      case 'crop': return faLeaf;
      case 'system': return faCog;
      case 'energy': return faLightbulb;
      case 'prediction': return faBrain;
      default: return faInfoCircle;
    }
  };

  /**
   * Get icon for warning severity
   */
  const getWarningIcon = (severity) => {
    switch (severity) {
      case 'critical': return faTimesCircle;
      case 'high': return faExclamationTriangle;
      case 'medium': return faInfoCircle;
      case 'low': return faCheckCircle;
      default: return faInfoCircle;
    }
  };

  /**
   * Get color classes for priority/severity
   */
  const getPriorityColors = (priority) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  /**
   * Format relative time
   */
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) return `${Math.floor(diffHours / 24)} days ago`;
    if (diffHours > 0) return `${diffHours} hours ago`;
    if (diffMins > 0) return `${diffMins} minutes ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{TEXT_CONSTANTS.TITLE}</h3>
          <p className="text-gray-600">{TEXT_CONSTANTS.SUBTITLE}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={loadSuggestions}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <FontAwesomeIcon 
              icon={faRefresh} 
              className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} 
            />
            {TEXT_CONSTANTS.ACTIONS.REFRESH}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'suggestions', label: TEXT_CONSTANTS.TABS.SUGGESTIONS, count: suggestions.length },
            { id: 'warnings', label: TEXT_CONSTANTS.TABS.WARNINGS, count: warnings.filter(w => !w.acknowledged).length },
            { id: 'preferences', label: TEXT_CONSTANTS.TABS.PREFERENCES }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading suggestions...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map(suggestion => (
              <div key={suggestion.id} className={`border rounded-lg p-4 ${getPriorityColors(suggestion.priority)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon 
                        icon={getSuggestionIcon(suggestion.type)} 
                        className="mr-2 text-lg" 
                      />
                      <h4 className="text-lg font-medium">{suggestion.title}</h4>
                      <span className="ml-3 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                        {suggestion.type}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {suggestion.confidence}% confidence
                      </span>
                    </div>
                    
                    <p className="text-sm mb-3">{suggestion.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <span className="font-medium">Recommendation:</span>
                        <p className="text-sm">{suggestion.recommendation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Impact:</span>
                        <p className="text-sm">{suggestion.impact}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <FontAwesomeIcon icon={faRobot} className="mr-1" />
                      {suggestion.source} • {getRelativeTime(suggestion.timestamp)}
                      {suggestion.zone !== 'all' && (
                        <>
                          {' • '}
                          <FontAwesomeIcon icon={faWater} className="ml-1 mr-1" />
                          {suggestion.zone} zone
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {suggestion.actionable && (
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        {TEXT_CONSTANTS.ACTIONS.APPLY}
                      </button>
                    )}
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      {TEXT_CONSTANTS.ACTIONS.DISMISS}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faLightbulb} className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
              <p className="text-gray-600">All systems are running optimally. Check back later for new recommendations.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'warnings' && (
        <div className="space-y-4">
          {warnings.filter(w => !w.acknowledged).length > 0 ? (
            warnings.filter(w => !w.acknowledged).map(warning => (
              <div key={warning.id} className={`border rounded-lg p-4 ${getPriorityColors(warning.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FontAwesomeIcon 
                        icon={getWarningIcon(warning.severity)} 
                        className="mr-2 text-lg" 
                      />
                      <h4 className="text-lg font-medium">{warning.title}</h4>
                      <span className="ml-3 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                        {warning.severity}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-3">{warning.description}</p>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <FontAwesomeIcon icon={faCog} className="mr-1" />
                      {warning.source} • {getRelativeTime(warning.timestamp)}
                      {warning.zone !== 'all' && (
                        <>
                          {' • '}
                          <FontAwesomeIcon icon={faWater} className="ml-1 mr-1" />
                          {warning.zone} zone
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => acknowledgeWarning(warning.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 ml-4"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faCheckCircle} className="w-16 h-16 text-green-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active warnings</h3>
              <p className="text-gray-600">All systems are operating normally with no alerts.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-medium mb-4">Notification Preferences</h4>
          
          <div className="space-y-4">
            {Object.entries({
              enableWeatherAlerts: TEXT_CONSTANTS.PREFERENCES.WEATHER_ALERTS,
              enableSoilAlerts: TEXT_CONSTANTS.PREFERENCES.SOIL_ALERTS,
              enableCropAlerts: TEXT_CONSTANTS.PREFERENCES.CROP_ALERTS,
              enableSystemAlerts: TEXT_CONSTANTS.PREFERENCES.SYSTEM_ALERTS
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <button
                  onClick={() => updatePreferences({
                    ...preferences,
                    [key]: !preferences[key]
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {TEXT_CONSTANTS.PREFERENCES.FREQUENCY}
              </label>
              <select
                value={preferences.alertFrequency}
                onChange={(e) => updatePreferences({
                  ...preferences,
                  alertFrequency: e.target.value
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly Summary</option>
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;
