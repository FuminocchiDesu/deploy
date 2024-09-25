// src/components/AdminSide/Analytics.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Analytics = ({ coffeeShopId }) => {
  const [data, setData] = useState({ visits: 0, popularItems: [] });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`https://khlcle.pythonanywhere.com/api/analytics/${coffeeShopId}/`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [coffeeShopId]);

  return (
    <div>
      <h3>Analytics</h3>
      <p>Visits: {data.visits}</p>
      <h4>Popular Menu Items</h4>
      <ul>
        {data.popularItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Analytics;
