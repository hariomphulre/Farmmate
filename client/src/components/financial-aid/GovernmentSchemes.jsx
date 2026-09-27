import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faExternalLinkAlt,
  faCalendarAlt,
  faHandshake,
  faLandmark,
  faMapMarkerAlt,
  faInfoCircle,
  faTimes,
  faBuilding,
  faTag,
  faGlobe,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

import schemesData from '../../data/schemes_data.json';

/**
 * Government Schemes Component
 *
 * Displays all government agricultural schemes from schemes_data.json
 * displaying ALL fields (id, name, ministry, launched, benefit, eligibility, apply_url, category, level)
 * in the exact card format matching the Banks & Loans section.
 */

/* Category badge color helper matching Banks & Loans styling */
const getCategoryColor = (category) => {
  switch (category) {
    case 'Income support': return 'text-green-600 bg-green-100';
    case 'Insurance': return 'text-blue-600 bg-blue-100';
    case 'Pension': return 'text-purple-600 bg-purple-100';
    case 'Advisory': return 'text-amber-600 bg-amber-100';
    case 'Sustainable farming': return 'text-teal-600 bg-teal-100';
    case 'Irrigation': return 'text-cyan-600 bg-cyan-100';
    case 'Infrastructure': return 'text-slate-600 bg-slate-100';
    case 'Price support': return 'text-rose-600 bg-rose-100';
    case 'Mechanization': return 'text-orange-600 bg-orange-100';
    case 'Development': return 'text-emerald-600 bg-emerald-100';
    case 'Fisheries': return 'text-indigo-600 bg-indigo-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

/* ─── Scheme Card Component (matching LoanBankFinder card structure with all fields) ─── */
const SchemeCard = ({ scheme }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
      <div>
        {/* Bank/Scheme Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{scheme.name}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(scheme.category)}`}>
                {scheme.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                scheme.level === 'Central' ? 'text-indigo-600 bg-indigo-100' : 'text-yellow-700 bg-yellow-100'
              }`}>
                <FontAwesomeIcon icon={scheme.level === 'Central' ? faLandmark : faMapMarkerAlt} className="mr-1 text-[10px]" />
                {scheme.level}
              </span>
            </div>
          </div>
          <div className="text-right pl-2">
            <span className="text-[11px] font-mono font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              #{scheme.id}
            </span>
          </div>
        </div>

        {/* Key Details (matching LoanBankFinder detail key-value pairs) */}
        <div className="space-y-2.5 mb-4 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 text-xs sm:text-sm flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-xs" />
              Ministry:
            </span>
            <span className="font-medium text-gray-800 text-xs sm:text-sm text-right max-w-[60%] line-clamp-1" title={scheme.ministry}>
              {scheme.ministry}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 text-xs sm:text-sm flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 text-xs" />
              Launched Year:
            </span>
            <span className="font-medium text-gray-800 text-xs sm:text-sm">
              {scheme.launched ? scheme.launched : 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 text-xs sm:text-sm flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTag} className="text-gray-400 text-xs" />
              Category:
            </span>
            <span className="font-medium text-green-600 text-xs sm:text-sm">
              {scheme.category}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 text-xs sm:text-sm flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLayerGroup} className="text-gray-400 text-xs" />
              Level:
            </span>
            <span className="font-medium text-gray-800 text-xs sm:text-sm">
              {scheme.level}
            </span>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-1">Benefits:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{scheme.benefit}</p>
        </div>

        {/* Eligibility Criteria */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-1">Eligibility Criteria:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{scheme.eligibility}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <a
          href={scheme.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-center text-sm flex items-center justify-center gap-1.5 font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
          Visit Website
        </a>
        <a
          href={scheme.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center justify-center gap-1 font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faHandshake} className="mr-1" />
          Apply Now
        </a>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const GovernmentSchemes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const categories = useMemo(() => {
    const cats = [...new Set(schemesData.map(s => s.category))];
    return ['All', ...cats.sort()];
  }, []);

  const levels = useMemo(() => {
    const lvls = [...new Set(schemesData.map(s => s.level))];
    return ['All', ...lvls.sort()];
  }, []);

  const filteredSchemes = useMemo(() => {
    return schemesData.filter(scheme => {
      const matchesSearch =
        searchTerm === '' ||
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.benefit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.ministry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || scheme.category === selectedCategory;
      const matchesLevel =
        selectedLevel === 'All' || scheme.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchTerm, selectedCategory, selectedLevel]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLevel('All');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Government Agricultural Schemes</h2>
        <p className="text-gray-600">
          Discover central and state government schemes, subsidies, and financial support initiatives for farmers
        </p>
      </div>

      {/* Search and Filters (Matching Banks & Loans filter box style) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search schemes by name, ministry, benefit or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="All">All Levels</option>
              {levels.filter(l => l !== 'All').map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters button if active */}
        {(searchTerm || selectedCategory !== 'All' || selectedLevel !== 'All') && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-200 text-xs font-medium flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faTimes} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredSchemes.length} of {schemesData.length} government schemes
        </p>
      </div>

      {/* Schemes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {/* No Results */}
      {filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faInfoCircle} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schemes found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find relevant government schemes.
          </p>
          <button
            onClick={clearFilters}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
          >
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
};

export default GovernmentSchemes;
