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
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [visitsData, setVisitsData] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [visitsFilter, setVisitsFilter] = useState('month');
  const [reviewsFilter, setReviewsFilter] = useState('month');
  const [visitsYear, setVisitsYear] = useState(null);
  const [visitsMonth, setVisitsMonth] = useState(null);
  const [visitsWeek, setVisitsWeek] = useState(null);
  const [reviewsYear, setReviewsYear] = useState(null);
  const [reviewsMonth, setReviewsMonth] = useState(null);
  const [reviewsWeek, setReviewsWeek] = useState(null);
  const [visitsStartDate, setVisitsStartDate] = useState(null);
  const [visitsEndDate, setVisitsEndDate] = useState(null);
  const [reviewsStartDate, setReviewsStartDate] = useState(null);
  const [reviewsEndDate, setReviewsEndDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const formatDate = (dateStr, filter = 'month', options = {}) => {
    if (!dateStr) return '';
    
    // Handle different potential date formats
    let date = new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      try {
        date = new Date(Date.parse(dateStr));
      } catch (error) {
        console.warn('Invalid date:', dateStr);
        return dateStr;
      }
    }

    // Formatting based on filter type
    switch(filter) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'week':
        // Calculate the start and end of the week
        const startOfWeek = new Date(date);
        const endOfWeek = new Date(date);
        
        // Adjust to the first day of the week (assuming Sunday is the first day)
        startOfWeek.setDate(date.getDate() - date.getDay());
        endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
        
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}`;
      
      case 'month':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      
      case 'year':
        return date.getFullYear().toString();
      
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
    }
  };

  // Enhanced chart title generator
  const generateChartTitle = (filter, year, month, week, startDate, endDate) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    switch(filter) {
      case 'day':
        return 'Daily Analysis';
      
      case 'week':
        if (week) {
          const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });
          const weekStart = (week - 1) * 7 + 1;
          const weekEnd = week * 7;
          return `Week ${week}: ${monthName} ${weekStart}-${weekEnd}, ${currentYear}`;
        }
        return 'Weekly Analysis';
      
      case 'month':
        if (month) {
          const monthName = new Date(currentYear, month - 1).toLocaleString('default', { month: 'long' });
          return `${monthName} ${year || currentYear}`;
        }
        return 'Monthly Analysis';
      
      case 'year':
        return `Analysis for ${year || currentYear}`;
      
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          return `Custom Period: ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return 'Custom Period Analysis';
      
      default:
        return 'Analysis';
    }
  };

  // Custom Tooltip to handle date formatting with filter context
  const CustomTooltip = ({ active, payload, label }) => {
    const currentFilter = activeMenuItem === 'Visits' ? visitsFilter : reviewsFilter;
    
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc'
        }}>
          <p>{formatDate(label, currentFilter)}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      
      try {
        // More comprehensive query parameters for visits
        const visitsParams = {
          filter: visitsFilter,
          ...(visitsYear && { year: visitsYear }),
          ...(visitsMonth && { month: visitsMonth }),
          ...(visitsWeek && { week: visitsWeek }),
          ...(visitsFilter === 'custom' && visitsStartDate && visitsEndDate && {
            start_date: visitsStartDate,
            end_date: visitsEndDate
          })
        };

        // Similar comprehensive query parameters for reviews
        const reviewsParams = {
          filter: reviewsFilter,
          ...(reviewsYear && { year: reviewsYear }),
          ...(reviewsMonth && { month: reviewsMonth }),
          ...(reviewsWeek && { week: reviewsWeek }),
          ...(reviewsFilter === 'custom' && reviewsStartDate && reviewsEndDate && {
            start_date: reviewsStartDate,
            end_date: reviewsEndDate
          })
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
  }, [
    visitsFilter, visitsYear, visitsMonth, visitsWeek, 
    visitsStartDate, visitsEndDate,
    reviewsFilter, reviewsYear, reviewsMonth, reviewsWeek, 
    reviewsStartDate, reviewsEndDate
  ]);


  const handleError = (error) => {
    if (error.response?.status === 401) {
      handleOwnerLogout();
      navigate('/admin-login');
    } else {
      console.error('Error fetching data:', error);
    }
  };

  const FilterButtons = ({ 
    filter, 
    setFilter, 
    label, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate,
    year, 
    setYear, 
    month, 
    setMonth, 
    week, 
    setWeek 
  }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const weeks = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
      <div className="filter-buttons">
        <span className="filter-label">{label}:</span>
        {['day', 'week', 'month', 'year', 'custom'].map((period) => (
          <React.Fragment key={period}>
            <button
              className={`filter-button ${filter === period ? 'active' : ''}`}
              onClick={() => {
                setFilter(period);
                // Reset specific parameters when changing filter
                setYear(null);
                setMonth(null);
                setWeek(null);
                setStartDate(null);
                setEndDate(null);
              }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
            
            {filter === period && period !== 'custom' && period !== 'year' && (
              <select 
                value={month || ''} 
                onChange={(e) => setMonth(e.target.value ? parseInt(e.target.value) : null)}
                className="filter-select"
              >
                <option value="">All Months</option>
                {months.map(m => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            )}
            
            {filter === period && period !== 'custom' && period === 'week' && (
              <select 
                value={week || ''} 
                onChange={(e) => setWeek(e.target.value ? parseInt(e.target.value) : null)}
                className="filter-select"
              >
                <option value="">All Weeks</option>
                {weeks.map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            )}
            
            {filter === period && period !== 'custom' && period === 'year' && (
              <select 
                value={year || ''} 
                onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : null)}
                className="filter-select"
              >
                <option value="">Current Year</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
            
            {filter === 'custom' && period === 'custom' && (
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
              </div>
            )}
          </React.Fragment>
        ))}
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
                  visitsFilter={visitsFilter}
                  reviewsFilter={reviewsFilter}
                />       
            </div>

            <div className="dashboard-content">
              {/* Visits Chart */}
            <div className="settings-form">
              <div className="card-header">
                <h2 className="card-title">Visits Over Time</h2>
                {generateChartTitle(
                      visitsFilter, 
                      visitsYear, 
                      visitsMonth, 
                      visitsWeek, 
                      visitsStartDate, 
                      visitsEndDate
                    )}
                <FilterButtons
                    filter={visitsFilter}
                    setFilter={setVisitsFilter}
                    label="Filter by"
                    startDate={visitsStartDate}
                    setStartDate={setVisitsStartDate}
                    endDate={visitsEndDate}
                    setEndDate={setVisitsEndDate}
                    year={visitsYear}
                    setYear={setVisitsYear}
                    month={visitsMonth}
                    setMonth={setVisitsMonth}
                    week={visitsWeek}
                    setWeek={setVisitsWeek}
                  />
              </div>
              <div className="card-content">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={visitsData?.visits_data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tickFormatter={(value) => formatDate(value, visitsFilter)}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip 
                        content={<CustomTooltip />} 
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
              </div>
            </div>

            {/* Reviews Chart */}
            <div className="settings-form">
              <div className="card-header">
                <h2 className="card-title">Reviews Analysis</h2>
                {generateChartTitle(
                      reviewsFilter, 
                      reviewsYear, 
                      reviewsMonth, 
                      reviewsWeek, 
                      reviewsStartDate, 
                      reviewsEndDate
                    )}
                <FilterButtons
                    filter={reviewsFilter}
                    setFilter={setReviewsFilter}
                    label="Filter by"
                    startDate={reviewsStartDate}
                    setStartDate={setReviewsStartDate}
                    endDate={reviewsEndDate}
                    setEndDate={setReviewsEndDate}
                    year={reviewsYear}
                    setYear={setReviewsYear}
                    month={reviewsMonth}
                    setMonth={setReviewsMonth}
                    week={reviewsWeek}
                    setWeek={setReviewsWeek}
                  />
              </div>
              <div className="card-content">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reviewsData?.reviews_data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tickFormatter={(value) => formatDate(value, reviewsFilter)}
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
                        content={<CustomTooltip />} 
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