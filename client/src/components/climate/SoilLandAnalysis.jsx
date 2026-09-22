import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSeedling,
  faInfoCircle,
  faTriangleExclamation,
  faFlask,
  faLeaf,
  faTint,
  faTemperatureHigh,
  faLayerGroup,
  faChartBar,
  faDownload,
  faCalendarAlt,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, BarElement, CategoryScale, LinearScale, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAppContext } from '../../context/AppContext';
import { fetchSoilData } from '../../services/climateService';

// Register ChartJS components
ChartJS.register(
  LineElement,
  PointElement, 
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SoilLandAnalysis = ({ dateRange, loading, setLoading }) => {
  const { selectedField, selectedLocation } = useAppContext();
  const [soilData, setSoilData] = useState({
    soilType: '',
    ph: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    magnesium: 0,
    calcium: 0,
    sulfur: 0,
    zinc: 0,
    organicMatter: 0,
    cec: 0, // Cation Exchange Capacity
    waterCapacity: 0,
    soilTemperature: 0,
    soilCompaction: 0,
    recommendations: [],
    history: [] // Historical soil test data
  });
  
  useEffect(() => {
    loadSoilData();
  }, [selectedField, selectedLocation, dateRange]);
  
  const loadSoilData = async () => {
    setLoading(true);
    try {
      const data = await fetchSoilData(
        selectedField, 
        selectedLocation, 
        dateRange
      );
      setSoilData(data);
    } catch (error) {
      console.error('Error loading soil data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="Analytics">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FontAwesomeIcon icon={faSeedling} className="text-amber-700 mr-2" />
          Soil & Land Analysis
        </h2>
        <p className="text-gray-600">
          Monitor soil health, nutrient levels, and get recommendations for optimal crop growth.
        </p>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faInfoCircle} className="text-amber-600 mt-1 mr-2" />
            <div>
              <h3 className="font-medium text-amber-800">Soil Nutrient Status</h3>
              <p className="text-sm">
                Comprehensive soil analysis helps determine plant health, nutrient deficiencies, and fertilizer requirements. 
                Regular soil testing is recommended every 2-3 years.
              </p>              
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner border-t-4 border-amber-500 border-solid rounded-full w-12 h-12 mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600">Loading soil data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Soil Overview */}
          <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faLayerGroup} className="text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold">Soil Overview</h3>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faSeedling} className="text-amber-700 text-lg mr-3" />
                <div>
                  <h4 className="font-semibold text-amber-800">Field Soil Classification</h4>
                  <p className="text-amber-900 text-lg font-bold">{soilData.soilType || "Clay Loam"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Soil Type:
                </span>
                <span className="font-medium">{soilData.soilType || "Clay Loam"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  pH Level:
                </span>
                <div className="flex items-center">
                  <span className={`font-medium ${
                    (soilData.ph || 6.5) < 5.5 ? 'text-red-600' : 
                    (soilData.ph || 6.5) > 7.5 ? 'text-blue-600' : 
                    'text-green-600'
                  }`}>
                    {soilData.ph || 6.5}
                  </span>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                    {(soilData.ph || 6.5) < 5.5 ? 'Acidic' : 
                    (soilData.ph || 6.5) > 7.5 ? 'Alkaline' : 
                    'Optimal'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Organic Matter:
                </span>
                <span className="font-medium">{soilData.organicMatter || 3.2}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  CEC:
                </span>
                <span className="font-medium">{soilData.cec || 14.8} meq/100g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Water Capacity:
                </span>
                <span className="font-medium">{soilData.waterCapacity || 0.21} g/cm³</span>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Soil Health Score</h4>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-green-500 h-3 rounded-full shadow-inner" 
                    style={{ width: `${(soilData.organicMatter || 3.2) / 5 * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="flex items-center justify-center w-full py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md text-sm font-medium transition-colors border border-amber-200">
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download Soil Report
              </button>
            </div> */}
          </div>
          
          {/* Enhanced Nutrient Levels - Visual Chart */}
          <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faFlask} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Nutrient Analysis</h3>
              </div>
              <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center">
                <FontAwesomeIcon icon={faHistory} className="mr-1" />
                History
              </button>
            </div>
            
            <div className="h-64 mb-4">
              {/* We would use Radar chart for nutrient levels comparison */}
              <Radar
                data={{
                  labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Magnesium (Mg)', 'Calcium (Ca)', 'Sulfur (S)'],
                  datasets: [
                    {
                      label: 'Current Levels',
                      data: [
                        soilData.nitrogen || 45,
                        soilData.phosphorus || 32, 
                        soilData.potassium || 180, 
                        soilData.magnesium || 58,
                        soilData.calcium || 1200,
                        soilData.sulfur || 15
                      ],
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      borderColor: 'rgb(75, 192, 192)',
                      pointBackgroundColor: 'rgb(75, 192, 192)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgb(75, 192, 192)'
                    },
                    {
                      label: 'Optimal Levels',
                      data: [60, 40, 200, 60, 1500, 20],
                      backgroundColor: 'rgba(255, 159, 64, 0.2)',
                      borderColor: 'rgb(255, 159, 64)',
                      pointBackgroundColor: 'rgb(255, 159, 64)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgb(255, 159, 64)'
                    }
                  ]
                }}
                options={{
                  scales: {
                    r: {
                      angleLines: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                      },
                      beginAtZero: true,
                      ticks: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 12,
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 border border-gray-200 rounded bg-green-50">
                <div className="font-medium">Nitrogen</div>
                <div className="flex justify-between mt-1">
                  <span>{soilData.nitrogen || 45}</span>
                  <span className="text-gray-500">kg/ha</span>
                </div>
                <div className={`mt-1 ${(soilData.nitrogen || 45) < 30 ? 'text-red-600' : (soilData.nitrogen || 45) < 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {(soilData.nitrogen || 45) < 30 ? 'Low' : (soilData.nitrogen || 45) < 60 ? 'Medium' : 'Optimal'}
                </div>
              </div>
              
              <div className="p-2 border border-gray-200 rounded bg-orange-50">
                <div className="font-medium">Phosphorus</div>
                <div className="flex justify-between mt-1">
                  <span>{soilData.phosphorus || 32}</span>
                  <span className="text-gray-500">kg/ha</span>
                </div>
                <div className={`mt-1 ${(soilData.phosphorus || 32) < 20 ? 'text-red-600' : (soilData.phosphorus || 32) < 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {(soilData.phosphorus || 32) < 20 ? 'Low' : (soilData.phosphorus || 32) < 40 ? 'Medium' : 'Optimal'}
                </div>
              </div>
              
              <div className="p-2 border border-gray-200 rounded bg-blue-50">
                <div className="font-medium">Potassium</div>
                <div className="flex justify-between mt-1">
                  <span>{soilData.potassium || 180}</span>
                  <span className="text-gray-500">kg/ha</span>
                </div>
                <div className={`mt-1 ${(soilData.potassium || 180) < 100 ? 'text-red-600' : (soilData.potassium || 180) < 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {(soilData.potassium || 180) < 100 ? 'Low' : (soilData.potassium || 180) < 200 ? 'Medium' : 'Optimal'}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-md">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faInfoCircle} className="text-amber-500 mt-1 mr-2" />
                <div>
                  <h4 className="font-medium">Nutrient Status</h4>
                  <p className="text-sm text-gray-600">
                    {(soilData.nitrogen || 45) < 30 || (soilData.phosphorus || 32) < 20 || (soilData.potassium || 180) < 100 ? 
                      'Some nutrients are critically low. Check recommendations for fertilizer application.' :
                      (soilData.nitrogen || 45) < 60 || (soilData.phosphorus || 32) < 40 || (soilData.potassium || 180) < 200 ?
                      'Nutrient levels are below optimal. Consider supplementing for best crop yields.' :
                      'Nutrient levels are in good range for most crops.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Recommendations */}
          <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faLeaf} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Fertilizer Recommendations</h3>
            </div>

            <div className="space-y-4">
              {/* Nitrogen Recommendation */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-white border border-green-100 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold text-green-800">N</span>
                  </div>
                  <h4 className="font-medium text-gray-800">Nitrogen (N)</h4>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Current</div>
                    <div className="font-bold text-xl">{soilData.nitrogen || 45} <span className="text-xs text-gray-500">kg/ha</span></div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Target</div>
                    <div className="font-bold text-xl">60 <span className="text-xs text-gray-500">kg/ha</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Deficiency</div>
                    <div className="font-bold text-xl text-amber-700">{Math.max(0, 60 - (soilData.nitrogen || 45))} <span className="text-xs text-gray-500">kg/ha</span></div>
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  <p>Apply {Math.max(0, 60 - (soilData.nitrogen || 45))} kg/ha of nitrogen-rich fertilizer before next planting season.</p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                    <span>Consider using urea (46-0-0) or ammonium nitrate (34-0-0)</span>
                  </div>
                </div>
              </div>

              {/* Phosphorus Recommendation */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-white border border-yellow-100 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="font-bold text-yellow-800">P</span>
                  </div>
                  <h4 className="font-medium text-gray-800">Phosphorus (P)</h4>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Current</div>
                    <div className="font-bold text-xl">{soilData.phosphorus || 32} <span className="text-xs text-gray-500">kg/ha</span></div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Target</div>
                    <div className="font-bold text-xl">40 <span className="text-xs text-gray-500">kg/ha</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Deficiency</div>
                    <div className="font-bold text-xl text-amber-700">{Math.max(0, 40 - (soilData.phosphorus || 32))} <span className="text-xs text-gray-500">kg/ha</span></div>
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  <p>Apply {Math.max(0, 40 - (soilData.phosphorus || 32))} kg/ha of phosphatic fertilizer to improve root development and flowering.</p>
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                    <span>Consider using triple superphosphate (0-46-0) or DAP (18-46-0)</span>
                  </div>
                </div>
              </div>

              {/* Other Recommendations */}
              {soilData.recommendations?.map((rec, index) => (
                <div key={index} className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="font-medium text-gray-800">{rec.nutrient}</h4>
                  <p className="text-sm text-gray-600 mt-1">Current: <span className="font-medium">{rec.current}</span></p>
                  <p className="text-sm text-gray-600 mt-1">{rec.recommendation}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button className="text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center">
                View all recommendations 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Enhanced pH Interpretation */}
          <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faTint} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">pH Interpretation</h3>
              </div>
              <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center">
                <FontAwesomeIcon icon={faHistory} className="mr-1" />
                pH History
              </button>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-800">What is Soil pH?</h4>
              </div>
              <p className="text-sm text-gray-700">
                Soil pH measures acidity or alkalinity on a scale from 0-14. It affects nutrient availability, 
                microbial activity, and plant growth. Most crops prefer slightly acidic to neutral conditions (pH 6.0-7.0).
              </p>
            </div>
            
            <div className="relative h-16 mb-8">
              <div className="absolute inset-0 flex rounded-lg overflow-hidden">
                <div className="w-1/7 bg-gradient-to-r from-red-600 to-red-500"></div>
                <div className="w-1/7 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <div className="w-1/7 bg-gradient-to-r from-orange-500 to-yellow-400"></div>
                <div className="w-1/7 bg-gradient-to-r from-yellow-400 to-green-500"></div>
                <div className="w-1/7 bg-gradient-to-r from-green-500 to-blue-400"></div>
                <div className="w-1/7 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="w-1/7 bg-gradient-to-r from-blue-600 to-purple-700"></div>
              </div>
              
              <div className="absolute inset-x-0 top-0 flex justify-between px-2 text-xs font-medium pt-2">
                <span className="text-white">4.0</span>
                <span className="text-white">5.0</span>
                <span className="text-white">6.0</span>
                <span className="text-white">7.0</span>
                <span className="text-white">8.0</span>
                <span className="text-white">9.0</span>
                <span className="text-white">10.0</span>
              </div>
              
              <div className="absolute bottom-0 inset-x-0 flex justify-between px-2 text-xs font-medium pb-1">
                <span className="text-red-800">Very Acidic</span>
                <span className="text-orange-800">Acidic</span>
                <span className="text-green-800">Neutral</span>
                <span className="text-blue-800">Alkaline</span>
                <span className="text-purple-800">Very Alkaline</span>
              </div>
              
              {/* Enhanced pH pointer */}
              <div 
                className="absolute top-0 w-6 h-12 flex flex-col items-center justify-center"
                style={{ left: `${((soilData.ph || 6.5) - 4) / 6 * 100}%`, transform: 'translateX(-50%)' }}
              >
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-800"></div>
                <div className="mt-1 px-1.5 py-0.5 bg-white rounded border border-gray-300 font-bold text-xs shadow-sm">
                  {soilData.ph || 6.5}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 border rounded-lg hover:shadow-sm transition-shadow bg-gradient-to-b from-white to-red-50">
                <h4 className="font-medium text-red-700">Acidic (4.0-5.5)</h4>
                <p className="text-xs text-gray-600 mt-1">Suitable for acid-loving plants</p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <div className="bg-red-50 rounded p-1 text-xs">Blueberries</div>
                  <div className="bg-red-50 rounded p-1 text-xs">Potatoes</div>
                  <div className="bg-red-50 rounded p-1 text-xs">Azaleas</div>
                  <div className="bg-red-50 rounded p-1 text-xs">Strawberries</div>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg hover:shadow-sm transition-shadow bg-gradient-to-b from-white to-green-50">
                <h4 className="font-medium text-green-700">Neutral (6.0-7.0)</h4>
                <p className="text-xs text-gray-600 mt-1">Ideal for most crops</p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <div className="bg-green-50 rounded p-1 text-xs">Corn</div>
                  <div className="bg-green-50 rounded p-1 text-xs">Wheat</div>
                  <div className="bg-green-50 rounded p-1 text-xs">Soybeans</div>
                  <div className="bg-green-50 rounded p-1 text-xs">Vegetables</div>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg hover:shadow-sm transition-shadow bg-gradient-to-b from-white to-blue-50">
                <h4 className="font-medium text-blue-700">Alkaline (7.5-10.0)</h4>
                <p className="text-xs text-gray-600 mt-1">Suitable for alkaline-tolerant plants</p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <div className="bg-blue-50 rounded p-1 text-xs">Asparagus</div>
                  <div className="bg-blue-50 rounded p-1 text-xs">Beets</div>
                  <div className="bg-blue-50 rounded p-1 text-xs">Cabbage</div>
                  <div className="bg-blue-50 rounded p-1 text-xs">Cauliflower</div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
              <div className="flex items-start">
                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-1 mr-2" />
                <div>
                  <h4 className="font-medium">Your Soil pH Analysis</h4>
                  <p className="text-sm text-gray-600">
                    {(soilData.ph || 6.5) < 5.5 ? 
                      'Your soil is acidic. Consider adding agricultural lime to raise pH for most crops.' :
                      (soilData.ph || 6.5) > 7.5 ? 
                      'Your soil is alkaline. Consider adding sulfur or organic matter to lower pH for most crops.' :
                      'Your soil pH is in optimal range for most crops. Maintain current practices to preserve this balance.'}
                  </p>
                  
                  {(soilData.ph || 6.5) < 5.5 && (
                    <div className="mt-2 text-xs flex items-center bg-white px-2 py-1 rounded">
                      <FontAwesomeIcon icon={faLeaf} className="text-green-500 mr-1" />
                      <span>Recommended: Apply 50 kg/ha of agricultural lime</span>
                    </div>
                  )}
                  
                  {(soilData.ph || 6.5) > 7.5 && (
                    <div className="mt-2 text-xs flex items-center bg-white px-2 py-1 rounded">
                      <FontAwesomeIcon icon={faLeaf} className="text-green-500 mr-1" />
                      <span>Recommended: Apply 30 kg/ha of elemental sulfur</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Soil Physical Properties */}
          <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faTemperatureHigh} className="text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold">Soil Physical Properties</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <h4 className="text-sm text-gray-600 mb-1">Soil Temperature</h4>
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-gray-800">{soilData.soilTemperature || 22}°</span>
                  <span className="text-sm text-gray-500 ml-1">C</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">Optimal for germination</div>
              </div>
              
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <h4 className="text-sm text-gray-600 mb-1">Soil Compaction</h4>
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-gray-800">{soilData.soilCompaction || 1.2}</span>
                  <span className="text-sm text-gray-500 ml-1">g/cm³</span>
                </div>
                <div className="mt-1 text-xs text-green-600">Good rooting conditions</div>
              </div>
            </div>
            
            {/* Soil Texture */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Soil Texture Analysis</h4>
              <div className="h-48">
                <Doughnut 
                  data={{
                    labels: ['Sand', 'Silt', 'Clay'],
                    datasets: [{
                      data: [35, 40, 25],
                      backgroundColor: ['#f59e0b', '#60a5fa', '#ef4444'],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="text-xs text-center text-gray-500 mt-2">
                Your soil consists of 35% sand, 40% silt, and 25% clay, classifying it as a loam soil.
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <button className="flex items-center justify-center w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
                <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                Detailed Soil Properties Analysis
              </button>
            </div>
          </div>
          
          {/* Enhanced Soil Management Practices */}
          <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faSeedling} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Smart Soil Management</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
                <h4 className="font-medium text-green-800 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faLeaf} className="mr-2" />
                  Recommended Practices
                </h4>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</div>
                    <div>
                      <p className="text-sm font-medium">Apply Organic Matter</p>
                      <p className="text-xs text-gray-600">Add compost or manure to improve soil structure and water retention</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</div>
                    <div>
                      <p className="text-sm font-medium">Implement Crop Rotation</p>
                      <p className="text-xs text-gray-600">Alternate different crop families to prevent nutrient depletion</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</div>
                    <div>
                      <p className="text-sm font-medium">Use Cover Crops</p>
                      <p className="text-xs text-gray-600">Plant legumes or grasses during off-seasons to prevent erosion</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faFlask} className="mr-2" />
                  Soil Amendment Plan
                </h4>
                
                <div className="space-y-3">
                  <div className="p-2 bg-white rounded border border-blue-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Fertilizer Application</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p className="text-xs text-gray-600">Apply balanced NPK fertilizer based on soil test recommendations</p>
                    <div className="text-xs text-blue-600 mt-1">Scheduled: September 15, 2025</div>
                  </div>
                  
                  <div className="p-2 bg-white rounded border border-blue-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Lime Application</span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Not needed</span>
                    </div>
                    <p className="text-xs text-gray-600">Current pH is in optimal range, no lime needed</p>
                  </div>
                  
                  <div className="p-2 bg-white rounded border border-blue-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Compost Addition</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Recommended</span>
                    </div>
                    <p className="text-xs text-gray-600">Add 5 tons/ha of compost to improve soil structure</p>
                    <div className="text-xs text-blue-600 mt-1">Scheduled: October 5, 2025</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 flex flex-wrap gap-3 items-center justify-between">
              {/* <button className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-sm font-medium transition-colors flex items-center">
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Download Soil Management Plan
              </button> */}
              
              <div className="flex items-center text-sm text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                <span>Next soil health assessment: October 15, 2025</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilLandAnalysis;
