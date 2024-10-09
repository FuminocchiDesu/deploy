// SidebarMenu.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Star } from 'lucide-react';

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
  );
};

export default SidebarMenu;
