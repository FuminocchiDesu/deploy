import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Coffee, Loader2 } from 'lucide-react';
import './SharedStyles.css';
import PasswordInput from './PasswordInput';
import ForgotPassword from './ForgotPassword';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('https://khlcle.pythonanywhere.com/api/owner/', credentials);
      if (response && response.data) {
        if (response.data.access) {
          localStorage.setItem('ownerToken', response.data.access);
        } else {
          setError('Login successful, but token not received. Please try again.');
          return;
        }

        if (response.data.coffee_shop_id) {
          localStorage.setItem('coffeeShopId', response.data.coffee_shop_id);
          onLogin(); // Notify that owner has logged in
          navigate('/dashboard'); // Redirect to Dashboard after successful login
        } else {
          setError('No coffee shop associated with this account');
        }
      } else {
        setError('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403) {
          setError('Not authorized. Are you sure you are a shop owner?');
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError(`Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        setError('No response received from server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };
  
  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Coffee Shop Owner Login</h2>
          <p className="login-description">
            Enter your credentials to access your coffee shop dashboard
          </p>
        </div>
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <PasswordInput
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <div className="forgot-password-link">
                <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
              </div>
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="submit-button-icon" />
                  Logging in...
                </>
              ) : (
                <>
                  <Coffee className="submit-button-icon" />
                  Login
                </>
              )}
            </button>
            
          </form>
          {error && (
            <div className="error-alert">
              <AlertCircle className="error-alert-icon" />
              <div className="error-alert-title">Error</div>
              <div className="error-alert-description">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
