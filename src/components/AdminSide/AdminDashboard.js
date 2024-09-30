import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, DollarSign, Home, LogOut, Edit, ShoppingCart, User, Users } from 'lucide-react';
import './SharedStyles.css';

const AdminDashboard = ({ handleOwnerLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Orders', icon: <ShoppingCart className="menu-icon" />, path: '/dashboard/orders' },
    { name: 'Customers', icon: <Users className="menu-icon" />, path: '/dashboard/customers' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Analytics', icon: <DollarSign className="menu-icon" />, path: '/dashboard/analytics' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };

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
          <h1>{activeMenuItem}</h1>
        </header>

        <div className="dashboard-content">
          <div className="card">
            <h2 className="card-title">Overview</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>Total Sales</h3>
                <p className="stat-value">$0</p>
                <span className="stat-change positive">+0%</span>
              </div>
              <div className="stat-item">
                <h3>Total Orders</h3>
                <p className="stat-value">0</p>
                <span className="stat-change positive">+0%</span>
              </div>
              <div className="stat-item">
                <h3>Total Customers</h3>
                <p className="stat-value">0</p>
                <span className="stat-change positive">+0%</span>
              </div>
              <div className="stat-item">
                <h3>Total Products</h3>
                <p className="stat-value">0</p>
                <span className="stat-change neutral">0%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Recent Orders</h2>
            <p>No recent orders</p>
          </div>

          <div className="card">
            <h2 className="card-title">Top Selling Items</h2>
            <p>No data available</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;