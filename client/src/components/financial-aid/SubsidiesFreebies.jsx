import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGift, 
  faSearch, 
  faFilter,
  faSeedling,
  faFlask,
  faShieldAlt,
  faTractor,
  faWater,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faExternalLinkAlt,
  faDownload,
  faCalendarAlt,
  faMapMarkerAlt,
  faRupeeSign
} from '@fortawesome/free-solid-svg-icons';

/**
 * Subsidies & Freebies Component
 * 
 * This component displays available agricultural subsidies, free inputs,
 * and government welfare programs for farmers. Includes application status
 * tracking and direct application links.
 */
const SubsidiesFreebies = () => {
  const [subsidies, setSubsidies] = useState([]);
  const [filteredSubsidies, setFilteredSubsidies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    state: '',
    applicationStatus: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sample subsidies data - replace with actual API call
  const sampleSubsidies = [
    {
      id: 1,
      name: 'Free Soil Health Card',
      category: 'Soil Testing',
      description: 'Free soil testing and health cards with nutrient recommendations',
      provider: 'Department of Agriculture',
      eligibility: 'All farmers across India',
      benefits: 'Free soil testing worth ₹500, customized fertilizer recommendations',
      applicationDeadline: '2024-12-31',
      status: 'Active',
      applicationStatus: 'not-applied',
      applicationLink: 'https://soilhealth.dac.gov.in/',
      documentsRequired: ['Aadhaar Card', 'Land Records'],
      subsidyAmount: 500,
      state: 'All India',
      validUntil: '2024-12-31',
      icon: faFlask,
      color: 'blue'
    },
    {
      id: 2,
      name: 'PM-KISAN Seed Subsidy',
      category: 'Seeds',
      description: 'Subsidized high-quality seeds for certified farmers',
      provider: 'Ministry of Agriculture',
      eligibility: 'Small and marginal farmers with valid Kisan Card',
      benefits: '50% subsidy on certified seeds, maximum ₹2000 per season',
      applicationDeadline: '2024-11-15',
      status: 'Active',
      applicationStatus: 'applied',
      applicationLink: 'https://pmkisan.gov.in/',
      documentsRequired: ['Kisan Credit Card', 'Land Documents', 'Previous Season Harvest Proof'],
      subsidyAmount: 2000,
      state: 'All India',
      validUntil: '2024-11-15',
      icon: faSeedling,
      color: 'green'
    },
    {
      id: 3,
      name: 'Pradhan Mantri Fasal Bima Yojana',
      category: 'Insurance',
      description: 'Crop insurance with minimal premium paid by farmers',
      provider: 'Ministry of Agriculture',
      eligibility: 'All farmers including tenant farmers and sharecroppers',
      benefits: 'Premium subsidy up to 90%, compensation for crop loss',
      applicationDeadline: '2024-10-31',
      status: 'Active',
      applicationStatus: 'approved',
      applicationLink: 'https://pmfby.gov.in/',
      documentsRequired: ['Aadhaar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
      subsidyAmount: 15000,
      state: 'All India',
      validUntil: '2024-10-31',
      icon: faShieldAlt,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Tractor Subsidy Scheme',
      category: 'Machinery',
      description: 'Subsidy on purchase of agricultural machinery and tractors',
      provider: 'State Agriculture Department',
      eligibility: 'Farmers with minimum 2 acres of land',
      benefits: '25-50% subsidy on tractor purchase, maximum ₹1,50,000',
      applicationDeadline: '2024-12-20',
      status: 'Active',
      applicationStatus: 'not-applied',
      applicationLink: 'https://agrimachinery.nic.in/',
      documentsRequired: ['Land Documents', 'Income Certificate', 'Bank Account Details'],
      subsidyAmount: 150000,
      state: 'Punjab',
      validUntil: '2024-12-20',
      icon: faTractor,
      color: 'orange'
    },
    {
      id: 5,
      name: 'Drip Irrigation Subsidy',
      category: 'Irrigation',
      description: 'Financial assistance for micro irrigation systems',
      provider: 'Department of Water Resources',
      eligibility: 'Farmers with bore well or water source',
      benefits: '90% subsidy for small farmers, 80% for others',
      applicationDeadline: '2024-11-30',
      status: 'Active',
      applicationStatus: 'under-review',
      applicationLink: 'https://pmksy.gov.in/',
      documentsRequired: ['Water Source Certificate', 'Land Records', 'Project Estimate'],
      subsidyAmount: 80000,
      state: 'Maharashtra',
      validUntil: '2024-11-30',
      icon: faWater,
      color: 'cyan'
    },
    {
      id: 6,
      name: 'Free Fertilizer Distribution',
      category: 'Fertilizers',
      description: 'Free distribution of DAP and Urea fertilizers',
      provider: 'Jila Sahakari Bank',
      eligibility: 'Bank members with land size up to 5 acres',
      benefits: 'Free fertilizers worth ₹3000 per acre per season',
      applicationDeadline: '2024-10-15',
      status: 'Limited Stocks',
      applicationStatus: 'not-applied',
      applicationLink: 'https://fertilizer.gov.in/',
      documentsRequired: ['Bank Membership', 'Land Size Certificate'],
      subsidyAmount: 15000,
      state: 'Haryana',
      validUntil: '2024-10-15',
      icon: faGift,
      color: 'red'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadSubsidies = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubsidies(sampleSubsidies);
      setFilteredSubsidies(sampleSubsidies);
      setIsLoading(false);
    };
    
    loadSubsidies();
  }, []);

  useEffect(() => {
    let filtered = subsidies.filter(subsidy => {
      const matchesSearch = subsidy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           subsidy.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || subsidy.category.toLowerCase() === filters.category.toLowerCase();
      
      const matchesStatus = filters.status === 'all' || subsidy.status.toLowerCase().includes(filters.status.toLowerCase());
      
      const matchesState = !filters.state || subsidy.state === 'All India' || subsidy.state === filters.state;
      
      const matchesApplicationStatus = filters.applicationStatus === 'all' || subsidy.applicationStatus === filters.applicationStatus;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesState && matchesApplicationStatus;
    });
    
    setFilteredSubsidies(filtered);
  }, [searchTerm, filters, subsidies]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Limited Stocks': return 'text-yellow-600 bg-yellow-100';
      case 'Closed': return 'text-red-600 bg-red-100';
      case 'Coming Soon': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'not-applied': return 'text-gray-600 bg-gray-100';
      case 'applied': return 'text-blue-600 bg-blue-100';
      case 'under-review': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getApplicationStatusText = (status) => {
    switch (status) {
      case 'not-applied': return 'Not Applied';
      case 'applied': return 'Applied';
      case 'under-review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'seeds': return faSeedling;
      case 'soil testing': return faFlask;
      case 'insurance': return faShieldAlt;
      case 'machinery': return faTractor;
      case 'irrigation': return faWater;
      case 'fertilizers': return faGift;
      default: return faGift;
    }
  };

  const getCategoryColor = (color) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'cyan': return 'text-cyan-600 bg-cyan-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Loading subsidies and benefits...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Subsidies & Freebies</h2>
        <p className="text-gray-600">
          Discover and apply for agricultural subsidies, free inputs, and government welfare programs
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faGift} className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Available</p>
              <p className="text-lg font-semibold">{subsidies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Applied</p>
              <p className="text-lg font-semibold">{subsidies.filter(s => s.applicationStatus === 'applied').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-md mr-3">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-lg font-semibold">{subsidies.filter(s => s.applicationStatus === 'under-review').length}</p>
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
              <p className="text-lg font-semibold">₹{subsidies.reduce((sum, s) => sum + s.subsidyAmount, 0).toLocaleString()}</p>
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
                placeholder="Search subsidies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="seeds">Seeds</option>
              <option value="soil testing">Soil Testing</option>
              <option value="insurance">Insurance</option>
              <option value="machinery">Machinery</option>
              <option value="irrigation">Irrigation</option>
              <option value="fertilizers">Fertilizers</option>
            </select>
          </div>

          {/* Application Status Filter */}
          <div>
            <select
              value={filters.applicationStatus}
              onChange={(e) => handleFilterChange('applicationStatus', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Applications</option>
              <option value="not-applied">Not Applied</option>
              <option value="applied">Applied</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => {
                setFilters({
                  category: 'all',
                  status: 'all',
                  state: '',
                  applicationStatus: 'all'
                });
                setSearchTerm('');
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredSubsidies.length} of {subsidies.length} subsidies and benefits
        </p>
      </div>

      {/* Subsidies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSubsidies.map((subsidy) => (
          <div key={subsidy.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start">
                <div className={`p-2 rounded-md mr-3 ${getCategoryColor(subsidy.color)}`}>
                  <FontAwesomeIcon icon={getCategoryIcon(subsidy.category)} className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{subsidy.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subsidy.status)}`}>
                    {subsidy.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{subsidy.description}</p>

            {/* Key Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provider:</span>
                <span className="text-sm font-medium">{subsidy.provider}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max Benefit:</span>
                <span className="text-sm font-medium text-green-600">
                  <FontAwesomeIcon icon={faRupeeSign} className="mr-1" />
                  {subsidy.subsidyAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deadline:</span>
                <span className="text-sm font-medium">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  {new Date(subsidy.applicationDeadline).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Coverage:</span>
                <span className="text-sm font-medium">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  {subsidy.state}
                </span>
              </div>
            </div>

            {/* Application Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Application Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(subsidy.applicationStatus)}`}>
                  {getApplicationStatusText(subsidy.applicationStatus)}
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Benefits:</h4>
              <p className="text-sm text-gray-600">{subsidy.benefits}</p>
            </div>

            {/* Documents Required */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Documents Required:</h4>
              <div className="flex flex-wrap gap-1">
                {subsidy.documentsRequired.map((doc, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {doc}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {subsidy.applicationStatus === 'not-applied' && (
                <a
                  href={subsidy.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center text-sm flex items-center justify-center gap-1"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
                  Apply Now
                </a>
              )}
              
              {subsidy.applicationStatus === 'approved' && (
                <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center justify-center gap-1">
                  <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                  Download Certificate
                </button>
              )}
              
              {subsidy.applicationStatus === 'applied' || subsidy.applicationStatus === 'under-review' && (
                <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm">
                  Track Application
                </button>
              )}
              
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSubsidies.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faGift} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subsidies found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more options.
          </p>
          <button
            onClick={() => {
              setFilters({
                category: 'all',
                status: 'all',
                state: '',
                applicationStatus: 'all'
              });
              setSearchTerm('');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Application Guide */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 text-blue-600" />
          Application Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Document Preparation</h4>
            <p className="text-gray-600">Keep all required documents ready in digital format. Ensure they are clear and readable.</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Application Deadlines</h4>
            <p className="text-gray-600">Apply well before deadlines as processing may take time. Some schemes have limited quotas.</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Follow Up</h4>
            <p className="text-gray-600">Track your application status regularly and respond promptly to any queries from authorities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubsidiesFreebies;
