import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminSide/AdminLogin';
// import CoffeeShopSettings from './components/AdminSide/CoffeeShopSettings'; // Comment this out for now
import "./App.css";

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
        
        {/* CoffeeShopSettings route - Commented out for now */}
        {/* <Route path="/coffee-shop-settings" element={isOwnerAuthenticated ? <CoffeeShopSettings /> : <Navigate to="/admin-login" />} /> */}

        {/* Other routes... */}

        {/* Default route */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/coffee-shops" /> :
          isOwnerAuthenticated ? <Navigate to={`/owner-dashboard/${localStorage.getItem('coffeeShopId')}`} /> :
          <Navigate to="/admin-login" />
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
