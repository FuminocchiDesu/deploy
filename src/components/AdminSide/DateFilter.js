import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

const DateFilter = ({ dateRange, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('7d');
  const [customDates, setCustomDates] = useState({
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
    // Update display when dateRange prop changes
    setCustomDates({
      startDate: dateRange.startDate || '',
      endDate: dateRange.endDate || ''
    });
  }, [dateRange]);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') {
      return; // Don't close dropdown for custom selection
    }

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

    const newDateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };

    setCustomDates(newDateRange);
    onDateChange(newDateRange);
    setIsOpen(false);
  };

  const handleCustomDateChange = (field, value) => {
    const newCustomDates = {
      ...customDates,
      [field]: value
    };
    setCustomDates(newCustomDates);
    
    // Only trigger onChange if both dates are set
    if (newCustomDates.startDate && newCustomDates.endDate) {
      onDateChange(newCustomDates);
    }
  };

  const clearDates = () => {
    const emptyDates = { startDate: '', endDate: '' };
    setCustomDates(emptyDates);
    onDateChange(emptyDates);
    setSelectedPreset('7d');
    setIsOpen(false);
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
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">{getDisplayText()}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
      </button>

      {(dateRange.startDate || dateRange.endDate) && (
        <button
          onClick={clearDates}
          className="ml-2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {presets.slice(0, -1).map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedPreset === preset.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => handlePresetClick('custom')}
                className={`w-full px-3 py-2 text-sm rounded-md mb-2 transition-colors ${
                  selectedPreset === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom Range
              </button>
              
              {selectedPreset === 'custom' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customDates.startDate}
                        onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customDates.endDate}
                        onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;