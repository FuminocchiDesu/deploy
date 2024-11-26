import React, { useState } from 'react';
import { Input, Select } from 'antd';

const CustomTimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select Time",
  style 
}) => {
  // Generate hours (1-12)
  const hours = Array.from({length: 12}, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  // Generate minutes (00-59)
  const minutes = Array.from({length: 60}, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // Periods for 12-hour format
  const periods = ['AM', 'PM'];

  // Parse existing value
  const parseTime = (timeString) => {
    if (!timeString) return { hour: '', minute: '', period: 'AM' };
    
    // Convert 24-hour to 12-hour format
    const [h, m] = timeString.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12; // Convert 0 or 12 to 12
    
    return { 
      hour: hour.toString().padStart(2, '0'), 
      minute: m.toString().padStart(2, '0'), 
      period 
    };
  };

  // Current state
  const [time, setTime] = useState(parseTime(value));

  // Handle change for hour, minute, or period
  const handleChange = (type, val) => {
    const newTime = { ...time, [type]: val };
    
    // Convert 12-hour to 24-hour format for storage
    const hour24 = newTime.period === 'PM' 
      ? (newTime.hour === '12' ? 12 : parseInt(newTime.hour) + 12)
      : (newTime.hour === '12' ? 0 : parseInt(newTime.hour));
    
    // Construct time string if all fields are selected
    const timeString = newTime.hour && newTime.minute && newTime.period
      ? `${hour24.toString().padStart(2, '0')}:${newTime.minute}` 
      : null;

    setTime(newTime);
    
    // Call onChange if provided
    if (onChange) {
      onChange(timeString);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', ...style }}>
      <Select
        style={{ width: '35%' }}
        value={time.hour}
        placeholder="Hour"
        onChange={(val) => handleChange('hour', val)}
      >
        {hours.map(hour => (
          <Select.Option key={hour} value={hour}>
            {hour}
          </Select.Option>
        ))}
      </Select>
      
      <Select
        style={{ width: '35%' }}
        value={time.minute}
        placeholder="Minute"
        onChange={(val) => handleChange('minute', val)}
      >
        {minutes.map(minute => (
          <Select.Option key={minute} value={minute}>
            {minute}
          </Select.Option>
        ))}
      </Select>

      <Select
        style={{ width: '30%' }}
        value={time.period}
        onChange={(val) => handleChange('period', val)}
      >
        {periods.map(period => (
          <Select.Option key={period} value={period}>
            {period}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default CustomTimePicker;

// Updated time formatting functions
export const formatTime = (time) => {
  if (!time) return 'Not specified';
  
  // Convert 24-hour to 12-hour format
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};