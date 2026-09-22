/**
 * Financial Aid Service
 * 
 * This service handles all API calls related to financial aid features including:
 * - Government scheme eligibility and recommendations
 * - Bank loan comparisons and applications
 * - Subsidy applications and tracking
 * - Notification management
 * - Support resources
 */

// Mock API base URL - replace with actual backend URL
const API_BASE_URL = 'http://localhost:5000/api/financial-aid';

/**
 * Government Schemes Service
 */
export const schemeService = {
  /**
   * Get scheme recommendations based on farmer profile
   * @param {Object} farmerProfile - Farmer details including state, category, land size, etc.
   * @returns {Promise<Array>} List of recommended schemes
   */
  async getSchemeRecommendations(farmerProfile) {
    try {
      // Mock implementation - replace with actual API call
      const response = await fetch(`${API_BASE_URL}/schemes/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmerProfile),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheme recommendations');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching scheme recommendations:', error);
      // Return mock data for development
      return [
        {
          id: 1,
          name: 'PM-KISAN Samman Nidhi',
          description: 'Income support of ₹6,000 per year to all farmer families',
          eligibility: 'All farmer families with cultivable land',
          benefits: '₹2,000 per installment, 3 times a year',
          applicationLink: 'https://pmkisan.gov.in/',
          documentsRequired: ['Aadhaar Card', 'Bank Account Details', 'Land Records'],
          status: 'Active',
          category: 'Income Support'
        },
        {
          id: 2,
          name: 'PMFBY - Crop Insurance',
          description: 'Comprehensive crop insurance scheme',
          eligibility: 'All farmers growing notified crops',
          benefits: 'Insurance coverage against crop loss',
          applicationLink: 'https://pmfby.gov.in/',
          documentsRequired: ['Land Records', 'Bank Account', 'Aadhaar Card'],
          status: 'Active',
          category: 'Insurance'
        }
      ];
    }
  },

  /**
   * Get all available schemes
   * @param {Object} filters - Filters like state, category, etc.
   * @returns {Promise<Array>} List of schemes
   */
  async getAllSchemes(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/schemes?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schemes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schemes:', error);
      return [];
    }
  },

  /**
   * Apply for a scheme
   * @param {number} schemeId - ID of the scheme
   * @param {Object} applicationData - Application form data
   * @returns {Promise<Object>} Application response
   */
  async applyForScheme(schemeId, applicationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/${schemeId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }
};

/**
 * Bank and Loan Service
 */
export const loanService = {
  /**
   * Get list of banks offering agricultural loans
   * @param {Object} filters - Filters like location, loan type, etc.
   * @returns {Promise<Array>} List of banks with loan details
   */
  async getBanksAndLoans(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/loans/banks?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bank data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching bank data:', error);
      // Return mock data
      return [
        {
          id: 1,
          name: 'State Bank of India',
          type: 'Public Sector',
          interestRate: '7.0%',
          processingFee: '0.40%',
          maxAmount: '₹10,00,000',
          tenure: '5 years',
          features: ['No collateral up to ₹1.6L', 'Flexible repayment'],
          contact: {
            phone: '1800-11-2211',
            email: 'agri@sbi.co.in',
            website: 'https://sbi.co.in'
          },
          location: 'Pan India',
          rating: 4.2
        },
        {
          id: 2,
          name: 'HDFC Bank',
          type: 'Private Sector',
          interestRate: '8.5%',
          processingFee: '1.00%',
          maxAmount: '₹75,00,000',
          tenure: '7 years',
          features: ['Quick processing', 'Digital application'],
          contact: {
            phone: '1800-266-4332',
            email: 'agriloan@hdfcbank.com',
            website: 'https://hdfcbank.com'
          },
          location: 'Major cities',
          rating: 4.0
        }
      ];
    }
  },

  /**
   * Apply for a loan
   * @param {number} bankId - Bank ID
   * @param {Object} loanApplication - Loan application data
   * @returns {Promise<Object>} Application response
   */
  async applyForLoan(bankId, loanApplication) {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankId, ...loanApplication }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit loan application');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting loan application:', error);
      throw error;
    }
  },

  /**
   * Get loan eligibility
   * @param {Object} farmerProfile - Farmer details
   * @returns {Promise<Object>} Eligibility assessment
   */
  async checkEligibility(farmerProfile) {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmerProfile),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return {
        eligible: true,
        maxAmount: 500000,
        recommendedBanks: ['SBI', 'HDFC']
      };
    }
  }
};

/**
 * Subsidy Service
 */
export const subsidyService = {
  /**
   * Get available subsidies
   * @param {Object} filters - Category, state, etc.
   * @returns {Promise<Array>} List of subsidies
   */
  async getSubsidies(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/subsidies?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subsidies');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subsidies:', error);
      return [];
    }
  },

  /**
   * Apply for subsidy
   * @param {number} subsidyId - Subsidy ID
   * @param {Object} applicationData - Application details
   * @returns {Promise<Object>} Application response
   */
  async applyForSubsidy(subsidyId, applicationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/subsidies/${subsidyId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply for subsidy');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error applying for subsidy:', error);
      throw error;
    }
  },

  /**
   * Track subsidy application status
   * @param {string} applicationId - Application reference ID
   * @returns {Promise<Object>} Application status
   */
  async trackApplication(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/subsidies/track/${applicationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to track application');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error tracking application:', error);
      return {
        status: 'Under Review',
        lastUpdated: new Date().toISOString(),
        nextAction: 'Document verification pending'
      };
    }
  }
};

/**
 * Notification Service
 */
export const notificationService = {
  /**
   * Get user notifications
   * @param {Object} filters - Type, read status, etc.
   * @returns {Promise<Array>} List of notifications
   */
  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  /**
   * Delete notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  /**
   * Subscribe to notification types
   * @param {Array} notificationTypes - Types to subscribe to
   * @returns {Promise<boolean>} Success status
   */
  async updateSubscriptions(notificationTypes) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ types: notificationTypes }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error updating subscriptions:', error);
      return false;
    }
  }
};

/**
 * Support Service
 */
export const supportService = {
  /**
   * Get FAQ data
   * @param {string} category - FAQ category
   * @returns {Promise<Array>} List of FAQs
   */
  async getFAQs(category = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/support/faqs?category=${category}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  },

  /**
   * Get application guides
   * @returns {Promise<Array>} List of guides
   */
  async getApplicationGuides() {
    try {
      const response = await fetch(`${API_BASE_URL}/support/guides`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch guides');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching guides:', error);
      return [];
    }
  },

  /**
   * Submit support ticket
   * @param {Object} ticketData - Support ticket details
   * @returns {Promise<Object>} Ticket response
   */
  async submitSupportTicket(ticketData) {
    try {
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit support ticket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      throw error;
    }
  },

  /**
   * Get contact information
   * @returns {Promise<Object>} Contact details
   */
  async getContactInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/support/contacts`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact info:', error);
      return {
        helpline: '1800-XXX-XXXX',
        email: 'support@smartagri.com',
        hours: '9 AM - 6 PM (Mon-Fri)'
      };
    }
  }
};

/**
 * Analytics Service
 */
export const analyticsService = {
  /**
   * Get financial analytics
   * @returns {Promise<Object>} Analytics data
   */
  async getFinancialAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/financial`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        totalSchemesApplied: 0,
        totalSubsidyReceived: 0,
        activeLoanApplications: 0,
        pendingApplications: 0
      };
    }
  },

  /**
   * Track user interaction
   * @param {string} action - Action performed
   * @param {Object} metadata - Additional data
   * @returns {Promise<boolean>} Success status
   */
  async trackInteraction(action, metadata = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, metadata, timestamp: new Date().toISOString() }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return false;
    }
  }
};

// Export all services as a default object
const financialAidService = {
  schemes: schemeService,
  loans: loanService,
  subsidies: subsidyService,
  notifications: notificationService,
  support: supportService,
  analytics: analyticsService
};

export default financialAidService;
