import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Timer } from 'lucide-react';
import SidebarMenu from './SideBarMenu';
import DateFilterModal from './DateFilterModal';
import { CoffeeLoader } from '../ui/CoffeeLoader';
import './SharedStyles.css';

function ReviewsPage({ handleOwnerLogout, 
  notifications = [], 
  clearNotifications = () => {}, 
  markNotificationAsRead = () => {},
  coffeeShopName = 'Coffee Shop Dashboard'
}) {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrExpiryTime, setQrExpiryTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [duration, setDuration] = useState('1d');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isDateFilterModalOpen, setIsDateFilterModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const openDateFilterModal = () => {
    setIsDateFilterModalOpen(true);
  };

  const closeDateFilterModal = () => {
    setIsDateFilterModalOpen(false);
  };

  const navigate = useNavigate();

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/ratings/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReviews(response.data);
      console.log(response.data);
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    } catch (err) {
      setError('Failed to fetch reviews. Please try again.');
      handleOwnerLogout();
      navigate('/admin-login');
    } finally {
      setIsLoading(false);
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
      
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    fetchLatestQRCode();
  }, [fetchReviews, fetchLatestQRCode]);

  useEffect(() => {
    filterReviews();
  }, [dateRange, reviews]);

  const filterReviews = () => {
    let filtered = [...reviews];

    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.created_at);
        reviewDate.setHours(0, 0, 0, 0);

        const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
        end?.setHours(23, 59, 59, 999);

        if (start && end) {
          return reviewDate >= start && reviewDate <= end;
        } else if (start) {
          return reviewDate >= start;
        } else if (end) {
          return reviewDate <= end;
        }
        return true;
      });
    }

    setFilteredReviews(filtered);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    // Array of month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Get components
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Format time with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
};

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

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
        notifications={notifications}
        clearNotifications={clearNotifications}
        markNotificationAsRead={markNotificationAsRead}
        coffeeShopName={coffeeShopName}
      />

      <main className="main-content">
      {isLoading ? (
            <div className="loader-container">
              <CoffeeLoader 
            size={80} 
            cupColor="#B5651D" 
            steamColor="#D2B48C" 
            saucerColor="#A0522D" 
          />
            </div>
          ) : (
            <div>
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
              <div className="modal-content-review">
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-700">Filter by Date Range</h3>
              </div>
              <div className="flex items-center">
                <DateFilterModal 
                  isOpen={isDateFilterModalOpen}
                  onClose={closeDateFilterModal}
                  dateRange={dateRange}
                  onDateChange={handleDateRangeChange}
                  onOpenModal={openDateFilterModal}
                />
              </div>
            </div>

            <ul className="review-list">
              {filteredReviews.map(review => (
                <li key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{review.user.username}</span>
                    <div className="review-rating">{renderStars(review.stars)}</div>
                  </div>
                  <p className="review-content">{review.description}</p>
                  <p className="review-date">
                    {formatDateTime(review.created_at)}
                  </p>
                </li>
              ))}
              {filteredReviews.length === 0 && (
                <li className="p-4 text-center text-gray-500">
                  No reviews found for the selected date range
                </li>
              )}
            </ul>
          </div>
          </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ReviewsPage;