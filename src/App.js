import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MerchantSignup from './pages/Auth/MerchantSignup';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Merchant/Dashboard';
import Office from './pages/Employee/Office';
import Warehouse from './pages/Employee/Warehouse';
import Packaging from './pages/Employee/Packaging';
import Support from './pages/Employee/Support';
import Confirmation from './pages/Employee/Confirmation'; // ← هذا السطر ضروري
import Admin from './pages/Admin/Admin';
import WarehouseManager from './pages/Employee/WarehouseManager';
import { AuthProvider } from './context/AuthContext';
import ReturnPage from './pages/Public/ReturnPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<MerchantSignup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/office" element={<Office />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="/support" element={<Support />} />
          <Route path="/confirmation" element={<Confirmation />} /> {/* اختياري: اجعل المسار صغير الحروف */}
          <Route path="/warehouse-manager" element={<WarehouseManager />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/return" element={<ReturnPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;