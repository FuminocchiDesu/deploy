import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
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
    const checkAuthStatus = () => {
      const ownerToken = localStorage.getItem('ownerToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      // If no tokens exist, user is definitely not authenticated
      if (!ownerToken && !refreshToken) {
        setIsOwnerAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Simple JWT expiry check
        if (ownerToken) {
          const tokenData = JSON.parse(atob(ownerToken.split('.')[1]));
          const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
          
          if (Date.now() >= expirationTime) {
            // Token has expired
            handleOwnerLogout();
          } else {
            setIsOwnerAuthenticated(true);
          }
        } else {
          setIsOwnerAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking token:', error);
        handleOwnerLogout();
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleOwnerLogin = () => {
    setIsOwnerAuthenticated(true);
  };

  const handleOwnerLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('ownerToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('coffeeShopId');
    
    // Don't clear rememberMe related items
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe) {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberMe');
    }
    
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