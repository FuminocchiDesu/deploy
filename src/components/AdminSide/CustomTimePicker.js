import React, { useState, useEffect } from 'react';
import styles from './CustomTimePicker.module.css';

const CustomTimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select Time",
  style 
}) => {
  // Parse existing value
  const parseTime = (timeString) => {
    if (!timeString) return '';
    
    // Convert 24-hour to 12-hour format for display
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Format to HH:MM for native time input
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Current state
  const [time, setTime] = useState(parseTime(value));

  // Update state if value prop changes
  useEffect(() => {
    setTime(parseTime(value));
  }, [value]);

  // Handle change for time input
  const handleChange = (e) => {
    const newTimeValue = e.target.value;
    setTime(newTimeValue);
    
    // Call onChange with 24-hour format time string
    if (onChange) {
      onChange(newTimeValue ? newTimeValue + ':00' : null);
    }
  };

  return (
    <div className={styles.CustomTimePickerContainer} style={style}>
      <input
        type="time"
        value={time}
        onChange={handleChange}
        className={styles.nativeTimeInput}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #DEB887',
          borderRadius: '0.375rem',
          backgroundColor: '#ffffff',
          color: 'var(--color-text)',
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
        }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomTimePicker;

// Formatting function (kept from original implementation)
export const formatTime = (time) => {
  if (!time) return 'Not specified';
  
  // Convert 24-hour to 12-hour format
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};