import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import io from 'socket.io-client';
import './App.css';

const App = () => {
  const [activityData, setActivityData] = useState([]);
  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [cartAbandonmentRate, setCartAbandonmentRate] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  const socket = io('http://localhost:5000');

  useEffect(() => {
    fetchActivityData();
    setupWebSocket();

  
    const interval = setInterval(() => {
      fetchActivityData();
    }, 5000);

   
    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchActivityData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/activity-data');
      processActivityData(res.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const setupWebSocket = () => {
    // Listen for real-time updates from the server
    socket.on('new-activity', (newActivity) => {
      console.log('New activity received:', newActivity);
      setActivityData((prevData) => [...prevData, newActivity]);
      processActivityData([...activityData, newActivity]);
    });
  };

  const processActivityData = (data) => {
   
    const productViews = data.filter((d) => d.activity_type === 'product_view');
    const cartAdditions = data.filter((d) => d.activity_type === 'cart_addition');
    const purchases = data.filter((d) => d.activity_type === 'purchase');

    // Calculate most viewed products
    const productViewCounts = productViews.reduce((acc, item) => {
      acc[item.product_id] = (acc[item.product_id] || 0) + 1;
      return acc;
    }, {});
    setMostViewedProducts(Object.entries(productViewCounts).slice(0, 10)); 

  
    const cartAdditionCount = cartAdditions.length;
    const purchaseCount = purchases.length;
    const abandonmentRate = cartAdditionCount === 0 ? 0 : (cartAdditionCount - purchaseCount) / cartAdditionCount;
    setCartAbandonmentRate(abandonmentRate);

  
    const conversion = productViews.length === 0 ? 0 : purchaseCount / productViews.length;
    setConversionRate(conversion);
  };

  return (
    <div className="dashboard">
      <h1>E-Commerce Dashboard (Real-Time)</h1>
      <div className="metrics">
        <div className="metric-card">
          <h3>Cart Abandonment Rate</h3>
          <p>{(cartAbandonmentRate * 100).toFixed(2)}%</p>
        </div>
        <div className="metric-card">
          <h3>Conversion Rate</h3>
          <p>{(conversionRate * 100).toFixed(2)}%</p>
        </div>
      </div>
      <div className="chart-container">
        <h3>Top 10 Most Viewed Products</h3>
        <Bar
          data={{
            labels: mostViewedProducts.map(([id]) => `Product ${id}`),
            datasets: [
              {
                label: 'Views',
                data: mostViewedProducts.map(([_, count]) => count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
              },
            ],
          }}
          options={{ responsive: true }}
        />
      </div>
    </div>
  );
};

export default App;
