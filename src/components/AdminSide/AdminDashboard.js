import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import SidebarMenu from './SideBarMenu';
import { CoffeeLoader } from '../ui/CoffeeLoader';
import DashboardReport from './DashboardReport';
import './SharedStyles.css';

const AdminDashboard = ({ handleOwnerLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [visitsData, setVisitsData] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [visitsFilter, setVisitsFilter] = useState('month');
  const [reviewsFilter, setReviewsFilter] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      
      try {
        // Fetch all data concurrently
        const [visitsResponse, reviewsResponse, dashboardResponse] = await Promise.all([
          axios.get(
            `https://khlcle.pythonanywhere.com/api/dashboard/visits/?filter=${visitsFilter}`,
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
            }
          ),
          axios.get(
            `https://khlcle.pythonanywhere.com/api/dashboard/reviews/?filter=${reviewsFilter}`,
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
            }
          ),
          axios.get(
            'https://khlcle.pythonanywhere.com/api/dashboard/',
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
            }
          )
        ]);

        setVisitsData(visitsResponse.data);
        setReviewsData(reviewsResponse.data);
        setDashboardData(dashboardResponse.data);

        // Calculate remaining time to show loader
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(2000 - elapsedTime, 0);
        
        // Keep showing loader for remaining time
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [visitsFilter, reviewsFilter]);

  const handleError = (error) => {
    if (error.response?.status === 401) {
      handleOwnerLogout();
      navigate('/admin-login');
    } else {
      console.error('Error fetching data:', error);
    }
  };

  const FilterButtons = ({ filter, setFilter, label }) => (
    <div className="filter-buttons">
      <span className="filter-label">{label}:</span>
      {['day', 'week', 'month', 'year'].map((period) => (
        <button
          key={period}
          className={`filter-button ${filter === period ? 'active' : ''}`}
          onClick={() => setFilter(period)}
        >
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </button>
      ))}
    </div>
  );

  

  return (
    <div className="admin-layout">
      <SidebarMenu 
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={(item) => {
          setActiveMenuItem(item.name);
          navigate(item.path);
        }}
        onLogout={() => {
          handleOwnerLogout();
          navigate('/admin-login');
        }}
      />

      <main className="main-content">
      {isLoading ? (
          <div className="loader-container">
            <CoffeeLoader size={80} color="#8B4513" />
          </div>
        ) : (
          <div>
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          {!isLoading && (
          <DashboardReport
            visitsData={visitsData}
            reviewsData={reviewsData}
            dashboardData={dashboardData}
            visitsFilter={visitsFilter}
            reviewsFilter={reviewsFilter}
          />
        )}
        </div>

        <div className="dashboard-content">
          {/* Visits Chart */}
          <div className="settings-form">
            <div className="card-header">
              <h2 className="card-title">Visits Over Time</h2>
              <FilterButtons
                filter={visitsFilter}
                setFilter={setVisitsFilter}
                label="Filter by"
              />
            </div>
            <div className="card-content">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={visitsData.visits_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="#8884d8" 
                      name="Visits"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Reviews Chart */}
          <div className="settings-form">
            <div className="card-header">
              <h2 className="card-title">Reviews Analysis</h2>
              <FilterButtons
              filter={reviewsFilter}
              setFilter={setReviewsFilter}
              label="Filter by"
            />
          </div>
          <div className="card-content">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reviewsData.reviews_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  {/* Left Y-axis for average rating */}
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 5]}
                    tickCount={6}
                    label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }}
                  />
                  {/* Right Y-axis for review count */}
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Number of Reviews', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="average_rating" 
                    stroke="#82ca9d" 
                    name="Average Rating"
                    yAxisId="left"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="review_count" 
                    stroke="#ffc658" 
                    name="Number of Reviews"
                    yAxisId="right"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

          <div className="dashboard-grid">
            {/* Favorites Card */}
            <div className="settings-form">
              <div className="card-header">
                <h2 className="card-title">Favorites</h2>
              </div>
              <div className="card-content">
                <p className="stat-value">{dashboardData.favorite_count}</p>
                <p className="stat-label">Users have favorited your coffee shop</p>
              </div>
            </div>

            {/* Recent Reviews Card */}
            <div className="settings-form">
              <div className="card-header">
                <h2 className="card-title">Recent Reviews</h2>
              </div>
              <div className="card-content">
                <div className="reviews-list">
                  {reviewsData.recent_reviews.map((review, index) => (
                    <div key={index} className="review-item-dashboard">
                      <p className="review-content">{review.content}</p>
                      <div className="review-footer">
                        <p className="review-author">- {review.author}</p>
                        <div className="star-rating">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`star ${i < review.rating ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="view-all-button"
                  onClick={() => navigate('/dashboard/reviews')}
                >
                  View All Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
       )}
       </main>
     </div>
   );
 };

export default AdminDashboard;