import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faClock,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faPlay,
  faPause,
  faWater,
  faRepeat,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';

/**
 * Irrigation Scheduler Component
 * 
 * This component manages irrigation scheduling for all field zones.
 * Features:
 * - Create, edit, and delete irrigation schedules
 * - Zone-specific scheduling
 * - Recurring schedule patterns (daily, weekly, custom)
 * - Manual override controls
 * - Schedule status monitoring
 */
const IrrigationScheduler = ({ onScheduleUpdate, isLoading }) => {
  const [schedules, setSchedules] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    zone: 'north',
    time: '06:00',
    duration: 15,
    repeat: 'daily',
    enabled: true,
    name: '',
    description: ''
  });

  // Text constants for translation support
  const TEXT_CONSTANTS = {
    TITLE: 'Irrigation Scheduler',
    SUBTITLE: 'Manage automated irrigation schedules for all zones',
    BUTTONS: {
      ADD_SCHEDULE: 'Add New Schedule',
      SAVE_SCHEDULE: 'Save Schedule',
      CANCEL: 'Cancel',
      EDIT: 'Edit',
      DELETE: 'Delete',
      ENABLE: 'Enable',
      DISABLE: 'Disable',
      RUN_NOW: 'Run Now'
    },
    FORM: {
      SCHEDULE_NAME: 'Schedule Name',
      DESCRIPTION: 'Description',
      ZONE: 'Zone',
      START_TIME: 'Start Time',
      DURATION: 'Duration (minutes)',
      REPEAT_PATTERN: 'Repeat Pattern',
      STATUS: 'Status'
    },
    REPEAT_OPTIONS: {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      CUSTOM: 'Custom Days'
    },
    ZONES: {
      NORTH: 'North Zone',
      SOUTH: 'South Zone',
      EAST: 'East Zone',
      WEST: 'West Zone'
    },
    STATUS: {
      ENABLED: 'Enabled',
      DISABLED: 'Disabled',
      RUNNING: 'Running',
      COMPLETED: 'Completed',
      NEXT_RUN: 'Next Run'
    }
  };

  // Sample schedules data - TODO: Replace with API call
  const sampleSchedules = [
    {
      id: 1,
      name: 'Morning North Irrigation',
      description: 'Daily morning watering for north zone',
      zone: 'north',
      time: '06:00',
      duration: 20,
      repeat: 'daily',
      enabled: true,
      lastRun: '2024-09-08T06:00:00Z',
      nextRun: '2024-09-09T06:00:00Z',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Evening South Irrigation',
      description: 'Daily evening watering for south zone',
      zone: 'south',
      time: '18:00',
      duration: 15,
      repeat: 'daily',
      enabled: true,
      lastRun: '2024-09-07T18:00:00Z',
      nextRun: '2024-09-08T18:00:00Z',
      status: 'scheduled'
    },
    {
      id: 3,
      name: 'Weekly Deep Watering',
      description: 'Weekly deep watering for all zones',
      zone: 'all',
      time: '05:00',
      duration: 45,
      repeat: 'weekly',
      enabled: false,
      lastRun: '2024-09-01T05:00:00Z',
      nextRun: '2024-09-08T05:00:00Z',
      status: 'disabled'
    }
  ];

  useEffect(() => {
    // Load existing schedules
    loadSchedules();
  }, []);

  /**
   * Load irrigation schedules from backend
   * TODO: Connect to actual API endpoint
   */
  const loadSchedules = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/irrigation/schedules');
      // const data = await response.json();
      // setSchedules(data);
      
      // Mock data for development
      setSchedules(sampleSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  /**
   * Handle creating a new schedule
   */
  const handleCreateSchedule = async () => {
    try {
      const scheduleData = {
        ...newSchedule,
        id: Date.now(), // Mock ID generation
        lastRun: null,
        nextRun: calculateNextRun(newSchedule.time, newSchedule.repeat),
        status: newSchedule.enabled ? 'scheduled' : 'disabled'
      };

      // TODO: Connect to backend API
      // const response = await fetch('/api/irrigation/schedules', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(scheduleData)
      // });
      
      setSchedules(prev => [...prev, scheduleData]);
      await onScheduleUpdate(scheduleData);
      
      // Reset form
      setNewSchedule({
        zone: 'north',
        time: '06:00',
        duration: 15,
        repeat: 'daily',
        enabled: true,
        name: '',
        description: ''
      });
      setIsCreating(false);
      
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  /**
   * Handle editing an existing schedule
   */
  const handleEditSchedule = async (scheduleId, updatedData) => {
    try {
      // TODO: Connect to backend API
      // const response = await fetch(`/api/irrigation/schedules/${scheduleId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedData)
      // });
      
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, ...updatedData, nextRun: calculateNextRun(updatedData.time, updatedData.repeat) }
          : schedule
      ));
      
      await onScheduleUpdate(updatedData);
      setEditingSchedule(null);
      
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  /**
   * Handle deleting a schedule
   */
  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      // TODO: Connect to backend API
      // await fetch(`/api/irrigation/schedules/${scheduleId}`, { method: 'DELETE' });
      
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  /**
   * Toggle schedule enabled/disabled status
   */
  const handleToggleSchedule = async (scheduleId, enabled) => {
    try {
      // TODO: Connect to backend API
      // await fetch(`/api/irrigation/schedules/${scheduleId}/toggle`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ enabled })
      // });
      
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, enabled, status: enabled ? 'scheduled' : 'disabled' }
          : schedule
      ));
      
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  /**
   * Run a schedule immediately
   */
  const handleRunNow = async (scheduleId) => {
    try {
      // TODO: Connect to backend API
      // await fetch(`/api/irrigation/schedules/${scheduleId}/run`, { method: 'POST' });
      
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: 'running', lastRun: new Date().toISOString() }
          : schedule
      ));
      
    } catch (error) {
      console.error('Error running schedule:', error);
    }
  };

  /**
   * Calculate next run time based on schedule pattern
   */
  const calculateNextRun = (time, repeat) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    if (repeat === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    }
    
    return nextRun.toISOString();
  };

  /**
   * Format time for display
   */
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  /**
   * Format next run date for display
   */
  const formatNextRun = (timestamp) => {
    if (!timestamp) return 'Not scheduled';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) return `Today at ${formatTime(date.toTimeString().slice(0, 5))}`;
    if (isTomorrow) return `Tomorrow at ${formatTime(date.toTimeString().slice(0, 5))}`;
    return date.toLocaleDateString() + ' at ' + formatTime(date.toTimeString().slice(0, 5));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{TEXT_CONSTANTS.TITLE}</h3>
          <p className="text-gray-600">{TEXT_CONSTANTS.SUBTITLE}</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          {TEXT_CONSTANTS.BUTTONS.ADD_SCHEDULE}
        </button>
      </div>

      {/* Create New Schedule Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold mb-4">Create New Schedule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {TEXT_CONSTANTS.FORM.SCHEDULE_NAME}
              </label>
              <input
                type="text"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter schedule name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {TEXT_CONSTANTS.FORM.ZONE}
              </label>
              <select
                value={newSchedule.zone}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, zone: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="north">{TEXT_CONSTANTS.ZONES.NORTH}</option>
                <option value="south">{TEXT_CONSTANTS.ZONES.SOUTH}</option>
                <option value="east">{TEXT_CONSTANTS.ZONES.EAST}</option>
                <option value="west">{TEXT_CONSTANTS.ZONES.WEST}</option>
                <option value="all">All Zones</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {TEXT_CONSTANTS.FORM.START_TIME}
              </label>
              <input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {TEXT_CONSTANTS.FORM.DURATION}
              </label>
              <select
                value={newSchedule.duration}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {TEXT_CONSTANTS.FORM.REPEAT_PATTERN}
              </label>
              <select
                value={newSchedule.repeat}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, repeat: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">{TEXT_CONSTANTS.REPEAT_OPTIONS.DAILY}</option>
                <option value="weekly">{TEXT_CONSTANTS.REPEAT_OPTIONS.WEEKLY}</option>
                <option value="custom">{TEXT_CONSTANTS.REPEAT_OPTIONS.CUSTOM}</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={newSchedule.enabled}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, enabled: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                Enable schedule immediately
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {TEXT_CONSTANTS.FORM.DESCRIPTION}
            </label>
            <textarea
              value={newSchedule.description}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional description for this schedule"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsCreating(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              {TEXT_CONSTANTS.BUTTONS.CANCEL}
            </button>
            <button
              onClick={handleCreateSchedule}
              disabled={!newSchedule.name || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {TEXT_CONSTANTS.BUTTONS.SAVE_SCHEDULE}
            </button>
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{schedule.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    schedule.enabled 
                      ? schedule.status === 'running' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {schedule.status === 'running' ? TEXT_CONSTANTS.STATUS.RUNNING :
                     schedule.enabled ? TEXT_CONSTANTS.STATUS.ENABLED : TEXT_CONSTANTS.STATUS.DISABLED}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                    {schedule.zone === 'all' ? 'All Zones' : `${schedule.zone} Zone`}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{schedule.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <div className="font-medium">{formatTime(schedule.time)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-medium">{schedule.duration} min</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Repeat:</span>
                    <div className="font-medium capitalize">{schedule.repeat}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{TEXT_CONSTANTS.STATUS.NEXT_RUN}:</span>
                    <div className="font-medium">{formatNextRun(schedule.nextRun)}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleSchedule(schedule.id, !schedule.enabled)}
                  className={`p-2 rounded-md ${
                    schedule.enabled 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={schedule.enabled ? TEXT_CONSTANTS.BUTTONS.DISABLE : TEXT_CONSTANTS.BUTTONS.ENABLE}
                >
                  <FontAwesomeIcon icon={schedule.enabled ? faToggleOn : faToggleOff} className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => handleRunNow(schedule.id)}
                  disabled={schedule.status === 'running'}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                  title={TEXT_CONSTANTS.BUTTONS.RUN_NOW}
                >
                  <FontAwesomeIcon icon={faPlay} className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setEditingSchedule(schedule)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                  title={TEXT_CONSTANTS.BUTTONS.EDIT}
                >
                  <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title={TEXT_CONSTANTS.BUTTONS.DELETE}
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Schedules Message */}
      {schedules.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules Created</h3>
          <p className="text-gray-600 mb-4">Create your first irrigation schedule to automate watering.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            {TEXT_CONSTANTS.BUTTONS.ADD_SCHEDULE}
          </button>
        </div>
      )}
    </div>
  );
};

export default IrrigationScheduler;
