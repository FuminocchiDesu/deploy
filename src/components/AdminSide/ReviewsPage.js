import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import './SharedStyles.css';

export default function Component({ handleOwnerLogout }) {
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const sidebarMenuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/owner_coffee_shop/reviews/?page=${currentPage}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setReviews(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 reviews per page
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

        {isLoading && <div className="loading">Loading reviews...</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="reviews-content">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="card review-card">
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
            ))
          ) : (
            <div className="no-reviews">No reviews found.</div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="button outline"
            >
              <ChevronLeft className="menu-icon" /> Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="button outline"
            >
              Next <ChevronRight className="menu-icon" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}