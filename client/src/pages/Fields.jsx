import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faEdit, faTrash, faSearch, faExclamationTriangle, faSpinner, faTimes, faSeedling } from '@fortawesome/free-solid-svg-icons';
import { API_URLS } from '../config';
import '../components/fields/Fields.css';

const Fields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URLS.FIELDS);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fields: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.fields)) {
        setFields(result.fields);
      } else {
        setFields([]);
        setError('No fields found or invalid server response');
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      setError(`Failed to load fields: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!fieldId) return;
    
    try {
      const response = await fetch(`${API_URLS.FIELDS}/${fieldId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete field: ${response.status} ${response.statusText}`);
      }

      // Remove the deleted field from the state
      setFields(fields.filter(field => field.id !== fieldId));
      
      // Clear delete confirmation
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting field:', error);
      setError(`Failed to delete field: ${error.message}`);
    }
  };

  const requestDelete = (fieldId) => {
    setDeleteConfirm(fieldId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter fields based on search term
  const filteredFields = fields.filter(field => 
    field.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    field.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (field.crop && field.crop.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort fields based on sortConfig
  const sortedFields = [...filteredFields].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return null;
  };

  return (
    <div className="fields-page bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faMap} className="mr-3 text-green-600" />
            My Fields
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all your field boundaries and details
          </p>
        </div>
        <Link 
          to="/create-field" 
          className="btn bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <span className="mr-2">+</span> Add New Field
        </Link>
      </div>

      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by field name, location, or crop..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 mb-6 rounded-lg flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-green-600 mb-4" />
          <p>Loading fields...</p>
        </div>
      ) : (
        <>
          {filteredFields.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FontAwesomeIcon icon={faMap} className="text-4xl text-gray-400 mb-3" />
              <h3 className="text-xl font-semibold text-gray-700">No fields found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No fields match your search criteria' : 'You haven\'t created any fields yet'}
              </p>
              {searchTerm && (
                <button 
                  className="text-green-600 hover:text-green-700 font-medium"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </button>
              )}
              {!searchTerm && (
                <Link 
                  to="/create-field" 
                  className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Create your first field
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 text-gray-500 font-medium text-sm tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                      Field Name {getSortIcon('name')}
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-gray-500 font-medium text-sm tracking-wider cursor-pointer" onClick={() => handleSort('location')}>
                      Location {getSortIcon('location')}
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-gray-500 font-medium text-sm tracking-wider cursor-pointer" onClick={() => handleSort('crop')}>
                      Crop {getSortIcon('crop')}
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-gray-500 font-medium text-sm tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                      Created Date {getSortIcon('createdAt')}
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-gray-500 font-medium text-sm tracking-wider">
                      Area
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 text-gray-500 font-medium text-sm tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFields.map((field) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 border-b border-gray-200">
                        <div className="font-medium text-gray-900">{field.name}</div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-500">
                        {field.location}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-500">
                        {field.crop || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-500">
                        {new Date(field.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-500">
                        {field.coordinates ? `${calculateFieldArea(field.coordinates).toFixed(2)} ha` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-right">
                        <div className="flex justify-end space-x-2">
                          <div className='pr-8 flex gap-4'>
                          <Link
                            to={`/field-detail/${field.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View field details"
                          >
                            View
                          </Link>
                          <Link
                            to={`/field-detail/${field.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit field"
                          >
                            
                            <FontAwesomeIcon icon={faEdit} />
                          </Link>
                          </div>
                          {deleteConfirm === field.id ? (
                            <div className="flex items-center ml-1">
                              <button
                                onClick={() => handleDeleteField(field.id)}
                                className="text-red-600 hover:text-red-900 mr-1"
                                title="Confirm delete"
                              >
                                Yes
                              </button>
                              <button
                                onClick={cancelDelete}
                                className="text-gray-600 hover:text-gray-900"
                                title="Cancel delete"
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => requestDelete(field.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete field"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Helper function to calculate approximate field area in hectares
function calculateFieldArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return 0;

  // Implementation of the Shoelace formula to calculate polygon area
  let area = 0;
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    area += coordinates[i].lat * coordinates[j].lng;
    area -= coordinates[j].lat * coordinates[i].lng;
  }

  area = Math.abs(area) / 2;
  
  // Convert square degrees to hectares (very approximate, varies by latitude)
  // This is a rough approximation, for more precise calculation, use proper GIS libraries
  const degreeToMeter = 111319.9; // At equator, varies by latitude
  const squareMetersToHectares = 0.0001;
  
  return area * Math.pow(degreeToMeter, 2) * squareMetersToHectares;
}

export default Fields;
