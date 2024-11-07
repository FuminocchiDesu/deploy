import React from 'react';

const DashboardReport = ({ visitsData, reviewsData, dashboardData, visitsFilter, reviewsFilter }) => {
    const createStaticSVGChart = (data, type) => {
        const width = 900;
        const height = 600;
        const padding = 60;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
      
        let maxValue, minValue;
        if (type === 'visits') {
          maxValue = Math.max(...data.map(d => d.visits));
          minValue = Math.min(...data.map(d => d.visits));
        } else {
          maxValue = Math.max(...data.map(d => Math.max(d.average_rating, d.review_count)));
          minValue = Math.min(...data.map(d => Math.min(d.average_rating, d.review_count)));
        }
      
        const xScale = chartWidth / (data.length - 1);
        const yScale = chartHeight / (maxValue - minValue);
      
        let path = '';
        let ratingPath = '';
        let reviewCountPath = '';
        let labels = '';
      
        data.forEach((d, i) => {
          const x = i * xScale + padding;
          if (type === 'visits') {
            const y = chartHeight - (d.visits - minValue) * yScale + padding;
            if (i === 0) path += `M${x},${y}`;
            else path += ` L${x},${y}`;
            labels += `
              <text x="${x}" y="${height - padding / 2}" text-anchor="middle" font-size="10" transform="rotate(90 ${x} ${height - padding / 2})">${d.date}</text>
              <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="10">${d.visits}</text>
            `;
          } else {
            const yRating = chartHeight - (d.average_rating - minValue) * yScale + padding;
            const yReviewCount = chartHeight - (d.review_count - minValue) * yScale + padding;
            if (i === 0) {
              ratingPath += `M${x},${yRating}`;
              reviewCountPath += `M${x},${yReviewCount}`;
            } else {
              ratingPath += ` L${x},${yRating}`;
              reviewCountPath += ` L${x},${yReviewCount}`;
            }
            labels += `
              <text x="${x}" y="${height - padding / 2}" text-anchor="middle" font-size="10" transform="rotate(90 ${x} ${height - padding / 2})">${d.date}</text>
              <text x="${x}" y="${yRating - 10}" text-anchor="middle" font-size="10" fill="green">${d.average_rating.toFixed(1)}</text>
              <text x="${x}" y="${yReviewCount - 10}" text-anchor="middle" font-size="10" fill="orange">${d.review_count}</text>
            `;
          }
        });
      
        // Y-axis labels
        const yAxisLabels = Array.from({ length: 6 }, (_, i) => {
          const value = minValue + (maxValue - minValue) * (i / 5);
          const y = chartHeight - (value - minValue) * yScale + padding;
          return `<text x="${padding - 5}" y="${y}" text-anchor="end" font-size="10">${value.toFixed(1)}</text>`;
        }).join('');
      
        return `
          <svg width="${width}" height="${height}">
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="black" />
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="black" />
            ${type === 'visits' 
              ? `<path d="${path}" fill="none" stroke="blue" stroke-width="2" />`
              : `<path d="${ratingPath}" fill="none" stroke="green" stroke-width="2" />
                 <path d="${reviewCountPath}" fill="none" stroke="orange" stroke-width="2" />`
            }
            ${labels}
            ${yAxisLabels}
            <text x="${width / 2}" y="${height - padding / 400}" text-anchor="middle" font-size="12">Date</text>
            <text x="${padding / 2}" y="${height / 2}" text-anchor="middle" font-size="12" transform="rotate(-90 ${padding / 2} ${height / 2})">${type === 'visits' ? 'Visits' : 'Rating / Review Count'}</text>
          </svg>
        `;
      };

  const generateReport = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const visitsChartSvg = createStaticSVGChart(visitsData.visits_data, 'visits');
    const reviewsChartSvg = createStaticSVGChart(reviewsData.reviews_data, 'reviews');

    reportWindow.document.write(`
      <html>
        <head>
          <title>Dashboard Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .report-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .chart-container { margin-bottom: 30px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .metric-card { background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; }
            .filter-info { background: #e0e0e0; padding: 15px; border-radius: 8px; margin-top: 30px; }
            .download-btn { background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }
            @media print { body { -webkit-print-color-adjust: exact; } .download-btn { display: none; } }
          </style>
        </head>
        <body>
          <div class="report-container">
            <h1>Coffee Shop Analytics Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${dashboardData.favorite_count.toLocaleString()}</div>
                <div>Total Favorites</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${
                  reviewsData.reviews_data.reduce((acc, curr) => acc + curr.review_count, 0).toLocaleString()
                }</div>
                <div>Total Reviews</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${
                  (reviewsData.reviews_data.reduce((acc, curr) => acc + (curr.average_rating * curr.review_count), 0) /
                  reviewsData.reviews_data.reduce((acc, curr) => acc + curr.review_count, 0)).toFixed(1)
                }</div>
                <div>Average Rating</div>
              </div>
            </div>

            <div class="chart-container">
              <h2>Visits Trend Analysis</h2>
              ${visitsChartSvg}
            </div>

            <div class="chart-container">
              <h2>Reviews Analysis</h2>
              ${reviewsChartSvg}
            </div>

            <div class="filter-info">
              <h3>Analysis Parameters</h3>
              <p>Visits data filtered by: ${visitsFilter}</p>
              <p>Reviews data filtered by: ${reviewsFilter}</p>
            </div>

            <button class="download-btn" onclick="window.print()">Download PDF</button>
          </div>

          <script>
            // Hide the download button when printing
            window.onbeforeprint = function() {
              document.querySelector('.download-btn').style.display = 'none';
            };
            window.onafterprint = function() {
              document.querySelector('.download-btn').style.display = 'inline-block';
            };
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <div className="dashboard-report">
      <button onClick={generateReport} className="generate-btn">Generate Report</button>

      <style jsx>{`
        .generate-btn {
          background-color: #A0522D;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default DashboardReport;