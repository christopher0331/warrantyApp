import React from 'react';

const ErrorDisplay = ({ error, userEmail, onSignOut }) => {
  return (
    <div className="w-screen min-h-screen bg-gray-100">
      <nav className="w-screen bg-white shadow-sm">
        <div className="w-screen px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-black">GVS Customer Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-black mr-4">{userEmail}</span>
              <button
                onClick={onSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gvs-primary hover:bg-gvs-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <div className="text-xl text-red-600 mb-4">{error}</div>
                <p className="text-black">
                  If you believe this is an error, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
