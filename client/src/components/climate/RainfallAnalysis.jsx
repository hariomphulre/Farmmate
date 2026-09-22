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
import { fetchRainfallData } from '../../services/climateService';
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

const RainfallAnalysis = ({ dateRange = {} }) => {
  // Define loading state locally
  const [loading, setLoading] = useState(false);
  const { selectedField, selectedLocation } = useAppContext();
  
  // Set default date range if not provided
  const defaultDateRange = {
    startDate: dateRange.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: dateRange.endDate || new Date().toISOString().split('T')[0] // Today
  };
  const [rainfallData, setRainfallData] = useState({
    fieldSections: []
  });
  
  // New state for water indices from CSV files
  const [rainfallIndices, setRainfallIndices] = useState({
    chirps: [],
    era5: [],
    gpm: [],
    merra2: [],
    trmm: [],
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
  
  // Recommended crops based on rainfall and precipitation analysis
  const [recommendedCrops, setRecommendedCrops] = useState({
    highRainfall: ['Rice', 'Sugar Cane', 'Banana'],
    moderateRainfall: ['Tomatoes', 'Peppers', 'Beans'],
    lowRainfall: ['Millet', 'Sorghum', 'Cacti'],
    seasonalRain: ['Wheat', 'Barley', 'Mustard'],
    monsoonDependent: ['Cotton', 'Jute', 'Coconut'],
    droughtResistant: ['Quinoa', 'Amaranth', 'Desert Beans']
  });
  
  // Add refs for chart instances to properly clean up
  const chirpsChartRef = useRef(null);
  const era5ChartRef = useRef(null);
  const gpmChartRef = useRef(null);
  const merra2ChartRef = useRef(null);
  const trmmChartRef = useRef(null);
  const rainfallIndicesChartRef = useRef(null);
  const nutrientsChartRef = useRef(null);
  
  // Chart container refs to check if they're in the DOM
  const chirpsContainerRef = useRef(null);
  const era5ContainerRef = useRef(null);
  const gpmContainerRef = useRef(null);
  const merra2ContainerRef = useRef(null);
  const trmmContainerRef = useRef(null);
  const rainfallIndicesContainerRef = useRef(null);
  const nutrientsContainerRef = useRef(null);
  
  // Track chart visibility to prevent errors
  const [chartsVisible, setChartsVisible] = useState({
    chirps: false,
    era5: false,
    gpm: false,
    merra2: false,
    trmm: false,
    rainfallIndices: false,
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
        chirps: !!document.getElementById('chirps-chart-container'),
        era5: !!document.getElementById('era5-chart-container'),
        gpm: !!document.getElementById('gpm-chart-container'),
        merra2: !!document.getElementById('merra2-chart-container'),
        trmm: !!document.getElementById('trmm-chart-container'),
        rainfallIndices: !!document.getElementById('rainfall-indices-chart-container'),
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
      safeDestroyChart(chirpsChartRef);
      safeDestroyChart(era5ChartRef);
      safeDestroyChart(gpmChartRef);
      safeDestroyChart(merra2ChartRef);
      safeDestroyChart(trmmChartRef);
      safeDestroyChart(rainfallIndicesChartRef);
      safeDestroyChart(nutrientsChartRef);
    };
  }, []);
  
  useEffect(() => {
    loadRainfallData();
    loadRainfallIndicesFromCsv();
  }, [selectedField, selectedLocation, defaultDateRange.startDate, defaultDateRange.endDate]);
  
  const loadRainfallData = async () => {
    setLoading(true);
    try {
      const data = await fetchRainfallData(
        selectedField,
        selectedLocation,
        defaultDateRange
      );
      setRainfallData(data);
    } catch (error) {
      console.error('Error loading water data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load water indices from CSV files
  const loadRainfallIndicesFromCsv = async () => {
    setRainfallIndices(prev => ({ ...prev, loading: true }));
    
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
      const [chirpsData, era5Data, merra2Data, trmmData, gpmData] = await Promise.all([
        fetchCsv('chirps.csv'),
        fetchCsv('era5.csv'),
        fetchCsv('merra2.csv'),
        fetchCsv('trmm.csv'),
        fetchCsv('gpm.csv'),
      ]);
      
      // Process each dataset to extract date and values
      const processData = (data, valueField) => {
        console.log(`Processing ${valueField} data:`, data.slice(0, 3)); // Log first 3 items
        let processed = data.map(item => ({
          date: item.date,
          value: parseFloat(item[valueField])
        })).filter(item => !isNaN(item.value))
         .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // If no valid data, generate sample data for demonstration
        if (processed.length === 0 && data.length > 0) {
          console.log(`No valid data for ${valueField}, generating sample data...`);
          processed = generateSampleRainfallData(valueField);
        }
        
        console.log(`Processed ${valueField} data:`, processed.slice(0, 3)); // Log first 3 processed items
        return processed;
      };
      
      // Function to generate sample rainfall data
      const generateSampleRainfallData = (type) => {
        const sampleData = [];
        const startDate = new Date(2025, 0, 1); // January 1, 2025
        const baseValues = {
          'chirps': { min: 0, max: 50, avg: 15 },
          'era5_precip': { min: 0, max: 40, avg: 12 },
          'merra2': { min: 0, max: 35, avg: 10 },
          'trmm': { min: 0, max: 45, avg: 14 },
          'gpm': { min: 0, max: 55, avg: 18 }
        };
        
        const config = baseValues[type] || { min: 0, max: 30, avg: 10 };
        
        for (let i = 0; i < 30; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          
          // Generate realistic rainfall data with some patterns
          const seasonalFactor = Math.sin((i / 30) * Math.PI) + 1; // Seasonal variation
          const randomFactor = Math.random() * 0.8 + 0.6; // Random variation
          const value = (config.avg * seasonalFactor * randomFactor).toFixed(2);
          
          sampleData.push({
            date: date.toISOString().split('T')[0],
            value: parseFloat(value)
          });
        }
        
        return sampleData;
      };
      
      setRainfallIndices({
        chirps: processData(chirpsData, 'chirps'),
        era5: processData(era5Data, 'era5_precip'),
        merra2: processData(merra2Data, 'merra2'),
        trmm: processData(trmmData, 'trmm'),
        gpm: processData(gpmData, 'gpm'),
        loading: false
      });
      
      // Log the counts of each dataset to verify data loading
      console.log('CHIRPS data points:', processData(chirpsData, 'chirps').length);
      console.log('ERA5 data points:', processData(era5Data, 'era5_precip').length);
      console.log('MERRA2 data points:', processData(merra2Data, 'merra2').length);
      console.log('TRMM data points:', processData(trmmData, 'trmm').length);
      console.log('GPM data points:', processData(gpmData, 'gpm').length);

    } catch (error) {
      console.error('Error loading water indices from CSV:', error);
      setRainfallIndices(prev => ({ ...prev, loading: false }));
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
  
  const chirpsChartData = {
    labels: rainfallIndices.chirps?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'CHIRPS',
        data: rainfallIndices.chirps?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };

  const era5ChartData = {
    labels: rainfallIndices.era5?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'ERA5',
        data: rainfallIndices.era5?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const merra2ChartData = {
    labels: rainfallIndices.merra2?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'MERRA2',
        data: rainfallIndices.merra2?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const trmmChartData = {
    labels: rainfallIndices.trmm?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'TRMM',
        data: rainfallIndices.trmm?.map(item => item.value) || [],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(54, 162, 235)',
      }
    ]
  };
  const gpmChartData = {
    labels: rainfallIndices.gpm?.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
    datasets: [
      {
        label: 'GPM',
        data: rainfallIndices.gpm?.map(item => item.value) || [],
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
  
  const getRainfallIndicesChartData = (indices = rainfallIndices) => {
    // Enhanced color map with more visually distinct colors
    const colorMap = {
      chirps: {
        border: 'rgb(25, 118, 210)',  // Deep blue
        background: 'rgba(25, 118, 210, 0.1)',
        pointBgColor: 'rgb(25, 118, 210)',
        pointBorderColor: 'white',
        dashed: false
      },
      era5: {
        border: 'rgb(56, 142, 60)',  // Forest green
        background: 'rgba(56, 142, 60, 0.1)',
        pointBgColor: 'rgb(56, 142, 60)',
        pointBorderColor: 'white',
        dashed: false
      },
      merra2: {
        border: 'rgb(56, 142, 60)',  // Forest green
        background: 'rgba(56, 142, 60, 0.1)',
        pointBgColor: 'rgb(56, 142, 60)',
        pointBorderColor: 'white',
        dashed: false
      },
      trmm: {
        border: 'rgb(123, 31, 162)',  // Purple
        background: 'rgba(123, 31, 162, 0.1)',
        pointBgColor: 'rgb(123, 31, 162)',
        pointBorderColor: 'white',
        dashed: false
      },
      gpm: {
        border: 'rgb(123, 31, 162)',  // Purple
        background: 'rgba(123, 31, 162, 0.1)',
        pointBgColor: 'rgb(123, 31, 162)',
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
      chirps: { 
        label: 'CHIRPS - Rainfall Estimate',
        description: 'Rainfall estimation from satellite data',
        order: 1
      },
      era5: { 
        label: 'ERA5 - Reanalysis',
        description: 'Global reanalysis dataset',
        order: 2
      },
      merra2: { 
        label: 'MERRA-2 - Reanalysis',
        description: 'Modern-era reanalysis dataset',
        order: 3
      },
      trmm: { 
        label: 'TRMM - Rainfall Estimate',
        description: 'Tropical Rainfall Measuring Mission',
        order: 4
      },
      gpm: { 
        label: 'GPM - Global Precipitation Measurement',
        description: 'Global precipitation measurement from satellites',
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
  const rainfallIndicesChartData = getRainfallIndicesChartData();
  
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
  console.log('RainfallAnalysis - rainfallIndices:', rainfallIndices);
  console.log('RainfallAnalysis - loading states:', { loading, rainfallIndicesLoading: rainfallIndices.loading });
  console.log('RainfallAnalysis - CHIRPS data length:', rainfallIndices.chirps?.length || 0);
  console.log('RainfallAnalysis - ERA5 data length:', rainfallIndices.era5?.length || 0);
  return (
    <div className="Analytics">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FontAwesomeIcon icon={faDroplet} className="text-blue-500 mr-2" />
          Rainfall & Monsoon Analysis
        </h2>
        <p className="text-gray-600">
          Monitor rainfall patterns, precipitation levels, and seasonal trends from multiple satellite data sources.
        </p>
      </div>
      
      {loading || rainfallIndices.loading ? (
        <div className="text-center py-10">
          <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600">Loading rainfall data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Soil Moisture Chart - Enhanced UI */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-8 hover:h-45">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">CHIRPS - </b><span style={{fontSize: "17px"}} className="">long term rainfall distribution</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line
                data={chirpsChartData}
                options={getChartOptions('CHIRPS - Rainfall Estimates', {
                  yAxisTitle: 'Rainfall (mm)',
                  beginAtZero: true
                })} 
                ref={chirpsChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-15 hover:h-48">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">ERA5 - </b><span style={{fontSize: "17px"}} className="">Reconstructed past weather & climate variables</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={era5ChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'NDMI Values',
                  beginAtZero: true
                })} 
                ref={era5ChartRef} 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-15 hover:h-48">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">MERRA2 - </b><span style={{fontSize: "17px"}} className="">Climate forcing + weather reconstruction with aerosols & energy balance</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={merra2ChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })}
                ref={merra2ChartRef}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-15 hover:h-48">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">TRMM - </b><span style={{fontSize: "17px"}} className="">Precipitation in tropical & subtropical regions</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={trmmChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })}
                ref={trmmChartRef}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div style={{display: "flex",flexDirection: "column",overflowY: "hidden", transitionDuration: "200ms", transitionTimingFunction: "linear", transitionProperty: "all"}} className="flex items-center mb-0 h-15 hover:h-48">
              <h3 style={{borderBottom: "1px solid rgba(0,0,0,0.2)"}} className="text-lg w-full pl-2 pb-0.5"><b className="font-semibold">GPM - </b><span style={{fontSize: "17px"}} className="">Real-time rainfall, snow, global hydrological cycle</span></h3>
  
              <div style={{fontSize: "14px",borderBottom: "1px solid rgba(0,0,0,0.2)"}} class="chart-info-content pl-2 pr-2 pb-1">
                <p id="defination">It measures the <b>amount and health of green vegetation</b> by comparing how plants reflect near-infrared (NIR) light and absorb red light.</p>
                <p id="scale-range">Range: -1 to +1</p>
                <p id="scale-increase"><b>Increase</b>: Vigorous plant growth, high leaf area.</p>
                <p id="scale-decrease"><b>Decrease</b>: Sparse or stressed vegetation.</p>
              </div>
          
            </div>
            <div className="h-80">
              <Line 
                data={gpmChartData} 
                options={getChartOptions('Soil Moisture Over Time', {
                  yAxisTitle: 'Moisture (%)',
                  beginAtZero: true
                })}
                ref={gpmChartRef}
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
              {rainfallData.recommendations?.map((recommendation, index) => (
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
              
              {!rainfallData.recommendations?.length && (
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
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-100 lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-blue-600 mr-3">
                <FontAwesomeIcon icon={faSeedling} size="lg" />
              </span>
              <h3 className="text-lg font-semibold">Recommended Crops for Current Rainfall Conditions</h3>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm border-l-4 border-blue-400">
              <p className="font-medium">Crops most suitable based on current rainfall patterns and precipitation levels</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faDroplet} className="mr-2" />
                  <span>High Rainfall</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.highRainfall.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faWater} className="mr-2" />
                  <span>Moderate Rainfall</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.moderateRainfall.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faSun} className="mr-2" />
                  <span>Low Rainfall</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.lowRainfall.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faTint} className="mr-2" />
                  <span>Seasonal Rain Dependent</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.seasonalRain.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-cyan-50 text-cyan-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-b pb-3">
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faLeaf} className="mr-2" />
                  <span>Monsoon Dependent</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.monsoonDependent.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-purple-50 text-purple-800 rounded-lg text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                  <FontAwesomeIcon icon={faSeedling} className="mr-2" />
                  <span>Drought Resistant</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.droughtResistant.map((crop, index) => (
                    <span key={index} className="px-3 py-1.5 bg-orange-50 text-orange-800 rounded-lg text-sm">
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

export default RainfallAnalysis;

