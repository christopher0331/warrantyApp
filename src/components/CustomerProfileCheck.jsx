import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CustomerProfileCheck = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAndCreateCustomerProfile = async () => {
      if (!user) return;
      
      try {
        // Check if customer record exists
        const { data, error } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error checking customer profile:', error);
          return;
        }
        
        // If customer record exists, we're done
        if (data) {
          console.log('Customer profile exists:', data);
          return;
        }
        
        // No customer record found, create one
        setIsCreating(true);
        setError(null);
        
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert([
            {
              user_id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              created_at: new Date().toISOString()
            }
          ])
          .select();
          
        if (createError) {
          console.error('Error creating customer profile:', createError);
          setError('Failed to create customer profile. Please contact support.');
          return;
        }
        
        console.log('Created customer profile:', newCustomer);
        setSuccess(true);
        
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred. Please contact support.');
      } finally {
        setIsCreating(false);
      }
    };
    
    checkAndCreateCustomerProfile();
  }, [user]);
  
  if (isCreating) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 p-4 rounded-lg shadow-md max-w-md">
        <p className="text-blue-800">Setting up your customer profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 p-4 rounded-lg shadow-md max-w-md">
        <p className="text-red-800">{error}</p>
        <button 
          className="mt-2 text-sm text-red-600 underline"
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 p-4 rounded-lg shadow-md max-w-md">
        <p className="text-green-800">Your customer profile has been set up successfully!</p>
        <button 
          className="mt-2 text-sm text-green-600 underline"
          onClick={() => setSuccess(false)}
        >
          Dismiss
        </button>
      </div>
    );
  }
  
  return null;
};

export default CustomerProfileCheck;
