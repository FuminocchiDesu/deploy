import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminSide/AdminLogin';
import AdminDashboard from './components/AdminSide/AdminDashboard';
import PageSettings from './components/AdminSide/PageSettings'; // Import the PageSettings component
import './App.css';

const App = () => {
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);

  useEffect(() => {
    const ownerToken = localStorage.getItem('ownerToken');
    setIsOwnerAuthenticated(!!ownerToken);
  }, []);

  const handleOwnerLogin = () => {
    setIsOwnerAuthenticated(true);
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('coffeeShopId');
    setIsOwnerAuthenticated(false);
  };

  return (
    <Router>
      <AppContent
        isOwnerAuthenticated={isOwnerAuthenticated}
        handleOwnerLogin={handleOwnerLogin}
        handleOwnerLogout={handleOwnerLogout}
      />
    </Router>
  );
};

const AppContent = ({ isOwnerAuthenticated, handleOwnerLogin, handleOwnerLogout }) => {
  return (
    <div className="content">
      <Routes>
        <Route 
          path="/admin-login" 
          element={
            isOwnerAuthenticated 
              ? <Navigate to="/dashboard" /> 
              : <AdminLogin onLogin={handleOwnerLogin} />
          } 
        />
        
        <Route 
          path="/dashboard/*" 
          element={
            isOwnerAuthenticated 
              ? <AdminDashboard handleOwnerLogout={handleOwnerLogout} /> 
              : <Navigate to="/admin-login" />
          } 
        />

        <Route 
          path="/dashboard/page-settings" 
          element={
            isOwnerAuthenticated 
              ? <PageSettings /> 
              : <Navigate to="/admin-login" />
          } 
        />

        <Route path="/" element={<Navigate to={isOwnerAuthenticated ? "/dashboard" : "/admin-login"} />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;