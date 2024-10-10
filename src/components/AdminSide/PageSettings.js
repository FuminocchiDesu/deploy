import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Upload, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import './SharedStyles.css';
import SidebarMenu from './SideBarMenu';

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
  const [isOpeningHoursExpanded, setIsOpeningHoursExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const [imagePreview, setImagePreview] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const navigate = useNavigate();

  const apiKey = 'AIzaSyBEvPia5JJC-eYWLlO_Zlt27cDnPuyJxmw'; // Replace with your API key

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries
  });

  useEffect(() => {
    fetchCoffeeShop();
  }, []);

  const toggleOpeningHours = () => {
    setIsOpeningHoursExpanded(!isOpeningHoursExpanded);
  };

  const dayFullNames = {
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday'
  };

  const fetchCoffeeShop = async () => {
    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/owner/coffee-shop/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      if (response.data.length > 0) {
        const fetchedCoffeeShop = response.data[0]; // Assuming the owner has only one coffee shop
        setCoffeeShop(fetchedCoffeeShop);
        setImagePreview(fetchedCoffeeShop.image);
        if (fetchedCoffeeShop.latitude && fetchedCoffeeShop.longitude) {
          setMapCenter({ lat: parseFloat(fetchedCoffeeShop.latitude), lng: parseFloat(fetchedCoffeeShop.longitude) });
        }
        fetchOpeningHours(fetchedCoffeeShop.id);
      }
    } catch (error) {
      console.error('Error fetching coffee shop:', error);
      setError('Failed to fetch coffee shop details. Please try again.');
    }
  };

  const fetchOpeningHours = async (coffeeShopId) => {
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShopId}/opening_hours/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setCoffeeShop(prev => ({ ...prev, opening_hours: response.data }));
    } catch (error) {
      console.error('Error fetching opening hours:', error);
      setError('Failed to fetch opening hours. Please try again.');
    }
  };

  const handleShopUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    Object.entries(coffeeShop).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'opening_hours') {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    try {
      const response = await axios.put(`https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update opening hours separately
      await axios.post(`https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/set_opening_hours/`, 
        coffeeShop.opening_hours, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />

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
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
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
                          <div
                            {...getSuggestionItemProps(suggestion, { style })}
                            key={suggestion.placeId}
                          >
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

            <div className="opening-hours-section">
            <h2 className="card-title" onClick={toggleOpeningHours} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Opening Hours
              {isOpeningHoursExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h2>
            <div className={`opening-hours ${isOpeningHoursExpanded ? 'expanded' : ''}`}>
              {coffeeShop.opening_hours.map((hour) => (
                <div key={hour.day} className="opening-hour">
                  <label>{dayFullNames[hour.day] || hour.day}</label>
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
          </div>

          <button type="submit" className="btn btn-primary">Update Coffee Shop</button>
        </div>
      </form>

        <div className="map-container">
        <h2 className="card-title">Map</h2>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ height: '400px', width: '100%' }}
            center={mapCenter}
            zoom={15}
            onClick={handleMapClick}
          >
            {coffeeShop.latitude && coffeeShop.longitude && (
              <MarkerF 
                position={{ 
                  lat: parseFloat(coffeeShop.latitude), 
                  lng: parseFloat(coffeeShop.longitude) 
                }} 
              />
            )}
          </GoogleMap>
        ) : (
          <div>Loading map...</div>
        )}
      </div>
      </main>
    </div>
  );
};

export default PageSettings;