import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCalendarAlt, 
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faFilter,
  faSearch,
  faTrash,
  faEye,
  faEyeSlash,
  faClock,
  faRupeeSign,
  faFileAlt,
  faHandshake,
  faGift
} from '@fortawesome/free-solid-svg-icons';

/**
 * Notification Center Component
 * 
 * This component displays time-sensitive alerts, reminders, and notifications
 * related to government schemes, loan deadlines, subsidy applications,
 * and other important agricultural finance updates.
 */
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    status: 'all',
    category: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sample notifications data - replace with actual API call
  const sampleNotifications = [
    {
      id: 1,
      title: 'PM-KISAN Payment Released',
      message: 'Your PM-KISAN installment of ₹2,000 has been credited to your account ending with 1234.',
      type: 'success',
      priority: 'medium',
      category: 'payments',
      timestamp: '2024-09-07T10:30:00Z',
      isRead: false,
      isImportant: true,
      actionRequired: false,
      relatedScheme: 'PM-KISAN',
      amount: 2000,
      icon: faCheckCircle
    },
    {
      id: 2,
      title: 'Crop Insurance Deadline Approaching',
      message: 'Last 5 days to apply for Kharif crop insurance under PMFBY. Deadline: September 15, 2024.',
      type: 'warning',
      priority: 'high',
      category: 'deadlines',
      timestamp: '2024-09-06T08:00:00Z',
      isRead: false,
      isImportant: true,
      actionRequired: true,
      relatedScheme: 'PMFBY',
      deadline: '2024-09-15',
      actionLink: 'https://pmfby.gov.in/',
      icon: faExclamationTriangle
    },
    {
      id: 3,
      title: 'New Tractor Subsidy Scheme Launched',
      message: 'Maharashtra government has launched a new tractor subsidy scheme with 50% subsidy up to ₹1.5 lakhs.',
      type: 'info',
      priority: 'medium',
      category: 'new-schemes',
      timestamp: '2024-09-05T14:20:00Z',
      isRead: true,
      isImportant: false,
      actionRequired: false,
      relatedScheme: 'Tractor Subsidy',
      amount: 150000,
      state: 'Maharashtra',
      icon: faInfoCircle
    },
    {
      id: 4,
      title: 'KCC Loan Application Under Review',
      message: 'Your Kisan Credit Card application (Ref: KCC123456) is under review. Expected approval in 3-5 working days.',
      type: 'info',
      priority: 'medium',
      category: 'applications',
      timestamp: '2024-09-04T16:45:00Z',
      isRead: true,
      isImportant: false,
      actionRequired: false,
      relatedScheme: 'Kisan Credit Card',
      referenceNumber: 'KCC123456',
      icon: faClock
    },
    {
      id: 5,
      title: 'Document Verification Required',
      message: 'Please submit updated land records for your soil health card application within 7 days.',
      type: 'warning',
      priority: 'high',
      category: 'documents',
      timestamp: '2024-09-03T11:15:00Z',
      isRead: false,
      isImportant: true,
      actionRequired: true,
      relatedScheme: 'Soil Health Card',
      documentsRequired: ['Updated Land Records', 'Survey Settlement Number'],
      deadline: '2024-09-10',
      icon: faFileAlt
    },
    {
      id: 6,
      title: 'Fertilizer Subsidy Approved',
      message: 'Your fertilizer subsidy application has been approved. Subsidy amount: ₹3,500 will be credited within 48 hours.',
      type: 'success',
      priority: 'medium',
      category: 'approvals',
      timestamp: '2024-09-02T09:30:00Z',
      isRead: true,
      isImportant: false,
      actionRequired: false,
      relatedScheme: 'Fertilizer Subsidy',
      amount: 3500,
      icon: faCheckCircle
    },
    {
      id: 7,
      title: 'Weather Alert: Heavy Rainfall Expected',
      message: 'IMD has issued heavy rainfall warning for your district. Consider postponing harvest activities.',
      type: 'warning',
      priority: 'high',
      category: 'weather',
      timestamp: '2024-09-01T07:00:00Z',
      isRead: false,
      isImportant: true,
      actionRequired: true,
      weatherType: 'Heavy Rainfall',
      duration: '2-3 days',
      impact: 'Crop harvesting may be affected',
      icon: faExclamationTriangle
    },
    {
      id: 8,
      title: 'Interest Rate Reduced on Agriculture Loans',
      message: 'SBI has reduced interest rates on agriculture loans to 7.0% from 7.5%. Existing customers can apply for rate revision.',
      type: 'info',
      priority: 'low',
      category: 'loan-updates',
      timestamp: '2024-08-31T12:00:00Z',
      isRead: true,
      isImportant: false,
      actionRequired: false,
      bankName: 'State Bank of India',
      oldRate: '7.5%',
      newRate: '7.0%',
      icon: faRupeeSign
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadNotifications = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(sampleNotifications);
      setFilteredNotifications(sampleNotifications);
      setIsLoading(false);
    };
    
    loadNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || notification.type === filters.type;
      const matchesPriority = filters.priority === 'all' || notification.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || 
                           (filters.status === 'read' && notification.isRead) ||
                           (filters.status === 'unread' && !notification.isRead);
      const matchesCategory = filters.category === 'all' || notification.category === filters.category;
      
      return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesCategory;
    });
    
    // Sort by timestamp (newest first) and then by priority
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    setFilteredNotifications(filtered);
  }, [searchTerm, filters, notifications]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAsUnread = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notification Center</h2>
            <p className="text-gray-600">
              Stay updated with important alerts, deadlines, and financial aid updates
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm"
            >
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-lg font-semibold">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-lg font-semibold">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Important</p>
              <p className="text-lg font-semibold">{importantCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Action Required</p>
              <p className="text-lg font-semibold">{notifications.filter(n => n.actionRequired).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="info">Information</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
              !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                {/* Icon */}
                <div className={`p-2 rounded-md mr-4 ${getTypeColor(notification.type)}`}>
                  <FontAwesomeIcon icon={notification.icon} className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h3>
                    {notification.isImportant && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                        Important
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{notification.message}</p>

                  {/* Additional Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span>
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                      {getTimeAgo(notification.timestamp)}
                    </span>
                    {notification.relatedScheme && (
                      <span>
                        <FontAwesomeIcon icon={faHandshake} className="mr-1" />
                        {notification.relatedScheme}
                      </span>
                    )}
                    {notification.amount && (
                      <span>
                        <FontAwesomeIcon icon={faRupeeSign} className="mr-1" />
                        ₹{notification.amount.toLocaleString()}
                      </span>
                    )}
                    {notification.deadline && (
                      <span className="text-red-600">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        Deadline: {new Date(notification.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {notification.actionRequired && (
                    <div className="flex gap-2 mb-3">
                      {notification.actionLink && (
                        <a
                          href={notification.actionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                        >
                          Take Action
                        </a>
                      )}
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                  title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  <FontAwesomeIcon icon={notification.isRead ? faEyeSlash : faEye} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete notification"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faBell} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(f => f !== 'all') 
              ? 'Try adjusting your search criteria or filters.'
              : 'You\'re all caught up! No new notifications at the moment.'
            }
          </p>
          {(searchTerm || Object.values(filters).some(f => f !== 'all')) && (
            <button
              onClick={() => {
                setFilters({
                  type: 'all',
                  priority: 'all',
                  status: 'all',
                  category: 'all'
                });
                setSearchTerm('');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
