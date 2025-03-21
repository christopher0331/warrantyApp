import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isCustomerSignUp, setIsCustomerSignUp] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [customerExists, setCustomerExists] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()

  // Check for success message from password set
  const message = location.state?.message

  const validateEmployeeEmail = (email) => {
    return email.endsWith('@greenviewsolutions.net') || email.endsWith('@gvsco.net')
  }
  
  // Check if a customer with this email exists in the system
  const checkCustomerEmail = async (email) => {
    if (!email) return
    
    setCheckingEmail(true)
    setError('')
    
    try {
      // Check if they're in the customer_invites table with status 'pending'
      const { data: inviteData, error: inviteError } = await supabase
        .from('customer_invites')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle()
      
      if (inviteError) {
        console.error('Error checking customer invites:', inviteError)
      }
      
      // If customer invite exists, they can sign up
      if (inviteData) {
        setCustomerExists(true)
        return
      }
      
      // Then check customers table
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle()
      
      if (customerError) {
        console.error('Error checking customers:', customerError)
      }
      
      // If customer exists in the customers table
      if (customerData) {
        setCustomerExists(true)
        return
      }
      
      // For testing purposes during development - allow specific test emails
      if (email === 'test@example.com' || email.includes('@greenviewsolutions') || email.includes('@gvsco')) {
        setCustomerExists(true)
        return
      }
      
      // No customer found with this email
      setCustomerExists(false)
    } catch (error) {
      console.error('Error checking customer email:', error)
      // Don't block signup during development
      setCustomerExists(true)
    } finally {
      setCheckingEmail(false)
    }
  }
  
  // Check customer email when it changes in customer signup mode
  useEffect(() => {
    if (isCustomerSignUp && email) {
      const delayDebounceFn = setTimeout(() => {
        checkCustomerEmail(email)
      }, 500)
      
      return () => clearTimeout(delayDebounceFn)
    }
  }, [email, isCustomerSignUp])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)
      console.log('Form submission type:', isSignUp ? (isCustomerSignUp ? 'Customer Signup' : 'Employee Signup') : 'Sign In')

      // Handle employee sign up
      if (isSignUp && !isCustomerSignUp) {
        // Validate employee email domain for sign up
        if (!validateEmployeeEmail(email)) {
          throw new Error('Only @greenviewsolutions.net or @gvsco.net email addresses can sign up as employees')
        }
        
        console.log('Attempting employee signup for:', email)
        const { data: signUpData, error: signUpError } = await signUp({ 
          email, 
          password,
          options: {
            data: {
              role: 'employee'
            }
          }
        })
        
        if (signUpError) {
          console.error('Employee signup error:', signUpError)
          throw signUpError
        }
        
        console.log('Employee signup successful:', signUpData)
        setError('Please check your email for verification link')
        return
      }
      
      // Handle customer sign up
      if (isCustomerSignUp) {
        // Check if customer exists in the system
        console.log('Checking if customer exists:', email)
        await checkCustomerEmail(email)
        
        if (!customerExists) {
          console.error('Customer does not exist in system:', email)
          throw new Error('Your email is not in our system. Please contact GreenView Solutions to create an account.')
        }
        
        console.log('Customer exists, attempting signup for:', email)
        const { data: signUpData, error: signUpError } = await signUp({ 
          email, 
          password,
          options: {
            data: {
              role: 'customer'
            }
          }
        })
        
        if (signUpError) {
          console.error('Customer signup error:', signUpError)
          throw signUpError
        }
        
        console.log('Customer signup successful:', signUpData)
        setError('Please check your email for verification link')
        return
      }

      // Handle sign in
      console.log('Attempting sign in for:', email)
      const { data: signInData, error: signInError } = await signIn({ email, password })
      
      if (signInError) {
        console.error('Sign in error:', signInError)
        throw signInError
      }
      
      console.log('Sign in successful:', signInData)

      // Redirect based on email domain
      if (validateEmployeeEmail(email)) {
        console.log('Redirecting to employee dashboard')
        navigate('/employee-dashboard')
      } else {
        console.log('Redirecting to customer dashboard')
        navigate('/customer-dashboard')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </motion.div>
        <motion.h2 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600"
        >
          {isCustomerSignUp 
            ? 'Create Customer Account' 
            : (isSignUp ? 'Create Employee Account' : 'Welcome Back')}
        </motion.h2>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 text-center text-lg text-gray-600 font-medium"
        >
          {isCustomerSignUp 
            ? 'Access your GreenView Solutions account' 
            : (isSignUp ? 'Join the GreenView Solutions team' : 'Sign in to GreenView Solutions')}
        </motion.p>
        {!isSignUp && (
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-center text-sm text-gray-500"
          >
            {isCustomerSignUp 
              ? 'Customers must have a valid invitation to sign up' 
              : 'Employees can sign up with their @greenviewsolutions.net or @gvsco.net email'}
          </motion.p>
        )}
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-100">
          {message && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                {isCustomerSignUp && checkingEmail && (
                  <span className="text-xs text-blue-500 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking email...
                  </span>
                )}
                {isCustomerSignUp && !checkingEmail && customerExists === true && (
                  <span className="text-xs text-green-500 flex items-center">
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Account eligible
                  </span>
                )}
                {isCustomerSignUp && !checkingEmail && customerExists === false && email && (
                  <span className="text-xs text-red-500 flex items-center">
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Not found
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Create a secure password' : 'Enter your password'}
                  className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-white hover:bg-gray-50 text-blue-500 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1 transition-all duration-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 font-medium text-sm"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading 
                  ? (isSignUp || isCustomerSignUp ? 'Creating account...' : 'Signing in...') 
                  : (isCustomerSignUp ? 'Create Customer Account' : (isSignUp ? 'Create Employee Account' : 'Sign in'))}
              </motion.button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  {isCustomerSignUp 
                    ? 'Already have an account?' 
                    : (isSignUp ? 'Already have an account?' : 'Need an account?')}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isCustomerSignUp || isSignUp) {
                    // Go back to sign in
                    setIsSignUp(false)
                    setIsCustomerSignUp(false)
                  } else {
                    // Go to employee sign up
                    setIsSignUp(true)
                    setIsCustomerSignUp(false)
                  }
                  setError('')
                  setCustomerExists(null)
                }}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                {isCustomerSignUp || isSignUp ? 'Sign in instead' : 'Sign up as employee'}
              </motion.button>
              
              {!isSignUp && !isCustomerSignUp && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsCustomerSignUp(true)
                    setIsSignUp(false)
                    setError('')
                    setCustomerExists(null)
                  }}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Sign up as customer
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
