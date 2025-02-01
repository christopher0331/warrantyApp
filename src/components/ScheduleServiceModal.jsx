import React, { useState, useEffect } from 'react';

const ScheduleServiceModal = ({ isOpen, onClose, onSchedule, initialData, isRescheduling = false }) => {
  const [serviceData, setServiceData] = useState({
    type: 'cleaning',
    date: '',
    preferredTime: 'morning'
  });

  const [error, setError] = useState('');

  // Load initial data when rescheduling
  useEffect(() => {
    if (initialData && isRescheduling) {
      setServiceData(initialData);
    }
  }, [initialData, isRescheduling]);

  const validateForm = () => {
    if (!serviceData.date) {
      setError('Please select a date');
      return false;
    }
    
    // Ensure date is not in the past
    const selectedDate = new Date(serviceData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Please select a future date');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('Submitting service data:', serviceData);
    onSchedule(serviceData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">
            {isRescheduling ? 'Reschedule Service' : 'Schedule Service'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Service Type
            </label>
            <select
              value={serviceData.type}
              onChange={(e) => setServiceData({ ...serviceData, type: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRescheduling}
            >
              <option value="cleaning">Cleaning</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={serviceData.date}
              onChange={(e) => {
                setError('');
                setServiceData({ ...serviceData, date: e.target.value });
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:text-blue-600 [&::-webkit-calendar-picker-indicator]:fill-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Preferred Time
            </label>
            <select
              value={serviceData.preferredTime}
              onChange={(e) => setServiceData({ ...serviceData, preferredTime: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">Morning (8AM - 12PM)</option>
              <option value="afternoon">Afternoon (12PM - 4PM)</option>
              <option value="evening">Evening (4PM - 8PM)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isRescheduling ? 'Reschedule' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleServiceModal;
