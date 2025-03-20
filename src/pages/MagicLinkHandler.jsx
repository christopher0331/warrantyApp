import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function MagicLinkHandler() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        // Get the hash fragment from the URL (contains the access token)
        const hash = location.hash;
        
        if (!hash) {
          throw new Error('No authentication token found in URL');
        }

        // The hash includes the access token and other parameters
        // We need to extract these and process them with Supabase
        console.log('Processing magic link with hash:', hash);
        
        // Let Supabase handle the token exchange
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!data.session) {
          // If there's no session yet, we need to exchange the token
          // This happens when the user first clicks the magic link
          await supabase.auth.getUser();
          
          // Check again for a session
          const { data: refreshData, error: refreshError } = await supabase.auth.getSession();
          
          if (refreshError) {
            throw refreshError;
          }
          
          if (!refreshData.session) {
            throw new Error('Failed to authenticate with the provided token');
          }
        }
        
        // Successfully authenticated
        console.log('Magic link authentication successful');
        
        // Determine where to redirect based on user email
        const userEmail = data.session?.user?.email || '';
        const isEmployee = userEmail.endsWith('@greenviewsolutions.net') || userEmail.endsWith('@gvsco.net');
        
        if (isEmployee) {
          navigate('/employee-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      } catch (error) {
        console.error('Magic link authentication error:', error);
        setError(error.message || 'Authentication failed');
        // After a short delay, redirect to login
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Authentication failed. Please try logging in again.' } 
          });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleMagicLink();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {loading ? 'Authenticating...' : (error ? 'Authentication Error' : 'Authentication Successful')}
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {loading ? (
              <div className="flex justify-center">
                <svg className="animate-spin h-10 w-10 text-gvs-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
                <p className="text-gray-500">Redirecting to login page...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  You have been successfully authenticated!
                </div>
                <p className="text-gray-500">Redirecting to your dashboard...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
