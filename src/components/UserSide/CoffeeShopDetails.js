// frontend/src/component/UserSide/CoffeeShopDeatils.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Ratings from './Ratings';
import Menu from './Menu';
import Promos from './Promos';
import "./csd_frontend.css";

const CoffeeShopDetails = () => {
  const [coffeeShop, setCoffeeShop] = useState(null);
  const { id } = useParams(); // coffeeShopId

  useEffect(() => {
    const fetchCoffeeShop = async () => {
      try {
        const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${id}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        console.log('API Response:', response.data);
        setCoffeeShop(response.data);
      } catch (error) {
        console.error('Error fetching coffee shop details:', error);
      }
    };

    fetchCoffeeShop();
  }, [id]);

  if (!coffeeShop) return <div>Loading...</div>;

  return (
    <div className="coffee-shop-details-container">
      {coffeeShop.image && (
        <img 
          src={coffeeShop.image}
          alt={coffeeShop.name} 
          className="coffee-shop-image"
        />
      )}
      
      <div className="coffee-shop-details">
        <h1 className="coffee-shop-name">{coffeeShop.name}</h1>
        <p className="coffee-shop-info">Location: {coffeeShop.address}</p>
        <p className="coffee-shop-info">Opening Hours: {coffeeShop.opening_hours}</p>
        <p className="coffee-shop-description">{coffeeShop.description}</p>
        
        <Menu coffeeShopId={id} />
        
        <Promos coffeeShopId={id} />

        <div className="coffee-shop-ratings">
          <h2>Ratings</h2>
          <p>Average Rating: {coffeeShop.average_rating ? coffeeShop.average_rating.toFixed(1) : 'N/A'}</p>
          <Ratings coffeeShopId={id} />
          <Link to={`/rate/${id}`} className="rate-button">Rate this Coffee Shop</Link>
        </div>
      </div>
    </div>
  );
};

export default CoffeeShopDetails;
