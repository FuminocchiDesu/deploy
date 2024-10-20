import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import SidebarMenu from './SideBarMenu'; // Import SidebarMenu

import './SharedStyles.css';

const AdminDashboard = ({ handleOwnerLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [filter, setFilter] = useState('month'); // Default filter
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [filter]); // Refetch data whenever the filter changes

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/dashboard/?filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleOwnerLogout();
        navigate('/admin-login');
      } else {
        console.error('Error fetching dashboard data:', error);
      }
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path); // Navigate to the clicked menu item's path
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
      {/* SidebarMenu component */}
      <SidebarMenu 
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />

      <main className="main-content">
        <header className="page-header">
          <h1>Dashboard</h1>
          <div className="filter-buttons">
            <button onClick={() => handleFilterChange('day')} className={filter === 'day' ? 'active' : ''}>Day</button>
            <button onClick={() => handleFilterChange('week')} className={filter === 'week' ? 'active' : ''}>Week</button>
            <button onClick={() => handleFilterChange('month')} className={filter === 'month' ? 'active' : ''}>Month</button>
            <button onClick={() => handleFilterChange('year')} className={filter === 'year' ? 'active' : ''}>Year</button>
          </div>
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
