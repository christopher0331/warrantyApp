import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()

  // Check for success message from password set
  const message = location.state?.message

  const validateEmployeeEmail = (email) => {
    return email.endsWith('@greenviewsolutions.net') || email.endsWith('@gvsco.net')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)

      if (isSignUp) {
        // Validate employee email domain for sign up
        if (!validateEmployeeEmail(email)) {
          throw new Error('Only @greenviewsolutions.net or @gvsco.net email addresses can sign up')
        }
        
        const { error: signUpError } = await signUp({ 
          email, 
          password,
          options: {
            data: {
              role: 'employee'
            }
          }
        })
        if (signUpError) throw signUpError
        
        setError('Please check your email for verification link')
        return
      }

      // Handle sign in
      const { error: signInError } = await signIn({ email, password })
      if (signInError) throw signInError

      // Redirect based on email domain
      if (validateEmployeeEmail(email)) {
        navigate('/employee-dashboard')
      } else {
        navigate('/customer-dashboard')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Create Employee Account' : 'Sign in to GreenView Solutions'}
        </h2>
        {!isSignUp && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Employees can sign up with their @greenviewsolutions.net or @gvsco.net email
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gvs-primary focus:border-gvs-primary"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gvs-primary hover:bg-gvs-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary disabled:opacity-50"
              >
                {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign up' : 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isSignUp ? 'Already have an account?' : 'Need an employee account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gvs-primary"
              >
                {isSignUp ? 'Sign in instead' : 'Sign up as employee'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
