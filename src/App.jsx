import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import EmployeeDashboard from './pages/EmployeeDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import SetPassword from './pages/SetPassword'

const PrivateRoute = ({ children, requireEmployee = false }) => {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }

  const validateEmployeeEmail = (email) => {
    return email?.endsWith('@greenviewsolutions.net') || email?.endsWith('@gvsco.net')
  }

  const isEmployee = validateEmployeeEmail(user.email)

  if (requireEmployee && !isEmployee) {
    return <Navigate to="/customer-dashboard" />
  }

  if (!requireEmployee && isEmployee) {
    return <Navigate to="/employee-dashboard" />
  }

  return children
}

function App() {
  return (
    <Router>
      <div className="w-screen min-h-screen">
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route
              path="/employee-dashboard/*"
              element={
                <PrivateRoute requireEmployee={true}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer-dashboard/*"
              element={
                <PrivateRoute requireEmployee={false}>
                  <CustomerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  )
}

export default App
