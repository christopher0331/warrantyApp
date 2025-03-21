import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ScheduleServiceModal from '../../components/ScheduleServiceModal';
import CustomerProfileCheck from '../../components/CustomerProfileCheck';

// Import dashboard components
import Navbar from '../../components/customer-dashboard/Navbar';
import LoadingScreen from '../../components/customer-dashboard/LoadingScreen';
import ErrorDisplay from '../../components/customer-dashboard/ErrorDisplay';
import MaintenanceSchedule from '../../components/customer-dashboard/MaintenanceSchedule';
import AdditionalServices from '../../components/customer-dashboard/AdditionalServices';
import ServiceList from '../../components/customer-dashboard/ServiceList';
import ServiceManager from '../../components/customer-dashboard/ServiceManager';
import ServiceScheduler from '../../components/customer-dashboard/ServiceScheduler';
import WelcomeMessage from '../../components/customer-dashboard/WelcomeMessage';
import WarrantyAgreement from '../../components/customer-dashboard/WarrantyAgreement';

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

  // Initialize service manager and scheduler
  const { 
    fetchServiceRequests, 
    cancelService, 
    rescheduleService, 
    formatServiceTime 
  } = ServiceManager();
  
  const { handleScheduleService } = ServiceScheduler({ 
    user, 
    onScheduleSuccess: () => fetchServiceRequests(user.id, user.email)
      .then(result => {
        if (result.success) {
          setMaintenanceServices(result.data);
        }
      })
  });

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Load customer data on mount
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        // First, fetch the customer profile from the database
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('email', user.email)
          .single();
          
        if (customerError) {
          console.error('Error fetching customer profile:', customerError);
          setError('Error loading customer profile. Please try again later.');
          setLoading(false);
          return;
        }
        
        if (customerData) {
          console.log('Customer data loaded:', customerData);
          setCustomerData(customerData);
        }
        
        // Then fetch service requests
        const result = await fetchServiceRequests(user.id, user.email);
        
        if (result.success) {
          setMaintenanceServices(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error)
        setError('Error loading customer data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.id && user?.email) {
      loadCustomerData()
    }
  }, [user?.id])

  // Handle opening scheduling modal
  const handleOpenSchedulingModal = () => {
    setIsSchedulingModalOpen(true);
  };

  // Handle closing scheduling modal
  const handleCloseSchedulingModal = () => {
    setIsSchedulingModalOpen(false);
  };

  // Handle service scheduling
  const handleScheduleServiceSubmit = async (serviceData) => {
    const result = await handleScheduleService(serviceData);
    
    if (result.success) {
      setIsSchedulingModalOpen(false);
      // Refresh service list
      const servicesResult = await fetchServiceRequests(user.id, user.email);
      if (servicesResult.success) {
        setMaintenanceServices(servicesResult.data);
      }
    } else {
      alert(result.error);
    }
  };

  // Handle opening rescheduling modal
  const handleOpenReschedulingModal = (service) => {
    setSelectedService(service);
    setIsReschedulingModalOpen(true);
  };

  // Handle closing rescheduling modal
  const handleCloseReschedulingModal = () => {
    setIsReschedulingModalOpen(false);
    setSelectedService(null);
  };

  // Handle service rescheduling
  const handleRescheduleServiceSubmit = async (serviceData) => {
    if (!selectedService) return;

    const result = await rescheduleService(
      selectedService.id, 
      serviceData.date, 
      serviceData.time
    );
    
    if (result.success) {
      setIsReschedulingModalOpen(false);
      setSelectedService(null);
      // Refresh service list
      const servicesResult = await fetchServiceRequests(user.id, user.email);
      if (servicesResult.success) {
        setMaintenanceServices(servicesResult.data);
      }
    } else {
      alert(result.error);
    }
  };

  // Handle cancelling service
  const handleCancelService = async (serviceId) => {
    if (window.confirm('Are you sure you want to cancel this service?')) {
      const result = await cancelService(serviceId);
      
      if (result.success) {
        // Refresh service list
        const servicesResult = await fetchServiceRequests(user.id, user.email);
        if (servicesResult.success) {
          setMaintenanceServices(servicesResult.data);
        }
      } else {
        alert(result.error);
      }
    }
  };

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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorDisplay error={error} userEmail={user?.email} onSignOut={handleSignOut} />;
  }

  return (
    <div className="w-screen min-h-screen bg-gray-100">
      <CustomerProfileCheck />
      <Navbar user={user} customerData={customerData} onSignOut={handleSignOut} />

      <div className="w-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Message */}
          <div className="mb-6">
            <WelcomeMessage 
              user={{
                ...user,
                ...customerData,
                upcoming_services: filteredServices.filter(s => s.status === 'upcoming').length,
                completed_services: filteredServices.filter(s => s.status === 'completed').length
              }} 
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {/* Maintenance Schedule */}
            <MaintenanceSchedule />

            {/* Additional Services */}
            <AdditionalServices />
            
            {/* Warranty Agreement - Full width */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 mt-6">
              <WarrantyAgreement customerData={customerData} />
            </div>

            {/* Schedule Service Button */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Need Service?</h2>
                    <p className="text-gray-600 max-w-md">Schedule a service appointment for your warranty-covered items. Our professional technicians are ready to help.</p>
                  </div>
                  <button
                    onClick={handleOpenSchedulingModal}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Schedule Service
                  </button>
                </div>
              </div>
            </div>

            {/* Service List */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2">
              <ServiceList 
                filteredServices={filteredServices}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                formatServiceTime={formatServiceTime}
                onReschedule={handleOpenReschedulingModal}
                onCancel={handleCancelService}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scheduling Modal */}
      {isSchedulingModalOpen && (
        <ScheduleServiceModal
          isOpen={isSchedulingModalOpen}
          onClose={handleCloseSchedulingModal}
          onSubmit={handleScheduleServiceSubmit}
        />
      )}

      {/* Rescheduling Modal */}
      {isReschedulingModalOpen && selectedService && (
        <ScheduleServiceModal
          isOpen={isReschedulingModalOpen}
          onClose={handleCloseReschedulingModal}
          onSubmit={handleRescheduleServiceSubmit}
          initialData={{
            type: selectedService.service_type,
            date: selectedService.scheduled_date,
            preferredTime: selectedService.preferred_time
          }}
          isRescheduling={true}
        />
      )}
    </div>
  )
}
