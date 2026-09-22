import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrophone, 
  faMagnifyingGlass, 
  faBars, 
  faXmark,
  faChevronDown,
  faPlus,
  faMap,
  faLeaf,
  faCloudSunRain
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { useAppContext } from '../../context/AppContext';
import { API_URLS } from '../../config';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  
  // Safely use context with default values if context is undefined
  const contextValue = useAppContext() || {};
  const { 
    selectedField = '', 
    setSelectedField = () => {}, 
    selectedLocation = '', 
    setSelectedLocation = () => {}, 
    fields = [], 
    addField = () => {} 
  } = contextValue;
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFieldDialog, setShowNewFieldDialog] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  
  // State to track screen size
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update window width when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          menuButtonRef.current && 
          !menuButtonRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    
    // Handle Escape key to close menu
    const handleEscape = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);
  
  const handleFieldChange = (e) => {
    const value = e.target.value;
    
    if (value === 'new_field') {
      setShowNewFieldDialog(true);
    } else {
      setSelectedField(value);
    }
  };
  
  // Compute centroid for a polygon
  const getCentroid = (points) => {
    if (!Array.isArray(points) || points.length === 0) return null;
    const n = points.length;
    let latSum = 0;
    let lngSum = 0;
    points.forEach(({ lat, lng }) => {
      latSum += lat;
      lngSum += lng;
    });
    return { lat: latSum / n, lng: lngSum / n };
  };

  // Auto-fetch location name from backend when selectedField changes
  useEffect(() => {
    const updateLocationFromBackend = async () => {
      try {
        if (!selectedField) return;
        const field = fields.find(f => String(f.id) === String(selectedField));
        if (!field || !Array.isArray(field.coordinates) || field.coordinates.length === 0) return;
        const centroid = getCentroid(field.coordinates);
        if (!centroid) return;
        const res = await fetch(API_URLS.WEATHER_COORDINATES, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([centroid])
        });
        const json = await res.json();
        if (res.ok && json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const backendName = json.data[0]?.raw?.name;
          if (backendName && backendName.trim().length > 0) {
            setSelectedLocation(backendName);
            return;
          }
        }
        setSelectedLocation(`${centroid.lat.toFixed(5)}, ${centroid.lng.toFixed(5)}`);
      } catch (err) {
        // Silent fallback
      }
    };
    updateLocationFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedField, fields]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };
  
  const handleNewFieldSubmit = (e) => {
    e.preventDefault();
    
    if (newFieldName.trim()) {
      addField(newFieldName.trim());
      setSelectedField(newFieldName.trim());
      setNewFieldName('');
      setShowNewFieldDialog(false);
    }
  };
  
  const navigateToClimateAnalysis = () => {
    navigate('/climate');
  };
  
  const navigateToFarmConsole = () => {
    navigate('/farm-console');
  };

  return (
    <>
      <nav id="top-bar" className="fixed top-0 z-50 w-full border-b border-green-800 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center">            
            <img style={{ paddingRight: "10px" }} width="45px" src="logo.png" alt="logo" />
            <Link to="/" style={{fontSize: "25px", }} className="text-xl  text-white whitespace-nowrap">
              {windowWidth < 480 ? "Smart Agri" : "Climate Resilient Agriculture"}
            </Link> 
            
            {/* Mobile menu button */}
            <button 
              ref={menuButtonRef}
              style={{marginLeft: "auto", marginRight: "0px"}}
              className="md:hidden text-white hover:bg-green-700 active:bg-green-800 p-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-70"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} className="text-lg" />
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-grow mx-4 lg:mx-6">
              {/* Search Bar */}
              <div className="flex-grow max-w-sm lg:max-w-md">
                <form style={{borderRadius: "0.4rem"}} onSubmit={handleSearch} className="relative flex items-center overflow-hidden bg-white border border-green-200 shadow-sm h-9 md:h-10 focus-within:ring-2 focus-within:ring-green-400 focus-within:border-transparent transition-all duration-200">
                  <input 
                    type="text" 
                    id="searchInput" 
                    style={{fontSize: "17px"}}
                    placeholder="Search (/) for tools, and more..." 
                    className="w-full pl-3 pr-2 md:px-4 py-1.5 md:py-2 outline-none text-gray-700 bg-white text-sm"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="flex md:px-2 md:space-x-0 bg-white">
                    <button 
                      type="button" 
                      className="text-green-600 hover:text-green-800 transition duration-200 pr-1 rounded-full hover:bg-green-50"
                      aria-label="Voice search"
                    >
                      <FontAwesomeIcon icon={faMicrophone} style={{fontSize: "18px"}} className="text-xs md:text-sm" />
                    </button>
                    <button 
                      type="submit" 
                      className="text-green-600 hover:text-green-800 transition duration-200 pr-1 rounded-full hover:bg-green-50"
                      aria-label="Search"
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} style={{fontSize: "18px"}} className="text-xs md:text-sm" />
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Create Field Button */}
              <button 
                onClick={() => navigate('/create-field')}
                className="flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow active:shadow-inner text-sm whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1.5 md:mr-2 text-xs md:text-sm" />
                <span>Create Field</span>
              </button>
              
              {/* Field Selection */}
              <div className="relative min-w-[140px] lg:min-w-[160px]">
                <select
                  name="Select Field"
                  id="selectField"
                  className="w-full h-9 md:h-10 border border-green-200 rounded-md px-2.5 md:px-4 py-0 md:py-2 bg-white/90 text-gray-700 appearance-none cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  onChange={handleFieldChange}
                  value={selectedField || ''}
                >
                  <option value="" disabled hidden>Select Field</option>
                  
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 md:px-3 text-gray-700">
                  <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 md:w-4 md:h-4" />
                </div>
              </div>
              
              {/* Navigation Buttons */}
              {/* <button 
                onClick={navigateToClimateAnalysis} 
                className={`bg-white border rounded px-3 py-1.5 font-medium h-8.5 transition-colors ${location.pathname === '/climate' ? 'bg-green-100 text-green-800 border-green-500' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Climate Analysis
              </button>
              
              <button 
                onClick={navigateToFarmConsole} 
                className={`bg-white border rounded px-3 py-1.5 font-medium transition-colors ${location.pathname === '/farm-console' ? 'bg-green-100 text-green-800 border-green-500' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Farm Console
              </button> */}
            </div>
            
            {/* Location Display - Desktop (auto-fetched) */}
            <div className="hidden md:flex items-center h-9 md:h-10 border border-green-200 rounded-md px-2.5 md:px-3 bg-white/90 text-gray-700 shadow-sm text-sm min-w-[8rem]">
              <span className="truncate" title={selectedLocation || ''}>📍 {selectedLocation || 'Fetching...'}</span>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          <div 
            ref={mobileMenuRef} 
            className={`md:hidden mt-1.5 py-4 border-t border-green-800 bg-gradient-to-b from-[#192a06] to-green-900 rounded-b-lg shadow-lg fixed top-[52px] sm:top-[60px] left-0 right-0 max-h-[calc(100vh-52px)] sm:max-h-[calc(100vh-60px)] overflow-y-auto z-50 transition-all duration-300 transform ${
              mobileMenuOpen ? 'opacity-100 translate-y-0 mobile-menu-enter' : 'opacity-0 -translate-y-5 pointer-events-none'
            }`}
          >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4 px-4">
                <div className="flex rounded-md overflow-hidden shadow-sm">
                  <input
                    type="text"
                    
                    className="text-white flex-1 px-4 py-2.5 outline-none border-2 border-green-100 focus:border-green-300 text-sm"
                    placeholder="Search for tools, analytics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 transition duration-200 active:from-green-800 active:to-green-900">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>
              </form>
              
              {/* Create Field Button - Mobile */}
              <div className="px-4 mb-4">
                <button 
                  onClick={() => {
                    navigate('/create-field');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md font-medium transition duration-200 text-sm shadow-sm active:shadow-inner"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  <span>Create Field</span>
                </button>
              </div>
              
              {/* Mobile Field Selection */}
              <div className="mb-4 px-4">
                <label className="block text-sm font-medium text-green-50 mb-1.5">Select Field</label>
                <div className="relative">
                  <select
                    className="w-full border border-green-100 rounded-md px-3 py-2.5 bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-green-400 text-sm shadow-sm"
                    onChange={handleFieldChange}
                    value={selectedField || ''}
                  >
                    <option value="" disabled hidden>Select Field</option>
                    <option value="new_field">Create New Field</option>
                    {fields.map(field => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              {/* Mobile Location (read-only display) */}
              <div className="mb-4 px-4">
                <label className="block text-sm font-medium text-green-50 mb-1.5">Location</label>
                <div className="w-full border border-green-100 rounded-md px-3 py-2.5 bg-white text-gray-700 text-sm shadow-sm">
                  <span className="truncate">📍 {selectedLocation || 'Fetching...'}</span>
                </div>
              </div>
              
              {/* Mobile Navigation Buttons */}
              <div className="space-y-0 divide-y divide-green-800/50 mt-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1">Quick Navigation</p>
                </div>
                <button 
                  onClick={() => {
                    navigateToClimateAnalysis();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 text-white hover:bg-green-800/50 active:bg-green-800/70 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faCloudSunRain} className="mr-3 text-green-300 w-4 h-4" />
                  Climate Analysis
                </button>
                <button 
                  onClick={() => {
                    navigateToFarmConsole();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 text-white hover:bg-green-800/50 active:bg-green-800/70 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faLeaf} className="mr-3 text-green-300 w-4 h-4" />
                  Farm Console
                </button>
                <Link 
                  to="/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-5 py-3 text-white hover:bg-green-800/50 active:bg-green-800/70 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faMap} className="mr-3 text-green-300 w-4 h-4" />
                  Reports
                </Link>
                <Link 
                  to="/ai-assistant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-5 py-3 text-white hover:bg-green-800/50 active:bg-green-800/70 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faMicrophone} className="mr-3 text-green-300 w-4 h-4" />
                  AI Assistant
                </Link>
              </div>
            </div>
        </div>
      </nav>
        
      {/* New Field Dialog */}
      {showNewFieldDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FontAwesomeIcon icon={faPlus} className="mr-2 text-green-600 text-sm" />
                Create New Field
              </h3>
              <button 
                type="button"
                onClick={() => setShowNewFieldDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none p-1"
                aria-label="Close dialog"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>
            <form onSubmit={handleNewFieldSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Field Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                  placeholder="Enter field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Give your field a descriptive name</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-sm text-sm font-medium"
                  onClick={() => setShowNewFieldDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md hover:from-green-700 hover:to-green-600 transition-all shadow-sm active:shadow-inner disabled:opacity-70 text-sm font-medium"
                  disabled={!newFieldName.trim()}
                >
                  Create Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
