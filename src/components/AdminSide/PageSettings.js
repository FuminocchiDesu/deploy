import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Upload, Star } from 'lucide-react';
import './SharedStyles.css';

const PageSettings = ({ handleOwnerLogout }) => {
  const [coffeeShop, setCoffeeShop] = useState({
    id: '',
    name: '',
    address: '',
    opening_hours: [],
    description: '',
    image: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    fetchCoffeeShop();
  }, []);

  const fetchCoffeeShop = async () => {
    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/coffee-shops/owner_coffee_shop/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setCoffeeShop(response.data);
      setImagePreview(response.data.image);
    } catch (error) {
      console.error('Error fetching coffee shop:', error);
      setError('Failed to fetch coffee shop details. Please try again.');
    }
  };

  const handleShopUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    Object.entries(coffeeShop).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'opening_hours') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    try {
      const response = await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShop.id}/`, formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setCoffeeShop(response.data);
      setSuccess('Coffee shop details updated successfully.');
    } catch (error) {
      console.error('Error updating coffee shop:', error);
      setError('Failed to update coffee shop details. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setCoffeeShop(prev => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setCoffeeShop(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setCoffeeShop(prev => ({
      ...prev,
      opening_hours: prev.opening_hours.map(oh => 
        oh.day === day ? { ...oh, [field]: value } : oh
      )
    }));
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
          <h1>Page Settings</h1>
        </header>

        {error && (
          <div className="alert error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert success">
            <strong>Success:</strong> {success}
          </div>
        )}

        <form onSubmit={handleShopUpdate}>
          <div className="card">
            <h2 className="card-title">Coffee Shop Image</h2>
            <div className="image-upload">
              {imagePreview && (
                <img src={imagePreview} alt="Coffee Shop" className="preview-image" />
              )}
              <div className="upload-placeholder">
                <Upload className="upload-icon" />
                <p>Click to upload or drag and drop</p>
                <p className="upload-info">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input
                type="file"
                id="image-upload"
                name="image"
                onChange={handleInputChange}
                className="file-input"
              />
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Coffee Shop Details</h2>
            <div className="form-group">
              <label htmlFor="name">Coffee Shop Name</label>
              <input
                id="name"
                name="name"
                value={coffeeShop.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                value={coffeeShop.address}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Opening Hours</label>
              {coffeeShop.opening_hours.map((oh, index) => (
                <div key={index} className="opening-hours-row">
                  <span className="day-label">{oh.day}</span>
                  <input
                    type="time"
                    value={oh.opening_time}
                    onChange={(e) => handleOpeningHoursChange(oh.day, 'opening_time', e.target.value)}
                    className="form-input time-input"
                  />
                  <input
                    type="time"
                    value={oh.closing_time}
                    onChange={(e) => handleOpeningHoursChange(oh.day, 'closing_time', e.target.value)}
                    className="form-input time-input"
                  />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={coffeeShop.description}
                onChange={handleInputChange}
                rows={3}
                className="form-textarea"
              />
            </div>
          </div>

          <div className="action-buttons">
            <button type="button" className="button outline">Cancel</button>
            <button type="submit" className="button primary">Save Changes</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PageSettings;