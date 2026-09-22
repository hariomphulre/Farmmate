import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory,
  faCalendarAlt,
  faFilter,
  faDownload,
  faSearch,
  faWater,
  faClock,
  faMapMarkerAlt,
  faUser,
  faRobot,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

/**
 * Irrigation History Component
 * 
 * This component displays the complete history of irrigation events
 * with filtering, search, and export capabilities.
 * 
 * Features:
 * - Chronological irrigation event log
 * - Filtering by zone, date range, and trigger type
 * - Search functionality
 * - Event details with duration, trigger source, and status
 * - Export capabilities for reporting
 */
const IrrigationHistory = () => {
  const [irrigationEvents, setIrrigationEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    zone: 'all',
    dateRange: '7days',
    triggerType: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Text constants for translation support
  const TEXT_CONSTANTS = {
    TITLE: 'Irrigation History',
    SUBTITLE: 'Complete log of all irrigation events and activities',
    FILTERS: {
      ZONE: 'Zone',
      DATE_RANGE: 'Date Range',
      TRIGGER_TYPE: 'Trigger Type',
      STATUS: 'Status'
    },
    TRIGGER_TYPES: {
      MANUAL: 'Manual',
      SCHEDULED: 'Scheduled',
      AUTOMATIC: 'Automatic',
      EMERGENCY: 'Emergency'
    },
    STATUS_TYPES: {
      COMPLETED: 'Completed',
      INTERRUPTED: 'Interrupted',
      FAILED: 'Failed',
      IN_PROGRESS: 'In Progress'
    },
    DATE_RANGES: {
      TODAY: 'Today',
      WEEK: 'Last 7 days',
      MONTH: 'Last 30 days',
      QUARTER: 'Last 3 months',
      CUSTOM: 'Custom Range'
    },
    COLUMNS: {
      TIMESTAMP: 'Date & Time',
      ZONE: 'Zone',
      DURATION: 'Duration',
      TRIGGER: 'Trigger',
      STATUS: 'Status',
      WATER_USED: 'Water Used',
      ACTIONS: 'Actions'
    },
    BUTTONS: {
      EXPORT: 'Export Data',
      VIEW_DETAILS: 'View Details',
      SEARCH: 'Search events...'
    }
  };

  // Mock irrigation events data - TODO: Replace with API call
  const mockEvents = [
    {
      id: 1,
      timestamp: '2024-09-08T09:15:00Z',
      zone: 'west',
      duration: 20,
      waterUsed: 150,
      triggerType: 'scheduled',
      triggerSource: 'Morning Schedule - West Zone',
      status: 'completed',
      userId: 'system',
      soilMoistureeBefore: 35,
      soilMoistureAfter: 68,
      notes: 'Automated morning irrigation'
    },
    {
      id: 2,
      timestamp: '2024-09-08T08:30:00Z',
      zone: 'south',
      duration: 15,
      waterUsed: 112,
      triggerType: 'scheduled',
      triggerSource: 'Morning Schedule - South Zone',
      status: 'completed',
      userId: 'system',
      soilMoistureBefore: 42,
      soilMoistureAfter: 72,
      notes: 'Routine scheduled watering'
    },
    {
      id: 3,
      timestamp: '2024-09-08T06:00:00Z',
      zone: 'north',
      duration: 25,
      waterUsed: 187,
      triggerType: 'scheduled',
      triggerSource: 'Morning Schedule - North Zone',
      status: 'completed',
      userId: 'system',
      soilMoistureBefore: 38,
      soilMoistureAfter: 65,
      notes: 'Extended duration due to low moisture'
    },
    {
      id: 4,
      timestamp: '2024-09-07T19:45:00Z',
      zone: 'east',
      duration: 12,
      waterUsed: 89,
      triggerType: 'manual',
      triggerSource: 'User Override',
      status: 'interrupted',
      userId: 'farmer_john',
      soilMoistureBefore: 28,
      soilMoistureAfter: 35,
      notes: 'Manually stopped due to weather change'
    },
    {
      id: 5,
      timestamp: '2024-09-07T18:00:00Z',
      zone: 'south',
      duration: 15,
      waterUsed: 112,
      triggerType: 'scheduled',
      triggerSource: 'Evening Schedule - South Zone',
      status: 'completed',
      userId: 'system',
      soilMoistureBefore: 55,
      soilMoistureAfter: 72,
      notes: 'Evening maintenance irrigation'
    },
    {
      id: 6,
      timestamp: '2024-09-07T14:30:00Z',
      zone: 'north',
      duration: 0,
      waterUsed: 0,
      triggerType: 'automatic',
      triggerSource: 'Low Moisture Alert',
      status: 'failed',
      userId: 'system',
      soilMoistureBefore: 25,
      soilMoistureAfter: 25,
      notes: 'Valve malfunction detected'
    },
    {
      id: 7,
      timestamp: '2024-09-07T11:20:00Z',
      zone: 'west',
      duration: 8,
      waterUsed: 60,
      triggerType: 'manual',
      triggerSource: 'Mobile App',
      status: 'completed',
      userId: 'farmer_john',
      soilMoistureBefore: 45,
      soilMoistureAfter: 58,
      notes: 'Quick manual watering before lunch'
    },
    {
      id: 8,
      timestamp: '2024-09-07T06:00:00Z',
      zone: 'all',
      duration: 60,
      waterUsed: 450,
      triggerType: 'scheduled',
      triggerSource: 'Weekly Deep Watering',
      status: 'completed',
      userId: 'system',
      soilMoistureBefore: 40,
      soilMoistureAfter: 75,
      notes: 'Weekly comprehensive irrigation cycle'
    }
  ];

  useEffect(() => {
    loadIrrigationHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [irrigationEvents, filters, searchTerm]);

  /**
   * Load irrigation history from backend
   * TODO: Connect to actual API endpoint
   */
  const loadIrrigationHistory = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/irrigation/history');
      // const data = await response.json();
      // setIrrigationEvents(data);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIrrigationEvents(mockEvents);
      
    } catch (error) {
      console.error('Error loading irrigation history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters and search to irrigation events
   */
  const applyFilters = () => {
    let filtered = irrigationEvents.filter(event => {
      // Zone filter
      if (filters.zone !== 'all' && event.zone !== filters.zone) return false;
      
      // Trigger type filter
      if (filters.triggerType !== 'all' && event.triggerType !== filters.triggerType) return false;
      
      // Status filter
      if (filters.status !== 'all' && event.status !== filters.status) return false;
      
      // Date range filter
      const eventDate = new Date(event.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'today':
          if (daysDiff > 0) return false;
          break;
        case '7days':
          if (daysDiff > 7) return false;
          break;
        case '30days':
          if (daysDiff > 30) return false;
          break;
        case '90days':
          if (daysDiff > 90) return false;
          break;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          event.zone.toLowerCase().includes(searchLower) ||
          event.triggerSource.toLowerCase().includes(searchLower) ||
          event.notes.toLowerCase().includes(searchLower) ||
          event.status.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredEvents(filtered);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Export irrigation data
   * TODO: Connect to backend export API
   */
  const handleExport = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/irrigation/history/export', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ filters, events: filteredEvents })
      // });
      
      // Mock export functionality
      const csvContent = generateCSV(filteredEvents);
      downloadCSV(csvContent, `irrigation_history_${new Date().toISOString().split('T')[0]}.csv`);
      
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  /**
   * Generate CSV content from events
   */
  const generateCSV = (events) => {
    const headers = ['Date & Time', 'Zone', 'Duration (min)', 'Water Used (L)', 'Trigger Type', 'Status', 'Notes'];
    const rows = events.map(event => [
      new Date(event.timestamp).toLocaleString(),
      event.zone,
      event.duration,
      event.waterUsed,
      event.triggerType,
      event.status,
      event.notes
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  /**
   * Download CSV file
   */
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Get status icon and color
   */
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { icon: faCheckCircle, color: 'text-green-600 bg-green-100' };
      case 'interrupted':
        return { icon: faExclamationTriangle, color: 'text-yellow-600 bg-yellow-100' };
      case 'failed':
        return { icon: faTimesCircle, color: 'text-red-600 bg-red-100' };
      case 'in_progress':
        return { icon: faClock, color: 'text-blue-600 bg-blue-100' };
      default:
        return { icon: faCheckCircle, color: 'text-gray-600 bg-gray-100' };
    }
  };

  /**
   * Get trigger icon
   */
  const getTriggerIcon = (triggerType) => {
    switch (triggerType) {
      case 'manual': return faUser;
      case 'scheduled': return faCalendarAlt;
      case 'automatic': return faRobot;
      case 'emergency': return faExclamationTriangle;
      default: return faWater;
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  /**
   * Calculate total statistics
   */
  const getStatistics = () => {
    const totalEvents = filteredEvents.length;
    const totalWaterUsed = filteredEvents.reduce((sum, event) => sum + event.waterUsed, 0);
    const totalDuration = filteredEvents.reduce((sum, event) => sum + event.duration, 0);
    const successfulEvents = filteredEvents.filter(event => event.status === 'completed').length;
    
    return {
      totalEvents,
      totalWaterUsed,
      totalDuration,
      successRate: totalEvents > 0 ? Math.round((successfulEvents / totalEvents) * 100) : 0
    };
  };

  const stats = getStatistics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading irrigation history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{TEXT_CONSTANTS.TITLE}</h3>
          <p className="text-gray-600">{TEXT_CONSTANTS.SUBTITLE}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
            <div className="text-lg font-bold text-gray-900">{stats.totalEvents}</div>
            <div className="text-xs text-gray-600">Total Events</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
            <div className="text-lg font-bold text-blue-600">{stats.totalWaterUsed}L</div>
            <div className="text-xs text-gray-600">Water Used</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
            <div className="text-lg font-bold text-green-600">{Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</div>
            <div className="text-xs text-gray-600">Total Runtime</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border text-center">
            <div className="text-lg font-bold text-purple-600">{stats.successRate}%</div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={TEXT_CONSTANTS.BUTTONS.SEARCH}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          
          {/* Zone Filter */}
          <div>
            <select
              value={filters.zone}
              onChange={(e) => handleFilterChange('zone', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Zones</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 3 months</option>
            </select>
          </div>
          
          {/* Trigger Type Filter */}
          <div>
            <select
              value={filters.triggerType}
              onChange={(e) => handleFilterChange('triggerType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Triggers</option>
              <option value="manual">Manual</option>
              <option value="scheduled">Scheduled</option>
              <option value="automatic">Automatic</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          
          {/* Export Button */}
          <div>
            <button
              onClick={handleExport}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center text-sm"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXT_CONSTANTS.COLUMNS.TIMESTAMP}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXT_CONSTANTS.COLUMNS.ZONE}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXT_CONSTANTS.COLUMNS.DURATION}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXT_CONSTANTS.COLUMNS.WATER_USED}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXT_CONSTANTS.COLUMNS.TRIGGER}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {TEXT_CONSTANTS.COLUMNS.STATUS}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const statusDisplay = getStatusDisplay(event.status);
                return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatTimestamp(event.timestamp)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                        {event.zone}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="mr-1 text-gray-400" />
                        {event.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faWater} className="mr-1 text-blue-500" />
                        {event.waterUsed} L
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={getTriggerIcon(event.triggerType)} className="mr-2 text-gray-500" />
                        <div>
                          <div className="font-medium capitalize">{event.triggerType}</div>
                          <div className="text-xs text-gray-500">{event.triggerSource}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                        <FontAwesomeIcon icon={statusDisplay.icon} className="mr-1" />
                        {event.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {event.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faHistory} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No irrigation events found</h3>
          <p className="text-gray-600">
            {irrigationEvents.length === 0 
              ? 'No irrigation events have been recorded yet.' 
              : 'Try adjusting your filters to see more results.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default IrrigationHistory;
