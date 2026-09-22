import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TraderNavbar from './TraderNavbar';
import TraderSidebar from './TraderSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

const TraderLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      if (isMobileView !== isMobile) {
        setSidebarOpen(false);
      }

      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen && 
          !event.target.closest('aside') && 
          !event.target.closest('button[aria-controls="sidebar"]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    setIsPageTransitioning(true);
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-100 to-gray-100 border-r border-green-200 shadow-sm overflow-hidden">
      <TraderNavbar />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        type="button"
        className="md:hidden fixed bottom-6 left-6 z-50 inline-flex items-center p-2 text-sm rounded-full bg-green-600 text-white hover:bg-green-700 w-14 h-14 justify-center shadow-xl"
        aria-controls="sidebar"
        aria-expanded={sidebarOpen}
        aria-label="Toggle sidebar"
      >
        <span className="sr-only">Toggle sidebar</span>
        <FontAwesomeIcon icon={sidebarOpen ? faXmark : faBars} className="text-xl" />
      </button>

      {sidebarOpen && isMobile && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-30 bg-gray-900 bg-opacity-70 backdrop-blur-sm transition-opacity md:hidden"
          aria-hidden="true"
        ></div>
      )}

      <TraderSidebar isSidebarOpen={sidebarOpen} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 transition-all duration-300 mt-[60px] ${
        isMobile ? 'ml-0' : (isCollapsed ? 'md:ml-20' : 'md:ml-64')
      }`}>
        <main className="pl-3 pr-3 pb-3 sm:pl-4 sm:pr-4 sm:pb-4 md:pl-6 md:pr-6 md:pb-6">
          <div className={`mx-auto transition-opacity duration-300 ${isPageTransitioning ? 'opacity-80' : 'opacity-100'}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TraderLayout;