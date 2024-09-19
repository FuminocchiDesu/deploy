import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const RatingForm = () => {
  const [stars, setStars] = useState(5);
  const [description, setDescription] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/coffee-shops/${id}/rate/`, 
        { stars, description },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate(`/coffee-shop/${id}`);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Rate this Coffee Shop</h2>
      <div>
        <label>Stars:</label>
        <select value={stars} onChange={(e) => setStars(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Description:</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <button type="submit">Submit Rating</button>
    </form>
  );
};

export default RatingForm;