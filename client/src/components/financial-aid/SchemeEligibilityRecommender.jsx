import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faUser, 
  faMapMarkerAlt,
  faRupeeSign,
  faLandmark,
  faExternalLinkAlt,
  faCalendarAlt,
  faCheckCircle,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

/**
 * Scheme Eligibility Recommender Component
 * 
 * This component allows farmers to input their profile details and get
 * personalized recommendations for government schemes they are eligible for.
 * Includes PM schemes and state government agricultural support programs.
 */
const SchemeEligibilityRecommender = () => {
  const [formData, setFormData] = useState({
    landSize: '',
    annualIncome: '',
    state: '',
    district: '',
    cropType: '',
    farmerCategory: '',
    age: '',
    hasKisanCard: false,
    hasBankAccount: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Sample schemes data - replace with actual API call
  const sampleSchemes = [
    {
      id: 1,
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      description: 'Direct income support of ₹6,000 per year to small and marginal farmers',
      eligibility: 'Small and marginal farmers with landholding up to 2 hectares',
      benefits: '₹2,000 every 4 months directly to bank account',
      website: 'https://pmkisan.gov.in/',
      deadline: '2024-12-31',
      status: 'Active',
      documents: ['Aadhaar Card', 'Bank Account Details', 'Land Records'],
      category: 'PM Scheme'
    },
    {
      id: 2,
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Crop insurance scheme providing financial support to farmers',
      eligibility: 'All farmers including sharecroppers and tenant farmers',
      benefits: 'Insurance coverage against crop loss due to natural calamities',
      website: 'https://pmfby.gov.in/',
      deadline: '2024-11-30',
      status: 'Active',
      documents: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
      category: 'Insurance Scheme'
    },
    {
      id: 3,
      name: 'Kisan Credit Card (KCC)',
      description: 'Credit facility for farmers to meet agricultural expenses',
      eligibility: 'All farmers including tenant farmers, oral lessees, and sharecroppers',
      benefits: 'Credit up to ₹3 lakhs at subsidized interest rates',
      website: 'https://pmkisan.gov.in/Rpt_BeneficiaryStatus_pub.aspx',
      deadline: 'Ongoing',
      status: 'Active',
      documents: ['Aadhaar Card', 'PAN Card', 'Land Documents', 'Income Certificate'],
      category: 'Credit Scheme'
    },
    {
      id: 4,
      name: 'PM Kisan Maandhan Yojana',
      description: 'Pension scheme for small and marginal farmers',
      eligibility: 'Small and marginal farmers aged 18-40 years',
      benefits: 'Monthly pension of ₹3,000 after 60 years of age',
      website: 'https://maandhan.in/',
      deadline: 'Ongoing',
      status: 'Active',
      documents: ['Aadhaar Card', 'Bank Account', 'Age Proof'],
      category: 'Pension Scheme'
    },
    {
      id: 5,
      name: 'Soil Health Card Scheme',
      description: 'Free soil testing and health cards for farmers',
      eligibility: 'All farmers across India',
      benefits: 'Free soil testing and customized fertilizer recommendations',
      website: 'https://soilhealth.dac.gov.in/',
      deadline: 'Ongoing',
      status: 'Active',
      documents: ['Aadhaar Card', 'Land Records'],
      category: 'Support Scheme'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter schemes based on form data (mock logic)
      const eligibleSchemes = sampleSchemes.filter(scheme => {
        // Simple eligibility logic - replace with actual API logic
        if (formData.landSize && parseFloat(formData.landSize) <= 2) {
          return scheme.id === 1 || scheme.id === 4; // PM-KISAN and Maandhan
        }
        return true;
      });
      
      setSchemes(eligibleSchemes);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Deadline Soon': return 'text-yellow-600 bg-yellow-100';
      case 'Closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'PM Scheme': return 'text-blue-600 bg-blue-100';
      case 'Insurance Scheme': return 'text-purple-600 bg-purple-100';
      case 'Credit Scheme': return 'text-orange-600 bg-orange-100';
      case 'Pension Scheme': return 'text-indigo-600 bg-indigo-100';
      case 'Support Scheme': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      {!showResults ? (
        <div className="max-w-4xl mx-auto">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Find Your Eligible Schemes</h2>
            <p className="text-gray-600">
              Enter your details below to discover government schemes and financial aid programs you qualify for
            </p>
          </div>

          {/* Eligibility Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Land Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faLandmark} className="mr-2 text-green-600" />
                  Land Size (in hectares) *
                </label>
                <input
                  type="number"
                  name="landSize"
                  value={formData.landSize}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 1.5"
                />
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faRupeeSign} className="mr-2 text-green-600" />
                  Annual Income (in ₹) *
                </label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 200000"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" />
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select State</option>
                  <option value="uttar-pradesh">Uttar Pradesh</option>
                  <option value="punjab">Punjab</option>
                  <option value="haryana">Haryana</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="rajasthan">Rajasthan</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="west-bengal">West Bengal</option>
                  <option value="bihar">Bihar</option>
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your district"
                />
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Crop Type *
                </label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Crop Type</option>
                  <option value="wheat">Wheat</option>
                  <option value="rice">Rice</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="cotton">Cotton</option>
                  <option value="corn">Corn</option>
                  <option value="soybean">Soybean</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                </select>
              </div>

              {/* Farmer Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-green-600" />
                  Farmer Category *
                </label>
                <select
                  name="farmerCategory"
                  value={formData.farmerCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  <option value="small">Small Farmer (up to 2 hectares)</option>
                  <option value="marginal">Marginal Farmer (up to 1 hectare)</option>
                  <option value="medium">Medium Farmer (2-10 hectares)</option>
                  <option value="large">Large Farmer (above 10 hectares)</option>
                  <option value="tenant">Tenant Farmer</option>
                  <option value="sharecropper">Sharecropper</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="18"
                  max="100"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your age"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hasKisanCard"
                  checked={formData.hasKisanCard}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">I have a Kisan Credit Card</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hasBankAccount"
                  checked={formData.hasBankAccount}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">I have a bank account</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Finding Eligible Schemes...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} />
                    Find My Eligible Schemes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Your Eligible Schemes</h2>
              <p className="text-gray-600">Found {schemes.length} schemes that match your profile</p>
            </div>
            <button
              onClick={() => setShowResults(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Search Again
            </button>
          </div>

          {/* Schemes Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(scheme.category)}`}>
                        {scheme.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheme.status)}`}>
                        {scheme.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{scheme.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Benefits:</h4>
                    <p className="text-sm text-gray-600">{scheme.benefits}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Eligibility:</h4>
                    <p className="text-sm text-gray-600">{scheme.eligibility}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Required Documents:</h4>
                    <div className="flex flex-wrap gap-1">
                      {scheme.documents.map((doc, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                    <span>Deadline: {scheme.deadline}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <a
                    href={scheme.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center text-sm flex items-center justify-center gap-1"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
                    Official Website
                  </a>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                    More Info
                  </button>
                </div>
              </div>
            ))}
          </div>

          {schemes.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faInfoCircle} className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schemes found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any schemes matching your current profile. Try adjusting your details or check back later.
              </p>
              <button
                onClick={() => setShowResults(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Update Your Details
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchemeEligibilityRecommender;
