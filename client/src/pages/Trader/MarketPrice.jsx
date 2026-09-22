import { useState } from "react";
import { Search, TrendingUp, MapPin, Package, Filter, Download, RefreshCw } from "lucide-react";

export default function App() {
  const [data, setData] = useState([]);
  const [commodity, setCommodity] = useState("Soyabean");
  const [state, setState] = useState("Maharashtra");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_KEY = import.meta.env.VITE_DATA_GOV_API_KEY;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (!API_KEY) {
        throw new Error('VITE_DATA_GOV_API_KEY is not set');
      }
      const encState = encodeURIComponent(state);
      const encCommodity = encodeURIComponent(commodity);
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&limit=20&filters[state]=${encState}&filters[commodity]=${encCommodity}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || 'Upstream API error');
      }
      setData(Array.isArray(json.records) ? json.records : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['District', 'Market', 'Commodity', 'Variety', 'Min Price', 'Max Price', 'Modal Price'],
      ...data.map(row => [
        row.district, row.market, row.commodity, row.variety, 
        row.min_price, row.max_price, row.modal_price
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-prices-${state}-${commodity}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agricultural Market Prices</h1>
              <p className="text-sm text-gray-600">Real-time commodity pricing across Indian markets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4" />
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option>Maharashtra</option>
                <option>Andhra Pradesh</option>
                <option>Madhya Pradesh</option>
                <option>Uttar Pradesh</option>
                <option>Karnataka</option>
                <option>Gujarat</option>
                <option>Rajasthan</option>
                <option>Punjab</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Package className="w-4 h-4" />
                Commodity
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option>Soyabean</option>
                <option>Onion</option>
                <option>Wheat</option>
                <option>Tomato</option>
                <option>Cotton</option>
                <option>Rice</option>
                <option>Sugarcane</option>
                <option>Potato</option>
              </select>
            </div>

            <div className="md:col-span-2 flex items-end gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'Searching...' : 'Search Prices'}
              </button>

              {data.length > 0 && (
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {data.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Market Prices</h3>
                  <p className="text-sm text-gray-600">{data.length} records found for {commodity} in {state}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live Data
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">District</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Market</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commodity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variety</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Price (₹)</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Price (₹)</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Modal Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.district}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.market}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {row.commodity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.variety}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono">
                        {row.min_price ? `₹${parseFloat(row.min_price).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono">
                        {row.max_price ? `₹${parseFloat(row.max_price).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-blue-600 font-mono">
                          {row.modal_price ? `₹${parseFloat(row.modal_price).toLocaleString('en-IN')}` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
            <p className="text-gray-600 mb-6">Click "Search Prices" to fetch market data for the selected state and commodity.</p>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
              Get Started
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data sourced from Government of India's Open Data Platform</p>
        </div>
      </div>
    </div>
  );
}