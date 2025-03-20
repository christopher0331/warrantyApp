import React from 'react';

const AdditionalServices = () => {
  const services = [
    {
      id: 1,
      title: 'Custom Staining',
      description: 'Professional staining services to protect and beautify your fence with premium weather-resistant finishes.',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h10a2 2 0 012 2v12a4 4 0 01-4 4H7zm5-9v4m-5-7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'bg-amber-100 text-amber-600',
      buttonColor: 'bg-amber-600 hover:bg-amber-700'
    },
    {
      id: 2,
      title: 'Fence Extensions',
      description: 'Increase your fence height or add decorative elements to enhance privacy and curb appeal.',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 3,
      title: 'Security Features',
      description: 'Enhance your property security with premium gates, locks, and advanced security features.',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 4,
      title: 'Maintenance Plans',
      description: 'Protect your investment with our comprehensive maintenance plans for long-term fence care.',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'bg-purple-100 text-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Services</h2>
            <p className="text-gray-600">Enhance your property with our professional services</p>
          </div>
          <a 
            href="https://greenviewsolutions.net/services" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center transition-colors duration-200"
          >
            <span>View All Services</span>
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(service => (
            <div key={service.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl p-6 border border-gray-100">
              <div className="flex items-start mb-4">
                <div className={`p-3 ${service.color} rounded-lg`}>
                  {service.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                </div>
              </div>
              <a 
                href="https://greenviewsolutions.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full ${service.buttonColor} text-white rounded-lg py-2.5 px-4 transition-colors duration-200 font-medium flex items-center justify-center`}
              >
                <span>Request Information</span>
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdditionalServices;
