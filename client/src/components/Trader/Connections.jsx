import React, { useState } from 'react';
import { MapPin, Phone, Mail, Star, Users, Award, Clock, Shield, ChevronDown, ChevronUp, User, Droplet, Mountain } from 'lucide-react';

const FarmerConnections = ({ farmersData = [] }) => {
  const [expandedFarmer, setExpandedFarmer] = useState(null);

  const toggleExpanded = (farmerId) => {
    setExpandedFarmer(expandedFarmer === farmerId ? null : farmerId);
  };
  
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farmer Connections</h1>
              <p className="text-gray-600 mt-1">Connect with verified farmers and expand your network</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{farmersData.length} farmers available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Farmers List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {farmersData.map((farmer) => {
            const isExpanded = expandedFarmer === farmer.farmerId;
            
            return (
              <div key={farmer.farmerId} className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                {/* Basic Details - Always Visible */}
                <div 
                  className="p-6 cursor-pointer bg-gradient-to-br from-white to-gray-50"
                  onClick={() => toggleExpanded(farmer.farmerId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Profile Picture */}
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ring-2 ring-white shadow">
                        {farmer.name.charAt(0)}
                      </div>
                      
                      {/* Basic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-950">{farmer.name}</h3>
                          {farmer.verificationStatus === 'Verified' && (
                            <Shield className="w-5 h-5 text-blue-500" />
                          )}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(farmer.status)}`}>
                            {farmer.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{farmer.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>{farmer.farmDetails.farmingMethod}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{farmer.experience} experience</span>
                          </div>
                        </div>
                        
                        {renderStars(farmer.rating)}
                      </div>
                      
                      {/* Quick Crops Preview */}
                      <div className="hidden md:flex flex-wrap gap-2 max-w-xs">
                        {farmer.crops.slice(0, 3).map((crop, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {crop.name}
                          </span>
                        ))}
                        {farmer.crops.length > 3 && (
                          <span className="text-gray-500 text-sm">+{farmer.crops.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Expand Button */}
                    <div className="flex items-center gap-4">
                      {/* Compact Stats (collapsed) */}
                      <div className="hidden md:flex items-center gap-6 mr-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{farmer.connections.connectionsCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{farmer.crops.length} crops</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{farmer.rating}</span>
                        </div>
                      </div>

                      <div className="hidden lg:flex gap-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50">
                          Connect
                        </button>
                        <button className="border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300/60">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="border border-gray-300 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300/60">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h4>
                          <div className="bg-white p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Age:</span>
                                <p className="text-gray-600">{farmer.age} years</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Gender:</span>
                                <p className="text-gray-600">{farmer.gender}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Education:</span>
                                <p className="text-gray-600">{farmer.education}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Languages:</span>
                                <p className="text-gray-600">{farmer.languagesSpoken.join(', ')}</p>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Bio:</span>
                              <p className="text-gray-600 mt-1">{farmer.bio}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Contact:</span>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-gray-600">{farmer.contact.phone}</span>
                                <span className="text-gray-600">{farmer.contact.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Farm Details */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Farm Details</h4>
                          <div className="bg-white p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Mountain className="w-4 h-4 text-brown-500" />
                                <div>
                                  <span className="font-medium text-gray-700">Size:</span>
                                  <p className="text-gray-600">{farmer.farmDetails.farmSize}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-green-500" />
                                <div>
                                  <span className="font-medium text-gray-700">Method:</span>
                                  <p className="text-gray-600">{farmer.farmDetails.farmingMethod}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplet className="w-4 h-4 text-blue-500" />
                                <div>
                                  <span className="font-medium text-gray-700">Water Source:</span>
                                  <p className="text-gray-600">{farmer.farmDetails.waterSource}</p>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Soil Type:</span>
                                <p className="text-gray-600">{farmer.farmDetails.soilType}</p>
                              </div>
                            </div>
                            {farmer.farmDetails.certifications.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700">Certifications:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {farmer.farmDetails.certifications.map((cert, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        {/* Available Crops */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Available Crops</h4>
                          <div className="bg-white p-4 rounded-lg">
                            <div className="grid gap-3">
                              {farmer.crops.map((crop, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className="font-medium text-gray-900">{crop.name}</h5>
                                    <span className="text-lg font-bold text-green-600">₹{crop.pricePerKg}/kg</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">Available: {crop.availableQuantity}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Trading Information */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Trading Information</h4>
                          <div className="bg-white p-4 rounded-lg space-y-4">
                            <div>
                              <span className="font-medium text-gray-700">Monthly Supply Capacity:</span>
                              <p className="text-gray-600">{farmer.tradingInfo.averageMonthlySupply}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Payment Methods:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {farmer.tradingInfo.preferredPaymentMethods.map((method, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm">
                                    {method}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Delivery Options:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {farmer.tradingInfo.deliveryOptions.map((option, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm">
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {farmer.tradingInfo.pastBuyers.length > 0 && (
                              <div>
                                <span className="font-medium text-gray-700">Past Buyers:</span>
                                <p className="text-gray-600">{farmer.tradingInfo.pastBuyers.join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reviews */}
                        {farmer.reviews && farmer.reviews.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Recent Reviews</h4>
                            <div className="bg-white p-4 rounded-lg space-y-3">
                              {farmer.reviews.map((review, index) => (
                                <div key={index} className="border-l-4 border-green-500 pl-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">{review.traderName}</span>
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500">{review.date}</span>
                                  </div>
                                  <p className="text-gray-600 text-sm">{review.comment}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Connection Info */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">Network</h4>
                          <div className="bg-white p-4 rounded-lg">
                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Total Connections:</span>
                                <p className="text-gray-600">{farmer.connections.connectionsCount} farmers</p>
                              </div>
                              {farmer.connections.mutualConnections.length > 0 && (
                                <div>
                                  <span className="font-medium text-gray-700">Mutual Connections:</span>
                                  <p className="text-gray-600">{farmer.connections.mutualConnections.join(', ')}</p>
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                Last active: {farmer.lastActive}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="lg:hidden mt-6 flex gap-3">
                      <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                        Connect
                      </button>
                      <button className="border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Mail className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {farmersData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No farmers available</h3>
            <p className="text-gray-600">Farmers data will appear here when provided.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerConnections;