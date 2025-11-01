import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import NewPortfolioEditor from './components/NewPortfolioEditor';
import { PortfolioView } from './components/PortfolioView';
import { NewPortfolioData } from './lib/supabase';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.error('Auth loading timeout reached');
        setTimeoutReached(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Loading timeout</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add timeout to prevent infinite loading on public routes too
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.error('Public route loading timeout reached');
        setTimeoutReached(true);
      }
    }, 8000); // 8 seconds timeout for public routes

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (timeoutReached) {
    console.warn('Auth loading timeout on public route, rendering login anyway');
    return <>{children}</>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Portfolio View Route Component
function PortfolioRoute() {
  const { slug } = useParams<{ slug: string }>();
  return <PortfolioView slug={slug} />;
}

// Main Dashboard Component with Editor functionality
function DashboardApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | undefined>();

  // Determine view based on URL
  useEffect(() => {
    if (location.pathname === '/dashboard/create') {
      setView('editor');
      setEditingPortfolioId(undefined);
    } else if (location.pathname.startsWith('/dashboard/edit/') && portfolioId) {
      setView('editor');
      setEditingPortfolioId(portfolioId);
    } else {
      setView('dashboard');
      setEditingPortfolioId(undefined);
    }
  }, [location.pathname, portfolioId]);

  const handleSave = async (data: NewPortfolioData) => {
    console.log('Saving portfolio:', data);
    // TODO: Implement save logic to database
    alert('Portfolio saved! (Database integration coming soon)');
    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (view === 'editor') {
    return (
      <NewPortfolioEditor
        initialData={editingPortfolioId ? undefined : undefined} // TODO: Load portfolio data if editing
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Dashboard
      onEditPortfolio={(portfolioId) => {
        if (portfolioId) {
          window.history.pushState({}, '', `/dashboard/edit/${portfolioId}`);
        } else {
          window.history.pushState({}, '', '/dashboard/create');
        }
        setEditingPortfolioId(portfolioId);
        setView('editor');
      }}
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/create" element={
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/edit/:portfolioId" element={
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      } />

      {/* Portfolio View Route (public) */}
      <Route path="/:slug" element={<PortfolioRoute />} />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;