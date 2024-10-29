import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleMap, useJsApiLoader} from '@react-google-maps/api';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import './SharedStyles.css';
import SidebarMenu from './SideBarMenu';
import Switch from './CustomSwitch';
import OpeningHoursTable from './OpeningHoursTable';
import ContactDetailsTab from './ContactDetailsTab';
import EditActionButtons from './EditActionButtons';

const libraries = ['places'];

const PageSettings = ({ handleOwnerLogout }) => {
  const [coffeeShop, setCoffeeShop] = useState({
    id: '',
    name: '',
    address: '',
    latitude: null,
    longitude: null,
    description: '',
    image: null,
    is_under_maintenance: false,
    is_terminated: false  // Add this line
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Edit Page');
  const [imagePreview, setImagePreview] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);
  const [openingHours, setOpeningHours] = useState([]);

  const apiKey = 'AIzaSyBDU3QWyXnmPdcmphWACu71LSnJJlsImKU'; // Replace with your API key

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
          is_under_maintenance: fetchedCoffeeShop.is_under_maintenance,
          is_terminated: fetchedCoffeeShop.is_terminated
        }));
        setImagePreview(fetchedCoffeeShop.image);
        if (fetchedCoffeeShop.latitude && fetchedCoffeeShop.longitude) {
          setMapCenter({ lat: parseFloat(fetchedCoffeeShop.latitude), lng: parseFloat(fetchedCoffeeShop.longitude) });
        }
      }
    } catch (error) {
      console.error('Error fetching coffee shop:', error);
      setError('Failed to fetch coffee shop details. Please try again.');
      handleOwnerLogout();
      navigate('/admin-login');
    }
  };

  const handleTerminateToggle = async (checked) => {
    try {
      const response = await axios.patch(
        `https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/`,
        { is_terminated: checked },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      setCoffeeShop(prev => ({
        ...prev,
        is_terminated: checked
      }));
  
      setSuccess(checked ? 'Coffee shop marked as permanently closed' : 'Coffee shop marked as open');
    } catch (error) {
      console.error('Error updating termination status:', error);
      setError('Failed to update shop status. Please try again.');
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
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
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
    setSuccess(null);
    const formData = new FormData();
    Object.entries(coffeeShop).forEach(([key, value]) => {
      if (key === 'image') {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'string' && value.startsWith('http')) {
          // Do not append the image if it's a URL (existing image)
        } else {
          console.log('Invalid image value:', value);
        }
      } else if (key !== 'opening_hours') {
        formData.append(key, value.toString());
      }
    });

    try {
      // Update coffee shop details
      await axios.put(`https://khlcle.pythonanywhere.com/api/owner/coffee-shop/${coffeeShop.id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update opening hours
      const formattedHours = openingHours.map(hour => ({
        day: hour.day,
        opening_time: hour.opening_time || null,
        closing_time: hour.closing_time || null,
      })).filter(hour => hour.opening_time !== null && hour.closing_time !== null);

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

      await fetchCoffeeShop();
      setSuccess('Contact information updated successfully');

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
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
  };

  const handleMapClick = (event) => {
    if (isEditMode && window.google) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Update coffee shop latitude and longitude
      setCoffeeShop((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
      
      // Update map center
      setMapCenter({ lat, lng });
      
      // Move or create a marker on the map
      if (markerRef.current) {
        // Update existing marker position
        markerRef.current.setPosition({ lat, lng });
      } else {
        // Create a new marker or advanced marker with PinElement
        createMarker(lat, lng);
      }
    }
  };
  
  // Separate function to handle marker creation
  const createMarker = (lat, lng) => {
    if (window.google) {
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
      
      if (AdvancedMarkerElement && PinElement) {
        // Customize marker pin (e.g., with coffee shop's name first letter and color)
        const pin = new PinElement({
          glyph: coffeeShop.name.charAt(0).toUpperCase(),
          background: 'green', // Example color customization
        });
        
        // Create advanced marker with the customized pin
        markerRef.current = new AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat, lng },
          content: pin,
        });
      } else {
        // Fallback to regular marker if AdvancedMarkerElement isn't available
        markerRef.current = new window.google.maps.Marker({
          map: mapRef.current,
          position: { lat, lng },
          title: coffeeShop.name,
        });
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

            <div className="terminate-toggle mr-4">
            <label htmlFor="terminate-mode" className="mr-2 text-red-600">Permanently Closed</label>
            <Switch
              id="terminate-mode"
              checked={coffeeShop.is_terminated}
              onChange={handleTerminateToggle}
            />
            </div>

            <button onClick={toggleEditMode} className="button primary">
              {isEditMode ? 'Cancel Edit' : 'Edit'}
            </button>
          </div>
        </header>

        {activeTab === 'basic' ? (
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
            </div>
          )}

        <div className="settings-section">
          <h2>Opening Hours</h2>
          <OpeningHoursTable 
            coffeeShopId={coffeeShop.id} 
            isEditMode={isEditMode}
            onUpdate={handleOpeningHoursUpdate}
          />
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
        ) : (
          <ContactDetailsTab 
            coffeeShopId={coffeeShop.id}
            isEditMode={isEditMode}
          />
        )}
      </main>
    </div>
  );
};

export default PageSettings;