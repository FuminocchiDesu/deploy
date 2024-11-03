import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const DatePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
      }
    }
  }, [value]);

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onChange(formatDate(newDate));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`calendar-day ${isSelected ? 'selected' : ''}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const styles = {
    container: {
      position: 'relative',
      width: '200px',
    },
    inputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '8px',
      paddingRight: '32px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    iconContainer: {
      position: 'absolute',
      right: '8px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    },
    calendar: {
      position: 'absolute',
      top: '100%',
      left: '0',
      width: '280px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px',
      marginTop: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 1000,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    button: {
      padding: '4px 8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    weekdays: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px',
      marginBottom: '8px',
      textAlign: 'center',
      fontSize: '0.8em',
      color: '#666',
    },
    daysGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px',
    },
    day: {
      width: '100%',
      aspectRatio: '1',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedDay: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    empty: {
      backgroundColor: 'transparent',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          style={styles.input}
          placeholder="Select date"
        />
        <div 
          style={styles.iconContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon 
            size={18}
            color={isHovered ? "#007bff" : "#666"}
          />
        </div>
      </div>

      {isOpen && (
        <div style={styles.calendar}>
          <div style={styles.header}>
            <button onClick={handlePrevMonth} style={styles.button}>←</button>
            <div>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</div>
            <button onClick={handleNextMonth} style={styles.button}>→</button>
          </div>

          <div style={styles.weekdays}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div style={styles.daysGrid}>
            {renderCalendar().map((day, index) => {
              if (day.props.className.includes('empty')) {
                return <div key={index} style={{...styles.day, ...styles.empty}} />;
              }
              
              const isSelected = day.props.className.includes('selected');
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day.props.children)}
                  style={{
                    ...styles.day,
                    ...(isSelected ? styles.selectedDay : {}),
                  }}
                >
                  {day.props.children}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;