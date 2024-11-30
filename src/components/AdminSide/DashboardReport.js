import React from 'react';

const DashboardReport = ({ visitsData, reviewsData, dashboardData, visitsStartDate, visitsEndDate, reviewsStartDate, reviewsEndDate }) => {
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

    const createSVGGraph = (data, type) => {
        const width = 600;
        const height = 300;
        const margin = 40;
        const chartWidth = width - 2 * margin;
        const chartHeight = height - 2 * margin;

        // Determine max and min values
        let values, maxValue, minValue;
        if (type === 'visits') {
            values = data.map(d => d.visits);
            maxValue = Math.max(...values);
            minValue = Math.min(...values);
        } else {
            // For reviews, we'll plot two lines
            const ratings = data.map(d => d.average_rating);
            const reviewCounts = data.map(d => d.review_count);
            maxValue = Math.max(...ratings, ...reviewCounts);
            minValue = Math.min(...ratings, ...reviewCounts);
        }

        // Scaling functions
        const xScale = chartWidth / (data.length - 1);
        const yScale = chartHeight / (maxValue - minValue);

        // Generate path for visits or ratings
        const generatePath = (accessor) => {
            return data.map((d, i) => {
                const x = i * xScale + margin;
                const y = height - margin - (accessor(d) - minValue) * yScale;
                return i === 0 ? `M${x},${y}` : ` L${x},${y}`;
            }).join('');
        };

        // Visits or average rating path
        const primaryPath = type === 'visits' 
            ? generatePath(d => d.visits)
            : generatePath(d => d.average_rating);

        // Review count path (for reviews graph)
        const secondaryPath = type === 'reviews'
            ? generatePath(d => d.review_count)
            : '';

        return `
            <svg width="${width}" height="${height}">
                <rect width="${width}" height="${height}" fill="#f9f9f9" />
                <path d="${primaryPath}" 
                    fill="none" 
                    stroke="${type === 'visits' ? '#8884d8' : '#82ca9d'}" 
                    stroke-width="2" 
                />
                ${secondaryPath ? `
                    <path d="${secondaryPath}" 
                        fill="none" 
                        stroke="#ffc658" 
                        stroke-width="2" 
                    />
                ` : ''}
                ${data.map((d, i) => {
                    const x = i * xScale + margin;
                    return `
                        <text 
                            x="${x}" 
                            y="${height - 10}" 
                            text-anchor="middle" 
                            font-size="10"
                        >
                            ${formatDate(d.period)}
                        </text>
                    `;
                }).join('')}
            </svg>
        `;
    };

    const generateReport = () => {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) return;

        // Construct filter descriptions
        const visitsFilterDesc = [
            visitsStartDate && `From: ${formatDate(visitsStartDate)}`,
            visitsEndDate && `To: ${formatDate(visitsEndDate)}`
        ].filter(Boolean).join(' ');

        const reviewsFilterDesc = [
            reviewsStartDate && `From: ${formatDate(reviewsStartDate)}`,
            reviewsEndDate && `To: ${formatDate(reviewsEndDate)}`
        ].filter(Boolean).join(' ');

        // Create SVG graphs
        const visitsGraphSVG = createSVGGraph(visitsData.visits_data, 'visits');
        const reviewsGraphSVG = createSVGGraph(reviewsData.reviews_data, 'reviews');

        reportWindow.document.write(`
        <html>
            <head>
                <title>Coffee Shop Analytics Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        max-width: 1000px; 
                        margin: 0 auto; 
                        padding: 20px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 20px; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 12px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #f2f2f2; 
                        font-weight: bold; 
                    }
                    .graph-container {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 20px;
                    }
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .summary-card {
                        border: 1px solid #ddd;
                        padding: 15px;
                        text-align: center;
                    }
                    .summary-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #A0522D;
                    }
                    .report-header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Coffee Shop Analytics Report</h1>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                </div>

                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-value">${dashboardData.favorite_count.toLocaleString()}</div>
                        <div>Total Favorites</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${
                            reviewsData.reviews_data.reduce((acc, curr) => acc + curr.review_count, 0).toLocaleString()
                        }</div>
                        <div>Total Reviews</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${
                            (reviewsData.reviews_data.reduce((acc, curr) => acc + (curr.average_rating * curr.review_count), 0) /
                            reviewsData.reviews_data.reduce((acc, curr) => acc + curr.review_count, 0)).toFixed(1)
                        }</div>
                        <div>Average Rating</div>
                    </div>
                </div>

                <h2>Visits Analysis</h2>
                <div class="graph-container">
                    ${visitsGraphSVG}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Visits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${visitsData.visits_data.map(visit => `
                            <tr>
                                <td>${formatDate(visit.period)}</td>
                                <td>${visit.visits}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h2>Reviews Analysis</h2>
                <div class="graph-container">
                    ${reviewsGraphSVG}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Average Rating</th>
                            <th>Review Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reviewsData.reviews_data.map(review => `
                            <tr>
                                <td>${formatDate(review.period)}</td>
                                <td>${review.average_rating.toFixed(1)}</td>
                                <td>${review.review_count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="filter-info">
                    <h3>Analysis Parameters</h3>
                    <p>Visits data filtered: ${visitsFilterDesc || 'No date filter applied'}</p>
                    <p>Reviews data filtered: ${reviewsFilterDesc || 'No date filter applied'}</p>
                </div>

                <button class="no-print" onclick="window.print()" style="
                    background-color: #A0522D;
                    border: none;
                    color: white;
                    padding: 15px 32px;
                    text-align: center;
                    font-size: 16px;
                    cursor: pointer;
                    margin-top: 20px;
                ">Download PDF</button>
            </body>
        </html>
        `);
        reportWindow.document.close();
    };

    return (
        <div className="dashboard-report">
            <button onClick={generateReport} className="generate-btn">
                Generate Report
            </button>

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