import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LandingPage } from '../landing/LandingPage'
import { LoadingSpinner } from '../LoadingSpinner'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-lighter dark:bg-secondary">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return <Outlet />
}
