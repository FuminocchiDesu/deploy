import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { AlertTriangle } from 'lucide-react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import './SharedStyles.css';
import SidebarMenu from './SideBarMenu';
import Switch from './CustomSwitch';
import OpeningHoursTable from './OpeningHoursTable';
import ContactDetailsTab from './ContactDetailsTab';
import { CoffeeLoader } from '../ui/CoffeeLoader';

const libraries = ['places'];

const PageSettings = ({ handleOwnerLogout, 
  notifications = [], 
  clearNotifications = () => {}, 
  markNotificationAsRead = () => {}, 
  coffeeShopName = 'Coffee Shop Dashboard'
}) => {
  const { message: messageApi } = App.useApp();
  const [coffeeShop, setCoffeeShop] = useState({
    id: '',
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    description: '',
    image: null,
    is_under_maintenance: false,
    is_terminated: false
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const [imagePreview, setImagePreview] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const navigate = useNavigate();
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);
  const [openingHours, setOpeningHours] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const apiKey = 'AIzaSyBDU3QWyXnmPdcmphWACu71LSnJJlsImKU'; // Replace with your API key

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries
  });
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    fetchCoffeeShop();
  }, []);

  const fetchCoffeeShop = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/owner/coffee-shop/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      if (response.data.length > 0) {
        const fetchedCoffeeShop = response.data[0];
        setCoffeeShop(prevState => ({
          ...prevState,
          ...fetchedCoffeeShop,
          is_under_maintenance: fetchedCoffeeShop.is_under_maintenance,
          is_terminated: fetchedCoffeeShop.is_terminated
        }));
        setImagePreview(fetchedCoffeeShop.image);
        if (fetchedCoffeeShop.latitude && fetchedCoffeeShop.longitude) {
          setMapCenter({ lat: parseFloat(fetchedCoffeeShop.latitude), lng: parseFloat(fetchedCoffeeShop.longitude) });
        }
      }
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
        // Keep showing loader for remaining time
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    } catch (error) {
      console.error('Error fetching coffee shop:', error);
      setError('Failed to fetch coffee shop details. Please try again.');
      handleOwnerLogout();
      navigate('/admin-login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateClick = (e) => {
    e.preventDefault(); // Prevent any form submission
    setShowWarning(true);
  };

  const handleTerminateConfirm = async () => {
    try {
      const response = await axios.patch(
        `https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/`,
        { is_terminated: !coffeeShop.is_terminated },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      setCoffeeShop(prev => ({
        ...prev,
        is_terminated: !prev.is_terminated
      }));
  
      messageApi.success(!coffeeShop.is_terminated ? 'Coffee shop marked as permanently closed' : 'Coffee shop marked as open');
    } catch (error) {
      console.error('Error updating termination status:', error);
      setError('Failed to update shop status. Please try again.');
    } finally {
      setShowWarning(false);
    }
  };

  const handleTerminateCancel = () => {
    setShowWarning(false);
  };

  const handleMaintenanceToggle = async (checked) => {
    setIsUpdatingMaintenance(true);
    try {
      const response = await axios.patch(`https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/`, 
        { is_under_maintenance: checked },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setCoffeeShop(prev => ({
        ...prev,
        is_under_maintenance: checked
      }));
      
      messageApi.success('Maintenance mode updated successfully');
    } catch (error) {
      console.error('Error updating maintenance mode:', error);
      setError('Failed to update maintenance mode. Please try again.');
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };

  const handleOpeningHoursUpdate = (updatedHours) => {
    setOpeningHours(updatedHours);
  };

  const handleShopUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    Object.entries(coffeeShop).forEach(([key, value]) => {
      // Skip null/undefined values except for boolean fields
      if (value === null || value === undefined) {
        if (key === 'is_under_maintenance' || key === 'is_terminated') {
          formData.append(key, String(value));
        }
        return;
      }
  
      // Handle image separately
      if (key === 'image') {
        if (value instanceof File) {
          formData.append(key, value);
        }
        // Skip if it's a URL string (existing image)
        return;
      }
  
      // Skip opening_hours as it's handled separately
      if (key !== 'opening_hours') {
        formData.append(key, String(value));
      }
    });
  
    try {
      // Update coffee shop details
      await axios.put(
        `https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      // Only update opening hours if they exist
      if (openingHours && openingHours.length > 0) {
        const formattedHours = openingHours
          .filter(hour => hour.opening_time && hour.closing_time)
          .map(hour => ({
            day: hour.day,
            opening_time: hour.opening_time,
            closing_time: hour.closing_time,
          }));
  
        if (formattedHours.length > 0) {
          await axios.post(
            'https://khlcle.pythonanywhere.com/api/opening-hours/',
            formattedHours,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
  
      await fetchCoffeeShop();
      messageApi.success('Coffee shop details updated successfully');
    } catch (error) {
      console.error('Error updating coffee shop:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      setError('Failed to update coffee shop details. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      setCoffeeShop(prev => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setCoffeeShop(prev => ({ ...prev, [name]: value }));
    }
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

      if (mapRef.current && isLoaded) {
        createMarker(latLng);
      }
    } catch (error) {
      console.error('Error selecting address:', error);
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (isLoaded && coffeeShop.latitude && coffeeShop.longitude && mapRef.current) {
      const position = { lat: parseFloat(coffeeShop.latitude), lng: parseFloat(coffeeShop.longitude) };
      mapRef.current.panTo(position);
      
      if (markerRef.current) {
        markerRef.current.setPosition(position);
      } else {
        markerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: position,
          title: coffeeShop.name
        });
      }
    }
  }, [isLoaded, coffeeShop.latitude, coffeeShop.longitude, coffeeShop.name]);

  const onMapLoad = (map) => {
    mapRef.current = map;
    // Create initial marker if coordinates exist
    if (coffeeShop.latitude && coffeeShop.longitude) {
      const position = {
        lat: parseFloat(coffeeShop.latitude),
        lng: parseFloat(coffeeShop.longitude)
      };
      createMarker(position);
    }
  };

  const handleMapClick = (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setCoffeeShop(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
      
      createMarker({ lat, lng });
  };
  
  const createMarker = (position) => {
    // Remove existing marker if it exists
    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new window.google.maps.Marker({
      position,
      map: mapRef.current,
      title: coffeeShop.name,
      animation: window.google.maps.Animation.DROP
    });

    setMarker(newMarker);
    mapRef.current.panTo(position);
  };

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
        notifications={notifications}
        clearNotifications={clearNotifications}
        markNotificationAsRead={markNotificationAsRead}
        coffeeShopName={coffeeShopName}
      />

      <main className="main-content">
      {isLoading ? (
          <div className="loader-container">
            <CoffeeLoader 
            size={80} 
            cupColor="#B5651D" 
            steamColor="#D2B48C" 
            saucerColor="#A0522D" 
          />
          </div>
        ) : (
          <div>
        <div className="tab-navigation">
          <nav className="tab-list">
            <button
              className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => handleTabChange('basic')}
            >
              Basic Information
            </button>
            <button
              className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => handleTabChange('contact')}
            >
              Contact Details
            </button>
          </nav>
        </div>

        {showWarning && (
          <div className="warning-modal">
            <div className="warning-content">
              <AlertTriangle className="warning-icon" />
              <h2>{coffeeShop.is_terminated ? 'Reopen Shop?' : 'Permanently Close Shop?'}</h2>
              <p>
                {coffeeShop.is_terminated 
                  ? 'Are you sure you want to reopen this coffee shop? This will make it visible to customers again.'
                  : 'Are you sure you want to mark this coffee shop as permanently closed? This will hide it from customers.'}
              </p>
              <div className="warning-actions">
                <button onClick={handleTerminateConfirm} className="button danger">
                  {coffeeShop.is_terminated ? 'Yes, Reopen' : 'Yes, Close Permanently'}
                </button>
                <button onClick={handleTerminateCancel} className="button secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'basic' ? (
          <>
          <div className="flex justify-end mb-4">
          <header className="page-header flex justify-between items-center mb-6">
              <h1 className="page-title">Page Settings</h1>
              <div className="flex items-center">
                <div className="maintenance-toggle mr-4">
                  <label htmlFor="maintenance-mode" className="mr-2">Maintenance Mode</label>
                  <Switch
                    id="maintenance-mode"
                    checked={coffeeShop.is_under_maintenance}
                    onChange={handleMaintenanceToggle}
                    disabled={isUpdatingMaintenance}
                  />
                </div>
              </div>
            </header>
          </div>
          <form onSubmit={handleShopUpdate} className="settings-form">
          <div className="settings-section">
                <h2>Coffee Shop Image</h2>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Coffee Shop" />
                  
                  </div>
                ) : (
                  <p>No image uploaded</p>
                )}
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="form-input mt-1 block w-full"
                  />
              </div>

            <div className="settings-section">
              <h2>Basic Information</h2>
              {coffeeShop.is_terminated && (
                <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
                  This coffee shop is marked as permanently closed
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={coffeeShop.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="address">Address</label>
                  <PlacesAutocomplete
                    value={coffeeShop.address}
                    onChange={handleAddressChange}
                    onSelect={handleAddressSelect}
                  >
                    {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                      <div>
                        <input
                          {...getInputProps({
                            placeholder: 'Search address...',
                            className: 'form-input',
                          })}
                        />
                        <div className="autocomplete-dropdown-container">
                          {suggestions.map(suggestion => (
                            <div
                              {...getSuggestionItemProps(suggestion)}
                              key={suggestion.placeId}
                              className="suggestion-item"
                            >
                              {suggestion.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </PlacesAutocomplete>
              </div>

              <div className="mb-4">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  id="description"
                  value={coffeeShop.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>

            {isLoaded && (
              <div className="settings-section">
                <h2>Location on Map</h2>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '400px' }}
                  center={mapCenter}
                  zoom={15}
                  onClick={handleMapClick}
                  onLoad={onMapLoad}
                  options={{
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                  }}
                />
              </div>
            )}

            <div className="settings-section">
              <h2>Opening Hours</h2>
              <OpeningHoursTable 
                coffeeShopId={coffeeShop.id} 
                onUpdate={handleOpeningHoursUpdate}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                <button 
                  type="submit" 
                  className="button primary" 
                  style={{ 
                    backgroundColor: '#61a02d',
                    transition: 'background-color 0.3s',
                    marginLeft: '10px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7bc043'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#61a02d'}
                >
                  Save Changes
                </button>
              <button 
                onClick={handleTerminateClick} 
                className="button danger"
                style={{ 
                  backgroundColor: '#ef4444',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f87171'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                {coffeeShop.is_terminated ? 'Reopen Shop' : 'Mark as Permanently Closed'}
              </button>
            </div>
            </form>
          </>
        ) : (
          <>
            <ContactDetailsTab 
            coffeeShopId={coffeeShop.id}
          />
          </>
        )}
        </div>
              )}     
         </main>
    </div>
  );
};

export default PageSettings;