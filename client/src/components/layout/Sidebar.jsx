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
  CloudSun,
  Cloud,
  Leaf,
  CloudRain,
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
} from 'lucide-react';

const MAIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/field-list', label: 'My Fields', icon: MapPin },
  { to: '/crop-management', label: 'Crop Management', icon: Sprout },
  { to: '/financial-aid', label: 'Financial Aid', icon: HandCoins },
  { to: '/market-price', label: 'Market Prices', icon: TrendingUp },
  { to: '/plant-disease-detection', label: 'Plant Disease', icon: Search },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
];

const CLIMATE_LINKS = [
  { to: '/climate', label: 'Weather Forecast', icon: Cloud },
  { to: '/vegetation', label: 'Vegetation & Crop Health', icon: Leaf },
  { to: '/water', label: 'Water Irrigation', icon: CloudRain },
  { to: '/rainfall', label: 'Rainfall & Monsoon', icon: CloudDrizzle },
  { to: '/soil', label: 'Soil Info', icon: Layers },
];

const IRRIGATION_LINKS = [
  { to: '/water-management', label: 'Water Management', icon: Droplet },
  { to: '/irrigation-schedule', label: 'Schedule & Control', icon: CalendarClock },
];

const Sidebar = ({ isSidebarOpen, isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    climate: true,
    irrigation: true,
  });
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (CLIMATE_LINKS.some(link => location.pathname === link.to)) {
      setExpandedMenus(prev => ({ ...prev, climate: true }));
    }
    if (IRRIGATION_LINKS.some(link => location.pathname === link.to)) {
      setExpandedMenus(prev => ({ ...prev, irrigation: true }));
    }
  }, [location.pathname]);

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
  const isClimateActive = CLIMATE_LINKS.some(link => location.pathname === link.to);
  const isIrrigationActive = IRRIGATION_LINKS.some(link => location.pathname === link.to);

  // Style tokens using the shade of white (#eef0f3)
  const btn = 'flex items-center rounded-full transition-all duration-100 cursor-pointer';
  const idle = 'text-[#9aa3af] hover:text-[#4b5563] hover:bg-[#e5e7eb]';
  const on = 'bg-white text-[#374151] font-medium shadow-[0_1px_2px_rgba(15,23,42,0.08)]';
  const ic = (active) => (active ? 'text-[#374151]' : '');

  const pill = (active) =>
    `${btn} ${isCollapsed ? 'w-9 h-9 justify-center' : 'w-full px-3 py-2'} ${active ? on : idle}`;

  return (
    <aside 
      id="sidebar"
      className={`fixed top-0 left-0 z-40 h-screen pt-14 transition-all duration-300 ease-in-out bg-white shadow-lg ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isMobile ? 'w-[85vw] max-w-[300px]' : ''} ${!isMobile && isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col justify-between overflow-y-auto pb-20 md:pb-0 overscroll-contain select-none">
        <div>
          {/* ── Top Collapse Toggle (Circle Space) ── */}
          <div className="flex items-center px-4 pt-3.5 pb-1 sticky top-0 bg-white z-10">
            {isCollapsed ? (
              <button
                onClick={toggleSidebar}
                className="mx-auto w-9 h-9 rounded-full bg-[#eef0f3] hover:bg-[#e5e7eb] text-[#4b5563] flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-95"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-full bg-[#eef0f3] hover:bg-[#e5e7eb] text-[#4b5563] flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-95"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* ── Notification dot (collapsed only) ── */}
          {isCollapsed && (
            <div className="flex justify-end pr-4 -mt-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          )}

          {/* ── Navigation Divs with previous background color (#eef0f3) ── */}
          <nav className="px-3 mt-1.5 space-y-2.5">
            {/* 1st Div: Dashboard to AI Assistant */}
            <div className={`bg-[#eef0f3] ${isCollapsed ? 'rounded-full py-2 px-1.5' : 'rounded-2xl py-2.5 px-2'} flex flex-col items-center gap-0.5`}>
              {MAIN_LINKS.map(item => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={pill(active)}
                  >
                    <item.icon size={16} className={ic(active)} />
                    {!isCollapsed && <span className="ml-3 text-sm truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>

            {/* 2nd Div: Climate Analysis */}
            <div className={`bg-[#eef0f3] ${isCollapsed ? 'rounded-full py-2 px-1.5' : 'rounded-2xl p-2'} flex flex-col gap-0.5`}>
              <button
                type="button"
                onClick={() => toggleMenu('climate')}
                onKeyDown={(e) => handleKeyDown(e, 'climate')}
                aria-expanded={expandedMenus.climate}
                title="Climate Analysis"
                className={`${btn} ${isCollapsed ? 'w-9 h-9 justify-center mx-auto' : 'w-full px-3 py-2 text-left'} ${
                  isClimateActive ? on : idle
                }`}
              >
                <CloudSun size={16} className={ic(isClimateActive)} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 mr-auto text-sm font-medium">Climate Analysis</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${expandedMenus.climate ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </>
                )}
              </button>

              {expandedMenus.climate && !isCollapsed && (
                <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l-2 border-[#d1d5db] ml-4 my-1">
                  {CLIMATE_LINKS.map(item => {
                    const active = isActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`${btn} w-full px-3 py-1.5 text-xs font-medium ${
                          active ? on : idle
                        }`}
                      >
                        <item.icon size={13} className={`mr-2.5 ${ic(active)}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3rd Div: Irrigation */}
            <div className={`bg-[#eef0f3] ${isCollapsed ? 'rounded-full py-2 px-1.5' : 'rounded-2xl p-2'} flex flex-col gap-0.5`}>
              <button
                type="button"
                onClick={() => toggleMenu('irrigation')}
                onKeyDown={(e) => handleKeyDown(e, 'irrigation')}
                aria-expanded={expandedMenus.irrigation}
                title="Irrigation"
                className={`${btn} ${isCollapsed ? 'w-9 h-9 justify-center mx-auto' : 'w-full px-3 py-2 text-left'} ${
                  isIrrigationActive ? on : idle
                }`}
              >
                <Droplets size={16} className={ic(isIrrigationActive)} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 mr-auto text-sm font-medium">Irrigation</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${expandedMenus.irrigation ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </>
                )}
              </button>

              {expandedMenus.irrigation && !isCollapsed && (
                <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l-2 border-[#d1d5db] ml-4 my-1">
                  {IRRIGATION_LINKS.map(item => {
                    const active = isActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`${btn} w-full px-3 py-1.5 text-xs font-medium ${
                          active ? on : idle
                        }`}
                      >
                        <item.icon size={13} className={`mr-2.5 ${ic(active)}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* ── Bottom: Settings / Logout / Avatar ── */}
        <div className="mt-auto flex flex-col items-center gap-1.5 pb-4 px-3">
          <Link
            to="/profile"
            title="Settings"
            className={`${btn} ${isCollapsed ? 'w-9 h-9 justify-center' : 'w-full px-3 py-2'} ${
              isActive('/profile') ? on : idle
            }`}
          >
            <Settings size={16} className={ic(isActive('/profile'))} />
            {!isCollapsed && <span className="ml-3 text-sm truncate">Settings</span>}
          </Link>

          <Link
            to="/logout"
            title="Logout"
            className={`${btn} ${isCollapsed ? 'w-9 h-9 justify-center' : 'w-full px-3 py-2'} text-[#9aa3af] hover:text-red-500 hover:bg-red-50`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span className="ml-3 text-sm truncate">Logout</span>}
          </Link>

          {/* Avatar */}
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#14532d] text-[#bef264] flex-shrink-0 mt-1">
            <Leaf size={16} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
