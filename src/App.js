import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd'; // Import Ant Design components
import AdminLogin from './components/AdminSide/AdminLogin';
import AdminDashboard from './components/AdminSide/AdminDashboard';
import PageSettings from './components/AdminSide/PageSettings';
import MenuPage from './components/AdminSide/MenuPage';
import ReviewsPage from './components/AdminSide/ReviewsPage';
import UserProfile from './components/AdminSide/UserProfile';
import ForgotPassword from './components/AdminSide/ForgotPassword';
import './App.css';

const App = () => {
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ownerToken = localStorage.getItem('ownerToken');

    if (ownerToken) {
      setIsOwnerAuthenticated(true);
    } else {
      setIsOwnerAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  const handleOwnerLogin = () => {
    setIsOwnerAuthenticated(true);
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('coffeeShopId');
    setIsOwnerAuthenticated(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#a0522d',
        },
        components: {
          Button: {
            colorPrimary: '#a0522d',
            colorPrimaryHover: '#8B4513',
            colorPrimaryActive: '#8B4513',
            defaultBg: '#ffffff',
            defaultColor: '#a0522d',
            defaultBorderColor: '#a0522d',
          },
        },
      }}
    >
      <AntApp>
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
            <Route 
              path="/dashboard/profile" 
              element={
                isOwnerAuthenticated 
                  ? <UserProfile handleOwnerLogout={handleOwnerLogout} /> 
                  : <Navigate to="/admin-login" />
              } 
            />
            <Route path="/" element={<Navigate to={isOwnerAuthenticated ? "/dashboard" : "/admin-login"} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;