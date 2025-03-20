import React from 'react';
import { supabase } from '../../lib/supabase';

const ServiceScheduler = ({ user, onScheduleSuccess }) => {
  // Function to handle service scheduling
  const handleScheduleService = async (serviceData) => {
    try {
      // Check if customer record exists by email
      const { data: existingCustomerByEmail, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user.email)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError;
      }

      let customerData;

      // If customer doesn't exist, create a new one
      if (!existingCustomerByEmail) {
        console.log('No customer record found, creating one...');
        
        // Let's check what columns are available in the customers table
        const { data: tableInfo, error: tableError } = await supabase
          .from('customers')
          .select('*')
          .limit(1);
          
        if (tableError) {
          console.error('Error getting table info:', tableError);
        } else {
          console.log('Customers table columns:', tableInfo.length > 0 ? Object.keys(tableInfo[0]) : 'No records found');
        }
        
        // Let Supabase handle created_at with default value
        const customerRecord = {
          email: user.email,
          // Try user_id instead of auth_id based on the error message
          user_id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || ''
        };
        
        console.log('Creating customer with data:', customerRecord);
        
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert(customerRecord)
          .select();

        if (createError) throw createError;
        
        customerData = newCustomer[0];
        console.log('Created new customer record:', customerData);
      } else {
        customerData = existingCustomerByEmail;
        console.log('Using existing customer record:', customerData);
      }

      // Create new service request - note that we're not including 'notes' field as it doesn't exist in the database
      const newService = {
        customer_id: customerData.id, // Use the customer ID from the customers table
        service_type: serviceData.type,
        status: 'upcoming',
        scheduled_date: serviceData.date,
        preferred_time: serviceData.preferredTime, // Make sure to use the correct property name from serviceData
      };

      const { data: service, error: serviceError } = await supabase
        .from('service_requests')
        .insert(newService)
        .select();

      if (serviceError) throw serviceError;

      console.log('Service scheduled successfully:', service);
      
      if (onScheduleSuccess) {
        onScheduleSuccess();
      }
      
      return { success: true, data: service };
    } catch (error) {
      console.error('Error scheduling service:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred while scheduling your service.' 
      };
    }
  };

  return { handleScheduleService };
};

export default ServiceScheduler;
