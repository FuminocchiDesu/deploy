import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ReadOnlyPromos = ({ coffeeShopId }) => {
  const [promos, setPromos] = useState([]);

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

  return (
    <div className="read-only-promos">
      {promos.map(promo => (
        <div key={promo.id} className="promo-item">
          <h3>{promo.name}</h3>
          <p>{promo.description}</p>
          <p>Valid from {promo.start_date} to {promo.end_date}</p>
        </div>
      ))}
    </div>
  );
};

export default ReadOnlyPromos;