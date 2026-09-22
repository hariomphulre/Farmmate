import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf,
  faCarrot,
  faInfoCircle,
  faChartLine,
  faFlask,
  faTable,
  faSeedling,
  faChartBar,
  faDna,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAppContext } from '../../context/AppContext';
import { fetchVegetationData, fetchFireData } from '../../services/climateService';
import Papa from 'papaparse';

// Register ChartJS components
ChartJS.register(
  LineElement,
  PointElement, 
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FireAnalysis = ({ dateRange = {} }) => {
  // Define loading state locally
  const [loading, setLoading] = useState(false);
  const { selectedField, selectedLocation } = useAppContext();
  
  // Set default date range if not provided
  const defaultDateRange = {
    startDate: dateRange.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: dateRange.endDate || new Date().toISOString().split('T')[0] // Today
  };
  
  // State for vegetation data from the API
  const [fireData, setFireData] = useState({
    fieldSections: []
  });
  
  // State for vegetation indices from CSV files
  const [fireIndices, setFireIndices] = useState({
    modis_fire: [],
    viirs_fire: [],
    burned_area: [],
    frp: [],
    fwi: [],
    loading: true
  });
  
  // Key observations and nutrient content
  const [keyObservations, setKeyObservations] = useState({
    health: { value: 82, status: 'Good' },
    stress: { value: 18, status: 'Low' },
    aging: { value: 25, status: 'Normal' },
    chlorophyll: { value: 79, status: 'Optimal' },
    nutrients: {
      nitrogen: { value: 45, status: 'Adequate' },
      phosphorus: { value: 32, status: 'Low' },
      potassium: { value: 180, status: 'High' },
      magnesium: { value: 58, status: 'Adequate' }
    }
  });
  
  // Recommended crops based on soil and vegetation analysis
  const [recommendedCrops, setRecommendedCrops] = useState({
    leafyGreen: ['Spinach', 'Kale', 'Lettuce'],
    vegetables: ['Tomatoes', 'Peppers', 'Carrots'],
    fruits: ['Strawberries', 'Blueberries'],
    grains: ['Wheat', 'Barley'],
    pulses: ['Lentils', 'Chickpeas'],
    herbsSpices: ['Basil', 'Mint', 'Coriander']
  });
  
  // Add chart visibility states and refs for chart instances to properly clean up
  const modis_fireChartRef = useRef(null);
  const viirs_fireChartRef = useRef(null);
  const burned_areaChartRef = useRef(null);
  const frpChartRef = useRef(null);
  const fwiChartRef = useRef(null);
  const fireIndicesChartRef = useRef(null);
  const nutrientsChartRef = useRef(null);
  
  // Chart container refs to check if they're in the DOM
  const modis_fireContainerRef = useRef(null);
  const viirs_fireContainerRef = useRef(null);
  const burned_areaContainerRef = useRef(null);
  const frpContainerRef = useRef(null);
  const fwiContainerRef = useRef(null);
  const fireIndicesContainerRef = useRef(null);
  const nutrientsContainerRef = useRef(null);
  
  // Track chart visibility to prevent errors
  const [chartsVisible, setChartsVisible] = useState({
    modis_fire: true,
    viirs_fire: true,
    burned_area: true,
    frp: true,
    fwi: true,
    fireIndices: true,
    nutrients: true
  });
  
  // Function to safely destroy a chart instance
  const safeDestroyChart = (chartRef) => {
    try {
      if (chartRef.current?.chartInstance) {
        chartRef.current.chartInstance.destroy();
      } else if (chartRef.current) {
        chartRef.current.destroy();
      }
    } catch (error) {
      console.error("Error destroying chart:", error);
    }
  };

  // Check if chart containers are in DOM and set visibility
  useEffect(() => {
    const checkVisibility = () => {
      setChartsVisible({
        modis_fire: !!document.getElementById('ndvi-chart-container'),
        viirs_fire: !!document.getElementById('evi-chart-container'),
        burned_area: !!document.getElementById('gci-chart-container'),
        frp: !!document.getElementById('psri-chart-container'),
        fwi: !!document.getElementById('ndre-chart-container'),
        fireIndices: !!document.getElementById('fire-indices-chart-container'),
        nutrients: !!document.getElementById('nutrients-chart-container')
      });
    };
    
    // Initial check
    checkVisibility();
    
    // Add resize observer to recheck on layout changes
    const observer = new ResizeObserver(() => {
      checkVisibility();
    });
    
    // Observe the main Analytics container
    const analyticsContainer = document.querySelector('.Analytics');
    if (analyticsContainer) {
      observer.observe(analyticsContainer);
    }
    
    return () => {
      // Clean up the observer
      observer.disconnect();
      
      // Safely destroy all chart instances
      safeDestroyChart(modis_fireChartRef);
      safeDestroyChart(viirs_fireChartRef);
      safeDestroyChart(burned_areaChartRef);
      safeDestroyChart(frpChartRef);
      safeDestroyChart(fwiChartRef);
      safeDestroyChart(fireIndicesChartRef);
      safeDestroyChart(nutrientsChartRef);
    };
  }, []);
  
  useEffect(() => {
    loadFireData();
    loadFireIndicesFromCsv();
  }, [selectedField, selectedLocation, defaultDateRange.startDate, defaultDateRange.endDate]);
  
  const loadFireData = async () => {
    setLoading(true);
    try {
      const data = await fetchFireData(
        selectedField,
        selectedLocation,
        defaultDateRange
      );
      setFireData(data);
    } catch (error) {
      console.error('Error loading fire data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load vegetation indices from CSV files
  const loadFireIndicesFromCsv = async () => {
    setFireIndices(prev => ({ ...prev, loading: true }));
    
    try {
      // Helper function to fetch and parse CSV
      const fetchCsv = async (filename) => {
        const response = await fetch(`/local_csv/${filename}`);
        const text = await response.text();
        return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
      };
      
      // Load all CSV files in parallel
      const [modis_fireData, viirs_fireData, burned_areaData, frpData, fwiData] = await Promise.all([
        fetchCsv('modis_fire.csv'),
        fetchCsv('viirs_fire.csv'),
        fetchCsv('burned_area.csv'),
        fetchCsv('frp.csv'),
        fetchCsv('fwi.csv'),
      ]);
      
      // Process each dataset to extract date and values
      const processData = (data, valueField) => {
        return data.map(item => ({
          date: item.date,
          value: parseFloat(item[valueField])
        })).filter(item => !isNaN(item.value))
         .sort((a, b) => new Date(a.date) - new Date(b.date));
      };
      
      setFireIndices({
        modis_fire: processData(modis_fireData, 'modis_fire'),
        viirs_fire: processData(viirs_fireData, 'viirs_fire'),
        burned_area: processData(burned_areaData, 'burned_area'),
        frp: processData(frpData, 'frp'),
        fwi: processData(fwiData, 'fwi'),
        loading: false
      });
      
      // // Log the counts of each dataset to verify data loading
      // console.log('modis_fire data points:', processData(ndviData, 'ndvi').length);
      // console.log('EVI data points:', processData(eviData, 'evi').length);
      // console.log('GCI data points:', processData(gciData, 'gci').length);
      // console.log('PSRI data points:', processData(psriData, 'psri').length);
      // console.log('NDRE data points:', processData(ndreData, 'ndre').length);
      // console.log('CRI1 data points:', processData(cri1Data, 'cri1').length);
      
    } catch (error) {
      console.error('Error loading fire indices from CSV:', error);
      setFireIndices(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Enhanced chart options with improved UI
  const getChartOptions = (title, customOptions = {}) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255,255,255,0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        titleFont: {
          weight: 'bold',
          size: 13
        },
        bodyFont: {
          size: 12
        },
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        cornerRadius: 4,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y !== null ? context.parsed.y.toFixed(3) : 'N/A';
            return `${label.split(' - ')[0]}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: {
            weight: 'bold',
            size: 12
          },
          padding: {
            top: 10
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: customOptions.beginAtZero !== undefined ? customOptions.beginAtZero : false,
        title: {
          display: true,
          text: customOptions.yAxisTitle || 'Value',
          font: {
            weight: 'bold',
            size: 12
          },
          padding: {
            bottom: 10
          }
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        hitRadius: 8
      }
    }
  });
  
  // Format date function for chart labels
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    } catch (e) {
      console.error('Invalid date:', dateString);
      return '';
    }
  };

  // Generate chart data for vegetation indices
  const getFireIndicesChartData = (indices = fireIndices) => {
    // Enhanced color map with visually distinct colors
    const colorMap = {
      modis_fire: {
        border: 'rgb(56, 142, 60)',  // Forest green
        background: 'rgba(56, 142, 60, 0.1)',
        pointBgColor: 'rgb(56, 142, 60)',
        pointBorderColor: 'white',
        dashed: false
      },
      viirs_fire: {
        border: 'rgb(0, 137, 123)',  // Teal
        background: 'rgba(0, 137, 123, 0.1)',
        pointBgColor: 'rgb(0, 137, 123)',
        pointBorderColor: 'white',
        dashed: false
      },
      burned_area: {
        border: 'rgb(104, 159, 56)',  // Light green
        background: 'rgba(104, 159, 56, 0.1)',
        pointBgColor: 'rgb(104, 159, 56)',
        pointBorderColor: 'white',
        dashed: false
      },
      frp: {
        border: 'rgb(255, 87, 34)',  // Deep orange
        background: 'rgba(255, 87, 34, 0.1)',
        pointBgColor: 'rgb(255, 87, 34)',
        pointBorderColor: 'white',
        dashed: true
      },
      fwi: {
        border: 'rgb(121, 85, 72)',  // Brown
        background: 'rgba(121, 85, 72, 0.1)',
        pointBgColor: 'rgb(121, 85, 72)',
        pointBorderColor: 'white',
        dashed: false
      },
    };
    
    // Find all dates from all indices
    const allDates = new Set();
    Object.entries(indices)
      .filter(([key, value]) => key !== 'loading' && Array.isArray(value) && value.length > 0)
      .forEach(([_, dataset]) => {
        dataset.forEach(item => {
          if (item.date) allDates.add(item.date);
        });
      });
    
    const sortedDates = [...allDates].sort((a, b) => new Date(a) - new Date(b));
    const labels = sortedDates.map(date => formatDate(date));
    
    // Create datasets for each index with enhanced visualization properties
    const datasets = [];
    
    // Define display names and ensure normalized ranges for better comparison
    const indexDefinitions = {
      modis_fire: { 
        label: 'NDVI - Vegetation Index',
        description: 'Vegetation health & density',
        order: 1
      },
      viirs_fire: { 
        label: 'EVI - Enhanced Vegetation',
        description: 'Improved vegetation detection',
        order: 2
      },
      burned_area: { 
        label: 'GCI - Chlorophyll Index',
        description: 'Chlorophyll content estimate',
        order: 3
      },
      frp: { 
        label: 'PSRI - Senescence Index',
        description: 'Plant aging & stress',
        order: 4
      },
      fwi: { 
        label: 'NDRE - Red Edge Index',
        description: 'Nitrogen & chlorophyll detection',
        order: 5
      },
    };
    
    // Process each index type
    const processedIndices = Object.entries(indices)
      .filter(([key, value]) => key !== 'loading' && Array.isArray(value) && value.length > 0)
      .sort(([keyA], [keyB]) => {
        // Sort by defined order to ensure consistent legend display
        return (indexDefinitions[keyA]?.order || 99) - (indexDefinitions[keyB]?.order || 99);
      });
      
    processedIndices.forEach(([key, data]) => {
      // Create a map of date to value for quick lookup
      const dateValueMap = {};
      data.forEach(item => {
        // Ensure we have valid numeric values
        if (item.date && !isNaN(parseFloat(item.value))) {
          dateValueMap[item.date] = parseFloat(item.value);
        }
      });
      
      // Only include datasets that actually have values
      if (Object.keys(dateValueMap).length > 0) {
        // For each date, get the value or null
        const values = sortedDates.map(date => {
          const value = dateValueMap[date];
          return value !== undefined ? value : null;
        });
        
        // Get index information
        const indexInfo = indexDefinitions[key] || { 
          label: key.toUpperCase(), 
          description: 'Vegetation/plant health index'
        };
        
        // Create enhanced dataset with proper styling
        datasets.push({
          label: indexInfo.label,
          data: values,
          borderColor: colorMap[key].border,
          backgroundColor: colorMap[key].background,
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointStyle: 'circle',
          pointBackgroundColor: colorMap[key].pointBgColor,
          pointBorderColor: colorMap[key].pointBorderColor,
          pointBorderWidth: 1.5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: colorMap[key].pointBgColor,
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 2,
          borderDash: colorMap[key].dashed ? [5, 5] : undefined,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          spanGaps: true, // Connect lines across missing data points
          clip: 5,
          order: indexInfo.order || 1
        });
      }
    });
    
    // If no datasets were created, create a placeholder dataset
    if (datasets.length === 0) {
      datasets.push({
        label: 'No Data Available',
        data: sortedDates.map(() => null),
        borderColor: 'rgb(200, 200, 200)',
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        borderWidth: 2,
        fill: false
      });
    }
    
    return {
      labels,
      datasets
    };
  };
  
  // Generate specific chart data for NDVI
  const getModis_fireChartData = () => {
    const modis_fireData = fireIndices.modis_fire;
    
    // Return empty dataset if no data
    if (!modis_fireData || modis_fireData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'MODIS FIRE',
          data: [],
          fill: true,
          backgroundColor: 'rgba(75, 192, 75, 0.2)',
          borderColor: 'rgb(75, 192, 75)',
          tension: 0.3
        }]
      };
    }
    
    // Process the data
    const sortedData = [...modis_fireData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => formatDate(item.date));
    const values = sortedData.map(item => item.value);
    
    return {
      labels,
      datasets: [
        {
          label: 'MODIS FIRE',
          data: values,
          fill: true,
          backgroundColor: 'rgba(56, 142, 60, 0.2)',
          borderColor: 'rgb(56, 142, 60)',
          tension: 0.3,
          pointBackgroundColor: 'rgb(56, 142, 60)',
          pointBorderColor: 'white',
          pointBorderWidth: 1.5,
          pointRadius: 4
        }
      ]
    };
  };

  const getViirs_fireChartData = () => {
    const viirs_fireData = fireIndices.viirs_fire;
    
    if (!viirs_fireData || viirs_fireData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'VIIRS FIRE',
          data: [],
          fill: true,
          backgroundColor: 'rgba(75, 192, 75, 0.2)',
          borderColor: 'rgb(75, 192, 75)',
          tension: 0.3
        }]
      };
    }
    
    // Process the data
    const sortedData = [...viirs_fireData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => formatDate(item.date));
    const values = sortedData.map(item => item.value);
    
    return {
      labels,
      datasets: [
        {
          label: 'VIIRS FIRE',
          data: values,
          fill: true,
          backgroundColor: 'rgba(56, 142, 60, 0.2)',
          borderColor: 'rgb(56, 142, 60)',
          tension: 0.3,
          pointBackgroundColor: 'rgb(56, 142, 60)',
          pointBorderColor: 'white',
          pointBorderWidth: 1.5,
          pointRadius: 4
        }
      ]
    };
  };

  const getBurned_areaChartData = () => {
    const burned_areaData = fireIndices.burned_area;
    
    if (!burned_areaData || burned_areaData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Burned Area',
          data: [],
          fill: true,
          backgroundColor: 'rgba(75, 192, 75, 0.2)',
          borderColor: 'rgb(75, 192, 75)',
          tension: 0.3
        }]
      };
    }
    
    // Process the data
    const sortedData = [...burned_areaData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => formatDate(item.date));
    const values = sortedData.map(item => item.value);
    
    return {
      labels,
      datasets: [
        {
          label: 'Burned Area',
          data: values,
          fill: true,
          backgroundColor: 'rgba(56, 142, 60, 0.2)',
          borderColor: 'rgb(56, 142, 60)',
          tension: 0.3,
          pointBackgroundColor: 'rgb(56, 142, 60)',
          pointBorderColor: 'white',
          pointBorderWidth: 1.5,
          pointRadius: 4
        }
      ]
    };
  };

  const getFrpChartData = () => {
    const frpData = fireIndices.frp;
    
    if (!frpData || frpData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'FRP',
          data: [],
          fill: true,
          backgroundColor: 'rgba(75, 192, 75, 0.2)',
          borderColor: 'rgb(75, 192, 75)',
          tension: 0.3
        }]
      };
    }
    
    // Process the data
    const sortedData = [...frpData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => formatDate(item.date));
    const values = sortedData.map(item => item.value);
    
    return {
      labels,
      datasets: [
        {
          label: 'FRP',
          data: values,
          fill: true,
          backgroundColor: 'rgba(56, 142, 60, 0.2)',
          borderColor: 'rgb(56, 142, 60)',
          tension: 0.3,
          pointBackgroundColor: 'rgb(56, 142, 60)',
          pointBorderColor: 'white',
          pointBorderWidth: 1.5,
          pointRadius: 4
        }
      ]
    };
  };

  const getFwiChartData = () => {
    const pwiData = fireIndices.fwi;
    
    if (!pwiData || pwiData.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'PWI',
          data: [],
          fill: true,
          backgroundColor: 'rgba(75, 192, 75, 0.2)',
          borderColor: 'rgb(75, 192, 75)',
          tension: 0.3
        }]
      };
    }
    
    // Process the data
    const sortedData = [...pwiData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => formatDate(item.date));
    const values = sortedData.map(item => item.value);
    
    return {
      labels,
      datasets: [
        {
          label: 'PWI',
          data: values,
          fill: true,
          backgroundColor: 'rgba(56, 142, 60, 0.2)',
          borderColor: 'rgb(56, 142, 60)',
          tension: 0.3,
          pointBackgroundColor: 'rgb(56, 142, 60)',
          pointBorderColor: 'white',
          pointBorderWidth: 1.5,
          pointRadius: 4
        }
      ]
    };
  };
  
  // Generate chart data for nutrients
  const getNutrientsChartData = () => {
    return {
      labels: ['Nitrogen', 'Phosphorus', 'Potassium', 'Magnesium'],
      datasets: [
        {
          label: 'Nutrient Content',
          data: [
            keyObservations.nutrients.nitrogen.value,
            keyObservations.nutrients.phosphorus.value,
            keyObservations.nutrients.potassium.value,
            keyObservations.nutrients.magnesium.value
          ],
          backgroundColor: [
            'rgba(46, 125, 50, 0.7)',  // Dark green
            'rgba(255, 111, 0, 0.7)',  // Orange
            'rgba(25, 118, 210, 0.7)',  // Blue
            'rgba(123, 31, 162, 0.7)'   // Purple
          ],
          borderColor: [
            'rgb(46, 125, 50)',
            'rgb(255, 111, 0)',
            'rgb(25, 118, 210)',
            'rgb(123, 31, 162)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Generate the chart data for rendering
  const fireIndicesChartData = getFireIndicesChartData();
  const modis_fireChartData = getModis_fireChartData();
  const viirs_fireChartData = getViirs_fireChartData();
  const burned_areaChartData = getBurned_areaChartData();
  const frpChartData = getFrpChartData();
  const fwiChartData = getFwiChartData();
  const nutrientsChartData = getNutrientsChartData();
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'excellent':
      case 'good':
      case 'high':
      case 'adequate':
        return 'bg-green-100 text-green-800';
      case 'moderate':
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="Analytics">
      <div style={{display: "flex", flexDirection: "row", borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="mb-6">
        <h2 className="text-2xl font-bold flex items-center ">
          <FontAwesomeIcon icon={faCarrot} className="text-green-600 mr-2" />
          Fire Analytics
        </h2>
        <div style={{display: "flex", flexDirection: "row", marginLeft: "auto", marginRight: "10px", alignItems: "center"}} class="IntervalRange">
          <p id="Interval">Interval:</p>
          <input type="date" id="startDate"/>
          <p id="to">to</p>
          <input type="date" id="endDate"/>
        </div>
      </div>
      
      {loading || fireIndices.loading ? (
        <div className="text-center py-10">
          <div className="spinner border-t-4 border-green-500 border-solid rounded-full w-12 h-12 mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600">Loading fire data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* NDVI Chart - Enhanced UI */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-8 hover:h-45">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">MODIS Fire - </b><span style={{fontSize: "17px"}} className="">crop health, greenness, biomass</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-72 pl-1 pr-1 ">
              <div id="ndvi-chart-container" className="w-full h-full" ref={modis_fireContainerRef}>
                {chartsVisible.modis_fire && (
                  <Line 
                    data={modis_fireChartData} 
                    options={getChartOptions('Normalized Difference Vegetation Index', {
                      yAxisTitle: 'NDVI Value',
                      beginAtZero: false
                    })} 
                    ref={modis_fireChartRef}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-0">
              
                <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">VIIRS Fire - </b><span style={{fontSize: "17px"}} className="">similar to NDVI, better in dense canopies</span></h3>
            </div>
            
            {/* <div className="mb-0 p-3 bg-green-50 rounded-md text-sm border-l-4 border-green-400">
              <p className="font-medium">NDVI - Normalized Difference Vegetation Index</p>
              <p className="mt-1">Measures <b>green vegetation amount & health</b> using NIR and red light reflectance.</p>
              <p className="mt-1"><b>Range</b>: -1 to +1</p>
              <p className="mt-1"><b>Interpretation</b>: Higher values indicate healthier vegetation.</p>
            </div> */}
            <div className="h-72 pl-1 pr-1 ">
              <div id="evi-chart-container" className="w-full h-full" ref={viirs_fireContainerRef}>
                {chartsVisible.viirs_fire && (
                  <Line 
                    data={viirs_fireChartData} 
                    options={getChartOptions('Enhanced Vegetation Index', {
                      yAxisTitle: 'VIIRS Fire Value',
                      beginAtZero: false
                    })} 
                    ref={viirs_fireChartRef}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-0">
              
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">Burned Area - </b><span style={{fontSize: "17px"}} className="">chlorophyll content, nitrogen</span></h3>
            </div>
            
            {/* <div className="mb-0 p-3 bg-green-50 rounded-md text-sm border-l-4 border-green-400">
              <p className="font-medium">NDVI - Normalized Difference Vegetation Index</p>
              <p className="mt-1">Measures <b>green vegetation amount & health</b> using NIR and red light reflectance.</p>
              <p className="mt-1"><b>Range</b>: -1 to +1</p>
              <p className="mt-1"><b>Interpretation</b>: Higher values indicate healthier vegetation.</p>
            </div> */}
            <div className="h-72 pl-1 pr-1 ">
              <div id="gci-chart-container" className="w-full h-full" ref={burned_areaContainerRef}>
                {chartsVisible.burned_area && (
                  <Line 
                    data={burned_areaChartData} 
                    options={getChartOptions('Green Chlorophyll Index', {
                      yAxisTitle: 'Burned Area Value',
                      beginAtZero: false
                    })} 
                    ref={burned_areaChartRef}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-0">
              
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">FRP - </b><span style={{fontSize: "17px"}} className="">aging, stress, carotenoid/pigment ratio</span></h3>
            </div>
            
            {/* <div className="mb-0 p-3 bg-green-50 rounded-md text-sm border-l-4 border-green-400">
              <p className="font-medium">NDVI - Normalized Difference Vegetation Index</p>
              <p className="mt-1">Measures <b>green vegetation amount & health</b> using NIR and red light reflectance.</p>
              <p className="mt-1"><b>Range</b>: -1 to +1</p>
              <p className="mt-1"><b>Interpretation</b>: Higher values indicate healthier vegetation.</p>
            </div> */}
            <div className="h-72 pl-1 pr-1 ">
              <div id="psri-chart-container" className="w-full h-full" ref={frpContainerRef}>
                {chartsVisible.frp && (
                  <Line 
                    data={frpChartData} 
                    options={getChartOptions('Plant Senescence Reflectance Index', {
                      yAxisTitle: 'FRP Value',
                      beginAtZero: false
                    })} 
                    ref={frpChartRef}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-0">
              
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">FWI - </b><span style={{fontSize: "17px"}} className="">chlorophyll concentration in canopy</span></h3>
            </div>
            
            {/* <div className="mb-0 p-3 bg-green-50 rounded-md text-sm border-l-4 border-green-400">
              <p className="font-medium">NDVI - Normalized Difference Vegetation Index</p>
              <p className="mt-1">Measures <b>green vegetation amount & health</b> using NIR and red light reflectance.</p>
              <p className="mt-1"><b>Range</b>: -1 to +1</p>
              <p className="mt-1"><b>Interpretation</b>: Higher values indicate healthier vegetation.</p>
            </div> */}
            <div className="h-72 pl-1 pr-1 ">
              <div id="ndre-chart-container" className="w-full h-full" ref={fwiContainerRef}>
                {chartsVisible.fwi && (
                  <Line 
                    data={fwiChartData} 
                    options={getChartOptions('Normalized Difference Red Edge Index', {
                      yAxisTitle: 'FWI Value',
                      beginAtZero: false
                    })} 
                    ref={fwiChartRef}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Key Observations - Enhanced UI */}
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <span className="text-green-600 mr-3">
                <FontAwesomeIcon icon={faChartLine} size="lg" />
              </span>
              <h3 className="text-lg font-semibold">Key Observations</h3>
            </div>
            
            <div className="space-y-4">
              {/* Health Status */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Health</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.health.status)}`}>
                    {keyObservations.health.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${keyObservations.health.value}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on NDVI and EVI values</p>
              </div>
              
              {/* Stress Detection */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Stress</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.stress.status)}`}>
                    {keyObservations.stress.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-500 h-2.5 rounded-full" 
                    style={{ width: `${keyObservations.stress.value}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on PSRI and CRI1 indicators</p>
              </div>
              
              {/* Aging */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Aging</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.aging.status)}`}>
                    {keyObservations.aging.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${keyObservations.aging.value}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on PSRI values</p>
              </div>
              
              {/* Chlorophyll */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Chlorophyll</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.chlorophyll.status)}`}>
                    {keyObservations.chlorophyll.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${keyObservations.chlorophyll.value}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on GCI and NDRE values</p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Soil Nutrient Analysis */}
          <div className="bg-white pl-3 pr-3 pt-2.5 pb-2 rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faFlask} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Soil Nutrient Analysis</h3>
              </div>
              <button className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full flex items-center">
                <FontAwesomeIcon icon={faChartBar} className="mr-1" />
                Advanced View
              </button>
            </div>
            
            {/* <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-white rounded-lg text-sm border-l-4 border-green-500">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faInfoCircle} className="text-green-600 mr-2 text-lg" />
                <div>
                  <h4 className="font-semibold text-green-800">Nutrient Profile & Recommendations</h4>
                  <p>Analysis based on spectral imagery, vegetation indices, and soil test results</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Last soil test: September 1, 2025
                    </span>
                    <span className="text-amber-600">
                      Next test due: October 15, 2025
                    </span>
                  </div>
                </div>
              </div>
            </div> */}
            
            <div className="h-80 mb-0">
              <div id="nutrients-chart-container" className="w-full h-full" ref={nutrientsContainerRef}>
                {chartsVisible.nutrients && (
                  <Bar 
                    data={nutrientsChartData} 
                    options={{
                      ...getChartOptions('Macronutrient Analysis', {
                        yAxisTitle: 'Value (kg/ha)',
                        beginAtZero: true
                      }),
                      plugins: {
                        ...getChartOptions().plugins,
                        tooltip: {
                          ...getChartOptions().plugins.tooltip,
                          callbacks: {
                            label: function(context) {
                              const label = context.dataset.label || '';
                              const value = context.parsed.y !== null ? context.parsed.y : 'N/A';
                              
                              // Add nutrient status to tooltip
                              const nutrientName = context.label.toLowerCase();
                              let status = '';
                              
                              if (nutrientName === 'nitrogen') {
                                status = keyObservations.nutrients.nitrogen.status;
                              } else if (nutrientName === 'phosphorus') {
                                status = keyObservations.nutrients.phosphorus.status;
                              } else if (nutrientName === 'potassium') {
                                status = keyObservations.nutrients.potassium.status;
                              } else if (nutrientName === 'magnesium') {
                                status = keyObservations.nutrients.magnesium.status;
                              }
                              
                              return [`${label}: ${value} kg/ha`, `Status: ${status}`];
                            }
                          }
                        }
                      }
                    }} 
                    ref={nutrientsChartRef}
                  />
                )}
              </div>
            </div>            

            
          </div>

          {/* Recommended Crops */}
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100 lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-green-600 mr-3">
                <FontAwesomeIcon icon={faSeedling} size="lg" />
              </span>
              <h3 className="text-lg font-semibold">Recommended Crops</h3>
            </div>
            
            <div className="mb-4 p-3 bg-green-50 rounded-md text-sm border-l-4 border-green-400">
              <p className="font-medium">Crops most suitable based on current soil and vegetation conditions</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-green-800 mb-2">
                  <FontAwesomeIcon icon={faSeedling} className="mr-2" />
                  <span>Leafy Greens</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.leafyGreen.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-green-800 mb-2">
                  <FontAwesomeIcon icon={faTable} className="mr-2" />
                  <span>Vegetables</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.vegetables.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-red-50 text-red-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-green-800 mb-2">
                  <FontAwesomeIcon icon={faSun} className="mr-2" />
                  <span>Fruits</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.fruits.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-green-800 mb-2">
                  <FontAwesomeIcon icon={faLeaf} className="mr-2" />
                  <span>Grains & Pulses</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.grains.concat(recommendedCrops.pulses).map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireAnalysis;
