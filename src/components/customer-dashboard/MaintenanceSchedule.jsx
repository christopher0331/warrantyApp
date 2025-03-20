import React, { useState } from 'react';

const MaintenanceSchedule = () => {
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const maintenanceWindows = [
    { 
      period: 'Dec 2025 - Mar 2026', 
      status: 'Upcoming', 
      months: 10,
      details: [
        'Full inspection of all fence posts and panels',
        'Hardware check and tightening',
        'Cleaning of any debris or vegetation',
        'Treatment for weather protection',
        'Replacement of any damaged components'
      ]
    },
    { 
      period: 'Dec 2027 - Mar 2028', 
      status: 'Upcoming', 
      months: 34,
      details: [
        'Comprehensive structural assessment',
        'Deep cleaning of all surfaces',
        'Application of protective sealant',
        'Gate alignment and adjustment',
        'Replacement of worn hardware'
      ]
    },
    { 
      period: 'Dec 2029 - Mar 2030', 
      status: 'Upcoming', 
      months: 58,
      details: [
        'Complete system evaluation',
        'Professional power washing',
        'Premium weather-proofing treatment',
        'Security feature inspection',
        'Aesthetic enhancement options'
      ]
    }
  ];
  
  const openDetailsModal = (window) => {
    setSelectedWindow(window);
    setIsDetailsModalOpen(true);
  };
  
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWindow(null);
  };
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 p-8">
      <div className="flex items-center mb-8">
        <div className="bg-blue-100 p-3 rounded-lg">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h2>
          <p className="text-gray-600 text-sm mt-1">Regular maintenance keeps your warranty valid</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
          <div className="flex items-center">
            <div className="bg-green-100 p-1.5 rounded-full mr-2">
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-green-700 font-medium">Maintenance up to date</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Maintenance Windows</h3>
            <span className="text-sm text-blue-600 font-medium">View all</span>
          </div>
          <div className="space-y-4">
            {maintenanceWindows.map((window, index) => (
              <div key={index} className="flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-base font-medium text-gray-900">{window.period}</h4>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {window.status}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">{window.months} months away</span>
                  </div>
                </div>
                <button 
                  onClick={() => openDetailsModal(window)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center transition-colors duration-200"
                >
                  <span>Details</span>
                  <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Maintenance Details Modal */}
      {isDetailsModalOpen && selectedWindow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fade-in-up">
            <button 
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedWindow.period}</h3>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  {selectedWindow.status}
                </span>
                <span className="text-gray-500 text-sm">{selectedWindow.months} months away</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Maintenance Details</h4>
              <ul className="space-y-3">
                {selectedWindow.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Add this CSS to your global styles */
/* @keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
} */

export default MaintenanceSchedule;
