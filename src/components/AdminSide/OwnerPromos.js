import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SharedStyles.css';

const OwnerPromos = ({ coffeeShopId }) => {
  const [promos, setPromos] = useState([]);
  const [newPromo, setNewPromo] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const fetchPromos = useCallback(async () => {
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setPromos(response.data);
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  }, [coffeeShopId]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const addPromo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/`, 
        {
          ...newPromo,
          coffee_shop: coffeeShopId
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        }
      );
      setNewPromo({ name: '', description: '', start_date: '', end_date: '' });
      fetchPromos();
    } catch (error) {
      console.error('Error adding promo:', error);
    }
  };

  const updatePromo = async (promoId, updatedPromo) => {
    try {
      await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/${promoId}/`, updatedPromo, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchPromos();
    } catch (error) {
      console.error('Error updating promo:', error);
    }
  };

  const deletePromo = async (promoId) => {
    try {
      await axios.delete(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/${promoId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchPromos();
    } catch (error) {
      console.error('Error deleting promo:', error);
    }
  };

  return (
    <div className="owner-promos">
      <div className="card">
        <h3 className="card-title">Add New Promotion</h3>
        <form onSubmit={addPromo} className="form-group">
          <input
            type="text"
            value={newPromo.name}
            onChange={(e) => setNewPromo({...newPromo, name: e.target.value})}
            placeholder="Promotion Name"
            required
            className="form-input"
          />
          <textarea
            value={newPromo.description}
            onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
            placeholder="Description"
            required
            className="form-textarea"
          />
          <input
            type="date"
            value={newPromo.start_date}
            onChange={(e) => setNewPromo({...newPromo, start_date: e.target.value})}
            required
            className="form-input"
          />
          <input
            type="date"
            value={newPromo.end_date}
            onChange={(e) => setNewPromo({...newPromo, end_date: e.target.value})}
            required
            className="form-input"
          />
          <button type="submit" className="button primary">Add Promotion</button>
        </form>
      </div>

      {promos.map(promo => (
        <div key={promo.id} className="card">
          <h3 className="card-title">{promo.name}</h3>
          <p>{promo.description}</p>
          <p>Valid from {promo.start_date} to {promo.end_date}</p>
          <div className="action-buttons">
            <button className="button outline" onClick={() => updatePromo(promo.id, { ...promo, name: prompt('Enter new promo name:', promo.name) || promo.name })}>Edit</button>
            <button className="button outline" onClick={() => deletePromo(promo.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OwnerPromos;