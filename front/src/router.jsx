/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAppContext } from './AppContext'
import App from './App'
import {
  LoginPage,
  SignupPage,
  DashboardPage,
  ClientDashboardPage,
  ProfilePage,
} from './components'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { authUser } = useAppContext()
  
  if (!authUser) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage onLogout={() => {}} />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client-dashboard',
    element: (
      <ProtectedRoute>
        <ClientDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
])
