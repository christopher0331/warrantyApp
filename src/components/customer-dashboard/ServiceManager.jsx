import React from 'react';
import { supabase } from '../../lib/supabase';

const ServiceManager = () => {
  // Function to fetch service requests for a user
  const fetchServiceRequests = async (userId, userEmail) => {
    try {
      console.log('Fetching service requests for user:', { userId, userEmail });
      
      // First, get the customer record for this user using email (more reliable)
      // Based on our memory, we know the customers table uses email as a reliable lookup field
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (customerError) {
        console.error('Error fetching customer data:', customerError);
        return { success: false, error: customerError.message };
      }

      if (!customerData) {
        console.log('No customer record found for user');
        return { success: true, data: [] };
      }

      // Then, get all service requests for this customer
      const { data: services, error: servicesError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('customer_id', customerData.id)
        .order('scheduled_date', { ascending: true });

      if (servicesError) {
        console.error('Error fetching service requests:', servicesError);
        return { success: false, error: servicesError.message };
      }

      return { success: true, data: services || [] };
    } catch (error) {
      console.error('Error in fetchServiceRequests:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to cancel a service
  const cancelService = async (serviceId) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled' })
        .eq('id', serviceId);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling service:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to reschedule a service
  const rescheduleService = async (serviceId, newDate, newTime) => {
    try {
      console.log('Rescheduling service:', { serviceId, newDate, newTime });
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          scheduled_date: newDate,
          preferred_time: newTime 
        })
        .eq('id', serviceId);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error rescheduling service:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to format service time
  const formatServiceTime = (time) => {
    const timeRanges = {
      'morning': '8AM - 12PM',
      'afternoon': '12PM - 4PM',
      'evening': '4PM - 8PM'
    };
    return timeRanges[time] || time;
  };

  return {
    fetchServiceRequests,
    cancelService,
    rescheduleService,
    formatServiceTime
  };
};

export default ServiceManager;
