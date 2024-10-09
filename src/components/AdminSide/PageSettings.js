import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Upload, Star } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import './SharedStyles.css';

const libraries = ['places'];

const PageSettings = ({ handleOwnerLogout }) => {
  const [coffeeShop, setCoffeeShop] = useState({
    id: '',
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    opening_hours: Array(7).fill({ opening_time: '', closing_time: '' }).map((_, index) => ({
      day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
      opening_time: '',
      closing_time: ''
    })),
    description: '',
    image: null
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const [imagePreview, setImagePreview] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const navigate = useNavigate();

  const apiKey = 'AIzaSyBEvPia5JJC-eYWLlO_Zlt27cDnPuyJxmw'; // Replace with your API key

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    loadGoogleMapsApi(apiKey).then(() => {
      fetchCoffeeShop();
    });
  }, []);

  const loadGoogleMapsApi = (apiKey) => {
    return new Promise((resolve) => {
      if (window.google) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  const fetchCoffeeShop = async () => {
    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/coffee-shops/owner_coffee_shop/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      // Ensure that response data includes opening_hours
      const fetchedCoffeeShop = {
        ...response.data,
        opening_hours: response.data.opening_hours || Array(7).fill({ opening_time: '', closing_time: '' }).map((_, index) => ({
          day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
          opening_time: '',
          closing_time: ''
        }))
      };
      setCoffeeShop(fetchedCoffeeShop);
      setImagePreview(response.data.image);
      if (response.data.latitude && response.data.longitude) {
        setMapCenter({ lat: response.data.latitude, lng: response.data.longitude });
      }
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

  const handleAddressChange = (address) => {
    setCoffeeShop(prev => ({ ...prev, address }));
  };

  const handleAddressSelect = async (address) => {
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      setCoffeeShop(prev => ({
        ...prev,
        address,
        latitude: latLng.lat,
        longitude: latLng.lng
      }));
      setMapCenter(latLng);
    } catch (error) {
      console.error('Error selecting address:', error);
    }
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setCoffeeShop(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setMapCenter({ lat, lng });
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
        <ul>
          {menuItems.map(item => (
            <li key={item.name} onClick={() => handleMenuItemClick(item)}>
              {item.icon}
              <span>{item.name}</span>
            </li>
          ))}
          <li onClick={onLogout}>
            <LogOut className="menu-icon" />
            <span>Logout</span>
          </li>
        </ul>
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
              {imagePreview && <img src={imagePreview} alt="Coffee Shop Preview" className="image-preview" />}
              <input
                type="file"
                accept="image/*"
                name="image"
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Coffee Shop Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={coffeeShop.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <PlacesAutocomplete
                value={coffeeShop.address}
                onChange={handleAddressChange}
                onSelect={handleAddressSelect}
              >
                {({ getInputProps, suggestions, loading }) => (
                  <div>
                    <input
                      {...getInputProps({
                        placeholder: 'Search Places...',
                        className: 'form-input'
                      })}
                    />
                    <div>
                      {loading && <div>Loading suggestions...</div>}
                      {suggestions.map(suggestion => {
                        const style = suggestion.active ? { backgroundColor: '#a0c4ff', cursor: 'pointer' } : { backgroundColor: '#ffffff', cursor: 'pointer' };
                        return (
                          <div key={suggestion.placeId} onClick={() => handleAddressSelect(suggestion.description)} style={style}>
                            {suggestion.description}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={coffeeShop.description}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <h2 className="card-title">Opening Hours</h2>
            <div className="opening-hours">
              {coffeeShop.opening_hours.map((hour) => (
                <div key={hour.day} className="opening-hour">
                  <label>{hour.day}</label>
                  <input
                    type="time"
                    value={hour.opening_time}
                    onChange={(e) => handleOpeningHoursChange(hour.day, 'opening_time', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="time"
                    value={hour.closing_time}
                    onChange={(e) => handleOpeningHoursChange(hour.day, 'closing_time', e.target.value)}
                    className="form-input"
                  />
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary">Update Coffee Shop</button>
          </div>
        </form>

        <div className="map-container">
          <h2 className="card-title">Map</h2>
          <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
              mapContainerStyle={{ height: '400px', width: '100%' }}
              center={mapCenter}
              zoom={15}
              onClick={handleMapClick}
            >
              {coffeeShop.latitude && coffeeShop.longitude && (
                <Marker position={{ lat: coffeeShop.latitude, lng: coffeeShop.longitude }} />
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </main>
    </div>
  );
};

export default PageSettings;
