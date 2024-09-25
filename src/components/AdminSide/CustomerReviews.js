// src/components/AdminSide/CustomerReviews.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerReviews = ({ coffeeShopId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`https://khlcle.pythonanywhere.com/api/reviews/${coffeeShopId}/`);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [coffeeShopId]);

  return (
    <div>
      <h3>Customer Reviews</h3>
      {reviews.map(review => (
        <div key={review.id}>
          <h4>{review.customerName}</h4>
          <p>{review.rating} Stars</p>
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default CustomerReviews;
