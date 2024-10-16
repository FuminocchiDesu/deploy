// ReviewsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from './SideBarMenu';

const ReviewsPage = ({ handleOwnerLogout }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
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

  const generateQRCode = async (shopId, token) => {
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/generate-qr/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*', // Accept any format
        },
        responseType: 'blob'  // Expect binary data (like an image)
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
        fill={index < rating ? '#FFD700' : 'none'}
        stroke={index < rating ? '#FFD700' : '#D1D5DB'}
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
          <h1>Customer Reviews</h1>
        </header>

        <div className="dashboard-content">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button
  onClick={() => {
    const token = localStorage.getItem('ownerToken');
    const shopId = localStorage.getItem('coffeeShopId');
    generateQRCode(shopId, token);
  }}
  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
>
  <QrCode className="mr-2" size={20} />
  Generate QR Code
</button>
      {qrCodeUrl && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">QR Code for Ratings</h2>
          <img src={qrCodeUrl} alt="QR Code for Ratings" className="w-64 h-64" />
        </div>
      )}

          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="font-semibold mr-2">{review.user.username}</span>
                  <div className="flex">{renderStars(review.stars)}</div>
                </div>
                <p className="text-gray-600">{review.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewsPage;