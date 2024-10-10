import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import SidebarMenu from './SideBarMenu'; // Adjust the import path as necessary

import './SharedStyles.css';

const AdminDashboard = ({ handleOwnerLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/dashboard/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <User className="menu-icon" />
          <span className="admin-title">Admin</span>
          <Bell className="menu-icon" />
        </div>
        <div className="sidebar-search">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activeMenuItem === item.name ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={onLogout}>
          <LogOut className="menu-icon" />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <h1>Dashboard</h1>
        </header>

        <div className="dashboard-content">
          <div className="card">
            <h2 className="card-title">Visits Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.visits_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visits" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <h2 className="card-title">Favorites</h2>
              <p className="stat-value">{dashboardData.favorite_count}</p>
              <p>Users have favorited your coffee shop</p>
            </div>

            <div className="card">
              <h2 className="card-title">Recent Reviews</h2>
              {dashboardData.recent_reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <p>{review.content}</p>
                  <p className="review-author">- {review.author}</p>
                  <p className="review-rating">Rating: {review.rating}/5</p>
                </div>
              ))}
              <button className="button primary" onClick={() => navigate('/dashboard/reviews')}>
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;