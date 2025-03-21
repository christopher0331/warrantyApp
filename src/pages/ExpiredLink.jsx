import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ExpiredLink() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResendLink = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      console.log('Requesting new magic link for:', email);
      
      // Check if this email exists in our customers table
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();
        
      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }
      
      if (!customerData) {
        // Check customer_invites table as fallback
        const { data: inviteData, error: inviteError } = await supabase
          .from('customer_invites')
          .select('*')
          .eq('email', email)
          .eq('status', 'pending')
          .single();
          
        if (inviteError && inviteError.code !== 'PGRST116') {
          throw inviteError;
        }
        
        if (!inviteData) {
          throw new Error('Your email is not in our system. Please contact GreenView Solutions to create an account.');
        }
      }
      
      // Send magic link
      const { error: magicLinkError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/callback',
      });
      
      if (magicLinkError) {
        throw magicLinkError;
      }
      
      setMessage('A new magic link has been sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Error requesting new magic link:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Magic Link Expired
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your magic link has expired or is invalid. Please request a new one.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleResendLink}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gvs-primary hover:bg-gvs-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary"
              >
                {loading ? 'Sending...' : 'Send New Magic Link'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
