import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUniversity, 
  faSearch, 
  faFilter,
  faPhone,
  faMapMarkerAlt,
  faPercentage,
  faRupeeSign,
  faCalendarAlt,
  faCheckCircle,
  faExternalLinkAlt,
  faChartLine,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';

/**
 * Loan/Bank Finder Component
 * 
 * This component displays and allows comparison of various banks,
 * Jila Sahakari banks, and their agricultural loan products.
 * Includes interest rates, eligibility criteria, and contact information.
 */
const LoanBankFinder = () => {
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bankType: 'all',
    maxInterestRate: '',
    minLoanAmount: '',
    maxLoanAmount: '',
    state: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sample banks data - replace with actual API call
  const sampleBanks = [
    {
      id: 1,
      name: 'State Bank of India (SBI)',
      type: 'Public Sector Bank',
      interestRate: '7.0% - 8.5%',
      processingFee: '0.35% + GST',
      minLoanAmount: 50000,
      maxLoanAmount: 10000000,
      tenure: '1-7 years',
      eligibility: 'Farmers with land documents, minimum age 21 years',
      features: ['Kisan Credit Card', 'Crop Loan', 'Farm Mechanization'],
      contactNumber: '1800-425-3800',
      website: 'https://sbi.co.in/web/agri-rural/agriculture/agricultural-banking',
      branches: '22000+',
      state: 'All India',
      rating: 4.2,
      documentsRequired: ['Aadhaar Card', 'PAN Card', 'Land Documents', 'Income Proof'],
      specialOffers: ['Subsidy on interest rates for timely repayment', 'Insurance coverage available']
    },
    {
      id: 2,
      name: 'Punjab National Bank (PNB)',
      type: 'Public Sector Bank',
      interestRate: '7.25% - 8.75%',
      processingFee: '0.50% + GST',
      minLoanAmount: 25000,
      maxLoanAmount: 5000000,
      tenure: '1-5 years',
      eligibility: 'Individual farmers, tenant farmers, sharecroppers',
      features: ['Kisan Credit Card', 'Gold Loan for Farmers', 'Dairy Development'],
      contactNumber: '1800-180-2222',
      website: 'https://www.pnbindia.in/agriculture-loan.html',
      branches: '7500+',
      state: 'All India',
      rating: 4.0,
      documentsRequired: ['Aadhaar Card', 'Voter ID', 'Land Records', 'Bank Statements'],
      specialOffers: ['Reduced interest for organic farming', 'Quick processing within 7 days']
    },
    {
      id: 3,
      name: 'HDFC Bank',
      type: 'Private Sector Bank',
      interestRate: '8.5% - 10.0%',
      processingFee: '1.0% + GST',
      minLoanAmount: 100000,
      maxLoanAmount: 15000000,
      tenure: '1-10 years',
      eligibility: 'Farmers with regular income, good credit score',
      features: ['Agri Term Loan', 'Tractor Loan', 'Poultry & Dairy Loans'],
      contactNumber: '1800-425-4332',
      website: 'https://www.hdfcbank.com/personal/loans/rural-loans',
      branches: '5500+',
      state: 'All India',
      rating: 4.5,
      documentsRequired: ['Aadhaar Card', 'PAN Card', 'Income Certificate', 'Property Documents'],
      specialOffers: ['Digital loan processing', 'Flexible repayment options']
    },
    {
      id: 4,
      name: 'Jila Sahakari Bank - Pune',
      type: 'District Cooperative Bank',
      interestRate: '6.5% - 7.5%',
      processingFee: '0.25% + GST',
      minLoanAmount: 10000,
      maxLoanAmount: 500000,
      tenure: '1-3 years',
      eligibility: 'Local farmers with membership, land ownership proof',
      features: ['Fertilizer Distribution', 'Seed Supply', 'Local Crop Insurance'],
      contactNumber: '020-2612-3456',
      website: 'https://punedccb.com/',
      branches: '150+',
      state: 'Maharashtra',
      rating: 4.1,
      documentsRequired: ['Membership Certificate', 'Land Records', 'Aadhaar Card'],
      specialOffers: ['Direct fertilizer supply at subsidized rates', 'Local market linkage']
    },
    {
      id: 5,
      name: 'Haryana State Cooperative Bank',
      type: 'State Cooperative Bank',
      interestRate: '6.0% - 7.0%',
      processingFee: '0.20% + GST',
      minLoanAmount: 15000,
      maxLoanAmount: 1000000,
      tenure: '1-4 years',
      eligibility: 'Haryana resident farmers, cooperative society members',
      features: ['Wheat Procurement', 'Rice Marketing', 'Subsidy Distribution'],
      contactNumber: '0172-272-1234',
      website: 'https://harco-op.com/',
      branches: '200+',
      state: 'Haryana',
      rating: 4.0,
      documentsRequired: ['Residence Proof', 'Land Documents', 'Cooperative Membership'],
      specialOffers: ['MSP payments through bank', 'Government subsidy disbursement']
    },
    {
      id: 6,
      name: 'NABARD Regional Rural Bank',
      type: 'Regional Rural Bank',
      interestRate: '5.5% - 6.5%',
      processingFee: 'Nil',
      minLoanAmount: 5000,
      maxLoanAmount: 300000,
      tenure: '1-2 years',
      eligibility: 'Small and marginal farmers, rural entrepreneurs',
      features: ['Microfinance', 'Self Help Group Loans', 'Rural Development'],
      contactNumber: '1800-270-3000',
      website: 'https://www.nabard.org/',
      branches: '500+',
      state: 'Multiple States',
      rating: 4.3,
      documentsRequired: ['Income Certificate', 'Group Membership', 'Project Report'],
      specialOffers: ['Zero processing fee', 'Lowest interest rates', 'Government backing']
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadBanks = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBanks(sampleBanks);
      setFilteredBanks(sampleBanks);
      setIsLoading(false);
    };
    
    loadBanks();
  }, []);

  useEffect(() => {
    let filtered = banks.filter(bank => {
      const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bank.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.bankType === 'all' || bank.type.toLowerCase().includes(filters.bankType.toLowerCase());
      
      const matchesState = !filters.state || bank.state === 'All India' || bank.state === filters.state;
      
      const matchesInterest = !filters.maxInterestRate || 
                             parseFloat(bank.interestRate.split('%')[0]) <= parseFloat(filters.maxInterestRate);
      
      const matchesMinAmount = !filters.minLoanAmount || bank.minLoanAmount >= parseInt(filters.minLoanAmount);
      
      const matchesMaxAmount = !filters.maxLoanAmount || bank.maxLoanAmount <= parseInt(filters.maxLoanAmount);
      
      return matchesSearch && matchesType && matchesState && matchesInterest && matchesMinAmount && matchesMaxAmount;
    });
    
    setFilteredBanks(filtered);
  }, [searchTerm, filters, banks]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getBankTypeColor = (type) => {
    switch (type) {
      case 'Public Sector Bank': return 'text-blue-600 bg-blue-100';
      case 'Private Sector Bank': return 'text-purple-600 bg-purple-100';
      case 'District Cooperative Bank': return 'text-green-600 bg-green-100';
      case 'State Cooperative Bank': return 'text-orange-600 bg-orange-100';
      case 'Regional Rural Bank': return 'text-teal-600 bg-teal-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Loading banks and loan options...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Banks & Loan Finder</h2>
        <p className="text-gray-600">
          Compare agricultural loans from various banks, cooperative banks, and rural financial institutions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search banks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Bank Type Filter */}
          <div>
            <select
              value={filters.bankType}
              onChange={(e) => handleFilterChange('bankType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Bank Types</option>
              <option value="public">Public Sector</option>
              <option value="private">Private Sector</option>
              <option value="cooperative">Cooperative</option>
              <option value="rural">Rural Bank</option>
            </select>
          </div>

          {/* Interest Rate Filter */}
          <div>
            <input
              type="number"
              placeholder="Max Interest %"
              value={filters.maxInterestRate}
              onChange={(e) => handleFilterChange('maxInterestRate', e.target.value)}
              step="0.1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Gujarat">Gujarat</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => {
                setFilters({
                  bankType: 'all',
                  maxInterestRate: '',
                  minLoanAmount: '',
                  maxLoanAmount: '',
                  state: ''
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
          Showing {filteredBanks.length} of {banks.length} banks and loan options
        </p>
      </div>

      {/* Banks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBanks.map((bank) => (
          <div key={bank.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Bank Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{bank.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBankTypeColor(bank.type)}`}>
                  {bank.type}
                </span>
              </div>
              <div className="text-right">
                <div className="text-yellow-500 text-sm">{getRatingStars(bank.rating)}</div>
                <div className="text-xs text-gray-500">{bank.rating}/5.0</div>
              </div>
            </div>

            {/* Key Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Interest Rate:</span>
                <span className="font-medium text-green-600">
                  <FontAwesomeIcon icon={faPercentage} className="mr-1" />
                  {bank.interestRate}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Loan Amount:</span>
                <span className="font-medium">
                  <FontAwesomeIcon icon={faRupeeSign} className="mr-1" />
                  {(bank.minLoanAmount / 100000).toFixed(1)}L - {(bank.maxLoanAmount / 100000).toFixed(1)}L
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processing Fee:</span>
                <span className="font-medium">{bank.processingFee}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tenure:</span>
                <span className="font-medium">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  {bank.tenure}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Branches:</span>
                <span className="font-medium">{bank.branches}</span>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Key Features:</h4>
              <div className="flex flex-wrap gap-1">
                {bank.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Special Offers */}
            {bank.specialOffers && bank.specialOffers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Special Offers:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {bank.specialOffers.slice(0, 2).map((offer, index) => (
                    <li key={index} className="flex items-start">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1 mt-0.5 text-green-500 w-3 h-3" />
                      {offer}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact and Actions */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <FontAwesomeIcon icon={faPhone} className="mr-2 text-green-600" />
                <span>{bank.contactNumber}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-green-600" />
                <span>{bank.state}</span>
              </div>

              <div className="flex gap-2 mt-4">
                <a
                  href={bank.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-center text-sm flex items-center justify-center gap-1"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
                  Visit Website
                </a>
                <button className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm">
                  <FontAwesomeIcon icon={faHandshake} className="mr-1" />
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredBanks.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faUniversity} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No banks found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more options.
          </p>
          <button
            onClick={() => {
              setFilters({
                bankType: 'all',
                maxInterestRate: '',
                minLoanAmount: '',
                maxLoanAmount: '',
                state: ''
              });
              setSearchTerm('');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Comparison Tool */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <FontAwesomeIcon icon={faChartLine} className="mr-2 text-green-600" />
          Quick Comparison Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Interest Rates</h4>
            <p className="text-gray-600">Cooperative banks typically offer lower rates (5.5-7.5%) compared to private banks (8.5-10%)</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Processing Time</h4>
            <p className="text-gray-600">Digital applications with private banks are faster, while cooperative banks may take longer but offer better local support</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Additional Benefits</h4>
            <p className="text-gray-600">Jila Sahakari banks often provide fertilizers, seeds, and direct market access along with loans</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanBankFinder;
