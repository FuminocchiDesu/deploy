import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminSide/AdminLogin';
import AdminDashboard from './components/AdminSide/AdminDashboard';
import PageSettings from './components/AdminSide/PageSettings';
import MenuPage from './components/AdminSide/MenuPage';
import ReviewsPage from './components/AdminSide/ReviewsPage';
import './App.css';

const App = () => {
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(null);

  useEffect(() => {
    const ownerToken = localStorage.getItem('ownerToken');
    if (ownerToken) {
      setIsOwnerAuthenticated(true);
    } else {
      setIsOwnerAuthenticated(false);
    }
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
          path="/dashboard" 
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
          path="/dashboard/menu" 
          element={
            isOwnerAuthenticated 
              ? <MenuPage handleOwnerLogout={handleOwnerLogout} /> 
              : <Navigate to="/admin-login" />
          } 
        />

        <Route 
          path="/dashboard/reviews" 
          element={
            isOwnerAuthenticated 
              ? <ReviewsPage handleOwnerLogout={handleOwnerLogout} /> 
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
