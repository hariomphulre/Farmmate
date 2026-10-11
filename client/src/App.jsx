import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import ClimateAnalysis from './pages/ClimateAnalysis';
import FarmConsole from './pages/FarmConsole';
import AIAssistant from './pages/AIAssistant';
import CropManagement from './pages/CropManagement';
import CreateField from './pages/CreateField';
import Fields from './pages/Fields';
import FieldDetail from './pages/FieldDetail';
import EditField from './pages/EditField';
import FinancialAid from './pages/FinancialAid';
import WaterManagement from './pages/WaterManagement';
import PlantDiseaseDetection from './pages/PlantDiseaseDetection';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import VegetationAnalysis from './components/climate/VegetationAnalysis';
import SoilLandAnalysis from './components/climate/SoilLandAnalysis';
import WaterIrrigationAnalysis from './components/climate/WaterIrrigationAnalysis';
import RainfallAnalysis from './components/climate/RainfallAnalysis';
import TraderLayout from './components/layout/Trader/TraderLayout';
import TraderDashboard from './pages/Trader/TraderDashboard';
import MarketPrice from './pages/Trader/MarketPrice';
import EventManagement from './components/Trader/EventManagement';
import farmers from './components/Trader/connectiondata';
import Connections from './components/Trader/Connections';
import TranslateComponent from './components/TranslateComponent';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <TranslateComponent />
        <Router>
          <Routes>
            {/* Public route - only accessible when logged out */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Farmer protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['Farmer']} />}>
              <Route element={<Layout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="climate" element={<ClimateAnalysis />} />
                <Route path="farm-console" element={<FarmConsole />} />
                <Route path="crop-management" element={<CropManagement />} />
                <Route path="crop-planning" element={<CropManagement />} />
                <Route path="crop-health" element={<CropManagement />} />
                <Route path="financial-aid" element={<FinancialAid />} />
                <Route path="water-management" element={<WaterManagement />} />
                <Route path="irrigation" element={<WaterManagement />} />
                <Route path="market-price" element={<MarketPrice />} />
                <Route path="reports" element={<h1>Reports Page (Coming Soon)</h1>} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="soil" element={<SoilLandAnalysis />} />
                <Route path="vegetation" element={<VegetationAnalysis />} />
                <Route path="water" element={<WaterIrrigationAnalysis dateRange={{ startDate: '2025-01-01', endDate: '2025-09-01' }} />} />
                <Route path="rainfall" element={<RainfallAnalysis dateRange={{ startDate: '2025-01-01', endDate: '2025-09-01' }} />} />
                <Route path="create-field" element={<CreateField />} />
                <Route path="field-list" element={<Fields />} />
                <Route path="field-detail/:id" element={<FieldDetail />} />
                <Route path="edit-field/:id" element={<EditField />} />
                <Route path="plant-disease-detection" element={<PlantDiseaseDetection />} />
              </Route>
            </Route>

            {/* Trader protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['Trader']} />}>
              <Route path="/trader" element={<TraderLayout />}>
                <Route index element={<Navigate to="/trader/dashboard" replace />} />
                <Route path="dashboard" element={<TraderDashboard />} />
                <Route path="market-price" element={<MarketPrice />} />
                <Route path="event-management" element={<EventManagement />} />
                <Route path="connections" element={<Connections farmersData={farmers} />} />
                <Route path="*" element={<h1>Trader Page Not Found</h1>} />
              </Route>
            </Route>

            {/* Dedicated logout route */}
            <Route path="/logout" element={<Logout />} />

            {/* Global fallback route */}
            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
