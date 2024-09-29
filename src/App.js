import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminSide/AdminLogin';
import AdminDashboard from './components/AdminSide/AdminDashboard'; // Correct import for AdminDashboard
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const ownerToken = localStorage.getItem('ownerToken');
    setIsAuthenticated(!!token);
    setIsOwnerAuthenticated(!!ownerToken);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleOwnerLogin = () => {
    setIsOwnerAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('coffeeShopId');
    setIsOwnerAuthenticated(false);
  };

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        isOwnerAuthenticated={isOwnerAuthenticated}
        handleLogin={handleLogin}
        handleOwnerLogin={handleOwnerLogin}
        handleLogout={handleLogout}
        handleOwnerLogout={handleOwnerLogout}
      />
    </Router>
  );
};

const AppContent = ({ isAuthenticated, isOwnerAuthenticated, handleLogin, handleOwnerLogin, handleLogout, handleOwnerLogout }) => {
  return (
    <div className="content">
      <Routes>
        {/* Public routes */}
        <Route path="/admin-login" element={<AdminLogin onLogin={handleOwnerLogin} />} />
        
        {/* Admin dashboard */}
        <Route path="/dashboard" element={isOwnerAuthenticated ? <AdminDashboard /> : <Navigate to="/admin-login" />} />

        {/* Default route */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" /> :
          isOwnerAuthenticated ? <Navigate to="/dashboard" /> :
          <Navigate to="/admin-login" />
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
