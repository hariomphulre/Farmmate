import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWarehouse, 
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faDownload,
  faFilter,
  faSearch,
  faBoxes,
  faChartLine,
  faRupeeSign
} from '@fortawesome/free-solid-svg-icons';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([
    {
      id: 1,
      cropName: 'Wheat',
      variety: 'HD-2967',
      quantity: 450,
      unit: 'kg',
      harvestDate: '2024-04-10',
      quality: 'Grade A',
      storageLocation: 'Warehouse 1',
      estimatedValue: 18000,
      marketPrice: 2500,
      expiryDate: '2025-04-10',
      status: 'available'
    },
    {
      id: 2,
      cropName: 'Rice',
      variety: 'Basmati 1121',
      quantity: 320,
      unit: 'kg',
      harvestDate: '2024-10-25',
      quality: 'Premium',
      storageLocation: 'Warehouse 2',
      estimatedValue: 32000,
      marketPrice: 8000,
      expiryDate: '2025-10-25',
      status: 'available'
    },
    {
      id: 3,
      cropName: 'Corn',
      variety: 'Pioneer 3394',
      quantity: 150,
      unit: 'kg',
      harvestDate: '2024-08-15',
      quality: 'Grade B',
      storageLocation: 'Warehouse 1',
      estimatedValue: 7500,
      marketPrice: 3500,
      expiryDate: '2025-02-15',
      status: 'low-stock'
    },
    {
      id: 4,
      cropName: 'Sugarcane',
      variety: 'CO-86032',
      quantity: 2.5,
      unit: 'tons',
      harvestDate: '2024-12-01',
      quality: 'Grade A',
      storageLocation: 'Field Storage',
      estimatedValue: 75000,
      marketPrice: 3000,
      expiryDate: '2025-03-01',
      status: 'reserved'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100';
      case 'reserved': return 'text-blue-600 bg-blue-100';
      case 'sold': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Premium': return 'text-purple-600 bg-purple-100';
      case 'Grade A': return 'text-green-600 bg-green-100';
      case 'Grade B': return 'text-yellow-600 bg-yellow-100';
      case 'Standard': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.variety.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalValue = inventory.reduce((sum, item) => sum + item.estimatedValue, 0);
  const totalQuantity = inventory.reduce((sum, item) => {
    if (item.unit === 'tons') return sum + (item.quantity * 1000);
    return sum + item.quantity;
  }, 0);

  const AddInventoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add to Inventory</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., HD-2967, Basmati 1121"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Amount"
              />
              <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="kg">kg</option>
                <option value="tons">tons</option>
                <option value="quintals">quintals</option>
                <option value="bags">bags</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Grade</option>
              <option value="premium">Premium</option>
              <option value="grade-a">Grade A</option>
              <option value="grade-b">Grade B</option>
              <option value="standard">Standard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Select Location</option>
              <option value="warehouse-1">Warehouse 1</option>
              <option value="warehouse-2">Warehouse 2</option>
              <option value="field-storage">Field Storage</option>
              <option value="cold-storage">Cold Storage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Market Price (per unit)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                ₹
              </span>
              <input 
                type="number" 
                className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 2500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Expiry Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              Add to Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ItemDetailsModal = () => {
    if (!selectedItem) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedItem.cropName}</h3>
              <p className="text-gray-600">{selectedItem.variety}</p>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Quantity</h4>
              <p className="text-2xl font-bold text-blue-700">
                {selectedItem.quantity} {selectedItem.unit}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Total Value</h4>
              <p className="text-2xl font-bold text-green-700">
                ₹{selectedItem.estimatedValue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Harvest Date:</span>
              <span className="font-medium">{new Date(selectedItem.harvestDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quality:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(selectedItem.quality)}`}>
                {selectedItem.quality}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Location:</span>
              <span className="font-medium">{selectedItem.storageLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Market Price (per {selectedItem.unit}):</span>
              <span className="font-medium">₹{selectedItem.marketPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expiry Date:</span>
              <span className="font-medium">{new Date(selectedItem.expiryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-yellow-50 p-3 rounded-md">
              <h5 className="font-medium text-yellow-900 mb-1">Market Analysis</h5>
              <p className="text-sm text-yellow-700">
                Current market value: ₹{(selectedItem.quantity * selectedItem.marketPrice).toLocaleString()}
              </p>
              <p className="text-sm text-yellow-700">
                Profit potential: ₹{((selectedItem.quantity * selectedItem.marketPrice) - selectedItem.estimatedValue).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Update Quantity
            </button>
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Mark as Sold
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 text-sm mt-1">Track and manage your harvested crops</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="low-stock">Low Stock</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            Add to Inventory
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faBoxes} className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-lg font-semibold">{inventory.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faWarehouse} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-lg font-semibold">{totalQuantity.toLocaleString()} kg</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faRupeeSign} className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-lg font-semibold">₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Items</p>
              <p className="text-lg font-semibold">{inventory.filter(i => i.status === 'available').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harvest Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.cropName}</div>
                      <div className="text-sm text-gray-500">{item.variety}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{item.quantity} {item.unit}</div>
                    <div className="text-xs text-gray-500">₹{item.marketPrice}/{item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.harvestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getQualityColor(item.quality)}`}>
                      {item.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.storageLocation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{item.estimatedValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Edit">
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Delete">
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faWarehouse} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No items match your search' : 'No inventory items yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search terms or filters.' 
              : 'Start managing your harvest inventory by adding items.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Add Your First Item
            </button>
          )}
        </div>
      )}

      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
          Export Inventory Report
        </button>
      </div>

      {/* Modals */}
      {showAddModal && <AddInventoryModal />}
      {showDetailsModal && <ItemDetailsModal />}
    </div>
  );
};

export default InventoryManagement;
