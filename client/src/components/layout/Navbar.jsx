import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMicrophone, 
  faMicrophoneSlash,
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
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import CommandPalette from './CommandPalette';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchInputRef = useRef(null);
  
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
  const [voiceError, setVoiceError] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Speech Recognition hook
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({ language: 'en-IN' });

  // When speech recognition returns a final transcript, update search query
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  // Show interim (partial) results in the search box as user speaks
  useEffect(() => {
    if (isListening && interimTranscript) {
      setSearchQuery(interimTranscript);
    }
  }, [interimTranscript, isListening]);

  // Show speech errors as temporary toast
  useEffect(() => {
    if (speechError) {
      setVoiceError(speechError);
      const timer = setTimeout(() => setVoiceError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [speechError]);

  // Toggle voice search
  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      setSearchQuery('');
      startListening();
    }
  };

  // Command palette: detect '/' in search query
  useEffect(() => {
    if (searchQuery.startsWith('/')) {
      setShowCommandPalette(true);
    } else {
      setShowCommandPalette(false);
    }
  }, [searchQuery]);

  // Global '/' keyboard shortcut to focus search bar
  useEffect(() => {
    const handleGlobalSlash = (e) => {
      // Don't trigger if user is typing in an input/textarea/select
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setSearchQuery('/');
          setShowCommandPalette(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalSlash);
    return () => window.removeEventListener('keydown', handleGlobalSlash);
  }, []);

  // Close command palette
  const closeCommandPalette = () => {
    setShowCommandPalette(false);
    setSearchQuery('');
  };
  
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
    // If command palette is open, don't submit the form
    if (showCommandPalette) return;
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
      <nav id="top-bar" className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 sm:px-8 py-1.5 flex justify-between items-center border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Farmmate Logo" className="w-9 h-9 object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-[#052e16] leading-tight">Farmmate</h1>
              <h2 className="text-[10px] font-medium text-slate-600 tracking-wide">Smart & Climate Resilient Agriculture</h2>
            </div>
          </Link>
          
          <div className="flex items-center flex-grow justify-end gap-2 sm:gap-4 lg:gap-6">
            
            {/* Mobile menu button */}
            <button 
              ref={menuButtonRef}
              className="md:hidden ml-auto text-slate-600 hover:bg-slate-100 active:bg-slate-200 p-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#052e16]/15"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} className="text-lg" />
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-grow mx-4 lg:mx-6">
              {/* Search Bar */}
              <div className="flex-grow max-w-sm lg:max-w-md ml-auto relative">
                <form style={{borderRadius: "2rem"}} onSubmit={handleSearch} className={`relative flex items-center overflow-hidden bg-slate-50 border shadow-sm h-9 md:h-10 transition-all duration-200 ${showCommandPalette ? 'border-[#052e16] ring-2 ring-[#052e16]/15' : 'border-slate-200 focus-within:ring-2 focus-within:ring-[#052e16]/15 focus-within:border-[#052e16]'}`}>
                  <input 
                    type="text" 
                    id="searchInput" 
                    ref={searchInputRef}
                    style={{fontSize: "14px"}}
                    placeholder="Search (/) for tools, and more..." 
                    className="w-full pl-4 pr-2 md:px-4 py-1.5 md:py-2 outline-none text-slate-700 bg-slate-50 text-sm"
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.startsWith('/')) setShowCommandPalette(true); }}
                  />
                  <div className="flex md:px-2 md:space-x-0 bg-slate-50">
                    <button 
                      type="button" 
                      onClick={handleVoiceSearch}
                      className={`transition duration-200 pr-2 rounded-full ${
                        isListening 
                          ? 'text-red-500 animate-pulse' 
                          : isSpeechSupported 
                            ? 'text-slate-400 hover:text-[#052e16]' 
                            : 'text-slate-300 cursor-not-allowed'
                      }`}
                      aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                      title={!isSpeechSupported ? 'Speech recognition not supported in this browser' : isListening ? 'Click to stop listening' : 'Click to search by voice'}
                      disabled={!isSpeechSupported}
                    >
                      <FontAwesomeIcon icon={isListening ? faMicrophoneSlash : faMicrophone} className="text-xs md:text-sm" />
                    </button>
                    <button 
                      type="submit" 
                      className="text-slate-400 hover:text-[#052e16] transition duration-200 pr-1 rounded-full"
                      aria-label="Search"
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs md:text-sm" />
                    </button>
                  </div>
                </form>

                {/* Command Palette Dropdown */}
                <CommandPalette
                  query={searchQuery}
                  isOpen={showCommandPalette}
                  onClose={closeCommandPalette}
                  searchInputRef={searchInputRef}
                />
              </div>
              
              {/* Create Field Button */}
              <button 
                onClick={() => navigate('/create-field')}
                className="flex items-center px-3.5 md:px-4 py-1.5 md:py-2 bg-[#052e16] hover:bg-[#052e16]/90 text-white rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1.5 md:mr-2 text-xs md:text-sm" />
                <span>Create Field</span>
              </button>
              
              {/* Field Selection */}
              <div className="relative min-w-[140px] lg:min-w-[160px]">
                <select
                  name="Select Field"
                  id="selectField"
                  className="w-full h-9 md:h-10 border border-slate-200 rounded-md px-2.5 md:px-4 py-0 md:py-2 bg-white text-slate-700 appearance-none cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-[#052e16]/15 text-sm"
                  onChange={handleFieldChange}
                  value={selectedField || ''}
                >
                  <option value="" disabled hidden>Select Field</option>
                  
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>{field.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 md:px-3 text-slate-400">
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
              
              {/* <button 
                onClick={navigateToFarmConsole} 
                className={`bg-white border rounded px-3 py-1.5 font-medium transition-colors ${location.pathname === '/farm-console' ? 'bg-green-100 text-green-800 border-green-500' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Farm Console
              </button> */}
            </div>
            
            {/* Location Display - Desktop (auto-fetched) */}
            <div className="hidden md:flex items-center h-9 md:h-10 border border-slate-200 rounded-md px-2.5 md:px-3 bg-white text-slate-700 shadow-sm text-sm min-w-[8rem]">
              <span className="truncate font-medium text-slate-600" title={selectedLocation || ''}>📍 {selectedLocation || 'Fetching...'}</span>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          <div 
            ref={mobileMenuRef} 
            className={`md:hidden mt-1.5 py-4 border-t border-slate-200 bg-white rounded-b-lg shadow-lg fixed top-[52px] sm:top-[60px] left-0 right-0 max-h-[calc(100vh-52px)] sm:max-h-[calc(100vh-60px)] overflow-y-auto z-50 transition-all duration-300 transform ${
              mobileMenuOpen ? 'opacity-100 translate-y-0 mobile-menu-enter' : 'opacity-0 -translate-y-5 pointer-events-none'
            }`}
          >
              {/* Mobile Search */}
              <div className="mb-4 px-4 relative">
                <form onSubmit={handleSearch}>
                  <div className={`flex rounded-md overflow-hidden shadow-sm border ${showCommandPalette ? 'border-[#052e16] ring-2 ring-[#052e16]/15' : 'border-slate-200'}`}>
                    <input
                      type="text"
                      className="text-slate-800 flex-1 px-4 py-2.5 outline-none border-none focus:ring-0 text-sm bg-slate-50"
                      placeholder="Type / for commands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => { if (searchQuery.startsWith('/')) setShowCommandPalette(true); }}
                      autoComplete="off"
                    />
                    <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 transition duration-200 active:bg-slate-300">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                  </div>
                </form>

                {/* Mobile Command Palette */}
                <CommandPalette
                  query={searchQuery}
                  isOpen={showCommandPalette}
                  onClose={closeCommandPalette}
                  searchInputRef={searchInputRef}
                />
              </div>
              
              {/* Create Field Button - Mobile */}
              <div className="px-4 mb-4">
                <button 
                  onClick={() => {
                    navigate('/create-field');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-[#052e16] hover:bg-[#052e16]/90 text-white rounded-md font-medium transition duration-200 text-sm shadow-sm active:shadow-inner"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  <span>Create Field</span>
                </button>
              </div>
              
              {/* Mobile Field Selection */}
              <div className="mb-4 px-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Field</label>
                <div className="relative">
                  <select
                    className="w-full border border-slate-200 rounded-md px-3 py-2.5 bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#052e16]/15 text-sm shadow-sm"
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <div className="w-full border border-slate-200 rounded-md px-3 py-2.5 bg-white text-gray-700 text-sm shadow-sm">
                  <span className="truncate">📍 {selectedLocation || 'Fetching...'}</span>
                </div>
              </div>
              
              {/* Mobile Navigation Buttons */}
              <div className="space-y-0 divide-y divide-slate-100 mt-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Quick Navigation</p>
                </div>
                <button 
                  onClick={() => {
                    navigateToClimateAnalysis();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 text-slate-700 hover:bg-slate-50 active:bg-slate-100 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faCloudSunRain} className="mr-3 text-slate-400 w-4 h-4" />
                  Climate Analysis
                </button>
                <button 
                  onClick={() => {
                    navigateToFarmConsole();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-3 text-slate-700 hover:bg-slate-50 active:bg-slate-100 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faLeaf} className="mr-3 text-slate-400 w-4 h-4" />
                  Farm Console
                </button>
                <Link 
                  to="/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-5 py-3 text-slate-700 hover:bg-slate-50 active:bg-slate-100 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faMap} className="mr-3 text-slate-400 w-4 h-4" />
                  Reports
                </Link>
                <Link 
                  to="/ai-assistant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-5 py-3 text-slate-700 hover:bg-slate-50 active:bg-slate-100 block transition-colors text-sm font-medium flex items-center mobile-nav-item smooth-transition"
                >
                  <FontAwesomeIcon icon={faMicrophone} className="mr-3 text-slate-400 w-4 h-4" />
                  AI Assistant
                </Link>
              </div>
          </div>
      </nav>

      {/* Voice Error Toast */}
      {voiceError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md text-sm flex items-center gap-2 animate-fade-in">
          <FontAwesomeIcon icon={faMicrophoneSlash} className="text-red-500 flex-shrink-0" />
          <span>{voiceError}</span>
          <button onClick={() => setVoiceError(null)} className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {/* Listening Indicator Overlay */}
      {isListening && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-white border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm flex items-center gap-3 animate-fade-in">
          <div className="relative flex-shrink-0">
            <FontAwesomeIcon icon={faMicrophone} className="text-red-500 text-lg" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <p className="font-medium text-green-800">Listening...</p>
            <p className="text-xs text-green-600">Speak now – click mic again to stop</p>
          </div>
        </div>
      )}
        
      {/* New Field Dialog */}
      {showNewFieldDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <FontAwesomeIcon icon={faPlus} className="mr-2 text-[#052e16] text-sm" />
                Create New Field
              </h3>
              <button 
                type="button"
                onClick={() => setShowNewFieldDialog(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1"
                aria-label="Close dialog"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>
            <form onSubmit={handleNewFieldSubmit}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Field Name</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#052e16]/15 focus:border-[#052e16] transition-all shadow-sm"
                  placeholder="Enter field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">Give your field a descriptive name</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-100 active:bg-slate-200 transition-colors shadow-sm text-sm font-medium text-slate-700"
                  onClick={() => setShowNewFieldDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#052e16] text-white rounded-md hover:bg-[#052e16]/90 transition-all shadow-sm active:shadow-inner disabled:opacity-70 text-sm font-medium"
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
