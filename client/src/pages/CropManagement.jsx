import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWheatAwn, 
  faSeedling, 
  faWarehouse,
  faChartLine,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import CropLifecycleTracking from '../components/crop/CropLifecycleTracking';
import InventoryManagement from '../components/crop/InventoryManagement';
import FertilizerRecommender from '../components/crop/fertilizerrecomender';

const CropManagement = () => {
  const [activeTab, setActiveTab] = useState('lifecycle');

  // Sample data - this would come from backend
  // This will be moved to individual components

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Management</h1>
        <p className="text-gray-600">Track your crop lifecycle and manage inventory efficiently</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lifecycle'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faSeedling} className="mr-2" />
              Crop Lifecycle
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faWarehouse} className="mr-2" />
              Inventory Management
            </button>
            <button
              onClick={() => setActiveTab('fertilizer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'fertilizer'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faWheatAwn} className="mr-2" />
              Fertilizer Recommender
            </button>
          </nav>
        </div>
      </div>

      {/* Crop Lifecycle Tab */}
      {activeTab === 'lifecycle' && <CropLifecycleTracking />}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && <InventoryManagement />}

      {/* Fertilizer Recaommender Tab */}
      {activeTab === 'fertilizer' && <FertilizerRecommender />}
    </div>
  );
};

export default CropManagement;
