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
import axios from 'axios';
import './App.css';

const App = () => {
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const ownerToken = localStorage.getItem('ownerToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
  
      if (!ownerToken && !refreshToken && !rememberMe) {
        setIsOwnerAuthenticated(false);
        setIsLoading(false);
        return;
      }
  
      try {
        if (ownerToken) {
          const tokenData = JSON.parse(atob(ownerToken.split('.')[1]));
          const expirationTime = tokenData.exp * 1000;
  
          if (Date.now() >= expirationTime) {
            // Access token has expired
            if (rememberMe) {
              // Refresh the access token using the refresh token
              const response = await axios.post('https://khlcle.pythonanywhere.com/api/owner/refresh/', {
                refresh: refreshToken,
              });
              localStorage.setItem('ownerToken', response.data.access);
              setIsOwnerAuthenticated(true);
            } else {
              // Clear all auth-related data and log out the user
              handleOwnerLogout();
            }
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