import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Calendar, ChevronDown, X, Pencil } from 'lucide-react';
import DatePicker from './DatePicker';
import './DateFilterModal.css';

const DateFilterModal = ({ isOpen, onClose, dateRange, onDateChange, onOpenModal }) => {
  const [selectedPreset, setSelectedPreset] = useState('7d');
  const [customDates, setCustomDates] = useState({
    startDate: dateRange.startDate || '',
    endDate: dateRange.endDate || ''
  });
  const [tempDates, setTempDates] = useState({
    startDate: dateRange.startDate || '',
    endDate: dateRange.endDate || ''
  });

  const presets = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 14 Days', value: '14d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Custom Range', value: 'custom' }
  ];

  useEffect(() => {
    setCustomDates({
      startDate: dateRange.startDate || '',
      endDate: dateRange.endDate || ''
    });
    setTempDates({
      startDate: dateRange.startDate || '',
      endDate: dateRange.endDate || ''
    });
  }, [dateRange]);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') return;

    const today = new Date();
    let startDate = new Date();
    
    switch (preset) {
      case '7d':
        startDate.setDate(today.getDate() - 7);
        break;
      case '14d':
        startDate.setDate(today.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(today.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(today.getDate() - 90);
        break;
      default:
        return;
    }

    setTempDates({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };

  const handleCustomDateChange = (field, value) => {
    setTempDates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearDates = () => {
    const emptyDates = { startDate: '', endDate: '' };
    setCustomDates(emptyDates);
    setTempDates(emptyDates);
    onDateChange(emptyDates);
    setSelectedPreset('7d');
    onClose();
  };

  const applyFilter = () => {
    setCustomDates(tempDates);
    onDateChange(tempDates);
    onClose();
  };

  const handleCancel = () => {
    setTempDates(customDates);
    setSelectedPreset(selectedPreset);
    onClose();
  };

  const getDisplayText = () => {
    if (!dateRange.startDate && !dateRange.endDate) {
      return 'Select Date Range';
    }
    
    if (selectedPreset === 'custom') {
      return `${dateRange.startDate} - ${dateRange.endDate}`;
    }
    
    return presets.find(p => p.value === selectedPreset)?.label || 'Select Date Range';
  };

  return (
    <div className="date-filter-container">
      <button className="date-trigger-button" onClick={onOpenModal}>
        <Calendar className="date-trigger-icon" />
        <span className="date-trigger-text">{getDisplayText()}</span>
        <ChevronDown className="date-trigger-icon" />
      </button>

      {(dateRange.startDate || dateRange.endDate) && (
        <button className="clear-date-button" onClick={clearDates} aria-label="Clear dates">
          <X className="date-trigger-icon" />
        </button>
      )}

      <Modal
        title={
          <div className="modal-header">
            <h3 className="modal-title">Select Date Range</h3>
          </div>
        }
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        width={400}
        className="date-filter-modal"
      >
        <div className="modal-content">
          <div className="preset-buttons-grid">
            {presets.slice(0, -1).map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`preset-button ${
                  selectedPreset === preset.value ? 'active' : 'inactive'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="divider-container">
            <div className="divider-line" />
            <div className="divider-text">
              <span>or</span>
            </div>
          </div>

          <button
            onClick={() => handlePresetClick('custom')}
            className={`custom-range-button ${
              selectedPreset === 'custom' ? 'active' : 'inactive'
            }`}
          >
            <Pencil className="date-trigger-icon" />
            Custom Range
          </button>
          
          {selectedPreset === 'custom' && (
            <div className="date-input-container">
              <div className="date-input-group">
                <label className="date-input-label">Start Date</label>
                <DatePicker
                  value={tempDates.startDate}
                  onChange={(value) => handleCustomDateChange('startDate', value)}
                  className="custom-datepicker"
                />
              </div>
              <div className="date-input-group">
                <label className="date-input-label">End Date</label>
                <DatePicker
                  value={tempDates.endDate}
                  onChange={(value) => handleCustomDateChange('endDate', value)}
                  className="custom-datepicker"
                />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button className="footer-button secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="footer-button primary" onClick={applyFilter}>
              Apply Filter
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DateFilterModal;