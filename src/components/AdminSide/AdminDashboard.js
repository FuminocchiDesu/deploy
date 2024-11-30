import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import SidebarMenu from './SideBarMenu';
import { CoffeeLoader } from '../ui/CoffeeLoader';
import DashboardReport from './DashboardReport';
import FavoritesCard from './FavoritesCard';
import DatePicker from './DatePicker';
import './SharedStyles.css';

const AdminDashboard = ({ 
  handleOwnerLogout, 
  notifications = [], 
  clearNotifications = () => {}, 
  markNotificationAsRead = () => {} 
}) => {
  // Set default date range to current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  };

  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [visitsData, setVisitsData] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Initialize with current month's start and end dates
  const { startDate: currentMonthStart, endDate: currentMonthEnd } = getCurrentMonthRange();
  const [visitsStartDate, setVisitsStartDate] = useState(currentMonthStart);
  const [visitsEndDate, setVisitsEndDate] = useState(currentMonthEnd);
  const [reviewsStartDate, setReviewsStartDate] = useState(currentMonthStart);
  const [reviewsEndDate, setReviewsEndDate] = useState(currentMonthEnd);
  
  const [isLoading, setIsLoading] = useState(true);
  const [noVisitsData, setNoVisitsData] = useState(false);
  const [noReviewsData, setNoReviewsData] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateStr);
      return dateStr;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setNoVisitsData(false);
      setNoReviewsData(false);
      const startTime = Date.now();
      
      try {
        // Comprehensive query parameters for visits and reviews
        const visitsParams = {
          start_date: visitsStartDate,
          end_date: visitsEndDate
        };

        const reviewsParams = {
          start_date: reviewsStartDate,
          end_date: reviewsEndDate
        };

        const [visitsResponse, reviewsResponse, dashboardResponse] = await Promise.all([
          axios.get(
            'https://khlcle.pythonanywhere.com/api/dashboard/visits/',
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` },
              params: visitsParams
            }
          ),
          axios.get(
            'https://khlcle.pythonanywhere.com/api/dashboard/reviews/',
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` },
              params: reviewsParams
            }
          ),
          axios.get(
            'https://khlcle.pythonanywhere.com/api/dashboard/',
            {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
            }
          )
        ]);

        // Check if visits data is empty
        if (!visitsResponse.data.visits_data || visitsResponse.data.visits_data.length === 0) {
          setNoVisitsData(true);
        }

        // Check if reviews data is empty
        if (!reviewsResponse.data.reviews_data || reviewsResponse.data.reviews_data.length === 0) {
          setNoReviewsData(true);
        }

        setVisitsData(visitsResponse.data);
        setReviewsData(reviewsResponse.data);
        setDashboardData(dashboardResponse.data);
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(2000 - elapsedTime, 0);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [visitsStartDate, visitsEndDate, reviewsStartDate, reviewsEndDate]);

  const handleError = (error) => {
    if (error.response?.status === 401) {
      handleOwnerLogout();
      navigate('/admin-login');
    } else {
      console.error('Error fetching data:', error);
    }
  };

  const DateRangeSelector = ({ 
    label, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate 
  }) => {
    const resetToCurrentMonth = () => {
      const { startDate: currentStart, endDate: currentEnd } = getCurrentMonthRange();
      setStartDate(currentStart);
      setEndDate(currentEnd);
    };

    return (
      <div className="date-range-selector">
        <span className="filter-label">{label}:</span>
        <div className="custom-date-range flex items-center space-x-2 ml-4">
          <span>From:</span>
          <DatePicker 
            value={startDate} 
            onChange={setStartDate} 
          />
          <span>To:</span>
          <DatePicker 
            value={endDate} 
            onChange={setEndDate} 
          />
          {(startDate !== getCurrentMonthRange().startDate || 
            endDate !== getCurrentMonthRange().endDate) && (
            <button 
              className="reset-filter-btn"
              onClick={resetToCurrentMonth}
            >
              Reset to Current Month
            </button>
          )}
        </div>
      </div>
    );
  };

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
        notifications={notifications}
        clearNotifications={clearNotifications}
        markNotificationAsRead={markNotificationAsRead}
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
                <DashboardReport
                  visitsData={visitsData}
                  reviewsData={reviewsData}
                  dashboardData={dashboardData}
                />       
            </div>

            <div className="dashboard-content">
              {/* Visits Chart */}
              <div className="settings-form">
                <div className="card-header">
                  <h2 className="card-title">Visits Over Time</h2>
                  <DateRangeSelector
                    label="Filter by Date"
                    startDate={visitsStartDate}
                    setStartDate={setVisitsStartDate}
                    endDate={visitsEndDate}
                    setEndDate={setVisitsEndDate}
                  />
                </div>
                <div className="card-content">
                  {noVisitsData ? (
                    <div className="no-data-message">
                      No data found for the selected dates
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={visitsData?.visits_data || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="period" 
                            tickFormatter={(value) => formatDate(value)}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={formatDate} 
                          />
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
                  )}
                </div>
              </div>

              {/* Reviews Chart */}
              <div className="settings-form">
                <div className="card-header">
                  <h2 className="card-title">Reviews Analysis</h2>
                  <DateRangeSelector
                    label="Filter by Date"
                    startDate={reviewsStartDate}
                    setStartDate={setReviewsStartDate}
                    endDate={reviewsEndDate}
                    setEndDate={setReviewsEndDate}
                  />
                </div>
                <div className="card-content">
                  {noReviewsData ? (
                    <div className="no-data-message">
                      No data found for the selected dates
                    </div>
                  ) : (
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={reviewsData?.reviews_data || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="period" 
                            tickFormatter={(value) => formatDate(value)}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            yAxisId="left"
                            domain={[0, 5]}
                            tickCount={6}
                            label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            label={{ value: 'Number of Reviews', angle: 90, position: 'insideRight' }}
                          />
                          <Tooltip 
                            labelFormatter={formatDate} 
                          />
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
                  )}
                </div>
              </div>

              <div className="dashboard-grid">
                {/* Favorites Card */}
                <div className="settings-form">
                <FavoritesCard dashboardData={dashboardData} />
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