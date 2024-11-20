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
      const response = await axios.get(`http://192.168.232.1:8000/api/opening-hours/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` },
        params: { coffee_shop: coffeeShopId }
      });
      const sortedHours = sortOpeningHours(response.data);
      setOpeningHours(sortedHours);
      onUpdate(sortedHours); // Update parent component
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
    onUpdate(updatedHours);
  };

  return (
    <div>
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
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '10px solid #DEB887',
                    borderRadius: '0.375rem',
                    backgroundColor: '#ffffff',
                    color: 'var(--color-text)',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                  }}
                />
              </td>
              <td>
                <input
                  type="time"
                  value={hour.closing_time || ''}
                  onChange={(e) => handleTimeChange(index, 'closing_time', e.target.value)}
                  disabled={!isEditMode}
                  className="border p-1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #DEB887',
                    borderRadius: '0.375rem',
                    backgroundColor: '#ffffff',
                    color: 'var(--color-text)',
                    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default OpeningHoursTable;