/**
 * Crop Management Service
 * 
 * This service handles all API calls related to crop management including:
 * - Crop lifecycle tracking
 * - Inventory management
 * 
 * Backend developers can use this file to understand the expected data structures
 * and API endpoints needed for the crop management feature.
 */

// API Base URL - Replace with actual backend URL
const API_BASE_URL = 'http://localhost:3001/api'; // Example URL

/**
 * CROP LIFECYCLE TRACKING APIs
 * These APIs handle tracking crops from sowing to harvest
 */

/**
 * Get all crops being tracked by the farmer
 * @returns {Promise<Array>} Array of crop objects
 * 
 * Expected Response Structure:
 * [
 *   {
 *     id: 1,
 *     name: "Wheat",
 *     variety: "HD-2967",
 *     sowingDate: "2024-11-15",
 *     expectedHarvest: "2025-04-15",
 *     currentStage: "Vegetative Growth",
 *     progress: 35,
 *     area: "2.5 acres",
 *     status: "healthy", // "healthy", "attention", "critical"
 *     notes: "Crop is growing well, regular watering maintained.",
 *     farmerId: "user123",
 *     createdAt: "2024-11-15T10:00:00Z",
 *     updatedAt: "2024-12-01T15:30:00Z"
 *   }
 * ]
 */
