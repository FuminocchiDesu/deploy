import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardReport = ({ visitsData, reviewsData, dashboardData, visitsFilter, reviewsFilter }) => {
  const getGraphDimensions = (data, valueKey) => {
    if (!data || data.length === 0) return { min: 0, max: 0 };
    const values = data.map(item => item[valueKey]);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const generateReport = () => {
    const reportWindow = window.open('', '_blank');
    const visitsDimensions = getGraphDimensions(visitsData.visits_data, 'visits');
    const reviewCountDimensions = getGraphDimensions(reviewsData.reviews_data, 'review_count');

    // Create the chart components as React elements
    const VisitsChart = () => (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={visitsData.visits_data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 'auto']} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="visits" 
            stroke="#8884d8" 
            name="Visits"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );

    const ReviewsChart = () => (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={reviewsData.reviews_data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            yAxisId="left"
            domain={[0, 5]}
            tickCount={6}
            label={{ value: 'Average Rating', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 'auto']}
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
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="review_count" 
            stroke="#ffc658" 
            name="Number of Reviews"
            yAxisId="right"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );

    reportWindow.document.write(`
      <html>
        <head>
          <title>Dashboard Report</title>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.12.0/Recharts.js"></script>
          <style>
            :root {
              --primary-color: #1a365d;
              --secondary-color: #2d3748;
              --accent-color: #4299e1;
              --background-color: #f7fafc;
              --text-color: #2d3748;
              --border-radius: 12px;
              --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 40px;
              background-color: var(--background-color);
              color: var(--text-color);
              line-height: 1.5;
            }
            
            .report-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: var(--border-radius);
              box-shadow: var(--shadow-md);
              overflow: hidden;
            }
            
            .report-header {
              background: var(--primary-color);
              color: white;
              padding: 32px;
              text-align: center;
            }
            
            .report-header h1 {
              margin: 0;
              font-size: 2.5rem;
              font-weight: 700;
            }
            
            .report-header p {
              margin: 8px 0 0;
              opacity: 0.9;
            }
            
            .report-content {
              padding: 32px;
            }
            
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 24px;
              margin: 32px 0;
            }
            
            .metric-card {
              background: white;
              padding: 24px;
              border-radius: var(--border-radius);
              box-shadow: var(--shadow-sm);
              border: 1px solid #e2e8f0;
              transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .metric-card:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow-md);
            }
            
            .metric-value {
              font-size: 2.5rem;
              font-weight: 700;
              color: var(--primary-color);
              line-height: 1;
              margin-bottom: 8px;
            }
            
            .metric-label {
              color: var(--secondary-color);
              font-size: 0.875rem;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            
            .chart-container {
              background: white;
              padding: 24px;
              border-radius: var(--border-radius);
              box-shadow: var(--shadow-sm);
              border: 1px solid #e2e8f0;
              margin: 32px 0;
              height: 450px;
            }
            
            .chart-title {
              font-size: 1.25rem;
              font-weight: 600;
              color: var(--secondary-color);
              margin-bottom: 16px;
            }
            
            .filter-info {
              background: #edf2f7;
              padding: 16px;
              border-radius: var(--border-radius);
              margin: 32px 0;
            }
            
            .filter-info h3 {
              margin: 0 0 8px;
              font-size: 1rem;
              color: var(--secondary-color);
            }
            
            .filter-info p {
              margin: 4px 0;
              font-size: 0.875rem;
              color: var(--text-color);
            }
            
            .print-button {
              display: inline-block;
              background: var(--accent-color);
              color: white;
              padding: 12px 24px;
              border-radius: var(--border-radius);
              border: none;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            }
            
            .print-button:hover {
              background: #2b6cb0;
            }
            
            @media print {
              body {
                padding: 0;
                background: white;
              }
              
              .report-container {
                box-shadow: none;
              }
              
              .print-button {
                display: none;
              }
              
              .chart-container {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <h1>Coffee Shop Analytics</h1>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>

            <div class="report-content">
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value">${dashboardData.favorite_count.toLocaleString()}</div>
                  <div class="metric-label">Total Favorites</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${
                    reviewsData.reviews_data.reduce((acc, curr) => acc + curr.review_count, 0).toLocaleString()
                  }</div>
                  <div class="metric-label">Total Reviews</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${
                    (reviewsData.reviews_data.reduce((acc, curr) => acc + (curr.average_rating * curr.review_count), 0) /
                    reviewsData.reviews_data.reduce((acc, curr) => acc + curr.review_count, 0)).toFixed(1)
                  }</div>
                  <div class="metric-label">Average Rating</div>
                </div>
              </div>

              <div class="chart-container">
                <div class="chart-title">Visits Trend Analysis</div>
                <div id="visits-chart"></div>
              </div>

              <div class="chart-container">
                <div class="chart-title">Reviews Analysis</div>
                <div id="reviews-chart"></div>
              </div>

              <div class="filter-info">
                <h3>Analysis Parameters</h3>
                <p>Visits data filtered by: ${visitsFilter}</p>
                <p>Reviews data filtered by: ${reviewsFilter}</p>
              </div>

              <button class="print-button" onclick="window.print()">
                Download Report
              </button>
            </div>
          </div>

          <script>
            // Wait for Recharts to load
            window.onload = function() {
              // Render visits chart
              const visitsChart = ${VisitsChart.toString()};
              ReactDOM.render(
                React.createElement(visitsChart),
                document.getElementById('visits-chart')
              );

              // Render reviews chart
              const reviewsChart = ${ReviewsChart.toString()};
              ReactDOM.render(
                React.createElement(reviewsChart),
                document.getElementById('reviews-chart')
              );
            };
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <button
          onClick={generateReport}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default DashboardReport;