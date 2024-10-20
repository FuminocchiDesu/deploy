import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_CODES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const OpeningHoursTable = ({ coffeeShopId, isEditMode, onUpdate }) => {
  const [openingHours, setOpeningHours] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpeningHours();
  }, [coffeeShopId]);

  const fetchOpeningHours = async () => {
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/opening-hours/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` },
        params: { coffee_shop: coffeeShopId }
      });
      console.log('Fetched opening hours:', response.data);
      const sortedHours = sortOpeningHours(response.data);
      setOpeningHours(sortedHours);
    } catch (error) {
      console.error('Error fetching opening hours:', error);
      setError('Failed to fetch opening hours. Please try again.');
    }
  };

  const sortOpeningHours = (hours) => {
    return DAY_CODES.map(dayCode => 
      hours.find(hour => hour.day === dayCode) || 
      { day: dayCode, opening_time: null, closing_time: null, id: null }
    );
  };

  const handleTimeChange = (index, field, value) => {
    const updatedHours = [...openingHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setOpeningHours(updatedHours);
    onUpdate(updatedHours); // Pass the updated hours to parent component
  };

  const saveOpeningHours = async () => {
    try {
      const formattedHours = openingHours.map(hour => ({
        id: hour.id,
        day: hour.day,
        opening_time: hour.opening_time || null,
        closing_time: hour.closing_time || null,
        coffee_shop: coffeeShopId
      }));

      console.log('Sending data:', formattedHours);

      // Pass the formatted hours to the parent component
      onUpdate(formattedHours);

      setError(null);
    } catch (error) {
      console.error('Error saving opening hours:', error);
      setError('Failed to save opening hours. Please try again.');
    }
  };

  return (
    <div className="opening-hours-table">
      <table className="w-full">
        <thead>
          <tr>
            <th>Day</th>
            <th>Opening Time</th>
            <th>Closing Time</th>
          </tr>
        </thead>
        <tbody>
          {openingHours.map((hour, index) => (
            <tr key={hour.day}>
              <td>{DAY_NAMES[index]}</td>
              <td>
                <input
                  type="time"
                  value={hour.opening_time || ''}
                  onChange={(e) => handleTimeChange(index, 'opening_time', e.target.value)}
                  disabled={!isEditMode}
                  className="border p-1"
                />
              </td>
              <td>
                <input
                  type="time"
                  value={hour.closing_time || ''}
                  onChange={(e) => handleTimeChange(index, 'closing_time', e.target.value)}
                  disabled={!isEditMode}
                  className="border p-1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="error-message mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default OpeningHoursTable;