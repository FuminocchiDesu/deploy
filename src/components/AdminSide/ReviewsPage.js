import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode } from 'lucide-react';
import SidebarMenu from './SideBarMenu';
import './SharedStyles.css';

const ReviewsPage = ({ handleOwnerLogout }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const [qrCodeUrl, 

 setQrCodeUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
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
    }
  };

  const generateQRCode = async () => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/generate-qr/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
        },
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      setQrCodeUrl(url);
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
          <h1 className="text-2xl font-bold mb-4">Customer Reviews</h1>
        </header>

        <div className="dashboard-content">
          {error && <div className="error-message">{error}</div>}
          <button
            onClick={generateQRCode}
            className="button primary flex items-center mb-4"
          >
            <QrCode className="mr-2" size={20} />
            Generate QR Code
          </button>
          {qrCodeUrl && (
            <div className="mt-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">QR Code for Ratings</h2>
              <img src={qrCodeUrl} alt="QR Code for Ratings" className="w-64 h-64" />
            </div>
          )}

          <div className="reviews-container">
            <ul className="review-list">
              {reviews.map(review => (
                <li key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="font-semibold">{review.user.username}</span>
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
    </div>
  );
};

export default ReviewsPage;