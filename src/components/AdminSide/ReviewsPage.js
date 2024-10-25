import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Timer } from 'lucide-react';
import SidebarMenu from './SideBarMenu';
import './SharedStyles.css';

const ReviewsPage = ({ handleOwnerLogout }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrExpiryTime, setQrExpiryTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [duration, setDuration] = useState('1d');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
    fetchLatestQRCode();
  }, []);

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
      handleOwnerLogout();
      navigate('/admin-login');
    }
  };

  const fetchLatestQRCode = async () => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      
      // First fetch the QR code metadata
      const metadataResponse = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/qr-metadata/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (metadataResponse.data.expires_at) {
        setQrExpiryTime(metadataResponse.data.expires_at);
        
        // Then fetch the QR code image
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
        params: { duration },
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      setQrCodeUrl(url);
      
      // Fetch the updated metadata after generating new QR code
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
      <div className="flex items-center text-sm text-gray-600 mt-2">
        <Timer className="mr-2" size={16} />
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
          <h1 className="text-2xl font-bold mb-4">Customer Reviews</h1>
        </header>

        <div className="dashboard-content">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          {qrCodeUrl && (
            <div className="mt-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Current Active QR Code for Ratings</h2>
              <img src={qrCodeUrl} alt="QR Code for Ratings" className="w-64 h-64 mb-4" />
              {renderRemainingTime()}
              <a href={qrCodeUrl} download="ratings-qr-code.png" className="mt-4 inline-block">
                <button className="button primary flex items-center">
                  <QrCode className="mr-2" size={20} />
                  Download QR Code
                </button>
              </a>
            </div>
          )}

          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
            <h1 className="font-bold">QR Code Generator</h1>
            <p>Generate a QR code to allow customers to rate your coffee shop.</p>
          </div>

          <div className="flex items-center mb-4">
            <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="mr-4 p-2 border rounded"
            >
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
            </select>

            <button 
              onClick={() => setShowConfirmDialog(true)} 
              className="button primary flex items-center"
            >
              <QrCode className="mr-2" size={20} />
              Generate QR Code
            </button>
          </div>

          {showConfirmDialog && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Generate New QR Code?</h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      This will generate a new QR code for customer ratings. Do you want to proceed?
                    </p>
                  </div>
                  <div className="items-center px-4 py-3">
                    <button
                      id="ok-btn"
                      className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      onClick={generateQRCode}
                    >
                      Continue
                    </button>
                    <button
                      id="cancel-btn"
                      className="mt-3 px-4 py-2 bg-white text-gray-500 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      onClick={() => setShowConfirmDialog(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
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