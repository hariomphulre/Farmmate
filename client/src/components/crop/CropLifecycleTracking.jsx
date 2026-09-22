import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSeedling, 
  faPlus,
  faEdit,
  faEye,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const CropLifecycleTracking = () => {
  const [crops, setCrops] = useState([
    {
      id: 1,
      name: 'Wheat',
      variety: 'HD-2967',
      sowingDate: '2024-11-15',
      expectedHarvest: '2025-04-15',
      currentStage: 'Vegetative Growth',
      progress: 35,
      area: '2.5 acres',
      status: 'healthy',
      notes: 'Crop is growing well, regular watering maintained.'
    },
    {
      id: 2,
      name: 'Rice',
      variety: 'Basmati 1121',
      sowingDate: '2024-06-20',
      expectedHarvest: '2024-10-30',
      currentStage: 'Grain Filling',
      progress: 85,
      area: '1.8 acres',
      status: 'attention',
      notes: 'Monitor for pest activity, increase nutrient supply.'
    },
    {
      id: 3,
      name: 'Corn',
      variety: 'Pioneer 3394',
      sowingDate: '2024-03-10',
      expectedHarvest: '2024-08-15',
      currentStage: 'Harvest Ready',
      progress: 100,
      area: '1.2 acres',
      status: 'healthy',
      notes: 'Ready for harvest, weather conditions favorable.'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'attention': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCropStages = (cropName) => {
    const stages = {
      'Wheat': ['Seed Preparation', 'Sowing', 'Germination', 'Tillering', 'Jointing', 'Booting', 'Flowering', 'Grain Filling', 'Maturity', 'Harvest Ready'],
      'Rice': ['Seed Preparation', 'Sowing', 'Germination', 'Vegetative Growth', 'Reproductive Phase', 'Flowering', 'Grain Filling', 'Maturity', 'Harvest Ready'],
      'Corn': ['Seed Preparation', 'Planting', 'Emergence', 'Vegetative Growth', 'Tasseling', 'Silking', 'Grain Filling', 'Maturity', 'Harvest Ready']
    };
    return stages[cropName] || stages['Wheat'];
  };

  const getTimelineData = (crop) => {
    const sowingDate = new Date(crop.sowingDate);
    const harvestDate = new Date(crop.expectedHarvest);
    const totalDays = Math.floor((harvestDate - sowingDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.floor((new Date() - sowingDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysPassed;

    return {
      totalDays,
      daysPassed,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      progressPercentage: Math.min((daysPassed / totalDays) * 100, 100)
    };
  };

  const AddCropModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm supports-[backdrop-filter]:bg-opacity-30 flex items-center justify-center z-50">

    {/*<div className="fixed inset-0 bg-blur bg-opacity-50 flex items-center justify-center z-50"> */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add New Crop to Lifecycle</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Crop</option>
              <option value="wheat">Wheat</option>
              <option value="rice">Rice</option>
              <option value="corn">Corn</option>
              <option value="sugarcane">Sugarcane</option>
              <option value="cotton">Cotton</option>
              <option value="soybean">Soybean</option>
              <option value="potato">Potato</option>
              <option value="tomato">Tomato</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety/Hybrid</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., HD-2967, Basmati 1121"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (acres)</label>
            <input 
              type="number" 
              step="0.1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stage</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Current Stage</option>
              <option value="seed-preparation">Seed Preparation</option>
              <option value="sowing">Sowing</option>
              <option value="germination">Germination</option>
              <option value="vegetative-growth">Vegetative Growth</option>
              <option value="flowering">Flowering</option>
              <option value="grain-filling">Grain Filling</option>
              <option value="maturity">Maturity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Add any notes about the crop condition, treatments, etc."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Crop
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const CropDetailsModal = () => {
    if (!selectedCrop) return null;
    
    const timeline = getTimelineData(selectedCrop);
    const stages = getCropStages(selectedCrop.name);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedCrop.name}</h3>
              <p className="text-gray-600">{selectedCrop.variety}</p>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Timeline Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Timeline Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Duration:</span>
                  <span className="font-medium">{timeline.totalDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Days Passed:</span>
                  <span className="font-medium">{timeline.daysPassed} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Days Remaining:</span>
                  <span className="font-medium">{timeline.daysRemaining} days</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Crop Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Area:</span>
                  <span className="font-medium">{selectedCrop.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Current Stage:</span>
                  <span className="font-medium">{selectedCrop.currentStage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Progress:</span>
                  <span className="font-medium">{selectedCrop.progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Stages Timeline */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Growth Stages Timeline</h4>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              {stages.map((stage, index) => {
                const isCompleted = index < stages.indexOf(selectedCrop.currentStage);
                const isCurrent = stage === selectedCrop.currentStage;
                
                return (
                  <div key={stage} className="relative flex items-center mb-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-600 border-green-600 text-white' 
                        : isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`font-medium ${
                        isCompleted 
                          ? 'text-green-900' 
                          : isCurrent 
                          ? 'text-blue-900'
                          : 'text-gray-500'
                      }`}>
                        {stage}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-blue-600">Current Stage</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {selectedCrop.notes && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedCrop.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Update Stage
            </button>
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Add Note
            </button>
            <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
              Edit Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Crop Lifecycle Tracking</h2>
          <p className="text-gray-600 text-sm mt-1">Monitor your crops from sowing to harvest</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Track New Crop
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faSeedling} className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Crops</p>
              <p className="text-lg font-semibold">{crops.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-lg font-semibold">{crops.filter(c => c.progress < 100).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Need Attention</p>
              <p className="text-lg font-semibold">{crops.filter(c => c.status === 'attention').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready to Harvest</p>
              <p className="text-lg font-semibold">{crops.filter(c => c.progress === 100).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {crops.map((crop) => {
          const timeline = getTimelineData(crop);
          return (
            <div key={crop.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                  <p className="text-sm text-gray-600">{crop.variety}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                  {crop.status === 'healthy' && <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />}
                  {crop.status === 'attention' && <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />}
                  {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sowing Date:</span>
                  <span className="font-medium">{new Date(crop.sowingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Harvest:</span>
                  <span className="font-medium">{new Date(crop.expectedHarvest).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Days Remaining:</span>
                  <span className="font-medium text-blue-600">{timeline.daysRemaining} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{crop.area}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Stage:</span>
                  <span className="font-medium">{crop.currentStage}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{crop.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      crop.progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${crop.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => {
                    setSelectedCrop(crop);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-100 text-sm flex items-center justify-center gap-1"
                >
                  <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                  View Timeline
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex items-center justify-center gap-1">
                  <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                  Update
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {crops.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faSeedling} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crops being tracked</h3>
          <p className="text-gray-600 mb-4">Start tracking your crop lifecycle from sowing to harvest.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Start Tracking Your First Crop
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddCropModal />}
      {showDetailsModal && <CropDetailsModal />}
    </div>
  );
};

export default CropLifecycleTracking;
