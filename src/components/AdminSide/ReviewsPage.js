import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Timer } from 'lucide-react';
import SidebarMenu from './SideBarMenu';
import './SharedStyles.css';

function ReviewsPage({ handleOwnerLogout }) {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrExpiryTime, setQrExpiryTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [duration, setDuration] = useState('1d');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  const fetchReviews = useCallback(async () => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/ratings/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReviews(response.data);
    } catch (err) {
      setError('Failed to fetch reviews. Please try again.');
      console.error('Error fetching reviews:', err);
      handleOwnerLogout();
      navigate('/admin-login');
    }
  }, [handleOwnerLogout, navigate]);

  const fetchLatestQRCode = useCallback(async () => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      
      const metadataResponse = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/qr-metadata/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (metadataResponse.data.expires_at) {
        setQrExpiryTime(metadataResponse.data.expires_at);
        
        const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/latest-qr-code/`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*',
          },
          responseType: 'blob'
        });
        const url = URL.createObjectURL(response.data);
        setQrCodeUrl(url);
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchLatestQRCode();
  }, [fetchReviews, fetchLatestQRCode]);

  useEffect(() => {
    let timer;
    if (qrExpiryTime) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(qrExpiryTime).getTime();
        const timeLeft = expiry - now;

        if (timeLeft <= 0) {
          setRemainingTime(null);
          setQrCodeUrl(null);
          setQrExpiryTime(null);
          clearInterval(timer);
        } else {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

          setRemainingTime({ days, hours, minutes, seconds });
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [qrExpiryTime]);

  const generateQRCode = async () => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/generate-qr/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
        },
        params: { duration },
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      setQrCodeUrl(url);
      
      await fetchLatestQRCode();
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < rating ? 'var(--color-primary)' : 'none'}
        stroke={index < rating ? 'var(--color-primary)' : 'var(--color-text-light)'}
      />
    ))
  }

  const renderRemainingTime = () => {
    if (!remainingTime) return null;
    
    return (
      <div className="remaining-time">
        <Timer className="timer-icon" size={16} />
        <span>
          Expires in: {remainingTime.days > 0 ? `${remainingTime.days}d ` : ''}
          {remainingTime.hours.toString().padStart(2, '0')}:
          {remainingTime.minutes.toString().padStart(2, '0')}:
          {remainingTime.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />

      <main className="main-content">
        <header className="page-header">
          <h1 className='page-title'>Customer Reviews</h1>
        </header>

        <div className="dashboard-content">
          {error && (
            <div className="error-message" role="alert">
              <strong>Error!</strong> {error}
            </div>
          )}
          
          {qrCodeUrl && (
            <div className="qr-code-container">
              <h2>Current Active QR Code for Ratings</h2>
              <img src={qrCodeUrl} alt="QR Code for Ratings" className="qr-code-image" />
              {renderRemainingTime()}
              <a href={qrCodeUrl} download="ratings-qr-code.png" className="download-button">
                <QrCode size={20} />
                Download QR Code
              </a>
            </div>
          )}

          <div className="info-box">
            <h2>QR Code Generator</h2>
            <p>Generate a QR code to allow customers to rate your coffee shop.</p>
          </div>

          <div className="qr-generator">
            <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="duration-select"
            >
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
            </select>

            <button 
              onClick={() => setShowConfirmDialog(true)} 
              className="generate-button"
            >
              <QrCode size={20} />
              Generate QR Code
            </button>
          </div>

          {showConfirmDialog && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Generate New QR Code?</h3>
                <p>
                  This will generate a new QR code for customer ratings. Do you want to proceed?
                </p>
                <div className="modal-actions">
                  <button
                    className="confirm-button"
                    onClick={generateQRCode}
                  >
                    Continue
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="reviews-container">
            <ul className="review-list">
              {reviews.map(review => (
                <li key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{review.user.username}</span>
                    <div className="review-rating">{renderStars(review.stars)}</div>
                  </div>
                  <p className="review-content">{review.description}</p>
                  <p className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .main-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }
          
        .error-message {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
        }

        .qr-code-container {
          background-color: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .qr-code-container h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .qr-code-image {
          width: 200px;
          height: 200px;
          margin-bottom: 1rem;
        }

        .remaining-time {
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .timer-icon {
          margin-right: 0.5rem;
        }

        .download-button {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #A0522D;
          color: white;
          border-radius: 0.375rem;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .download-button:hover {
          background-color: #D2B48C;
        }

        .download-button svg {
          margin-right: 0.5rem;
        }

        .info-box {
          background-color: #F5DEB3;
          border-left: 4px solid #A0522D;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 0.375rem;
        }

        .info-box h2 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #A0522D;
        }

        .info-box p {
          color: #A0522D;
          margin: 0;
        }

        .qr-generator {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .duration-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          margin-right: 1rem;
          background-color: white;
        }

        .generate-button {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background-color: #A0522D;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .generate-button:hover {
          background-color: #D2B48C;
        }

        .generate-button svg {
          margin-right: 0.5rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background-color: white;
          padding: 2rem;
          border-radius: 0.5rem;
          max-width: 400px;
          width: 100%;
        }

        .modal-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .modal-content p {
          margin-bottom: 1.5rem;
          color: #666;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
        }

        .modal-actions button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
        }

        .confirm-button {
          background-color: #A0522D;
          color: white;
          border: none;
          margin-right: 0.5rem;
        }

        .confirm-button:hover {
          background-color: #D2B48C;
        }

        .cancel-button {
          background-color: white;
          color: #666;
          border: 1px solid #d1d5db;
        }

        

        .cancel-button:hover {
          background-color: #f3f4f6;
        }

        .reviews-container {
          background-color: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .review-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .review-item {
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 0;
        }

        .review-item:last-child {
          border-bottom: none;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .review-author {
          font-weight: 600;
          color: #333;
        }

        .review-rating {
          display: flex;
        }

        .review-content {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }

        .review-date {
          font-size: 0.875rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

export default ReviewsPage;