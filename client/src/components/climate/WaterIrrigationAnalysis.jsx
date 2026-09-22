import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faInfoCircle,
  faTriangleExclamation,
  faTable,
  faLeaf,
  faChartLine,
  faFlask,
  faWater,
  faMapMarkerAlt,
  faTint,
  faSeedling,
  faCarrot,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAppContext } from '../../context/AppContext';
import { fetchWaterData } from '../../services/climateService';
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

const WaterIrrigationAnalysis = ({ dateRange = {} }) => {
  // Define loading state locally
  const [loading, setLoading] = useState(false);
  const { selectedField, selectedLocation } = useAppContext();
  
  // Set default date range if not provided
  const defaultDateRange = {
    startDate: dateRange.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: dateRange.endDate || new Date().toISOString().split('T')[0] // Today
  };
  const [waterData, setWaterData] = useState({
    fieldSections: []
  });
  
  // New state for water indices from CSV files
  const [waterIndices, setWaterIndices] = useState({
    ndwi: [],
    ndmi: [],
    lswi: [],
    awei: [],
    mndwi: [],
    sarwi: [],
    ewi: [],
    loading: true
  });

  // Key observations and nutrient content
  const [keyObservations, setKeyObservations] = useState({
    health: { value: 85, status: 'Good' },
    stress: { value: 12, status: 'Low' },
    aging: { value: 28, status: 'Normal' },
    chlorophyll: { value: 75, status: 'Optimal' },
    nutrients: {
      nitrogen: { value: 42, status: 'Adequate' },
      phosphorus: { value: 28, status: 'Low' },
      potassium: { value: 165, status: 'High' },
      magnesium: { value: 52, status: 'Adequate' }
    }
  });
  
  // Recommended crops based on water and irrigation analysis
  const [recommendedCrops, setRecommendedCrops] = useState({
    waterTolerant: ['Rice', 'Watercress', 'Celery'],
    moderateWater: ['Tomatoes', 'Peppers', 'Squash'],
    droughtTolerant: ['Beans', 'Peas', 'Herbs'],
    highMoisture: ['Lettuce', 'Spinach', 'Cabbage'],
    irrigation: ['Corn', 'Wheat', 'Soybeans'],
    aquatic: ['Water Spinach', 'Lotus', 'Taro']
  });
  
  // Add refs for chart instances to properly clean up
  const ndwiChartRef = useRef(null);
  const ndmiChartRef = useRef(null);
  const lswiChartRef = useRef(null);
  const aweiChartRef = useRef(null);
  const mndwiChartRef = useRef(null);
  const sarwiChartRef = useRef(null);
  const ewiChartRef = useRef(null);
  const waterIndicesChartRef = useRef(null);
  const nutrientsChartRef = useRef(null);
  
  // Chart container refs to check if they're in the DOM
  const ndwiContainerRef = useRef(null);
  const ndmiContainerRef = useRef(null);
  const lswiContainerRef = useRef(null);
  const aweiContainerRef = useRef(null);
  const mndwiContainerRef = useRef(null);
  const sarwiContainerRef = useRef(null);
  const ewiContainerRef = useRef(null);
  const waterIndicesContainerRef = useRef(null);
  const nutrientsContainerRef = useRef(null);
  
  // Track chart visibility to prevent errors
  const [chartsVisible, setChartsVisible] = useState({
    ndwi: false,
    ndmi: false,
    lswi: false,
    awei: false,
    mndwi: false,
    sarwi: false,
    ewi: false,
    waterIndices: false,
    nutrients: false
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
        ndwi: !!document.getElementById('ndwi-chart-container'),
        ndmi: !!document.getElementById('ndmi-chart-container'),
        lswi: !!document.getElementById('lswi-chart-container'),
        awei: !!document.getElementById('awei-chart-container'),
        mndwi: !!document.getElementById('mndwi-chart-container'),
        sarwi: !!document.getElementById('sarwi-chart-container'),
        ewi: !!document.getElementById('ewi-chart-container'),
        waterIndices: !!document.getElementById('water-indices-chart-container'),
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
      safeDestroyChart(ndwiChartRef);
      safeDestroyChart(ndmiChartRef);
      safeDestroyChart(lswiChartRef);
      safeDestroyChart(aweiChartRef);
      safeDestroyChart(mndwiChartRef);
      safeDestroyChart(sarwiChartRef);
      safeDestroyChart(ewiChartRef);
      safeDestroyChart(waterIndicesChartRef);
      safeDestroyChart(nutrientsChartRef);
    };
  }, []);
  
  useEffect(() => {
    loadWaterData();
    loadWaterIndicesFromCsv();
  }, [selectedField, selectedLocation, defaultDateRange.startDate, defaultDateRange.endDate]);
  
  const loadWaterData = async () => {
    setLoading(true);
    try {
      const data = await fetchWaterData(
        selectedField,
        selectedLocation,
        defaultDateRange
      );
      setWaterData(data);
    } catch (error) {
      console.error('Error loading water data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load water indices from CSV files
  const loadWaterIndicesFromCsv = async () => {
    setWaterIndices(prev => ({ ...prev, loading: true }));
    
    try {
      // Helper function to fetch and parse CSV
      const fetchCsv = async (filename) => {
        console.log(`Fetching CSV: ${filename}`);
        const response = await fetch(`/local_csv/${filename}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${filename}: ${response.status}`);
        }
        const text = await response.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        console.log(`Parsed ${filename}:`, {
          data: parsed.data.slice(0, 3), // First 3 rows
          errors: parsed.errors,
          meta: parsed.meta
        });
        return parsed.data;
      };
      
      // Load all CSV files in parallel
      const [ndwiData, ndmiData, lswiData, aweiData, mndwiData, sarwiData, ewiData] = await Promise.all([
        fetchCsv('ndwi.csv'),
        fetchCsv('ndmi.csv'),
        fetchCsv('lswi.csv'),
        fetchCsv('awei.csv'),
        fetchCsv('mndwi.csv'),
        fetchCsv('sarwi.csv'),
        fetchCsv('ewi.csv')
      ]);
      
      // Process each dataset to extract date and values
      const processData = (data, valueField) => {
        console.log(`Processing ${valueField} data:`, data.slice(0, 3)); // Log first 3 items
        const processed = data.map(item => ({
          date: item.date,
          value: parseFloat(item[valueField])
        })).filter(item => !isNaN(item.value))
         .sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(`Processed ${valueField} data:`, processed.slice(0, 3)); // Log first 3 processed items
        return processed;
      };
      
      setWaterIndices({
        ndwi: processData(ndwiData, 'ndwi'),
        ndmi: processData(ndmiData, 'ndmi'),
        lswi: processData(lswiData, 'lswi'),
        awei: processData(aweiData, 'awei'),
        mndwi: processData(mndwiData, 'mndwi'),
        sarwi: processData(sarwiData, 'sarwi'),
        ewi: processData(ewiData, 'ewi'),
        loading: false
      });
      
      // Log the counts of each dataset to verify data loading
      console.log('NDWI data points:', processData(ndwiData, 'ndwi').length);
      console.log('NDMI data points:', processData(ndmiData, 'ndmi').length);
      console.log('LSWI data points:', processData(lswiData, 'lswi').length);
      console.log('AWEI data points:', processData(aweiData, 'awei').length);
      console.log('MNDWI data points:', processData(mndwiData, 'mndwi').length);
      console.log('SARWI data points:', processData(sarwiData, 'sarwi').length);
      console.log('EWI data points:', processData(ewiData, 'ewi').length);
      
    } catch (error) {
      console.error('Error loading water indices from CSV:', error);
      setWaterIndices(prev => ({ ...prev, loading: false }));
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
  
  const ndwiChartData = {
    labels: waterIndices.ndwi?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'NDWI',
        data: waterIndices.ndwi?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };

  const ndmiChartData = {
    labels: waterIndices.ndmi?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'NDMI',
        data: waterIndices.ndmi?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const lswiChartData = {
    labels: waterIndices.lswi?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'LSWI',
        data: waterIndices.lswi?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const aweiChartData = {
    labels: waterIndices.awei?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'AWEI',
        data: waterIndices.awei?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const mndwiChartData = {
    labels: waterIndices.mndwi?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'MNDWI',
        data: waterIndices.mndwi?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const sarwiChartData = {
    labels: waterIndices.sarwi?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'SARWI',
        data: waterIndices.sarwi?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const ewiChartData = {
    labels: waterIndices.ewi?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'EWI',
        data: waterIndices.ewi?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  
  // Generate chart data for water indices with enhanced visualization
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    } catch (e) {
      console.error('Invalid date:', dateString);
      return '';
    }
  };
  
  const getWaterIndicesChartData = (indices = waterIndices) => {
    // Enhanced color map with more visually distinct colors
    const colorMap = {
      ndwi: {
        border: 'rgb(25, 118, 210)',  // Deep blue
        background: 'rgba(25, 118, 210, 0.1)',
        pointBgColor: 'rgb(25, 118, 210)',
        pointBorderColor: 'white',
        dashed: false
      },
      ndmi: {
        border: 'rgb(56, 142, 60)',  // Forest green
        background: 'rgba(56, 142, 60, 0.1)',
        pointBgColor: 'rgb(56, 142, 60)',
        pointBorderColor: 'white',
        dashed: false
      },
      lswi: {
        border: 'rgb(56, 142, 60)',  // Forest green
        background: 'rgba(56, 142, 60, 0.1)',
        pointBgColor: 'rgb(56, 142, 60)',
        pointBorderColor: 'white',
        dashed: false
      },
      awei: {
        border: 'rgb(123, 31, 162)',  // Purple
        background: 'rgba(123, 31, 162, 0.1)',
        pointBgColor: 'rgb(123, 31, 162)',
        pointBorderColor: 'white',
        dashed: false
      },
      mndwi: {
        border: 'rgb(123, 31, 162)',  // Purple
        background: 'rgba(123, 31, 162, 0.1)',
        pointBgColor: 'rgb(123, 31, 162)',
        pointBorderColor: 'white',
        dashed: false
      },
      sarwi: {
        border: 'rgb(255, 111, 0)',  // Deep orange
        background: 'rgba(255, 111, 0, 0.1)',
        pointBgColor: 'rgb(255, 111, 0)',
        pointBorderColor: 'white',
        dashed: true  // Use dashed line for better distinction
      },
      ewi: {
        border: 'rgb(211, 47, 47)',  // Deep red
        background: 'rgba(211, 47, 47, 0.1)',
        pointBgColor: 'rgb(211, 47, 47)',
        pointBorderColor: 'white',
        dashed: true  // Use dashed line for better distinction
      }
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
      ndwi: { 
        label: 'NDWI - Water Index',
        description: 'Surface water detection',
        order: 1
      },
      ndmi: { 
        label: 'NDMI - Moisture Index',
        description: 'Vegetation moisture content',
        order: 2
      },
      lswi: { 
        label: 'NDMI - Moisture Index',
        description: 'Vegetation moisture content',
        order: 3
      },
      awei: { 
        label: 'AWEI - Water Extraction',
        description: 'Enhanced water extraction',
        order: 4
      },
      mndwi: { 
        label: 'NDMI - Moisture Index',
        description: 'Vegetation moisture content',
        order: 5
      },
      sarwi: { 
        label: 'SARWI - Radar-based Index',
        description: 'Radar water detection',
        order: 6
      },
      ewi: { 
        label: 'EWI - Enhanced Wetness',
        description: 'Improved wetness detection',
        order: 7
      }
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
          description: 'Water/moisture index'
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
  
  // Generate the chart data directly during component render for fresh data
  const waterIndicesChartData = getWaterIndicesChartData();
  
  // Generate chart data for nutrients
  const nutrientsChartData = {
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
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'good':
      case 'optimal':
      case 'high':
      case 'adequate':
        return 'bg-green-100 text-green-800';
      case 'moderate':
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Debug logging
  console.log('WaterIrrigationAnalysis - waterIndices:', waterIndices);
  console.log('WaterIrrigationAnalysis - loading states:', { loading, waterIndicesLoading: waterIndices.loading });
  console.log('WaterIrrigationAnalysis - NDWI data length:', waterIndices.ndwi?.length || 0);

  return (
    <div className="Analytics">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FontAwesomeIcon icon={faDroplet} className="text-blue-500 mr-2" />
          Water & Irrigation
        </h2>
        <p className="text-gray-600">
          Monitor soil moisture, irrigation patterns, and water usage efficiency.
        </p>
      </div>
      
      {loading || waterIndices.loading ? (
        <div className="text-center py-10">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600">Loading water data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Soil Moisture Chart - Enhanced UI */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-8 hover:h-45">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">NDWI - </b><span style={{fontSize: "17px"}} className="">highlights open water bodies</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={ndwiChartData} 
                options={getChartOptions('Normalized Difference Water Index', {
                  yAxisTitle: 'NDWI Values',
                  beginAtZero: true
                })} 
                ref={ndwiChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-8 hover:h-45">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">NDMI - </b><span style={{fontSize: "17px"}} className="">drought stress, crop water availability</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={ndmiChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'NDMI Values',
                  beginAtZero: true
                })} 
                ref={ndmiChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-8 hover:h-45">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">LSWI - </b><span style={{fontSize: "17px"}} className="">vegetation water content & soil moisture</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={lswiChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })} 
                ref={lswiChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-8 hover:h-45">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">AWEI - </b><span style={{fontSize: "17px"}} className="">open water detection</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={aweiChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })} 
                ref={aweiChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-0">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">CRI1 - </b><span style={{fontSize: "17px"}} className="">carotenoid content in leaves (stress-related pigments)</span></h3>
              {/* <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div> */}
            </div>
        
            <div className="h-80">
              <Line 
                data={mndwiChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })} 
                ref={mndwiChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-8 hover:h-45">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">SARWI - </b><span style={{fontSize: "17px"}} className="">Highlights algal blooms / water turbidity</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={sarwiChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })} 
                ref={sarwiChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-0">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">EWI - </b><span style={{fontSize: "17px"}} className="">Typically designed to enhance water body extraction under complex land cover</span></h3>
              {/* <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div> */}
            </div>
            <div className="h-80">
              <Line 
                data={ewiChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })} 
                ref={ewiChartRef} 
              />
            </div>
          </div>

          {/* Irrigation Recommendations - Enhanced UI */}
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <span className="text-green-600 mr-3">
                <FontAwesomeIcon icon={faWater} size="lg" />
              </span>
              <h3 className="text-lg font-semibold">Irrigation Recommendations</h3>
            </div>
            
            <div className="space-y-4">
              {waterData.recommendations?.map((recommendation, index) => (
                <div 
                  key={index} 
                  className={`p-3 ${
                    recommendation.priority === 'warning' 
                      ? 'bg-yellow-50 border-l-4 border-yellow-500' 
                      : 'bg-blue-50 border-l-4 border-blue-500'
                  } rounded`}
                >
                  <div className="flex items-start">
                    <FontAwesomeIcon 
                      icon={recommendation.priority === 'warning' ? faTriangleExclamation : faInfoCircle} 
                      className={recommendation.priority === 'warning' ? 'text-yellow-500 mt-1 mr-2' : 'text-blue-500 mt-1 mr-2'} 
                    />
                    <div>
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {!waterData.recommendations?.length && (
                <div className="p-3 bg-gray-50 border-l-4 border-gray-300 rounded">
                  <p className="text-sm text-gray-600">No irrigation recommendations available for the selected period.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Key Observations - Enhanced UI */}
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <span className="text-green-600 mr-3">
                <FontAwesomeIcon icon={faLeaf} size="lg" />
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
              </div>
              
              {/* Stress */}
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
              </div>
            </div>
          </div>
          
          {/* Nutrients Content - Enhanced UI */}
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100">
            <div className="flex items-center mb-4">
              <span className="text-amber-600 mr-3">
                <FontAwesomeIcon icon={faFlask} size="lg" />
              </span>
              <h3 className="text-lg font-semibold">Nutrients Content</h3>
            </div>
            
            <div className="h-60 mb-4">
              <Bar 
                data={nutrientsChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
                ref={nutrientsChartRef}
              />
            </div>
            
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nutrients</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Nitrogen</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">{keyObservations.nutrients.nitrogen.value}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.nutrients.nitrogen.status)}`}>
                        {keyObservations.nutrients.nitrogen.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Phosphorus</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">{keyObservations.nutrients.phosphorus.value}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.nutrients.phosphorus.status)}`}>
                        {keyObservations.nutrients.phosphorus.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Potassium</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">{keyObservations.nutrients.potassium.value}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.nutrients.potassium.status)}`}>
                        {keyObservations.nutrients.potassium.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Magnesium</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-900">{keyObservations.nutrients.magnesium.value}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(keyObservations.nutrients.magnesium.status)}`}>
                        {keyObservations.nutrients.magnesium.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          

          {/* Recommended Crops for Water Conditions */}
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100 lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-blue-600 mr-3">
                <FontAwesomeIcon icon={faSeedling} size="lg" />
              </span>
              <h3 className="text-lg font-semibold">Recommended Crops for Current Water Conditions</h3>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm border-l-4 border-blue-400">
              <p className="font-medium">Crops most suitable based on current water availability and irrigation patterns</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faDroplet} className="mr-2" />
                  <span>Water Tolerant</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.waterTolerant.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faWater} className="mr-2" />
                  <span>Moderate Water Needs</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.moderateWater.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faSun} className="mr-2" />
                  <span>Drought Tolerant</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.droughtTolerant.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faTint} className="mr-2" />
                  <span>High Moisture Loving</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.highMoisture.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-cyan-50 text-cyan-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faLeaf} className="mr-2" />
                  <span>Irrigation Dependent</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.irrigation.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-purple-50 text-purple-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faWater} className="mr-2" />
                  <span>Aquatic/Semi-aquatic</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.aquatic.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-teal-50 text-teal-800 rounded-lg text-sm">
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

export default WaterIrrigationAnalysis;

