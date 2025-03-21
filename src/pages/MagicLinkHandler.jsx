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
        console.log('MagicLinkHandler activated, URL:', window.location.href);
        
        // Check for error in URL hash
        const hash = location.hash;
        if (hash && hash.includes('error=')) {
          console.error('Error found in URL hash:', hash);
          
          // Parse the error details
          const hashParams = new URLSearchParams(hash.substring(1));
          const errorType = hashParams.get('error');
          const errorCode = hashParams.get('error_code');
          const errorDescription = hashParams.get('error_description');
          
          // Handle specific error cases
          if (errorCode === 'otp_expired') {
            console.log('Magic link expired, redirecting to expired link page');
            navigate('/expired-link');
            return; // Exit early
          } else {
            throw new Error(errorDescription || 'Authentication failed');
          }
        }
        
        // Extract the token from the URL if present
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        // Log what we found for debugging
        if (accessToken) console.log('Found access_token in query params');
        if (refreshToken) console.log('Found refresh_token in query params');
        if (hash && !hash.includes('error=')) console.log('Found hash fragment:', hash);
        
        // If we have tokens in the URL, set them in the session
        if (accessToken && refreshToken) {
          console.log('Setting session with tokens from URL');
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (setSessionError) {
            console.error('Error setting session:', setSessionError);
            throw setSessionError;
          }
        }
        
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        console.log('Session data:', data);
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }
        
        if (!data.session) {
          console.log('No session found, attempting to exchange token from hash');
          
          // Try to handle the hash if present
          if (hash && hash.includes('access_token')) {
            // Let Supabase handle the hash
            const result = await supabase.auth.getUser();
            console.log('User result from hash:', result);
            
            // Check again for a session
            const { data: refreshData, error: refreshError } = await supabase.auth.getSession();
            console.log('Refreshed session data:', refreshData);
            
            if (refreshError) {
              console.error('Refresh error:', refreshError);
              throw refreshError;
            }
            
            if (!refreshData.session) {
              console.error('Still no session after processing hash');
              throw new Error('Failed to authenticate with the provided token');
            }
          } else {
            console.error('No authentication token found in URL');
            throw new Error('No authentication token found in URL');
          }
        }
        
        // Successfully authenticated
        console.log('Magic link authentication successful');
        
        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        console.log('Authenticated user:', userData);
        
        // Determine where to redirect based on user email
        const userEmail = userData.user?.email || data.session?.user?.email || '';
        console.log('User email for redirection:', userEmail);
        
        const isEmployee = userEmail.endsWith('@greenviewsolutions.net') || userEmail.endsWith('@gvsco.net');
        
        // Store the user in local storage to ensure persistence
        if (userData.user) {
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: data.session,
            expiresAt: Math.floor(Date.now() / 1000) + 3600
          }));
          
          // Check if the user has a password set
          // If they signed in with a magic link and don't have a password,
          // we should redirect them to set a password
          const user = userData.user;
          const hasPassword = user.identities?.some(identity => 
            identity.provider === 'email' && identity.identity_data?.email_verified === true
          );
          
          const isFirstLogin = !user.last_sign_in_at || 
            (new Date(user.last_sign_in_at).getTime() === new Date(user.created_at).getTime());
          
          console.log('User has password:', hasPassword, 'Is first login:', isFirstLogin);
          
          // If this is the first login via magic link, redirect to set password
          if (isFirstLogin) {
            console.log('First login detected, redirecting to set password');
            // Store the intended destination after password setup
            localStorage.setItem('redirectAfterPasswordSetup', 
              isEmployee ? '/employee-dashboard' : '/customer-dashboard');
            navigate('/set-password');
            return;
          }
        }
        
        console.log('Redirecting to', isEmployee ? 'employee dashboard' : 'customer dashboard');
        
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
