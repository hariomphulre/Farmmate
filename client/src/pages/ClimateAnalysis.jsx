import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudSunRain, 
  faDroplet, 
  faLeaf, 
  faFire, 
  faCloudRain, 
  faTriangleExclamation,
  faInfoCircle,
  faCalendarAlt,
  faFilter,
  faDownload,
  faLocationDot,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

// Import Analysis Components
import WeatherAnalysis from '../components/climate/WeatherAnalysis';
import VegetationAnalysis from '../components/climate/VegetationAnalysis';
import WaterIrrigationAnalysis from '../components/climate/WaterIrrigationAnalysis';
import SoilLandAnalysis from '../components/climate/SoilLandAnalysis';
import FireAnalysis from '../components/climate/FireAnalysis';

// Import Chart.js components
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ClimateAnalysis = () => {
  const { selectedField, selectedLocation } = useAppContext();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('weather');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check URL parameters for tab selection on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['weather', 'vegetation', 'water', 'soil', 'fire', 'rainfall'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Handle date range changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply date range filter
  const applyDateRange = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowDateRangePicker(false);
    }, 1000);
  };

  return (
    <div>
      {/* Enhanced Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('weather')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'weather'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FontAwesomeIcon icon={faCloudSunRain} className="mr-2" />
            Weather
          </button>
          
          <button
            onClick={() => setActiveTab('vegetation')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vegetation'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FontAwesomeIcon icon={faLeaf} className="mr-2" />
            Vegetation
          </button>
          
          <button
            onClick={() => setActiveTab('soil')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'soil'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
            Soil & Land
          </button>
          
          <button
            onClick={() => setActiveTab('water')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'water'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FontAwesomeIcon icon={faDroplet} className="mr-2" />
            Water & Irrigation
          </button>
          
          <button
            onClick={() => setActiveTab('rainfall')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rainfall'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FontAwesomeIcon icon={faCloudRain} className="mr-2" />
            Rainfall & Monsoon
          </button>
          
          <button
            onClick={() => setActiveTab('fire')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fire'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FontAwesomeIcon icon={faFire} className="mr-2" />
            Fire & Hazards
          </button>
        </nav>
      </div>

      {/* Render analysis component based on selected tab */}
      <div className="analysis-container">
        {activeTab === 'weather' && (
          <WeatherAnalysis 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange}
            showDateRangePicker={showDateRangePicker}
            setShowDateRangePicker={setShowDateRangePicker}
            fieldIDselected={selectedField}
          />
        )}
        
        {activeTab === 'vegetation' && (
          <VegetationAnalysis dateRange={dateRange} />
        )}
        
        {activeTab === 'soil' && (
          <SoilLandAnalysis dateRange={dateRange} loading={loading} setLoading={setLoading} />
        )}
        
        {activeTab === 'water' && (
          <WaterIrrigationAnalysis dateRange={dateRange} />
        )}
        
        {activeTab === 'fire' && (
          <FireAnalysis dateRange={dateRange} />
        )}
        
        {activeTab === 'rainfall' && (
          <div className="Analytics">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-2">Feature Coming Soon</h3>
              <p className="text-gray-600 mb-4">This analytics feature is currently in development.</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                Request Early Access
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClimateAnalysis;