import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/UserSide/Login';
import Register from './components/UserSide/Register';
import CoffeeShops from './components/UserSide/CoffeeShops';
import CoffeeShopDetails from './components/UserSide/CoffeeShopDetails';
import RatingForm from './components/UserSide/RatingForm';
import AdminLogin from './components/AdminSide/AdminLogin';
import OwnerDashboard from './components/AdminSide/OwnerDashboard';
import UserProfile from './components/UserSide/UserProfile';
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
  const navigate = useNavigate();

  const handleLoginWithRedirect = () => {
    handleLogin();
    navigate('/coffee-shops');
  };

  return (
    <div className="content">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login onLogin={handleLoginWithRedirect} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={handleOwnerLogin} />} />
        <Route path="/profile" element={<UserProfile/>}/>

        {/* Protected routes */}
        <Route path="/coffee-shops" element={isAuthenticated ? <CoffeeShops handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/coffee-shop/:id" element={isAuthenticated ? <CoffeeShopDetails /> : <Navigate to="/login" />} />
        <Route path="/rate/:id" element={isAuthenticated ? <RatingForm /> : <Navigate to="/login" />} />

        {/* Owner routes */}
        <Route 
          path="/owner-dashboard/:id" 
          element={isOwnerAuthenticated ? <OwnerDashboard handleOwnerLogout={handleOwnerLogout} /> : <Navigate to="/admin-login" />} 
        />

        {/* Default route */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/coffee-shops" /> :
          isOwnerAuthenticated ? <Navigate to={`/owner-dashboard/${localStorage.getItem('coffeeShopId')}`} /> :
          <Navigate to="/login" />
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;