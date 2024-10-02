import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import OwnerMenu from './OwnerMenu';
import OwnerPromos from './OwnerPromos';
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
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const [imagePreview, setImagePreview] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: 'home', path: '/dashboard' },
    { name: 'Orders', icon: 'shopping-cart', path: '/dashboard/orders' },
    { name: 'Customers', icon: 'users', path: '/dashboard/customers' },
    { name: 'Menu', icon: 'coffee', path: '/dashboard/menu' },
    { name: 'Analytics', icon: 'dollar-sign', path: '/dashboard/analytics' },
    { name: 'Edit Page', icon: 'edit', path: '/dashboard/page-settings' },
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
      setImagePreview(response.data.image);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="admin-title">Admin</span>
          <i className="fas fa-bell"></i>
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
              <i className={`fas fa-${item.icon} menu-icon`}></i>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={onLogout}>
          <i className="fas fa-sign-out-alt menu-icon"></i>
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h1>Page Settings</h1>
        </div>

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
            {imagePreview && (
              <img src={imagePreview} alt="Coffee Shop" className="full-width" style={{maxHeight: '200px', objectFit: 'cover'}} />
            )}
            <div className="upload-placeholder">
              <i className="fas fa-upload upload-icon"></i>
              <p>Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
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
          <form onSubmit={handleShopUpdate}>
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
                <div key={index} className="flex space-x-2">
                  <span className="w-20 flex items-center">{oh.day}</span>
                  <input
                    type="time"
                    value={oh.opening_time}
                    onChange={(e) => handleOpeningHoursChange(oh.day, 'opening_time', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="time"
                    value={oh.closing_time}
                    onChange={(e) => handleOpeningHoursChange(oh.day, 'closing_time', e.target.value)}
                    className="form-input"
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
            <button type="submit" className="button primary">Save Changes</button>
          </form>
        </div>

        <div className="card">
          <h2 className="card-title">Menu Management</h2>
          <OwnerMenu coffeeShopId={id || ''} />
        </div>

        <div className="card">
          <h2 className="card-title">Promotions Management</h2>
          <OwnerPromos coffeeShopId={id || ''} />
        </div>

        <div className="action-buttons">
          <button className="button outline">Terminate Page</button>
          <div>
            <button className="button outline">Cancel</button>
            <button className="button primary" onClick={handleShopUpdate}>Save All Changes</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageSettings;