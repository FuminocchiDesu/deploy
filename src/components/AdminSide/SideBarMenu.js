import React from 'react';
import { Coffee, Home, LogOut, Edit, User, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const SidebarMenu = ({ activeMenuItem, handleMenuItemClick, onLogout }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link 
          to="/dashboard/profile" 
          className="user-profile-link hover:opacity-80 transition-opacity"
        >
          <User className="menu-icon" />
        </Link>
        <span className="admin-title">Admin Dashboard</span>
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
  );
};

export default SidebarMenu;