import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Upload, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import './SharedStyles.css';
import SidebarMenu from './SideBarMenu';
import Switch from './CustomSwitch';

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
    image: null,
    is_under_maintenance: false
  });
  const [isOpeningHoursExpanded, setIsOpeningHoursExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const [imagePreview, setImagePreview] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);

  const apiKey = 'AIzaSyBEvPia5JJC-eYWLlO_Zlt27cDnPuyJxmw'; // Replace with your API key

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);

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
        const fetchedCoffeeShop = response.data[0];
        setCoffeeShop(prevState => ({
          ...prevState,
          ...fetchedCoffeeShop,
          is_under_maintenance: fetchedCoffeeShop.is_under_maintenance
        }));
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
      const fetchedHours = response.data;
      const fullOpeningHours = Object.keys(dayFullNames).map(shortDay => {
        const existingHour = fetchedHours.find(h => h.day.toLowerCase().startsWith(shortDay));
        return existingHour || { day: dayFullNames[shortDay], opening_time: '', closing_time: '' };
      });
      setCoffeeShop(prev => ({ ...prev, opening_hours: fullOpeningHours }));
    } catch (error) {
      console.error('Error fetching opening hours:', error);
      setError('Failed to fetch opening hours. Please try again.');
    }
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
      
      setSuccess('Maintenance mode updated successfully');
    } catch (error) {
      console.error('Error updating maintenance mode:', error);
      setError('Failed to update maintenance mode. Please try again.');
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };

  const handleShopUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    Object.entries(coffeeShop).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== 'opening_hours') {
        if (key === 'image') {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'string' && value.startsWith('http')) {
            console.log('Existing image URL:', value);
          } else {
            console.log('Invalid image value:', value);
          }
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

      await axios.post(`https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/set_opening_hours/`,
        coffeeShop.opening_hours,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await fetchCoffeeShop();

      setSuccess('Coffee shop details updated successfully.');
      setIsEditMode(false);
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

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
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
    console.log('Map loaded:', map);
  };

  const handleMapClick = (event) => {
    if (isEditMode && window.google) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setCoffeeShop(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
      setMapCenter({ lat, lng });
  
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
  
      if (AdvancedMarkerElement && PinElement) {
        if (markerRef.current) {
          markerRef.current.position = { lat, lng };
        } else {
          const pinElement = new PinElement({
            background: "#FBBC04",
            glyph: "☕"
          });
          
          markerRef.current = new AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat, lng },
            title: coffeeShop.name,
            content: pinElement.element
          });
        }
        console.log('Marker position updated:', { lat, lng });
      }
    }
  };

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />

      <main className="main-content">
        <header className="page-header flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Page Settings</h1>
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
            <button onClick={toggleEditMode} className="button primary">
              {isEditMode ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
        </header>

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
            {isEditMode && (
              <input
                type="file"
                name="image"
                id="image"
                accept="image/*"
                onChange={handleInputChange}
                className="form-input mt-1 block w-full"
              />
            )}
          </div>

          <div className="settings-section">
            <h2>Basic Information</h2>
            <div className="mb-4">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={coffeeShop.name}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className="form-input"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="address">Address</label>
              {isEditMode ? (
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
              ) : (
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={coffeeShop.address}
                  className="form-input"
                  disabled
                />
              )}
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
                disabled={!isEditMode}
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
          />
          <p>Latitude: {coffeeShop.latitude}, Longitude: {coffeeShop.longitude}</p>
            </div>
          )}

          <div className="settings-section">
            <div className="flex justify-between items-center mb-2">
              <h2>Opening Hours</h2>
              <button
                type="button"
                onClick={toggleOpeningHours}
                className="text-primary hover:text-primary-light"
              >
                {isOpeningHoursExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {isOpeningHoursExpanded && (
              <div className="space-y-2">
                {coffeeShop.opening_hours.map((oh, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-24">{oh.day}</span>
                    <input
                      type="time"
                      value={oh.opening_time}
                      onChange={(e) => handleOpeningHoursChange(oh.day, 'opening_time', e.target.value)}
                      className="form-input"
                      disabled={!isEditMode}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={oh.closing_time}
                      onChange={(e) => handleOpeningHoursChange(oh.day, 'closing_time', e.target.value)}
                      className="form-input"
                      disabled={!isEditMode}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {isEditMode && (
            <div className="flex justify-end">
              <button type="submit" className="button primary">
                Save Changes
              </button>
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default PageSettings;