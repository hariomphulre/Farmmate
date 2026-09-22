import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ClimateAnalysis from './pages/ClimateAnalysis';
import FarmConsole from './pages/FarmConsole';
import AIAssistant from './pages/AIAssistant';
import CropManagement from './pages/CropManagement';
import CreateField from './pages/CreateField';
import Fields from './pages/Fields';
import FieldDetail from './pages/FieldDetail';
import FinancialAid from './pages/FinancialAid';
import WaterManagement from './pages/WaterManagement';
import PlantDiseaseDetection from './pages/PlantDiseaseDetection';
import { AppProvider } from './context/AppContext';
import VegetationAnalysis from './components/climate/VegetationAnalysis';
import SoilLandAnalysis from './components/climate/SoilLandAnalysis';
import FireAnalysis from './components/climate/FireAnalysis';
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
    <AppProvider>
      <TranslateComponent />
      <Router>
        <Routes>
          <Route path="/" element={<Auth/>} />

          {/* Farmer layout */}
          <Route path="/" element={<Layout />}>
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
            <Route path="fire" element={<FireAnalysis />} />
            <Route path="water" element={<WaterIrrigationAnalysis dateRange={{ startDate: '2025-01-01', endDate: '2025-09-01' }} />} />
            <Route path="rainfall" element={<RainfallAnalysis dateRange={{ startDate: '2025-01-01', endDate: '2025-09-01' }} />} />
            <Route path="create-field" element={<CreateField />} />
            <Route path="field-list" element={<Fields />} />
            <Route path="field-detail/:id" element={<FieldDetail />} />
            <Route path="plant-disease-detection" element={<PlantDiseaseDetection />} />

            <Route path="*" element={<h1>Page Not Found</h1>} />
          </Route>

          {/* Trader layout */}
          <Route path="/trader" element={<TraderLayout />}>
            <Route path="dashboard" element={<TraderDashboard />} />
            <Route path="market-price" element={<MarketPrice />} />
            <Route path="*" element={<h1>Trader Page Not Found</h1>} />
            <Route path='event-management' element={<EventManagement/>}/>
            <Route path='connections' element={<Connections farmersData={farmers}/>}/>
          </Route>

        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
