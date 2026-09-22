import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faBook, 
  faFileAlt,
  faUsers,
  faPhone,
  faSearch,
  faChevronDown,
  faChevronRight,
  faDownload,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faInfoCircle,
  faGlobe,
  faEnvelope,
  faMapMarkerAlt,
  faClock,
  faHandshake,
  faRupeeSign,
  faIdCard,
  faHome,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';

/**
 * Support Guide Component
 * 
 * This component provides comprehensive help and guidance for farmers
 * including FAQs, application processes, documentation requirements,
 * and contact information for various agricultural financial schemes.
 */
const SupportGuide = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  
  const searchInputRef = useRef(null);

  // FAQ Data
  const faqData = [
    {
      id: 1,
      category: 'general',
      question: 'What is the eligibility criteria for agricultural loans?',
      answer: 'To be eligible for agricultural loans, you must be: 1) A farmer owning cultivable land, 2) Aged between 18-65 years, 3) Have a valid bank account, 4) Possess land ownership documents, 5) Have a good credit history. Different schemes may have additional specific requirements.',
      tags: ['eligibility', 'loans', 'criteria']
    },
    {
      id: 2,
      category: 'pmkisan',
      question: 'How do I check my PM-KISAN payment status?',
      answer: 'You can check your PM-KISAN payment status by: 1) Visiting the official website pmkisan.gov.in, 2) Clicking on "Beneficiary Status", 3) Entering your Aadhaar number, account number, or mobile number, 4) Click "Get Data" to view your payment history and status.',
      tags: ['pm-kisan', 'payment', 'status', 'check']
    },
    {
      id: 3,
      category: 'documents',
      question: 'What documents are required for Kisan Credit Card application?',
      answer: 'Required documents for KCC: 1) Filled application form, 2) Identity proof (Aadhaar/Voter ID), 3) Address proof, 4) Land ownership documents (Khasra/Revenue records), 5) Income certificate, 6) Recent passport size photographs, 7) Bank account statements (last 6 months).',
      tags: ['kcc', 'documents', 'application', 'credit-card']
    },
    {
      id: 4,
      category: 'subsidies',
      question: 'How much subsidy can I get for purchasing agricultural machinery?',
      answer: 'Machinery subsidies vary by state and category: 1) Small/Marginal farmers: 50-80% subsidy, 2) Other farmers: 40-50% subsidy, 3) SC/ST farmers: Additional 5-10% subsidy, 4) Women farmers: Additional benefits, 5) Maximum subsidy limit ranges from ₹50,000 to ₹5 lakhs depending on the equipment.',
      tags: ['machinery', 'subsidy', 'percentage', 'limit']
    },
    {
      id: 5,
      category: 'insurance',
      question: 'What crops are covered under PMFBY crop insurance?',
      answer: 'PMFBY covers: 1) Food crops (Rice, Wheat, Millets), 2) Oilseeds (Groundnut, Sunflower, Mustard), 3) Annual commercial/horticultural crops, 4) Perennial horticultural crops (on pilot basis), 5) All notified crops in your district are eligible. Coverage includes yield losses due to natural calamities, pests, and diseases.',
      tags: ['pmfby', 'insurance', 'crops', 'coverage']
    },
    {
      id: 6,
      category: 'application',
      question: 'How long does it take to process loan applications?',
      answer: 'Processing times vary by loan type: 1) KCC (existing customers): 7-15 days, 2) KCC (new customers): 15-30 days, 3) Term loans: 30-45 days, 4) Government scheme loans: 45-60 days. Factors affecting time: document completeness, verification process, loan amount, and bank workload.',
      tags: ['processing', 'time', 'loans', 'duration']
    },
    {
      id: 7,
      category: 'general',
      question: 'Can I apply for multiple government schemes simultaneously?',
      answer: 'Yes, you can apply for multiple non-conflicting schemes: 1) One scheme per category (e.g., one crop insurance + one input subsidy), 2) Check scheme guidelines for restrictions, 3) Some schemes may have overlapping benefits restrictions, 4) Maintain separate applications and documentation for each scheme.',
      tags: ['multiple', 'schemes', 'simultaneous', 'eligibility']
    },
    {
      id: 8,
      category: 'verification',
      question: 'What happens during field verification for loan applications?',
      answer: 'Field verification includes: 1) Physical visit to your farm, 2) Verification of land ownership documents, 3) Assessment of crop/livestock condition, 4) Confirmation of address and contact details, 5) Evaluation of farming activities, 6) Check for previous loan utilization, 7) Taking photographs for records.',
      tags: ['verification', 'field', 'process', 'loan']
    }
  ];

  // Application Process Guides
  const applicationGuides = [
    {
      id: 1,
      title: 'PM-KISAN Registration Process',
      category: 'government-schemes',
      description: 'Step-by-step guide to register for PM-KISAN Samman Nidhi Yojana',
      estimatedTime: '15-20 minutes',
      difficulty: 'Easy',
      steps: [
        {
          title: 'Visit Official Website',
          description: 'Go to pmkisan.gov.in and click on "New Farmer Registration"',
          documents: [],
          tips: 'Use a desktop/laptop for better experience'
        },
        {
          title: 'Choose Registration Type',
          description: 'Select between "Rural Farmer Registration" or "Urban Farmer Registration"',
          documents: [],
          tips: 'Select based on your land location'
        },
        {
          title: 'Enter Basic Details',
          description: 'Provide Aadhaar number, name, mobile number, and state',
          documents: ['Aadhaar Card'],
          tips: 'Ensure Aadhaar details match exactly with the card'
        },
        {
          title: 'Land Details Entry',
          description: 'Enter land ownership details including survey number and area',
          documents: ['Land Revenue Records', 'Khasra Number'],
          tips: 'Keep land documents handy for accurate entry'
        },
        {
          title: 'Bank Account Details',
          description: 'Provide bank account number, IFSC code, and account holder name',
          documents: ['Bank Passbook', 'Cancelled Cheque'],
          tips: 'Ensure account is linked to Aadhaar for DBT'
        },
        {
          title: 'Submit and Verify',
          description: 'Review all details, submit application, and note the reference number',
          documents: [],
          tips: 'Save the application reference number for future tracking'
        }
      ]
    },
    {
      id: 2,
      title: 'Kisan Credit Card Application',
      category: 'loans',
      description: 'Complete guide to apply for Kisan Credit Card (KCC)',
      estimatedTime: '30-45 minutes',
      difficulty: 'Medium',
      steps: [
        {
          title: 'Bank Selection',
          description: 'Choose a bank (preferably where you have existing relationship)',
          documents: [],
          tips: 'Compare interest rates and terms across banks'
        },
        {
          title: 'Document Preparation',
          description: 'Collect all required documents and make photocopies',
          documents: ['Aadhaar Card', 'PAN Card', 'Land Documents', 'Income Certificate', 'Bank Statements'],
          tips: 'Get documents attested by bank officials if required'
        },
        {
          title: 'Application Form',
          description: 'Fill the KCC application form completely and accurately',
          documents: ['Application Form'],
          tips: 'Double-check all entries before submission'
        },
        {
          title: 'Credit Assessment',
          description: 'Bank will assess your creditworthiness and farming activities',
          documents: [],
          tips: 'Be honest about your farming practices and income'
        },
        {
          title: 'Field Verification',
          description: 'Bank officer will visit your farm for verification',
          documents: ['Original Land Documents'],
          tips: 'Be available during the verification visit'
        },
        {
          title: 'Approval and Card Issuance',
          description: 'Once approved, collect your KCC and set PIN',
          documents: [],
          tips: 'Understand the credit limit and repayment terms'
        }
      ]
    },
    {
      id: 3,
      title: 'Crop Insurance (PMFBY) Application',
      category: 'insurance',
      description: 'Guide to apply for Pradhan Mantri Fasal Bima Yojana',
      estimatedTime: '20-25 minutes',
      difficulty: 'Medium',
      steps: [
        {
          title: 'Check Crop Coverage',
          description: 'Verify if your crop and area are covered under PMFBY',
          documents: [],
          tips: 'Visit pmfby.gov.in to check notified crops in your district'
        },
        {
          title: 'Choose Insurance Company',
          description: 'Select from empaneled insurance companies in your area',
          documents: [],
          tips: 'Compare premium rates and claim settlement ratios'
        },
        {
          title: 'Application Submission',
          description: 'Submit application before the cut-off date (usually 1-2 weeks before sowing)',
          documents: ['Land Documents', 'Bank Account Details', 'Aadhaar Card'],
          tips: 'Don\'t miss the deadline - applications close before sowing season'
        },
        {
          title: 'Premium Payment',
          description: 'Pay the farmer\'s share of premium (2% for Kharif, 1.5% for Rabi)',
          documents: [],
          tips: 'Government subsidizes majority of the premium'
        },
        {
          title: 'Policy Confirmation',
          description: 'Receive policy document and coverage details',
          documents: [],
          tips: 'Keep policy documents safe for claim purposes'
        },
        {
          title: 'Claim Process (if needed)',
          description: 'Report crop loss within 72 hours of occurrence',
          documents: [],
          tips: 'Take photographs of damaged crops for claim support'
        }
      ]
    }
  ];

  // Document Requirements
  const documentCategories = [
    {
      name: 'Identity Documents',
      icon: faIdCard,
      documents: [
        { name: 'Aadhaar Card', required: 'Mandatory for most schemes', validity: 'Lifetime' },
        { name: 'PAN Card', required: 'For loans above ₹50,000', validity: 'Lifetime' },
        { name: 'Voter ID Card', required: 'Alternative identity proof', validity: 'Check expiry date' },
        { name: 'Driving License', required: 'Alternative identity proof', validity: 'Check expiry date' }
      ]
    },
    {
      name: 'Land Documents',
      icon: faHome,
      documents: [
        { name: 'Khasra/Survey Number', required: 'Mandatory for land-based schemes', validity: 'Current year' },
        { name: 'Land Revenue Records', required: 'Proof of land ownership', validity: 'Updated records' },
        { name: 'Mutation Certificate', required: 'For inherited/purchased land', validity: '5 years' },
        { name: 'Sale Deed', required: 'For purchased land', validity: 'Lifetime' }
      ]
    },
    {
      name: 'Financial Documents',
      icon: faRupeeSign,
      documents: [
        { name: 'Bank Account Passbook', required: 'For direct benefit transfer', validity: 'Active account' },
        { name: 'Income Certificate', required: 'For subsidy calculations', validity: '1 year' },
        { name: 'ITR (if applicable)', required: 'For high-value loans', validity: '3 years' },
        { name: 'Crop Production Records', required: 'For agricultural loans', validity: '3 years' }
      ]
    },
    {
      name: 'Category Certificates',
      icon: faGraduationCap,
      documents: [
        { name: 'Caste Certificate', required: 'For SC/ST/OBC benefits', validity: 'Lifetime' },
        { name: 'BPL Certificate', required: 'For poverty-based schemes', validity: '3 years' },
        { name: 'Small/Marginal Farmer Certificate', required: 'For enhanced subsidies', validity: '3 years' },
        { name: 'Women Farmer Certificate', required: 'For women-specific benefits', validity: '3 years' }
      ]
    }
  ];

  // Contact Information
  const contactInfo = [
    {
      category: 'National Helplines',
      icon: faPhone,
      contacts: [
        { name: 'PM-KISAN Helpline', number: '011-24300606', email: 'pmkisan-ict@gov.in', timings: '9:30 AM - 6:00 PM (Mon-Fri)' },
        { name: 'Kisan Call Centre', number: '1551', email: 'kcc.dac@nic.in', timings: '6:00 AM - 10:00 PM (All days)' },
        { name: 'PMFBY Helpline', number: '1800-266-0700', email: 'pmfby@gov.in', timings: '10:00 AM - 6:00 PM (Mon-Fri)' },
        { name: 'Soil Health Card Helpline', number: '1800-180-1551', email: 'shc.dac@nic.in', timings: '9:00 AM - 5:00 PM (Mon-Fri)' }
      ]
    },
    {
      category: 'Online Support',
      icon: faGlobe,
      contacts: [
        { name: 'PM-KISAN Portal', number: 'N/A', email: 'pmkisan.gov.in', timings: '24/7 Online' },
        { name: 'DBT Agriculture Portal', number: 'N/A', email: 'dbtdacfw.gov.in', timings: '24/7 Online' },
        { name: 'AgriMarket Portal', number: 'N/A', email: 'agmarknet.gov.in', timings: '24/7 Online' },
        { name: 'PMFBY Portal', number: 'N/A', email: 'pmfby.gov.in', timings: '24/7 Online' }
      ]
    }
  ];

  // Filter FAQs
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'general': return faQuestionCircle;
      case 'pmkisan': return faHandshake;
      case 'documents': return faFileAlt;
      case 'subsidies': return faRupeeSign;
      case 'insurance': return faCheckCircle;
      case 'application': return faFileAlt;
      case 'verification': return faCheckCircle;
      default: return faInfoCircle;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Support Guide</h2>
        <p className="text-gray-600">
          Your comprehensive help center for agricultural schemes, applications, and documentation
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'faq', label: 'FAQs', icon: faQuestionCircle },
              { id: 'guides', label: 'Application Guides', icon: faBook },
              { id: 'documents', label: 'Document Requirements', icon: faFileAlt },
              { id: 'contact', label: 'Contact Support', icon: faUsers }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              {/* Search and Filter */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="general">General</option>
                      <option value="pmkisan">PM-KISAN</option>
                      <option value="documents">Documents</option>
                      <option value="subsidies">Subsidies</option>
                      <option value="insurance">Insurance</option>
                      <option value="application">Applications</option>
                      <option value="verification">Verification</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={getCategoryIcon(faq.category)} className="mr-3 text-green-600 w-4 h-4" />
                        <span className="font-medium text-gray-900">{faq.question}</span>
                      </div>
                      <FontAwesomeIcon 
                        icon={expandedFAQ === faq.id ? faChevronDown : faChevronRight} 
                        className="text-gray-400 w-4 h-4" 
                      />
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-4 border-t border-gray-100">
                        <p className="text-gray-600 mt-3 leading-relaxed">{faq.answer}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {faq.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faQuestionCircle} className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or select a different category.</p>
                </div>
              )}
            </div>
          )}

          {/* Application Guides Tab */}
          {activeTab === 'guides' && (
            <div>
              {selectedGuide ? (
                <div>
                  {/* Guide Header */}
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedGuide(null)}
                      className="text-green-600 hover:text-green-700 mb-4"
                    >
                      ← Back to Guides
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedGuide.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedGuide.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        {selectedGuide.estimatedTime}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedGuide.difficulty)}`}>
                        {selectedGuide.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-6">
                    {selectedGuide.steps.map((step, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start">
                          <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm mr-4 mt-1">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                            <p className="text-gray-600 mb-4">{step.description}</p>
                            
                            {step.documents.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-900 mb-2">Required Documents:</h5>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                  {step.documents.map((doc, docIndex) => (
                                    <li key={docIndex}>{doc}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {step.tips && (
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                <div className="flex items-center">
                                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-400 mr-2" />
                                  <span className="font-medium text-blue-800">Tip:</span>
                                </div>
                                <p className="text-blue-700 mt-1">{step.tips}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applicationGuides.map((guide) => (
                    <div key={guide.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => setSelectedGuide(guide)}>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            <FontAwesomeIcon icon={faClock} className="mr-1" />
                            {guide.estimatedTime}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                            {guide.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">{guide.steps.length} Steps</span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {documentCategories.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={category.icon} className="text-green-600 mr-3 w-5 h-5" />
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.documents.map((doc, docIndex) => (
                      <div key={docIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-1">{doc.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{doc.required}</p>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Valid: {doc.validity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              {contactInfo.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={category.icon} className="text-green-600 mr-3 w-5 h-5" />
                    <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.contacts.map((contact, contactIndex) => (
                      <div key={contactIndex} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{contact.name}</h4>
                        <div className="space-y-2 text-sm">
                          {contact.number !== 'N/A' && (
                            <div className="flex items-center text-gray-600">
                              <FontAwesomeIcon icon={faPhone} className="mr-2 w-4 h-4" />
                              <span>{contact.number}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <FontAwesomeIcon icon={contact.number === 'N/A' ? faGlobe : faEnvelope} className="mr-2 w-4 h-4" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FontAwesomeIcon icon={faClock} className="mr-2 w-4 h-4" />
                            <span>{contact.timings}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportGuide;
