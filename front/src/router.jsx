/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAppContext } from './AppContext'
import App from './App'
import { LoginPage, SignupPage, DashboardPage } from './components'

function ProtectedRoute({ children }) {
  const { authUser } = useAppContext()

  if (!authUser) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
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
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  // Legacy routes → unified dashboard
  {
    path: '/client-dashboard',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/profile',
    element: <Navigate to="/dashboard" replace />,
  },
])
