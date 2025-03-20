import React from 'react';

const WelcomeMessage = ({ user }) => {
  // Extract first name directly from user object (which now includes customer data)
  const firstName = user?.first_name || '';
  
  // Get current time for personalized greeting
  const getCurrentTimeMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get current date formatted nicely
  const getFormattedDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getCurrentTimeMessage()}{firstName ? `, ${firstName}` : ''}!
          </h2>
          <p className="text-gray-600">
            Today is {getFormattedDate()}. Here's an overview of your warranty services.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <span className="block text-2xl font-bold text-blue-600">
              {user?.upcoming_services || 0}
            </span>
            <span className="text-sm text-gray-600">Upcoming Services</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <span className="block text-2xl font-bold text-green-600">
              {user?.completed_services || 0}
            </span>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
