import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MdDashboard } from "react-icons/md";
import { MdOutlineStorage } from "react-icons/md";
import { MdStorage } from "react-icons/md";
import { 
  faTractor, 
  faDatabase, 
  faArrowRightFromBracket,
  faLayerGroup,
  faChartLine,
  faLeaf,
  faCloudSunRain,
  faDroplet,
  faCog,
  faAngleRight,
  faAngleDown,
  faUser,
  faUserGear,
  faChevronLeft,
  faChevronRight,
  faRobot,
  faHome,
  faChartArea,
  faWater,
  faSeedling,
  faCloudRain,
  faWarning,
  faBug,
  faSprayCan,
  faWheatAwn,
  faPlantWilt,
  faMap,
  faDraftingCompass,
  faLocationDot,
  faHandshake,
  faRupeeSign,
  faWarehouse,
  faMicroscope
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ isSidebarOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    analytics: true,
    pests: false,
    crops: false,
    irrigation: false,
    fields: false
  });
  
  // Detect screen size for responsive behavior
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = (menu) => {
    // Don't expand menus if sidebar is collapsed on desktop
    if (!isMobile && isCollapsed) {
      toggleSidebar(); // Expand the sidebar first
      return;
    }
    
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };
  
  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e, menu) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu(menu);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside 
      id="sidebar"
      className={`fixed top-0 left-0 z-40 h-screen pt-14 transition-all duration-300 ease-in-out bg-white border-r border-green-200 shadow-lg ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isMobile ? 'w-[85vw] max-w-[300px]' : ''} ${!isMobile && isCollapsed ? 'md:w-20' : 'md:w-64'}` }
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col justify-between overflow-y-auto pb-20 md:pb-0 overscroll-contain scroll-smooth">
        <div>
          {/* Top section with logo & collapse button */}
          <div className="flex items-center justify-between py-3 px-4 border-b border-green-200 sticky top-0 bg-gradient-to-r from-green-600 to-green-500 bg-opacity-95 backdrop-blur-sm z-10 shadow-md">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <span style={{overflowX: "hidden"}} className="font-bold text-white text-lg">Smart Agri</span>
              </div>
            )}
            
            {/* Toggle button */}
            <button 
              onClick={toggleSidebar} 
              type="button" 
              className={`${isCollapsed ? 'mx-auto' : ''} inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-green-400 hover:text-white transition-colors`}
              aria-expanded={!isCollapsed}
              aria-label="Toggle sidebar collapse"
            >
              <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} className="w-4 h-4" />
              <span className="sr-only">Toggle sidebar</span>
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="mt-2">
            <div className={`px-3 py-2 ${!isCollapsed && 'mb-1'}`}>
              { (
                <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider pl-2">
                  Main
                </h3>
              )}
              <ul className="mt-1 space-y-1">
                <li>
                  <Link
                    to="/dashboard"
                    className={`flex items-center px-3 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/dashboard') 
                        ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                        : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                    } group transition-all duration-100 ${isMobile ? 'active:bg-green-100' : ''}`}
                  >
                    <FontAwesomeIcon
                      icon={faHome}
                      className={`w-5 h-5 ${isActive('/') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Dashboard</span>}
                  </Link>
                </li>
                {/* <li>
                  <Link
                    to="/reports"
                    className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/reports') 
                        ? 'bg-green-100 text-green-800 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } group transition-colors duration-150`}
                  >
                    <FontAwesomeIcon
                      icon={faChartArea}
                      className={`w-5 h-5 ${isActive('/reports') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Reports</span>}
                  </Link>
                </li> */}
                
                {/* <li>
                  <Link
                    to="/farm-console"
                    className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/farm-console') 
                        ? 'bg-green-100 text-green-800 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } group transition-colors duration-150`}
                  >
                    <FontAwesomeIcon
                      icon={faTractor}
                      className={`w-5 h-5 ${isActive('/farm-console') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Farm Console</span>}
                  </Link>
                </li> */}
                <li>
                  <Link
                    to="/crop-management"
                    className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/crop-management') 
                        ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                        : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                    } group transition-all duration-100`}
                  >
                    <FontAwesomeIcon
                      icon={faWarehouse}
                      className={`w-5 h-5 ${isActive('/crop-management') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Crop Management</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/financial-aid"
                    className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/financial-aid') 
                        ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                        : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                    } group transition-all duration-100`}
                  >
                    <FontAwesomeIcon
                      icon={faHandshake}
                      className={`w-5 h-5 ${isActive('/financial-aid') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Financial Aid</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/market-price"
                    className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/market-price') 
                        ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                        : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                    } group transition-all duration-100`}
                  >
                    <FontAwesomeIcon
                      icon={faRupeeSign}
                      className={`w-5 h-5 ${isActive('/market-price') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Market Prices</span>}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/plant-disease-detection"
                    className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/plant-disease-detection') 
                        ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                        : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                    } group transition-all duration-100`}
                  >
                    <FontAwesomeIcon
                      icon={faMicroscope}
                      className={`w-5 h-5 ${isActive('/plant-disease-detection') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Plant Disease Detect</span>}
                  </Link>
                </li>
              </ul>
            </div>
             {/* Field Management */}
            <div className={`px-3 py-2 ${!isCollapsed && 'mb-1'}`}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider pl-2">
                  Field Management
                </h3>
              )}
              <ul className="mt-1 space-y-1">
                <li>
                  <button
                    type="button"
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-left text-gray-700 ${
                      isCollapsed ? 'justify-center' : ''
                    } hover:bg-green-100 hover:text-green-700 transition-all duration-100 ${expandedMenus.fields ? 'bg-green-50 text-green-700' : ''}`}
                    onClick={() => toggleMenu('fields')}
                  >
                    <FontAwesomeIcon
                      icon={faMap}
                      className="w-5 h-5 text-gray-500 group-hover:text-gray-900"
                    />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 mr-auto font-medium">Fields</span>
                        <FontAwesomeIcon
                          icon={expandedMenus.fields ? faAngleDown : faAngleRight}
                          className="w-4 h-4"
                        />
                      </>
                    )}
                  </button>

                  {expandedMenus.fields && !isCollapsed && (
                    <ul className="mt-1 pl-7 space-y-1">
                      <li>
                        <Link
                          to="/create-field"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/create-field') 
                              ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-600' 
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          } transition-all duration-100`}
                        >
                          <FontAwesomeIcon
                            icon={faDraftingCompass}
                            className={`w-4 h-4 mr-2 ${isActive('/create-field') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Create New Field</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/field-list"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/field-list') 
                              ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-600' 
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          } transition-all duration-100`}
                        >
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className={`w-4 h-4 mr-2 ${isActive('/field-list') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>My Fields</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>

            {/* Analytics Sections */}
            <div className={`px-3 py-2 ${!isCollapsed && 'mb-1'}`}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider pl-2">
                  Analytics
                </h3>
              )}
              <ul className="mt-1 space-y-1">
                {/* Climate Analysis Section */}
                <li>
                  <button
                    type="button"
                    className={`flex items-center w-full px-3 py-3 rounded-lg text-left text-gray-700 ${
                      isCollapsed ? 'justify-center' : ''
                    } hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${isMobile ? 'active:bg-green-100' : ''} ${expandedMenus.analytics ? 'bg-green-50 text-green-700' : ''}`}
                    onClick={() => toggleMenu('analytics')}
                    onKeyDown={(e) => handleKeyDown(e, 'analytics')}
                    aria-expanded={expandedMenus.analytics}
                  >
                    <FontAwesomeIcon
                      icon={faCloudSunRain}
                      className="w-5 h-5 text-gray-500 group-hover:text-gray-900"
                    />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 mr-auto font-medium">Climate Analysis</span>
                        <FontAwesomeIcon
                          icon={expandedMenus.analytics ? faAngleDown : faAngleRight}
                          className="w-5 h-5"
                        />
                      </>
                    )}
                  </button>

                  {expandedMenus.analytics && !isCollapsed && (
                    <ul className="mt-1 pl-7 space-y-1">
                      <li>
                        <Link
                          to="/climate"
                          className={`flex items-center px-3 py-2.5 rounded-md ${
                            isActive('/climate') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150 ${isMobile ? 'active:bg-green-50/80' : ''}`}
                        >
                          <FontAwesomeIcon
                            icon={faCloudSunRain}
                            className={`w-4 h-4 mr-2 ${isActive('/climate') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Weather Forecast</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/vegetation"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/vegetation') 
                              ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-600' 
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          } transition-all duration-200`}
                        >
                          <FontAwesomeIcon
                            icon={faLeaf}
                            className={`w-4 h-4 mr-2 ${isActive('/vegetation') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Vegetation & Crop Health</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/water"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/water') 
                              ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-600' 
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          } transition-all duration-200`}
                        >
                          <FontAwesomeIcon
                            icon={faCloudRain}
                            className={`w-4 h-4 mr-2 ${isActive('/water') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Water Irrigation</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/fire"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/fire') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon
                            icon={faWarning}
                            className={`w-4 h-4 mr-2 ${isActive('/fire') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Fire info</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/hazards"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/hazards') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon
                            icon={faWarning}
                            className={`w-4 h-4 mr-2 ${isActive('/hazards') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Hazard Activities</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/rainfall"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/rainfall') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon
                            icon={faWarning}
                            className={`w-4 h-4 mr-2 ${isActive('/rainfall') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Rainfall & Monsoon info</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/soil"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/soil') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon 
                            icon={faLayerGroup}
                            className={`w-4 h-4 mr-2 ${isActive('/soil') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Soil Info</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                
                {/* Pest Detection Section */}
                {/* <li>
                  <button
                    type="button"
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-left text-gray-700 ${
                      isCollapsed ? 'justify-center' : ''
                    } hover:bg-green-100 hover:text-green-700 transition-all duration-200 ${expandedMenus.pests ? 'bg-green-50 text-green-700' : ''}`}
                    onClick={() => toggleMenu('pests')}
                  >
                    <FontAwesomeIcon
                      icon={faBug}
                      className="w-5 h-5 text-gray-500 group-hover:text-gray-900"
                    />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 mr-auto font-medium">Pest Detection</span>
                        <FontAwesomeIcon
                          icon={expandedMenus.pests ? faAngleDown : faAngleRight}
                          className="w-4 h-4"
                        />
                      </>
                    )}
                  </button>

                  {expandedMenus.pests && !isCollapsed && (
                    <ul className="mt-1 pl-7 space-y-1">
                      <li>
                        <Link
                          to="/pest-monitor"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/pest-monitor') 
                              ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-600' 
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          } transition-all duration-200`}
                        >
                          <FontAwesomeIcon
                            icon={faBug}
                            className={`w-4 h-4 mr-2 ${isActive('/pest-monitor') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Monitor & Detect</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/pest-treatment"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/pest-treatment') 
                              ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-600' 
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          } transition-all duration-200`}
                        >
                          <FontAwesomeIcon
                            icon={faSprayCan}
                            className={`w-4 h-4 mr-2 ${isActive('/pest-treatment') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Treatment Advisor</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li> */}
                
                {/* Crop Management Section */}
                {/* <li>
                  <button
                    type="button"
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-left text-gray-700 ${
                      isCollapsed ? 'justify-center' : ''
                    } hover:bg-gray-100 transition-colors duration-150`}
                    onClick={() => toggleMenu('crops')}
                  >
                    <FontAwesomeIcon
                      icon={faWheatAwn}
                      className="w-5 h-5 text-gray-500 group-hover:text-gray-900"
                    />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 mr-auto font-medium">Crop Management</span>
                        <FontAwesomeIcon
                          icon={expandedMenus.crops ? faAngleDown : faAngleRight}
                          className="w-4 h-4"
                        />
                      </>
                    )}
                  </button>

                  {expandedMenus.crops && !isCollapsed && (
                    <ul className="mt-1 pl-7 space-y-1">
                      <li>
                        <Link
                          to="/crop-planning"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/crop-planning') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon
                            icon={faWheatAwn}
                            className={`w-4 h-4 mr-2 ${isActive('/crop-planning') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Crop Planning</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/crop-health"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/crop-health') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon
                            icon={faPlantWilt}
                            className={`w-4 h-4 mr-2 ${isActive('/crop-health') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Health Monitoring</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/crop-yield"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/crop-yield') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon
                            icon={faChartLine}
                            className={`w-4 h-4 mr-2 ${isActive('/crop-yield') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Yield Prediction</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li> */}
                
                {/* Irrigation Management Section */}
                <li>
                  <button
                    type="button"
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-left text-gray-700 ${
                      isCollapsed ? 'justify-center' : ''
                    } hover:bg-green-100 hover:text-green-700 transition-all duration-100 ${expandedMenus.irrigation ? 'bg-green-50 text-green-700' : ''}`}
                    onClick={() => toggleMenu('irrigation')}
                  >
                    <FontAwesomeIcon
                      icon={faWater}
                      className="w-5 h-5 text-gray-500 group-hover:text-gray-900"
                    />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 mr-auto font-medium">Irrigation</span>
                        <FontAwesomeIcon
                          icon={expandedMenus.irrigation ? faAngleDown : faAngleRight}
                          className="w-4 h-4"
                        />
                      </>
                    )}
                  </button>

                  {expandedMenus.irrigation && !isCollapsed && (
                    <ul className="mt-1 pl-7 space-y-1">
                      <li>
                        <Link
                          to="/water-management"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/water-management') 
                              ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-600' 
                              : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
                          } transition-all duration-100`}
                        >
                          <FontAwesomeIcon
                            icon={faDroplet}
                            className={`w-4 h-4 mr-2 ${isActive('/water-management') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Water Management</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/irrigation-schedule"
                          className={`flex items-center px-3 py-2 rounded-md ${
                            isActive('/irrigation-schedule') 
                              ? 'bg-green-50 text-green-800' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          } transition-colors duration-150`}
                        >
                          <FontAwesomeIcon
                            icon={faWater}
                            className={`w-4 h-4 mr-2 ${isActive('/irrigation-schedule') ? 'text-green-700' : 'text-gray-500'}`}
                          />
                          <span>Schedule & Control</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>

            {/* AI Assistant */}
           

            {/* Tools */}
            <div className={`px-3 py-2 ${!isCollapsed && 'mb-1'}`}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider pl-2">
                  Tools
                </h3>
              )}
              <ul className="mt-1 space-y-1">
                <li>
                  <Link
                    to="/ai-assistant"
                    className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                      isActive('/ai-assistant') 
                        ? 'bg-blue-100 text-blue-800 font-medium rounded-lg border-l-4 border-blue-600 shadow-sm' 
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg'
                    } group transition-all duration-100`}
                  >
                    <FontAwesomeIcon
                      icon={faRobot}
                      className={`w-5 h-5 ${isActive('/ai-assistant') ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-900'}`}
                    />
                    {!isCollapsed && <span className="ml-3 whitespace-nowrap ">AI Assistant</span>}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto">
          <div className="px-3 py-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1 pl-2">
                Account
              </h3>
            )}
            <ul className="space-y-1">
              <li>
                <Link
                  to="/profile"
                  className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                    isActive('/profile') 
                      ? 'bg-green-100 text-green-800 font-medium border-l-4 border-green-600 shadow-sm' 
                      : 'text-gray-700 hover:bg-green-500 hover:text-white'
                  } group transition-all duration-100`}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    className={`w-5 h-5 ${isActive('/profile') ? 'text-gray-700' : 'text-gray-500'} group-hover:text-gray-700`}
                  />
                  {!isCollapsed && <span className="ml-3 whitespace-nowrap">Admin</span>}
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/settings"
                  className={`flex items-center px-3 py-2.5 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                    isActive('/settings') 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'text-gray-700 hover:bg-gray-100'
                  } group transition-colors duration-150`}
                >
                  <FontAwesomeIcon
                    icon={faCog}
                    className={`w-5 h-5 ${isActive('/settings') ? 'text-gray-700' : 'text-gray-500'} group-hover:text-gray-700`}
                  />
                  {!isCollapsed && <span className="ml-3 whitespace-nowrap">Settings</span>}
                </Link>
              </li> */}
              <li>
                <Link
                  to="/logout"
                  className="flex items-center px-3 py-2.5 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                >
                  <FontAwesomeIcon
                    icon={faArrowRightFromBracket}
                    className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''} text-red-400 group-hover:text-red-600`}
                  />
                  {!isCollapsed && <span className="ml-3 whitespace-nowrap">Logout</span>}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
