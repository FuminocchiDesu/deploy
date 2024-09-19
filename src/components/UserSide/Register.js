// frontend/src/components/UserSide/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './register_frontend.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, password2 } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== password2) {
        setError('Passwords do not match');
        return;
    }

    try {
        const res = await axios.post('https://khlcle.pythonanywhere.com/api/register/', {
            username,
            email,
            password
        });
        
        console.log('Registration response:', res.data);
        
        setSuccess(true);
        setFormData({ username: '', email: '', password: '', password2: '' });
        
        setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
        console.error('Registration error:', err);
        if (err.response && err.response.data) {
            console.error('Error response:', err.response.data);
            setError(JSON.stringify(err.response.data));  // Display the full error message
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    }
};
  

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <p className="register-welcome">Welcome! Please fill in the details below.</p>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="register-input-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            value={username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="register-input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="register-input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="register-input-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            id="password2"
            type="password"
            name="password2"
            value={password2}
            onChange={handleChange}
            required
          />
        </div>
        <button className="register-button" type="submit">Register</button>
      </form>
      {error && <p className="register-error">{error}</p>}
      {success && <p className="register-success">Registration successful! Redirecting to login page...</p>}
      <p className="register-signin">Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Register;