// Authentication utility functions

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with score and feedback
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (password.length < 8) {
    result.feedback.push('Password must be at least 8 characters long');
  } else {
    result.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password must contain at least one lowercase letter');
  } else {
    result.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password must contain at least one uppercase letter');
  } else {
    result.score += 1;
  }

  if (!/\d/.test(password)) {
    result.feedback.push('Password must contain at least one number');
  } else {
    result.score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.feedback.push('Password must contain at least one special character');
  } else {
    result.score += 1;
  }

  result.isValid = result.score >= 4;
  return result;
};

/**
 * Gets password strength label
 * @param {number} score - Password strength score (0-5)
 * @returns {object} - Strength info with label and color
 */
export const getPasswordStrength = (score) => {
  if (score <= 1) return { label: 'Very Weak', color: 'red', percentage: 20 };
  if (score === 2) return { label: 'Weak', color: 'orange', percentage: 40 };
  if (score === 3) return { label: 'Fair', color: 'yellow', percentage: 60 };
  if (score === 4) return { label: 'Good', color: 'blue', percentage: 80 };
  return { label: 'Strong', color: 'green', percentage: 100 };
};

/**
 * Sanitizes user input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Formats API errors for display
 * @param {object} error - Error object from API
 * @returns {string} - User-friendly error message
 */
export const formatAuthError = (error) => {
  const errorMessages = {
    'EMAIL_EXISTS': 'An account with this email already exists',
    'INVALID_CREDENTIALS': 'Invalid email or password',
    'USER_NOT_FOUND': 'No account found with this email',
    'WEAK_PASSWORD': 'Password is too weak',
    'TOO_MANY_ATTEMPTS': 'Too many failed attempts. Please try again later',
    'NETWORK_ERROR': 'Network error. Please check your connection',
    'SERVER_ERROR': 'Server error. Please try again later'
  };

  return errorMessages[error.code] || error.message || 'An unexpected error occurred';
};

/**
 * Stores authentication token securely
 * @param {string} token - JWT token
 * @param {boolean} remember - Whether to persist token
 */
export const storeAuthToken = (token, remember = false) => {
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

/**
 * Retrieves stored authentication token
 * @returns {string|null} - Stored token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Removes stored authentication token
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
};

/**
 * Checks if user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    // Basic JWT token validation (decode without verification for client-side check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    // Check if token is not expired
    return payload.exp > now;
  } catch (error) {
    return false;
  }
};

/**
 * Decodes JWT token payload
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null
 */
export const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

/**
 * Creates a secure random string for state parameter
 * @param {number} length - Length of random string
 * @returns {string} - Random string
 */
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Rate limiting helper
 * @param {string} key - Unique identifier for rate limiting
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if under rate limit
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  
  // Remove old attempts outside the window
  const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (validAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  // Add current attempt
  validAttempts.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validAttempts));
  
  return true; // Under rate limit
};

/**
 * Clears rate limit data for a key
 * @param {string} key - Unique identifier for rate limiting
 */
export const clearRateLimit = (key) => {
  localStorage.removeItem(`rate_limit_${key}`);
};