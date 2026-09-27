import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Sprout,
  HandCoins,
  TrendingUp,
  Search,
  Bot,
  MapPin,
  PlusCircle,
  List,
  CloudSun,
  Cloud,
  Leaf,
  CloudRain,
  Flame,
  AlertTriangle,
  CloudDrizzle,
  Layers,
  Droplets,
  Droplet,
  CalendarClock,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    analytics: true,
    pests: false,
    crops: false,
    irrigation: false,
    fields: false
  });
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = (menu) => {
    if (!isMobile && isCollapsed) {
      toggleSidebar();
      return;
    }
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };
  
  const handleKeyDown = (e, menu) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu(menu);
    }
  };

  const isActive = (path) => location.pathname === path;

  // ── zm-rail–style tokens ──
  const btn = 'flex items-center rounded-full transition-all duration-100 cursor-pointer';
  const idle = 'text-[#9aa3af] hover:text-[#4b5563] hover:bg-[#e5e7eb]';
  const on   = 'bg-white text-[#374151] font-medium shadow-[0_1px_2px_rgba(15,23,42,0.08)]';
  const subIdle = 'text-[#9aa3af] hover:text-[#4b5563] hover:bg-[#e5e7eb]';
  const subOn   = 'bg-white text-[#374151] font-medium shadow-[0_1px_2px_rgba(15,23,42,0.08)]';
  const expOn   = 'bg-[#e5e7eb] text-[#4b5563]';

  const ic = (active) => active ? 'text-[#374151]' : '';  // icon tint when active

  // collapsed sizing
  const pill = (active) =>
    `${btn} ${isCollapsed ? 'w-9 h-9 justify-center' : 'w-full px-3 py-2'} ${active ? on : idle}`;

  const sub = (active) =>
    `${btn} w-full px-3 py-1.5 text-sm ${active ? subOn : subIdle}`;

  const expander = (open) =>
    `${btn} ${isCollapsed ? 'w-9 h-9 justify-center mx-auto' : 'w-full px-3 py-2'} text-left ${open ? expOn : idle}`;

  return (
    <aside 
      id="sidebar"
      className={`fixed top-0 left-0 z-40 h-screen pt-14 transition-all duration-300 ease-in-out bg-white shadow-lg ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isMobile ? 'w-[85vw] max-w-[300px]' : ''} ${!isMobile && isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col justify-between overflow-y-auto pb-20 md:pb-0 overscroll-contain scroll-smooth">
        <div>
          {/* ── Logo + collapse toggle ── */}
          <div className="flex items-center justify-between py-4 px-4 sticky top-0 bg-white z-10">
            {isCollapsed ? (
              <button onClick={toggleSidebar} className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-white" aria-label="Expand sidebar">
                <LayoutGrid size={16} />
              </button>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#111827] text-white flex-shrink-0">
                    <LayoutGrid size={16} />
                  </span>
                  <span className="font-semibold text-[#111827] text-base tracking-tight truncate">Smart Agri</span>
                </div>
                <button 
                  onClick={toggleSidebar} 
                  className="grid h-8 w-8 place-items-center rounded-full text-[#9aa3af] hover:bg-[#e5e7eb] hover:text-[#4b5563] transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>

          {/* ── Notification dot (collapsed only) ── */}
          {isCollapsed && (
            <div className="flex justify-end pr-4 -mt-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          )}

          {/* ── Main nav cluster (pill container) ── */}
          <nav className="px-3 mt-2">
            <div className={`bg-[#eef0f3] ${isCollapsed ? 'rounded-full py-2 px-1.5' : 'rounded-2xl py-3 px-2'} flex flex-col items-center gap-0.5`}>

              {!isCollapsed && (
                <div className="w-full px-2 mb-1">
                  <h3 className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">Main</h3>
                </div>
              )}

              <Link to="/dashboard" className={pill(isActive('/dashboard'))}>
                <Home size={16} className={ic(isActive('/dashboard'))} />
                {!isCollapsed && <span className="ml-3 text-sm truncate">Dashboard</span>}
              </Link>

              <Link to="/crop-management" className={pill(isActive('/crop-management'))}>
                <Sprout size={16} className={ic(isActive('/crop-management'))} />
                {!isCollapsed && <span className="ml-3 text-sm truncate">Crop Management</span>}
              </Link>

              <Link to="/financial-aid" className={pill(isActive('/financial-aid'))}>
                <HandCoins size={16} className={ic(isActive('/financial-aid'))} />
                {!isCollapsed && <span className="ml-3 text-sm truncate">Financial Aid</span>}
              </Link>

              <Link to="/market-price" className={pill(isActive('/market-price'))}>
                <TrendingUp size={16} className={ic(isActive('/market-price'))} />
                {!isCollapsed && <span className="ml-3 text-sm truncate">Market Prices</span>}
              </Link>

              <Link to="/plant-disease-detection" className={pill(isActive('/plant-disease-detection'))}>
                <Search size={16} className={ic(isActive('/plant-disease-detection'))} />
                {!isCollapsed && <span className="ml-3 text-sm truncate">Plant Disease</span>}
              </Link>

              <Link to="/ai-assistant" className={pill(isActive('/ai-assistant'))}>
                <Bot size={16} className={ic(isActive('/ai-assistant'))} />
                {!isCollapsed && <span className="ml-3 text-sm truncate">AI Assistant</span>}
              </Link>
            </div>

            {/* ── Fields ── */}
            <div className="mt-3">
              {!isCollapsed && (
                <div className="px-2 mb-1">
                  <h3 className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">Field Management</h3>
                </div>
              )}

              <button type="button" className={expander(expandedMenus.fields)} onClick={() => toggleMenu('fields')}>
                <MapPin size={16} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 mr-auto text-sm font-medium">Fields</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMenus.fields ? '' : '-rotate-90'}`} />
                  </>
                )}
              </button>

              {expandedMenus.fields && !isCollapsed && (
                <ul className="mt-1 pl-7 space-y-0.5">
                  <li>
                    <Link to="/create-field" className={sub(isActive('/create-field'))}>
                      <PlusCircle size={14} className={`mr-2 ${ic(isActive('/create-field'))}`} />
                      <span>Create New Field</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/field-list" className={sub(isActive('/field-list'))}>
                      <List size={14} className={`mr-2 ${ic(isActive('/field-list'))}`} />
                      <span>My Fields</span>
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* ── Analytics ── */}
            <div className="mt-3">
              {!isCollapsed && (
                <div className="px-2 mb-1">
                  <h3 className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">Analytics</h3>
                </div>
              )}

              {/* Climate Analysis */}
              <button
                type="button"
                className={expander(expandedMenus.analytics)}
                onClick={() => toggleMenu('analytics')}
                onKeyDown={(e) => handleKeyDown(e, 'analytics')}
                aria-expanded={expandedMenus.analytics}
              >
                <CloudSun size={16} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 mr-auto text-sm font-medium">Climate Analysis</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMenus.analytics ? '' : '-rotate-90'}`} />
                  </>
                )}
              </button>

              {expandedMenus.analytics && !isCollapsed && (
                <ul className="mt-1 pl-7 space-y-0.5">
                  <li>
                    <Link to="/climate" className={sub(isActive('/climate'))}>
                      <Cloud size={14} className={`mr-2 ${ic(isActive('/climate'))}`} />
                      <span>Weather Forecast</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/vegetation" className={sub(isActive('/vegetation'))}>
                      <Leaf size={14} className={`mr-2 ${ic(isActive('/vegetation'))}`} />
                      <span>Vegetation & Crop Health</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/water" className={sub(isActive('/water'))}>
                      <CloudRain size={14} className={`mr-2 ${ic(isActive('/water'))}`} />
                      <span>Water Irrigation</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/fire" className={sub(isActive('/fire'))}>
                      <Flame size={14} className={`mr-2 ${ic(isActive('/fire'))}`} />
                      <span>Fire Info</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/hazards" className={sub(isActive('/hazards'))}>
                      <AlertTriangle size={14} className={`mr-2 ${ic(isActive('/hazards'))}`} />
                      <span>Hazard Activities</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/rainfall" className={sub(isActive('/rainfall'))}>
                      <CloudDrizzle size={14} className={`mr-2 ${ic(isActive('/rainfall'))}`} />
                      <span>Rainfall & Monsoon</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/soil" className={sub(isActive('/soil'))}>
                      <Layers size={14} className={`mr-2 ${ic(isActive('/soil'))}`} />
                      <span>Soil Info</span>
                    </Link>
                  </li>
                </ul>
              )}

              {/* Irrigation */}
              <button
                type="button"
                className={`${expander(expandedMenus.irrigation)} ${isCollapsed ? 'mt-1' : 'mt-0.5'}`}
                onClick={() => toggleMenu('irrigation')}
              >
                <Droplets size={16} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 mr-auto text-sm font-medium">Irrigation</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${expandedMenus.irrigation ? '' : '-rotate-90'}`} />
                  </>
                )}
              </button>

              {expandedMenus.irrigation && !isCollapsed && (
                <ul className="mt-1 pl-7 space-y-0.5">
                  <li>
                    <Link to="/water-management" className={sub(isActive('/water-management'))}>
                      <Droplet size={14} className={`mr-2 ${ic(isActive('/water-management'))}`} />
                      <span>Water Management</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/irrigation-schedule" className={sub(isActive('/irrigation-schedule'))}>
                      <CalendarClock size={14} className={`mr-2 ${ic(isActive('/irrigation-schedule'))}`} />
                      <span>Schedule & Control</span>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </nav>
        </div>

        {/* ── Bottom — settings / logout / avatar ── */}
        <div className="mt-auto flex flex-col items-center gap-2 pb-4 px-3">
          <Link to="/profile" className={pill(isActive('/profile'))}>
            <Settings size={16} className={ic(isActive('/profile'))} />
            {!isCollapsed && <span className="ml-3 text-sm truncate">Settings</span>}
          </Link>

          <Link
            to="/logout"
            className={`${btn} ${isCollapsed ? 'w-9 h-9 justify-center' : 'w-full px-3 py-2'} text-[#9aa3af] hover:text-red-500 hover:bg-red-50`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span className="ml-3 text-sm truncate">Logout</span>}
          </Link>

          {/* Avatar — zm-rail-avatar */}
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#14532d] text-[#bef264] flex-shrink-0">
            <Leaf size={16} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
