import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminSide/AdminLogin';
import AdminDashboard from './components/AdminSide/AdminDashboard';
import PageSettings from './components/AdminSide/PageSettings';
import axios from 'axios';
import './App.css';

const App = () => {
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      const ownerToken = localStorage.getItem('ownerToken');
      if (ownerToken) {
        try {
          // Replace with your actual API endpoint for token validation
          const response = await axios.post('https://khlcle.pythonanywhere.com/api/validate-token/', {}, {
            headers: { Authorization: `Bearer ${ownerToken}` }
          });
          setIsOwnerAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('ownerToken');
          localStorage.removeItem('coffeeShopId');
          setIsOwnerAuthenticated(false);
        }
      } else {
        setIsOwnerAuthenticated(false);
      }
    };

    validateToken();
  }, []);

  const handleOwnerLogin = () => {
    setIsOwnerAuthenticated(true);
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('coffeeShopId');
    setIsOwnerAuthenticated(false);
  };

  if (isOwnerAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
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
              ? <PageSettings handleOwnerLogout={handleOwnerLogout} /> 
              : <Navigate to="/admin-login" />
          } 
        />

        <Route 
          path="/dashboard/page-settings/:id" 
          element={
            isOwnerAuthenticated 
              ? <PageSettings handleOwnerLogout={handleOwnerLogout} /> 
              : <Navigate to="/admin-login" />
          } 
        />

        <Route path="/" element={<Navigate to={isOwnerAuthenticated ? "/dashboard" : "/admin-login"} />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;