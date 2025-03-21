import React, { useState } from 'react';

const WarrantyAgreement = ({ customerData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Handle warranty document download
  const handleDownloadWarranty = () => {
    setIsDownloading(true);
    
    // Create warranty document content
    const warrantyContent = `
      GREEN VIEW SOLUTIONS - FENCE WARRANTY AGREEMENT
      
      Customer: ${customerData?.first_name || ''} ${customerData?.last_name || ''}
      Address: ${customerData?.address || 'N/A'}
      Warranty Issue Date: ${customerData?.warranty_issue_date || 'N/A'}
      Warranty Status: ${customerData?.warranty_status || 'Unknown'}
      
      LIFETIME WORKMANSHIP WARRANTY
      Green View Solutions provides a lifetime warranty on workmanship, valid only if regular maintenance 
      including staining and clear coating is performed every 2 years by our certified technicians. 
      This ensures the longevity and quality of your fence investment.
      
      WEATHER DAMAGE EXCLUSIONS
      The warranty does not cover damage resulting from extreme weather conditions, including but not limited to 
      winds exceeding 60 mph, hurricanes, tornadoes, flooding, lightning strikes, or other severe weather events 
      beyond our control.
      
      EXTERNAL IMPACT EXCLUSIONS
      The warranty does not cover damage caused by external impacts or collisions, including but not limited to 
      falling trees or branches, vehicle impacts, lawn equipment, or any other objects striking the fence. 
      Regular inspection is recommended to identify and address any such damage promptly.
      
      MAINTENANCE REQUIREMENTS
      To maintain warranty coverage, customers must adhere to the recommended maintenance schedule, 
      including professional inspections, cleaning, and treatments every 2 years. Failure to maintain 
      this schedule may void the warranty.
      
      For questions or to schedule maintenance, please contact Green View Solutions at support@greenviewsolutions.net
    `;
    
    // Create a Blob with the warranty content
    const blob = new Blob([warrantyContent], { type: 'text/plain' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GVS_Warranty_${customerData?.last_name || 'Customer'}.txt`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  // Format warranty issue date if available
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const warrantyIssueDate = customerData?.warranty_issue_date 
    ? formatDate(customerData.warranty_issue_date) 
    : 'Not available';

  const warrantyStatus = customerData?.warranty_status || 'Unknown';

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
      <div className="px-8 py-8">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04L12 21.944l9.618-13.96A11.955 11.955 0 0112 2.944z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900">Warranty Agreement</h2>
            <p className="text-gray-600 text-sm mt-1">Your fence is protected by our comprehensive warranty</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Warranty Status</h3>
            <div className="flex items-center">
              {warrantyStatus.toLowerCase() === 'active' ? (
                <>
                  <div className="bg-green-100 p-1.5 rounded-full mr-2">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-green-700 font-medium">Active</span>
                </>
              ) : (
                <>
                  <div className="bg-red-100 p-1.5 rounded-full mr-2">
                    <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-red-700 font-medium">{warrantyStatus}</span>
                </>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Warranty Issue Date</h3>
            <p className="text-gray-700">{warrantyIssueDate}</p>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Warranty Terms</h3>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center transition-colors duration-200"
            >
              <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
              <svg className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className={`space-y-4 transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-[150px] overflow-hidden opacity-90'}`}>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Lifetime Workmanship Warranty</h4>
              <p className="text-gray-700">
                Green View Solutions provides a lifetime warranty on workmanship, valid only if regular maintenance 
                including staining and clear coating is performed every 2 years by our certified technicians. 
                This ensures the longevity and quality of your fence investment.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Weather Damage Exclusions</h4>
              <p className="text-gray-700">
                The warranty does not cover damage resulting from extreme weather conditions, including but not limited to 
                winds exceeding 60 mph, hurricanes, tornadoes, flooding, lightning strikes, or other severe weather events 
                beyond our control.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h4 className="text-lg font-medium text-gray-900 mb-2">External Impact Exclusions</h4>
              <p className="text-gray-700">
                The warranty does not cover damage caused by external impacts or collisions, including but not limited to 
                falling trees or branches, vehicle impacts, lawn equipment, or any other objects striking the fence. 
                Regular inspection is recommended to identify and address any such damage promptly.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Maintenance Requirements</h4>
              <p className="text-gray-700">
                To maintain warranty coverage, customers must adhere to the recommended maintenance schedule, 
                including professional inspections, cleaning, and treatments every 2 years. Failure to maintain 
                this schedule may void the warranty.
              </p>
            </div>

            {isExpanded && (
              <div className="pt-4">
                <button 
                  onClick={handleDownloadWarranty}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center mx-auto py-2 px-4 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                >
                  <span>Download Full Warranty Document</span>
                  <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyAgreement;
