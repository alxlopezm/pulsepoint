import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InitiativesPage from './pages/InitiativesPage';
import CreateInitiativePage from './pages/CreateInitiativePage';
import InitiativeDetailPage from './pages/InitiativeDetailPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-lighter dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-lighter dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/initiatives"
        element={
          <ProtectedRoute>
            <Layout>
              <InitiativesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/initiatives/new"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateInitiativePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/initiatives/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <InitiativeDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
