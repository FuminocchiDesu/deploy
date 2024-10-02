import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Star } from 'lucide-react';
import axios from 'axios';
import './SharedStyles.css';

const ReviewsPage = ({ handleOwnerLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  const sidebarMenuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('https://khlcle.pythonanywhere.com/api/reviews/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
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
      <aside className="sidebar">
        <div className="sidebar-header">
          <User className="menu-icon" />
          <span className="admin-title">Admin</span>
          <Bell className="menu-icon" />
        </div>
        <div className="sidebar-search">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <nav className="sidebar-menu">
          {sidebarMenuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activeMenuItem === item.name ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={onLogout}>
          <LogOut className="menu-icon" />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <h1>Customer Reviews</h1>
        </header>

        <div className="reviews-content">
          {reviews.map((review, index) => (
            <div key={index} className="card review-card">
              <div className="review-header">
                <h3>{review.author}</h3>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`star-icon ${i < review.rating ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <p className="review-content">{review.content}</p>
              <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ReviewsPage;