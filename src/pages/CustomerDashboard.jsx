import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import ScheduleServiceModal from '../components/ScheduleServiceModal';

export default function CustomerDashboard() {
  const { user, signOut } = useAuth()
  const [customerData, setCustomerData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [maintenanceServices, setMaintenanceServices] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isReschedulingModalOpen, setIsReschedulingModalOpen] = useState(false);

  useEffect(() => {
    const validateEmployeeEmail = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('email', user?.email)
          .single()

        if (error) throw error

        if (!data) {
          setError('No customer profile found. Please contact support.')
          setCustomerData(null)
        } else {
          setCustomerData(data)
          setError(null)
        }
      } catch (error) {
        console.error('Error fetching customer data:', error)
        setError('Error loading customer data. Please try again later.')
        setCustomerData(null)
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      validateEmployeeEmail()
    }
  }, [user?.email])

  const fetchCustomerData = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCustomerData(data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Fetch service requests
  const fetchServiceRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaintenanceServices(data || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    }
  };

  // Schedule new service
  const handleScheduleService = async (serviceData) => {
    try {
      const newService = {
        customer_id: user.id,
        service_type: serviceData.type,
        scheduled_date: serviceData.date,
        preferred_time: serviceData.preferredTime,
        status: 'upcoming'
      };

      console.log('Scheduling service with data:', newService);

      const { data, error } = await supabase
        .from('service_requests')
        .insert([newService])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully created service request:', data);
      
      setIsSchedulingModalOpen(false);
      fetchServiceRequests();
    } catch (error) {
      console.error('Error scheduling service:', error);
      alert('Failed to schedule service: ' + error.message);
    }
  };

  // Update rescheduled service
  const handleRescheduleSubmit = async (newData) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          service_type: newData.type,
          scheduled_date: newData.date,
          preferred_time: newData.preferredTime,
          // created_at will be automatically set by Supabase
        })
        .eq('id', selectedService.id);

      if (error) throw error;

      setIsReschedulingModalOpen(false);
      setSelectedService(null);
      fetchServiceRequests();
    } catch (error) {
      console.error('Error rescheduling service:', error);
    }
  };

  // Handle cancelling service
  const handleCancelService = async (serviceId) => {
    if (window.confirm('Are you sure you want to cancel this service?')) {
      try {
        const { error } = await supabase
          .from('service_requests')
          .update({ status: 'cancelled' })
          .eq('id', serviceId);

        if (error) throw error;
        fetchServiceRequests();
      } catch (error) {
        console.error('Error cancelling service:', error);
      }
    }
  };

  // Load services on mount
  useEffect(() => {
    fetchServiceRequests();
  }, [user.id]);

  // Filter services based on active tab
  const filteredServices = maintenanceServices.filter(service => {
    switch (activeTab) {
      case 'upcoming':
        return service.status === 'upcoming';
      case 'cancelled':
        return service.status === 'cancelled';
      case 'completed':
        return service.status === 'completed';
      default:
        return true;
    }
  });

  // Update service list display
  const formatServiceTime = (time) => {
    const timeRanges = {
      'morning': '8AM - 12PM',
      'afternoon': '12PM - 4PM',
      'evening': '4PM - 8PM'
    };
    return timeRanges[time] || time;
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-black">Loading...</div>
      </div>
    )
  }

  if (error) {
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
                <span className="text-black mr-4">{user?.email}</span>
                <button
                  onClick={handleSignOut}
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
    )
  }

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
              <span className="text-black mr-4">{user?.email}</span>
              <button
                onClick={handleSignOut}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {/* Maintenance Schedule */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="text-2xl font-bold text-black ml-3">Maintenance Schedule</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-black">Current Status</h3>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-green-500 text-lg">Maintenance up to date</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-4">Maintenance Windows</h3>
                  <div className="space-y-4">
                    {[
                      { period: 'Dec 2025 - Mar 2026', status: 'Upcoming' },
                      { period: 'Dec 2027 - Mar 2028', status: 'Upcoming' },
                      { period: 'Dec 2029 - Mar 2030', status: 'Upcoming' }
                    ].map((window, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-lg font-medium text-black">{window.period}</h4>
                          <p className="text-gray-500">{window.status}</p>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-8 py-6">
                <h2 className="text-3xl font-bold text-black mb-2">Additional Services</h2>
                <p className="text-xl text-black mb-8">Enhance your fence with our professional services</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Custom Staining */}
                  <div className="bg-white shadow-sm rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 14V8a2 2 0 00-2-2h-3.172a2 2 0 01-1.414-.586L11.586 3.586A2 2 0 0010.172 3H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-black ml-3">Custom Staining</h3>
                    </div>
                    <p className="text-sm text-black mb-4">Professional staining services to protect and beautify your fence</p>
                    <button className="w-full bg-blue-500 text-white rounded-lg py-2 px-3 hover:bg-blue-600 transition-colors">
                      Request Information
                    </button>
                  </div>

                  {/* Fence Extensions */}
                  <div className="bg-white shadow-sm rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      </div>
                      <h3 className="text-lg font-bold text-black ml-3">Fence Extensions</h3>
                    </div>
                    <p className="text-sm text-black mb-4">Increase your fence height or add decorative elements</p>
                    <button className="w-full bg-blue-500 text-white rounded-lg py-2 px-3 hover:bg-blue-600 transition-colors">
                      Request Information
                    </button>
                  </div>

                  {/* Security Features */}
                  <div className="bg-white shadow-sm rounded-lg p-4">
                    <div className="flex items-start mb-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15V17M12 7V13M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-black ml-3">Security Features</h3>
                    </div>
                    <p className="text-sm text-black mb-4">Add gates, locks, or security enhancements</p>
                    <button className="w-full bg-blue-500 text-white rounded-lg py-2 px-3 hover:bg-blue-600 transition-colors">
                      Request Information
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Warranty Status */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center mb-6">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="text-2xl font-bold text-black ml-3">Warranty Status</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl text-black font-medium">Status</span>
                  <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full text-sm">active</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl text-black font-medium">Coverage Type</span>
                  <span className="text-xl text-black">premium</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl text-black font-medium">Issue Date</span>
                  <span className="text-xl text-black">{customerData?.warranty_issue_date ? new Date(customerData.warranty_issue_date).toLocaleDateString() : 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl text-black font-medium">Next Review</span>
                  <span className="text-xl text-black">{customerData?.next_review_date ? new Date(customerData.next_review_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Fence Profile */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="flex items-center mb-8">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 5v14M8 5v14M12 5v14M16 5v14M20 5v14M4 5h16M4 9h16M4 13h16M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h2 className="text-2xl font-bold text-black ml-3">Fence Profile</h2>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h3 className="text-lg text-black font-medium mb-1">Material</h3>
                  <p className="text-xl text-black">{customerData?.fence_type || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg text-black font-medium mb-1">Type</h3>
                  <p className="text-xl text-black">{customerData?.fence_type || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg text-black font-medium mb-1">Length</h3>
                  <p className="text-xl text-black">{customerData?.fence_length ? `${customerData.fence_length} ft` : 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg text-black font-medium mb-1">Gates</h3>
                  <p className="text-xl text-black">{customerData?.gates || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg text-black font-medium mb-1">Color/Finish</h3>
                  <p className="text-xl text-black">{customerData?.color || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="text-lg text-black font-medium mb-1">Installation Date</h3>
                  <p className="text-xl text-black">{customerData?.install_date ? new Date(customerData.install_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Scheduling Bar */}
        <div className="mt-8 mx-4 sm:mx-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="text-2xl font-bold text-black ml-3">Maintenance Schedule</h2>
              </div>
              <button 
                onClick={() => setIsSchedulingModalOpen(true)} 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011-1h4a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Schedule Service
              </button>
            </div>

            {/* Service Status Tabs */}
            <div className="bg-gray-100 rounded-lg p-1 mx-4">
              <div className="grid grid-cols-3 gap-1">
                <button 
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                    activeTab === 'upcoming' ? 'bg-white text-black' : 'text-gray-500 bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-6.5V5a1 1 0 10-2 0v4a1 1 0 00.4.8l3 2a1 1 0 101.2-1.6L11 8.5z"/>
                  </svg>
                  Upcoming
                </button>
                <button 
                  onClick={() => setActiveTab('cancelled')}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                    activeTab === 'cancelled' ? 'bg-white text-black' : 'text-gray-500 bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 7.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                  Cancelled
                </button>
                <button 
                  onClick={() => setActiveTab('completed')}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                    activeTab === 'completed' ? 'bg-white text-black' : 'text-gray-500 bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.707 7.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                  Completed
                </button>
              </div>
            </div>

            {/* Service List */}
            <div className="space-y-4 mt-4 mx-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-black capitalize">
                        {service.service_type}
                      </h3>
                      <p className="text-gray-600">
                        {new Date(service.scheduled_date).toLocaleDateString()} - {formatServiceTime(service.preferred_time)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested on: {new Date(service.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {service.status === 'upcoming' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleRescheduleService(service.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancelService(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Service Modal */}
      <ScheduleServiceModal 
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        onSchedule={handleScheduleService}
      />

      {/* Reschedule Service Modal */}
      <ScheduleServiceModal 
        isOpen={isReschedulingModalOpen}
        onClose={() => {
          setIsReschedulingModalOpen(false);
          setSelectedService(null);
        }}
        onSchedule={handleRescheduleSubmit}
        initialData={selectedService ? {
          type: selectedService.service_type,
          date: selectedService.scheduled_date,
          preferredTime: selectedService.preferred_time,
        } : null}
        isRescheduling={true}
      />
    </div>
  )
}
