// frontend/src/component/UserSide/Promos.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Promos = ({ coffeeShopId }) => {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setPromos(response.data);
      } catch (error) {
        console.error('Error fetching promos:', error);
      }
    };

    fetchPromos();
  }, [coffeeShopId]);

  return (
    <div className="coffee-shop-promos">
      <h2>Promos</h2>
      {promos.length > 0 ? (
        promos.map(promo => (
          <div key={promo.id} className="promo-item">
            <h3>{promo.name}</h3>
            <p>{promo.description}</p>
            <p>Valid from {promo.start_date} to {promo.end_date}</p>
          </div>
        ))
      ) : (
        <p>No promos available.</p>
      )}
    </div>
  );
};

export default Promos;