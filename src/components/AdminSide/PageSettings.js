import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Upload, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
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
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const apiKey = 'AIzaSyBEvPia5JJC-eYWLlO_Zlt27cDnPuyJxmw'; // Replace with your API key

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    version: "weekly", // or "latest"
    libraries
  });

  const mapRef = useRef(null);

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

      // Send opening hours separately
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

  const handleMapClick = (event) => {
    if (isEditMode) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setCoffeeShop(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
      setMapCenter({ lat, lng });
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

  // Effect to add the marker once the map is loaded
  useEffect(() => {
    if (isLoaded && coffeeShop.latitude && coffeeShop.longitude && window.google?.maps?.marker?.AdvancedMarkerElement) {
      const map = mapRef.current?.state?.map;

      if (map) {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: coffeeShop.latitude, lng: coffeeShop.longitude },
          map,
          title: coffeeShop.name, // Optional title for the marker
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Change marker color
            scaledSize: new window.google.maps.Size(50, 50), // Resize the marker
          },
        });

        return () => {
          marker.setMap(null);
        };
      }
    }
  }, [isLoaded, coffeeShop.latitude, coffeeShop.longitude]);
  

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
          <button onClick={toggleEditMode} className="btn btn-primary">
            {isEditMode ? 'Cancel Edit' : <><Edit /> Edit</>}
          </button>
        </header>

        <form onSubmit={handleShopUpdate}>
          <div className="form-section">
          <div className="form-group">
  <label htmlFor="image">Coffee Shop Image</label>
  {imagePreview ? (
    <div className="image-preview">
      <img src={imagePreview} alt="Coffee Shop" className="preview-image" />
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
      className="form-input"
    />
  )}
</div>

            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={coffeeShop.name}
                onChange={handleInputChange}
                className="form-input"
                disabled={!isEditMode}
                required
              />
            </div>

            <div className="form-group">
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
                        required
                      />
                      <div className="autocomplete-dropdown">
                        {suggestions.map((suggestion) => {
                          const className = suggestion.active ? 'suggestion-item active' : 'suggestion-item';
                          return (
                            <div
                              {...getSuggestionItemProps(suggestion, { className })}
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
              ) : (
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={coffeeShop.address}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled
                  required
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                value={coffeeShop.description}
                onChange={handleInputChange}
                className="form-input"
                rows="4"
                disabled={!isEditMode}
                required
              />
            </div>
              
            <div className="form-group opening-hours-group">
        <label>Opening Hours</label>
        <button
          type="button"
          className="btn-toggle-opening-hours"
          onClick={toggleOpeningHours}
        >
          {isOpeningHoursExpanded ? (
            <>
              Hide Hours <ChevronUp />
            </>
          ) : (
            <>
              Show Hours <ChevronDown />
            </>
          )}
        </button>

        {isOpeningHoursExpanded && (
          <table className="opening-hours-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Opening Time</th>
                <th>Closing Time</th>
              </tr>
            </thead>
            <tbody>
              {coffeeShop.opening_hours.map((dayHours) => (
                <tr key={dayHours.day}>
                  <td>{dayHours.day}</td>
                  <td>
                    <input
                      type="time"
                      value={dayHours.opening_time}
                      onChange={(e) =>
                        handleOpeningHoursChange(dayHours.day, 'opening_time', e.target.value)
                      }
                      className="form-input"
                      disabled={!isEditMode}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={dayHours.closing_time}
                      onChange={(e) =>
                        handleOpeningHoursChange(dayHours.day, 'closing_time', e.target.value)
                      }
                      className="form-input"
                      disabled={!isEditMode}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
          </div>

          <button type="submit" className="btn btn-success" disabled={!isEditMode}>
            Save Changes
          </button>
        </form>

        <div className="map-container">
          <h2 className="card-title">Map</h2>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ height: '400px', width: '100%' }}
              center={mapCenter}
              zoom={20}
              onClick={handleMapClick}
              ref={mapRef}
            />
          ) : (
            <div>Loading map...</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PageSettings;
