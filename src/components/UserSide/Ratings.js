// frontend/src/components/UserSide/Ratings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./r_frontend.css";

const Ratings = ({ coffeeShopId }) => {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/ratings/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setRatings(response.data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, [coffeeShopId]);

  return (
    <div>
      <h3>Customer Ratings</h3>
      {ratings.length > 0 ? (
        ratings.map(rating => (
          <div key={rating.id}>
            <p>Stars: {rating.stars}/5</p>
            <p>Description: {rating.description}</p>
            <p>By: {rating.user.username}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>No ratings yet.</p>
      )}
    </div>
  );
};

export default Ratings;