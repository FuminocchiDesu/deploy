import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Star } from 'lucide-react';
import axios from 'axios';
import './SharedStyles.css';

const MenuPage = ({ handleOwnerLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('Menu');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [promos, setPromos] = useState([]);
  const navigate = useNavigate();

  const sidebarMenuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const [categoriesResponse, menuItemsResponse, promosResponse] = await Promise.all([
        axios.get('https://khlcle.pythonanywhere.com/api/menu-categories/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        }),
        axios.get('https://khlcle.pythonanywhere.com/api/menu-items/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        }),
        axios.get('https://khlcle.pythonanywhere.com/api/promos/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        })
      ]);

      setCategories(categoriesResponse.data);
      setMenuItems(menuItemsResponse.data);
      setPromos(promosResponse.data);
    } catch (error) {
      console.error('Error fetching menu data:', error);
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
          {sidebarMenuItems.map((item) => (
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
          <h1>Menu Management</h1>
        </header>

        <div className="menu-content">
          <div className="card">
            <h2 className="card-title">Categories</h2>
            {categories.map(category => (
              <div key={category.id} className="category-item">
                <h3>{category.name}</h3>
                <button className="button outline">Edit</button>
                <button className="button outline">Delete</button>
              </div>
            ))}
            <button className="button primary">Add Category</button>
          </div>

          <div className="card">
            <h2 className="card-title">Menu Items</h2>
            {menuItems.map(item => (
              <div key={item.id} className="menu-item">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>Price: ${item.price}</p>
                <button className="button outline">Edit</button>
                <button className="button outline">Delete</button>
              </div>
            ))}
            <button className="button primary">Add Menu Item</button>
          </div>

          <div className="card">
            <h2 className="card-title">Promotions</h2>
            {promos.map(promo => (
              <div key={promo.id} className="promo-item">
                <h3>{promo.name}</h3>
                <p>{promo.description}</p>
                <p>Valid from {promo.start_date} to {promo.end_date}</p>
                <button className="button outline">Edit</button>
                <button className="button outline">Delete</button>
              </div>
            ))}
            <button className="button primary">Add Promotion</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MenuPage;