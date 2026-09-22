import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Cloud, Thermometer, Droplets, CloudRain, Info, TrendingUp, Calendar } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { fetchFieldData, getWeatherByCoordinates } from "../../services/dataService.js";

const WeatherAnalysis = ({ dateRange, fieldIDselected, onDateRangeChange, showDateRangePicker, setShowDateRangePicker }) => {
  const { selectedField } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({
    temperature: [],
    humidity: [],
    rainfall: [],
  });

  useEffect(() => {
    const getFieldWeather = async () => {
      if (!selectedField || !fieldIDselected) return;

      try {
        setLoading(true);

        const field = await fetchFieldData(fieldIDselected);
        if (!field?.coordinates?.length) {
          setWeatherData({ temperature: [], humidity: [], rainfall: [] });
          return;
        }

        const n = field.coordinates.length;
        const centroid = field.coordinates.reduce(
          (acc, p) => ({
            lat: acc.lat + (Number(p.lat) || 0) / n,
            lng: acc.lng + (Number(p.lng) || 0) / n,
          }),
          { lat: 0, lng: 0 }
        );

        const weather = await getWeatherByCoordinates(
          centroid.lat,
          centroid.lng,
          dateRange?.startDate,
          dateRange?.endDate
        );

        setWeatherData({
          temperature: Array.isArray(weather?.temperature) ? weather.temperature : [],
          humidity: Array.isArray(weather?.humidity) ? weather.humidity : [],
          rainfall: Array.isArray(weather?.rainfall) ? weather.rainfall : [],
        });

      } catch (error) {
        console.error(error);
        setWeatherData({ temperature: [], humidity: [], rainfall: [] });
      } finally {
        setLoading(false);
      }
    };

    getFieldWeather();
  }, [selectedField, fieldIDselected, dateRange]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStats = (data) => {
    if (!data || data.length === 0) return { avg: 0, max: 0, min: 0, trend: 0 };
    
    const values = data.map(item => item.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = values[values.length - 1] - values[0];
    
    return { avg: avg.toFixed(1), max, min, trend: trend.toFixed(1) };
  };

  const tempStats = getStats(weatherData.temperature);
  const humidityStats = getStats(weatherData.humidity);
  const rainfallStats = getStats(weatherData.rainfall);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading weather data...</p>
        </div>
      </div>
    );
  }

  const hasData = weatherData.temperature.length > 0 || weatherData.humidity.length > 0 || weatherData.rainfall.length > 0;

  if (!hasData) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
        <div className="text-center">
          <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Weather Data Available</h3>
          <p className="text-gray-500">Please select a field and date range to view weather analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Cloud className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Weather Analysis</h2>
        </div>
        <div className="flex items-center gap-2 text-blue-100">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {weatherData.temperature.length > 0 && 
              `${formatDate(weatherData.temperature[0].date)} - ${formatDate(weatherData.temperature[weatherData.temperature.length - 1].date)}`
            }
          </span>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            onClick={() => setShowDateRangePicker && setShowDateRangePicker(!showDateRangePicker)}
          >
            {showDateRangePicker ? 'Hide Date Range' : 'Select Date Range'}
          </button>

        {showDateRangePicker && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-sm text-gray-600">Start</label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={dateRange?.startDate || ''}
                onChange={onDateRangeChange}
                className="border rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-sm text-gray-600">End</label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={dateRange?.endDate || ''}
                onChange={onDateRangeChange}
                className="border rounded-md px-2 py-1 text-sm"
              />
            </div>
            <button
              type="button"
              className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
              onClick={() => setShowDateRangePicker && setShowDateRangePicker(false)}
            >
              Apply
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temperature Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Thermometer className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Temperature</h3>
                <p className="text-2xl font-bold text-red-600">{tempStats.avg}°C</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-4 w-4 ${tempStats.trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={tempStats.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {tempStats.trend > 0 ? '+' : ''}{tempStats.trend}°C
                </span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400">Max:</span> {tempStats.max}°C
              </div>
              <div>
                <span className="text-gray-400">Min:</span> {tempStats.min}°C
              </div>
            </div>
          </div>
        </div>

        {/* Humidity Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Humidity</h3>
                <p className="text-2xl font-bold text-blue-600">{humidityStats.avg}%</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-4 w-4 ${humidityStats.trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={humidityStats.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {humidityStats.trend > 0 ? '+' : ''}{humidityStats.trend}%
                </span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400">Max:</span> {humidityStats.max}%
              </div>
              <div>
                <span className="text-gray-400">Min:</span> {humidityStats.min}%
              </div>
            </div>
          </div>
        </div>

        {/* Rainfall Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CloudRain className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Rainfall</h3>
                <p className="text-2xl font-bold text-green-600">{rainfallStats.avg}mm</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <TrendingUp className={`h-4 w-4 ${rainfallStats.trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={rainfallStats.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {rainfallStats.trend > 0 ? '+' : ''}{rainfallStats.trend}mm
                </span>
              </div>
              <div className="mt-1">
                <span className="text-gray-400">Max:</span> {rainfallStats.max}mm
              </div>
              <div>
                <span className="text-gray-400">Min:</span> {rainfallStats.min}mm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        {/* Temperature and Humidity Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Temperature Chart */}
          {weatherData.temperature.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="h-4 w-4 text-red-600" />
                <h3 className="text-base font-semibold text-gray-800">Temperature Trend</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData.temperature}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => [`${value}°C`, 'Temperature']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 4, fill: '#dc2626' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Humidity Chart */}
          {weatherData.humidity.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="h-4 w-4 text-blue-600" />
                <h3 className="text-base font-semibold text-gray-800">Humidity Levels</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData.humidity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => [`${value}%`, 'Humidity']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 4, fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Rainfall Chart - Single Row */}
        {weatherData.rainfall.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CloudRain className="h-4 w-4 text-green-600" />
              <h3 className="text-base font-semibold text-gray-800">Rainfall Data</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherData.rainfall}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#6b7280"
                    fontSize={10}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={10}
                  />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value) => [`${value}mm`, 'Rainfall']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 4, fill: '#16a34a' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherAnalysis;