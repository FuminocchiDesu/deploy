// frontend/src/components/AdminSide/OwnerDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "./owner_dashboard.css";
import OwnerMenu from './OwnerMenu';
import OwnerPromos from './OwnerPromos';
import ReadOnlyMenu from './ReadOnlyMenu';
import ReadOnlyPromos from './ReadOnlyPromos';

const OwnerDashboard = ({ handleOwnerLogout }) => {
  const [coffeeShop, setCoffeeShop] = useState(null);
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [isEditingPromos, setIsEditingPromos] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchCoffeeShops = useCallback(async () => {
    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/coffee-shops/owner_coffee_shops/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setCoffeeShops(response.data);
      
      if (!id && response.data.length > 0) {
        navigate(`/owner-dashboard/${response.data[0].id}`);
      }
    } catch (error) {
      console.error('Error fetching coffee shops:', error);
    }
  }, [id, navigate]);

  const fetchCoffeeShop = useCallback(async () => {
    if (id) {
      try {
        const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${id}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        });
        setCoffeeShop(response.data);
      } catch (error) {
        console.error('Error fetching coffee shop:', error);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchCoffeeShops();
  }, [fetchCoffeeShops]);

  useEffect(() => {
    fetchCoffeeShop();
  }, [fetchCoffeeShop]);

  const handleShopUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in coffeeShop) {
      if (key === 'image' && coffeeShop[key] instanceof File) {
        formData.append(key, coffeeShop[key]);
      } else {
        formData.append(key, coffeeShop[key]);
      }
    }
    try {
      const response = await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShop.id}/`, formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('ownerToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setCoffeeShop(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating coffee shop:', error);
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

  const handleShopSelect = (shopId) => {
    navigate(`/owner-dashboard/${shopId}`);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };

  if (!coffeeShop) {
    return <div>Loading...</div>;
  }

  return (
    <div className="owner-dashboard-container">
      <div className="header">
        <h1>Owner Dashboard</h1>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
      <div className="shop-selector">
        <h2>Your Coffee Shops</h2>
        <select onChange={(e) => handleShopSelect(e.target.value)} value={id}>
          {coffeeShops.map(shop => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>
      </div>
      <div className="coffee-shop-details">
        <img 
          src={coffeeShop.image} 
          alt={coffeeShop.name} 
          className="coffee-shop-image"
        />
        {isEditing ? (
          <form onSubmit={handleShopUpdate} className="edit-form">
            <input
              type="text"
              name="name"
              value={coffeeShop.name}
              onChange={handleInputChange}
              className="edit-input"
            />
            <input
              type="text"
              name="address"
              value={coffeeShop.address}
              onChange={handleInputChange}
              className="edit-input"
            />
            <textarea
              name="description"
              value={coffeeShop.description}
              onChange={handleInputChange}
              className="edit-textarea"
            />
            <input
              type="text"
              name="opening_hours"
              value={coffeeShop.opening_hours}
              onChange={handleInputChange}
              className="edit-input"
            />
            <input
            type="file"
            name="image"
            onChange={handleInputChange}
            className="edit-input"
            />
            <div className="button-group">
              <button type="submit" className="save-button">Save Changes</button>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="coffee-shop-info">
            <h1 className="coffee-shop-name">{coffeeShop.name}</h1>
            <p className="coffee-shop-address">Location: {coffeeShop.address}</p>
            <p className="coffee-shop-hours">Opening Hours: {coffeeShop.opening_hours}</p>
            <p className="coffee-shop-description">{coffeeShop.description}</p>
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit Shop Details</button>
          </div>
        )}
        
        <div className="menu-management">
          <h2>Menu</h2>
          {isEditingMenu ? (
            <>
              <OwnerMenu coffeeShopId={id} />
              <button onClick={() => setIsEditingMenu(false)} className="done-button">Done Editing</button>
            </>
          ) : (
            <>
              <ReadOnlyMenu coffeeShopId={id} />
              <button onClick={() => setIsEditingMenu(true)} className="edit-button">Edit Menu</button>
            </>
          )}
        </div>
        
        <div className="promos-management">
          <h2>Promotions</h2>
          {isEditingPromos ? (
            <>
              <OwnerPromos coffeeShopId={id} />
              <button onClick={() => setIsEditingPromos(false)} className="done-button">Done Editing</button>
            </>
          ) : (
            <>
              <ReadOnlyPromos coffeeShopId={id} />
              <button onClick={() => setIsEditingPromos(true)} className="edit-button">Edit Promotions</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;