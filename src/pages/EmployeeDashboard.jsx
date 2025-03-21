import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function EmployeeDashboard() {
  const { user, signOut } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_numbers: '',
    address: '',
    notes: '',
    fence_length: '',
    install_date: '',
    fence_type: '',
    gates: '',
    color: '',
    warranty_status: 'Active',
    warranty_issue_date: '',
    next_review_date: '',
  })

  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchCustomers = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_numbers,
          address,
          fence_length,
          install_date,
          fence_type,
          gates,
          color,
          warranty_status,
          warranty_issue_date,
          next_review_date,
          notes,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error details:', error)
        throw error
      }

      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to load customers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, []) // Empty dependency array since fetchCustomers is defined inside the component

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      // Create customer profile
      const { error: insertError } = await supabase
        .from('customers')
        .insert([{
          ...formData,
          phone_numbers: JSON.stringify([formData.phone_numbers]),
          created_by: user.id,
          created_at: new Date().toISOString(),
          has_account: false
        }])

      if (insertError) throw insertError

      // Send invitation email
      console.log('Sending invitation to:', formData.email);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-customer-invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            email: formData.email,
            firstName: formData.first_name,
            lastName: formData.last_name
          })
        }
      )

      const responseData = await response.json();
      console.log('Invitation response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send invitation')
      }

      // Reset form and refresh customers list
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_numbers: '',
        address: '',
        notes: '',
        fence_length: '',
        install_date: '',
        fence_type: '',
        gates: '',
        color: '',
        warranty_status: 'Active',
        warranty_issue_date: '',
        next_review_date: '',
      })
      
      await fetchCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  // Function to format phone numbers
  const formatPhoneNumbers = (phoneNumbersString) => {
    try {
      const numbers = JSON.parse(phoneNumbersString)
      return Array.isArray(numbers) ? numbers.join(', ') : phoneNumbersString
    } catch {
      return phoneNumbersString
    }
  }

  // Customer Details Modal
  const CustomerDetailsModal = ({ customer, onClose }) => {
    if (!customer) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900">
            <div>
              <h4 className="font-semibold">Personal Information</h4>
              <p><span className="font-medium">Name:</span> {customer.first_name} {customer.last_name}</p>
              <p><span className="font-medium">Email:</span> {customer.email}</p>
              <p><span className="font-medium">Phone:</span> {formatPhoneNumbers(customer.phone_numbers)}</p>
              <p><span className="font-medium">Address:</span> {customer.address}</p>
            </div>

            <div>
              <h4 className="font-semibold">Fence Details</h4>
              <p><span className="font-medium">Type:</span> {customer.fence_type}</p>
              <p><span className="font-medium">Length:</span> {customer.fence_length} ft</p>
              <p><span className="font-medium">Color:</span> {customer.color}</p>
              <p><span className="font-medium">Gates:</span> {customer.gates}</p>
            </div>

            <div>
              <h4 className="font-semibold">Dates</h4>
              <p><span className="font-medium">Install Date:</span> {formatDate(customer.install_date)}</p>
              <p><span className="font-medium">Warranty Issue Date:</span> {formatDate(customer.warranty_issue_date)}</p>
              <p><span className="font-medium">Next Review Date:</span> {formatDate(customer.next_review_date)}</p>
            </div>

            <div>
              <h4 className="font-semibold">Warranty Information</h4>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  customer.warranty_status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {customer.warranty_status}
                </span>
              </p>
            </div>

            {customer.notes && (
              <div className="col-span-2">
                <h4 className="font-semibold">Notes</h4>
                <p className="whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gvs-primary">GVS Employee Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gvs-primary hover:bg-gvs-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary disabled:opacity-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Customer Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Customer</h2>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone_numbers}
                    onChange={(e) => setFormData({ ...formData, phone_numbers: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fence_length" className="block text-sm font-medium text-gray-700">
                      Fence Length (ft)
                    </label>
                    <input
                      type="number"
                      id="fence_length"
                      value={formData.fence_length}
                      onChange={(e) => setFormData({ ...formData, fence_length: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="install_date" className="block text-sm font-medium text-gray-700">
                      Install Date
                    </label>
                    <input
                      type="date"
                      id="install_date"
                      value={formData.install_date}
                      onChange={(e) => setFormData({ ...formData, install_date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fence_type" className="block text-sm font-medium text-gray-700">
                      Fence Type
                    </label>
                    <select
                      id="fence_type"
                      value={formData.fence_type}
                      onChange={(e) => setFormData({ ...formData, fence_type: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Wood">Wood</option>
                      <option value="Vinyl">Vinyl</option>
                      <option value="Chain Link">Chain Link</option>
                      <option value="Aluminum">Aluminum</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="gates" className="block text-sm font-medium text-gray-700">
                      Number of Gates
                    </label>
                    <input
                      type="number"
                      id="gates"
                      value={formData.gates}
                      onChange={(e) => setFormData({ ...formData, gates: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <input
                    type="text"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="warranty_issue_date" className="block text-sm font-medium text-gray-700">
                      Warranty Issue Date
                    </label>
                    <input
                      type="date"
                      id="warranty_issue_date"
                      value={formData.warranty_issue_date}
                      onChange={(e) => setFormData({ ...formData, warranty_issue_date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="next_review_date" className="block text-sm font-medium text-gray-700">
                      Next Review Date
                    </label>
                    <input
                      type="date"
                      id="next_review_date"
                      value={formData.next_review_date}
                      onChange={(e) => setFormData({ ...formData, next_review_date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-900 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gvs-primary hover:bg-gvs-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Customer'}
                </button>
              </form>
            </div>

            {/* Customer List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer List</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Install Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warranty Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatDate(customer.install_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.warranty_status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.warranty_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setIsModalOpen(true)
                            }}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCustomer(null)
          }}
        />
      )}
    </div>
  )
}
