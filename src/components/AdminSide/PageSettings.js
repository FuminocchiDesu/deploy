import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Bell, Coffee, DollarSign, Home, LogOut, Edit, ShoppingCart, User, Users, Upload } from 'lucide-react';
import './SharedStyles.css';

const PageSettings = ({ handleOwnerLogout }) => {
  const [coffeeShop, setCoffeeShop] = useState({
    name: '',
    address: '',
    opening_hours: '',
    description: '',
    image: null
  });
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [categories, setCategories] = useState(['Hot Coffee', 'Iced Coffee', 'Pastries', 'Sandwiches', 'Desserts']);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const { id } = useParams();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Orders', icon: <ShoppingCart className="menu-icon" />, path: '/dashboard/orders' },
    { name: 'Customers', icon: <Users className="menu-icon" />, path: '/dashboard/customers' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Analytics', icon: <DollarSign className="menu-icon" />, path: '/dashboard/analytics' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchCoffeeShops();
        if (id) {
          await fetchCoffeeShop(id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fetchCoffeeShops = async () => {
    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/coffee-shops/owner_coffee_shops/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setCoffeeShops(response.data);
      if (!id && response.data.length > 0) {
        navigate(`/dashboard/page-settings/${response.data[0].id}`);
      }
    } catch (error) {
      console.error('Error fetching coffee shops:', error);
      throw new Error('Failed to fetch coffee shops');
    }
  };

  const fetchCoffeeShop = async (shopId) => {
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setCoffeeShop(response.data);
    } catch (error) {
      console.error('Error fetching coffee shop:', error);
      throw new Error('Failed to fetch coffee shop details');
    }
  };

  const handleShopUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    Object.keys(coffeeShop).forEach(key => {
      if (coffeeShop[key] !== null && coffeeShop[key] !== undefined) {
        if (key === 'image' && coffeeShop[key] instanceof File) {
          formData.append(key, coffeeShop[key]);
        } else {
          formData.append(key, coffeeShop[key]);
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
    if (name === 'image') {
      setCoffeeShop(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setCoffeeShop(prev => ({ ...prev, [name]: value }));
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

  if (isLoading) {
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

        <div className="card">
          <h2 className="card-title">Coffee Shop Page Image</h2>
          <div className="image-upload">
            <div className="upload-placeholder">
              <Upload className="upload-icon" />
              <p>Upload image</p>
            </div>
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              className="file-input"
              id="image-upload"
            />
            <button
              className="button outline"
              onClick={() => document.getElementById('image-upload').click()}
            >
              Select Image
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Coffee Shop Details</h2>
          <form onSubmit={handleShopUpdate}>
            <div className="form-group">
              <label htmlFor="name">Coffee Shop Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={coffeeShop.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                name="address"
                id="address"
                value={coffeeShop.address}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="opening_hours">Opening Hours</label>
              <input
                type="text"
                name="opening_hours"
                id="opening_hours"
                value={coffeeShop.opening_hours}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={coffeeShop.description}
                onChange={handleInputChange}
                className="form-textarea"
              />
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Menu</h2>
            <button className="button outline">Manage Categories</button>
          </div>
          <div className="menu-categories">
            {categories.map((category, index) => (
              <button key={index} className="button outline category-button">{category}</button>
            ))}
          </div>
          <div className="menu-items">
            <div className="add-dish">
              <Upload className="add-icon" />
              <p>Add new dish</p>
            </div>
            <div className="dish-card">
              <img src="/placeholder.svg?height=100&width=100" alt="Spicy seasoned seafood noodles" className="dish-image" />
              <h3 className="dish-title">Spicy seasoned seafood noodles</h3>
              <p className="dish-price">$ 2.29</p>
              <button className="button outline full-width">Edit dish</button>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="button outline">Terminate Page</button>
          <div>
            <button className="button outline">Cancel</button>
            <button className="button primary" onClick={handleShopUpdate}>Save</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageSettings;