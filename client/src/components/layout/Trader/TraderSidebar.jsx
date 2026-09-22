import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MdHistory } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { faHandshake, faChevronLeft, faChevronRight, faCalendar, faIndianRupeeSign } from '@fortawesome/free-solid-svg-icons';

const TraderSidebar = ({ isSidebarOpen, isCollapsed, toggleSidebar }) => {
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <aside 
            id="trader-sidebar"
            className={`fixed top-0 left-0 z-40 h-screen pt-14 transition-all duration-300 ease-in-out bg-white border-r border-green-200 shadow-lg ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            } ${isMobile ? 'w-[85vw] max-w-[300px]' : ''} ${!isMobile && isCollapsed ? 'md:w-20' : 'md:w-64'}` }
            aria-label="Trader Sidebar"
        >
            <div className="h-full flex flex-col justify-between overflow-y-auto pb-20 md:pb-0 overscroll-contain scroll-smooth">
                <div>
                    {/* Top section with logo & collapse button */}
                    <div className="flex items-center justify-between py-3 px-4 border-b border-green-200 sticky top-0 bg-gradient-to-r from-green-600 to-green-500 bg-opacity-95 backdrop-blur-sm z-10 shadow-md">
                        {!isCollapsed && (
                            <div className="flex items-center space-x-2">
                                <span style={{overflowX: "hidden"}} className="font-bold text-white text-lg">Trader Panel</span>
                            </div>
                        )}
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
                                        to="/trader/connections"
                                        className={`flex items-center px-3 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                                            isActive('/trader/connections') 
                                                ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                                                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                                        } group transition-all duration-200 ${isMobile ? 'active:bg-green-100' : ''}`}
                                    >
                                        <FontAwesomeIcon
                                            icon={faHandshake}
                                            className={`w-5 h-5 ${isActive('/trader/connections') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                                        />
                                        {!isCollapsed && <span className="ml-3 whitespace-nowrap">Connections</span>}
                                    </Link>
                                </li>
                                    <Link
                                        to="/trader/market-price"
                                        className={`flex items-center px-3 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                                            isActive('/trader/market-price') 
                                                ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                                                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                                        } group transition-all duration-200 ${isMobile ? 'active:bg-green-100' : ''}`}
                                    >
                                        <FontAwesomeIcon
                                            icon={faIndianRupeeSign}
                                            className={`w-5 h-5 ${isActive('/trader/market-price') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`}
                                        />
                                        {!isCollapsed && <span className="ml-3 whitespace-nowrap">Market Price</span>}
                                    </Link>
                                <li>
                                    <Link
                                        to="/trader/trading-history"
                                        className={`flex items-center px-3 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                                            isActive('/trader/trading-history') 
                                                ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                                                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                                        } group transition-all duration-200 ${isMobile ? 'active:bg-green-100' : ''}`}
                                    >
                                        <MdHistory className={`w-5 h-5 ${isActive('/trader/trading-history') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`} />
                                        {!isCollapsed && <span className="ml-3 whitespace-nowrap">Trading History</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/trader/notifications"
                                        className={`flex items-center px-3 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${
                                            isActive('/trader/notifications') 
                                                ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600' 
                                                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                                        } group transition-all duration-200 ${isMobile ? 'active:bg-green-100' : ''}`}
                                    >
                                        <IoIosNotifications className={`w-5 h-5 ${isActive('/trader/notifications') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`} />
                                        {!isCollapsed && <span className="ml-3 whitespace-nowrap">Notifications</span>}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/trader/event-management"
                                        className={`flex items-center px-3 py-3 rounded-lg ${isCollapsed ? 'justify-center' : ''} ${isActive('/trader/event-management')
                                                ? 'bg-green-100 text-green-800 font-medium shadow-sm border-l-4 border-green-600'
                                                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                                            } group transition-all duration-200 ${isMobile ? 'active:bg-green-100' : ''}`}
                                    >
                                        <FontAwesomeIcon icon={faCalendar}
                                        className={`w-5 h-5 ${isActive('/trader/event-management') ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-900'}`} />
                                        {!isCollapsed && <span className="ml-3 whitespace-nowrap">Event Management</span>}
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
                                    } group transition-all duration-200`}
                                >
                                    <span className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''} text-gray-500 group-hover:text-gray-700`}>👤</span>
                                    {!isCollapsed && <span className="ml-3 whitespace-nowrap">Trader</span>}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default TraderSidebar;