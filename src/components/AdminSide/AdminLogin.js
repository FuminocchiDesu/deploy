import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://khlcle.pythonanywhere.com/api/owner/', credentials);
      localStorage.setItem('ownerToken', response.data.access);
      
      if (response.data.coffee_shop_id) {
        localStorage.setItem('coffeeShopId', response.data.coffee_shop_id);
        onLogin();
        navigate(`/owner-dashboard/${response.data.coffee_shop_id}`);
      } else {
        setError('No coffee shop associated with this account');
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Not authorized. Are you sure you are a shop owner?');
      } else {
        setError('Invalid credentials or server error');
      }
    }
  };

  return (
    <div>
      <h2>Coffee Shop Owner Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AdminLogin;