export const getCropLifecycle = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/lifecycle`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch crop lifecycle data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crop lifecycle:', error);
    throw error;
  }
};

/**
 * Add a new crop to lifecycle tracking
 * @param {Object} cropData - Crop information
 * @returns {Promise<Object>} Created crop object
 * 
 * Expected Request Body:
 * {
 *   name: "Wheat",
 *   variety: "HD-2967",
 *   sowingDate: "2024-11-15",
 *   expectedHarvest: "2025-04-15",
 *   area: 2.5,
 *   currentStage: "Sowing",
 *   notes: "Optional notes about the crop"
 * }
 */
export const addCropToLifecycle = async (cropData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/lifecycle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(cropData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to add crop to lifecycle');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding crop to lifecycle:', error);
    throw error;
  }
};

/**
 * Update crop stage and progress
 * @param {number} cropId - Crop ID
 * @param {Object} updateData - Update information
 * @returns {Promise<Object>} Updated crop object
 * 
 * Expected Request Body:
 * {
 *   currentStage: "Flowering",
 *   progress: 55,
 *   status: "healthy",
 *   notes: "Stage updated after field inspection"
 * }
 */
export const updateCropStage = async (cropId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/lifecycle/${cropId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update crop stage');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating crop stage:', error);
    throw error;
  }
};

/**
 * Delete a crop from lifecycle tracking
 * @param {number} cropId - Crop ID
 * @returns {Promise<void>}
 */
export const deleteCropFromLifecycle = async (cropId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/crops/lifecycle/${cropId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete crop from lifecycle');
    }
  } catch (error) {
    console.error('Error deleting crop from lifecycle:', error);
    throw error;
  }
};

/**
 * INVENTORY MANAGEMENT APIs
 * These APIs handle crop inventory after harvest
 */

/**
 * Get farmer's crop inventory
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of inventory items
 * 
 * Expected Response Structure:
 * [
 *   {
 *     id: 1,
 *     cropName: "Wheat",
 *     variety: "HD-2967",
 *     quantity: 450,
 *     unit: "kg", // "kg", "tons", "quintals", "bags"
 *     harvestDate: "2024-04-10",
 *     quality: "Grade A", // "Premium", "Grade A", "Grade B", "Standard"
 *     storageLocation: "Warehouse 1",
 *     estimatedValue: 18000,
 *     marketPrice: 2500, // Current market price per unit
 *     expiryDate: "2025-04-10",
 *     status: "available", // "available", "low-stock", "reserved", "sold"
 *     farmerId: "user123",
 *     createdAt: "2024-04-10T12:00:00Z",
 *     updatedAt: "2024-12-01T16:00:00Z"
 *   }
 * ]
 */
export const getInventory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${API_BASE_URL}/inventory${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inventory data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

/**
 * Add item to inventory
 * @param {Object} inventoryData - Inventory item information
 * @returns {Promise<Object>} Created inventory item
 * 
 * Expected Request Body:
 * {
 *   cropName: "Wheat",
 *   variety: "HD-2967",
 *   quantity: 450,
 *   unit: "kg",
 *   harvestDate: "2024-04-10",
 *   quality: "Grade A",
 *   storageLocation: "Warehouse 1",
 *   marketPrice: 2500,
 *   expiryDate: "2025-04-10"
 * }
 */
export const addInventoryItem = async (inventoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(inventoryData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to add inventory item');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

/**
 * Update inventory item
 * @param {number} itemId - Inventory item ID
 * @param {Object} updateData - Update information
 * @returns {Promise<Object>} Updated inventory item
 */
export const updateInventoryItem = async (itemId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update inventory item');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

/**
 * Delete inventory item
 * @param {number} itemId - Inventory item ID
 * @returns {Promise<void>}
 */
export const deleteInventoryItem = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete inventory item');
    }
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

/**
 * UTILITY FUNCTIONS
 * Helper functions for crop management
 */

/**
 * Get crop stages based on crop type
 * @param {string} cropName - Name of the crop
 * @returns {Array<string>} Array of growth stages
 */
export const getCropStages = (cropName) => {
  const cropStages = {
    'Wheat': [
      'Seed Preparation',
      'Sowing',
      'Germination',
      'Tillering',
      'Jointing',
      'Booting',
      'Flowering',
      'Grain Filling',
      'Maturity',
      'Harvest Ready'
    ],
    'Rice': [
      'Seed Preparation',
      'Sowing',
      'Germination',
      'Vegetative Growth',
      'Reproductive Phase',
      'Flowering',
      'Grain Filling',
      'Maturity',
      'Harvest Ready'
    ],
    'Corn': [
      'Seed Preparation',
      'Planting',
      'Emergence',
      'Vegetative Growth',
      'Tasseling',
      'Silking',
      'Grain Filling',
      'Maturity',
      'Harvest Ready'
    ],
    'Sugarcane': [
      'Planting',
      'Germination',
      'Tillering',
      'Grand Growth',
      'Maturity',
      'Harvest Ready'
    ],
    'Cotton': [
      'Planting',
      'Emergence',
      'Squaring',
      'Flowering',
      'Boll Development',
      'Boll Opening',
      'Harvest Ready'
    ]
  };
  
  return cropStages[cropName] || cropStages['Wheat'];
};

/**
 * Calculate crop timeline and progress
 * @param {Object} crop - Crop object with sowing and harvest dates
 * @returns {Object} Timeline information
 */
export const calculateCropTimeline = (crop) => {
  const sowingDate = new Date(crop.sowingDate);
  const harvestDate = new Date(crop.expectedHarvest);
  const currentDate = new Date();
  
  const totalDays = Math.floor((harvestDate - sowingDate) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.floor((currentDate - sowingDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = totalDays - daysPassed;
  
  return {
    totalDays,
    daysPassed: Math.max(0, daysPassed),
    daysRemaining: Math.max(0, daysRemaining),
    progressPercentage: Math.min((daysPassed / totalDays) * 100, 100)
  };
};

/**
 * DATABASE SCHEMA SUGGESTIONS
 * 
 * Backend developers can use these as reference for database design:
 * 
 * CROPS TABLE:
 * - id (Primary Key, Auto Increment)
 * - farmer_id (Foreign Key to Users table)
 * - name (VARCHAR, crop name like "Wheat", "Rice")
 * - variety (VARCHAR, variety like "HD-2967", "Basmati 1121")
 * - sowing_date (DATE)
 * - expected_harvest (DATE)
 * - current_stage (VARCHAR)
 * - progress (INTEGER, 0-100)
 * - area (DECIMAL, in acres)
 * - status (ENUM: 'healthy', 'attention', 'critical')
 * - notes (TEXT, optional)
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 * 
 * INVENTORY TABLE:
 * - id (Primary Key, Auto Increment)
 * - farmer_id (Foreign Key to Users table)
 * - crop_name (VARCHAR)
 * - variety (VARCHAR)
 * - quantity (DECIMAL)
 * - unit (ENUM: 'kg', 'tons', 'quintals', 'bags')
 * - harvest_date (DATE)
 * - quality (ENUM: 'Premium', 'Grade A', 'Grade B', 'Standard')
 * - storage_location (VARCHAR)
 * - estimated_value (DECIMAL)
 * - market_price (DECIMAL)
 * - expiry_date (DATE)
 * - status (ENUM: 'available', 'low-stock', 'reserved', 'sold')
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 */
