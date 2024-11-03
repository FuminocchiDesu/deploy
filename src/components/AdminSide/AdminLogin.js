import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Coffee, Loader2 } from 'lucide-react';
import './SharedStyles.css';
import PasswordInput from './PasswordInput';
import ForgotPassword from './ForgotPassword';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '',
    rememberMe: false 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUsername && savedRememberMe) {
      setCredentials(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://khlcle.pythonanywhere.com/api/owner/', {
        username: credentials.username,
        password: credentials.password
      });

      if (response && response.data) {
        if (response.data.access) {
          // Handle Remember Me functionality
          if (credentials.rememberMe) {
            localStorage.setItem('rememberedUsername', credentials.username);
            localStorage.setItem('rememberMe', 'true');
          } else {
            localStorage.removeItem('rememberedUsername');
            localStorage.setItem('rememberMe', 'false');
          }

          // Store authentication token
          localStorage.setItem('ownerToken', response.data.access);

          if (response.data.coffee_shop_id) {
            localStorage.setItem('coffeeShopId', response.data.coffee_shop_id);
            onLogin();
            navigate('/dashboard');
          } else {
            setError('No coffee shop associated with this account');
          }
        } else {
          setError('Login successful, but token not received. Please try again.');
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
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          flex: '1',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: 'var(--color-primary)',
              marginBottom: '0.5rem'
            }}>Coffee Shop Owner Login</h2>
            <p style={{
              color: 'var(--color-text-light)',
              marginBottom: '2rem'
            }}>Enter your credentials to access your coffee shop dashboard</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
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
                <label className="form-label">Password</label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
              
              {/* Remember Me Checkbox */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={credentials.rememberMe}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              <div style={{
                textAlign: 'right',
                marginTop: '0.5rem'
              }}>
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  style={{
                    color: 'var(--color-text)',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
                style={{ marginTop: '1.5rem' }}
              >
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
        
        <div style={{
          flex: '1',
          position: 'relative',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yl5yTCrtDoB2lrgxZoEXp5tyGfjCku.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.6'
          }} />
          <div style={{
            position: 'relative',
            textAlign: 'center',
            color: 'white'
          }}>
            <Coffee size={48} />
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginTop: '1rem'
            }}>KohiLocale</h2>
            <p style={{
              marginTop: '0.5rem',
              opacity: '0.9'
            }}>Brewing success, one cup at a time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;