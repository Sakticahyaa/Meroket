import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import NewPortfolioEditor from './components/NewPortfolioEditor';
import { PortfolioView } from './components/PortfolioView';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUserList } from './components/admin/AdminUserList';
import { NewPortfolioData, supabase } from './lib/supabase';
import { cleanupUnusedImages } from './lib/storageUtils';

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

// Standalone Editor Route
function EditorRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSave = async (data: NewPortfolioData, publish: boolean) => {
    if (!user) {
      alert('You must be logged in to save a portfolio');
      navigate('/login');
      return;
    }

    try {
      // Cleanup unused images if updating existing portfolio
      if (data.id) {
        // Get current portfolio data first
        const { data: currentPortfolio } = await supabase
          .from('portfolios_v2')
          .select('portfolio_data')
          .eq('id', data.id)
          .single();

        if (currentPortfolio) {
          const currentData = typeof currentPortfolio.portfolio_data === 'string'
            ? JSON.parse(currentPortfolio.portfolio_data)
            : currentPortfolio.portfolio_data;

          const oldPortfolioData: NewPortfolioData = {
            ...data,
            sections: currentData.sections || [],
            theme: currentData.theme,
            navbar: currentData.navbar,
          };

          // Cleanup orphaned images
          await cleanupUnusedImages(oldPortfolioData, data);
        }
      }

      // Save to database
      const portfolioToSave = {
        user_id: user.id,
        slug: data.slug,
        is_published: publish,
        portfolio_data: JSON.stringify({
          sections: data.sections,
          theme: data.theme,
          navbar: data.navbar,
        }),
      };

      const { error } = data.id
        ? await supabase
            .from('portfolios_v2')
            .update(portfolioToSave)
            .eq('id', data.id)
            .select()
            .single()
        : await supabase
            .from('portfolios_v2')
            .insert(portfolioToSave)
            .select()
            .single();

      if (error) throw error;

      alert(publish ? 'Portfolio published successfully!' : 'Portfolio saved successfully!');
    } catch (error: any) {
      console.error('Error saving portfolio:', error);
      alert(`Failed to save portfolio: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return <NewPortfolioEditor onSave={handleSave} onCancel={handleCancel} />;
}

// Main Dashboard Component with Editor functionality
function DashboardApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [editingSlug, setEditingSlug] = useState<string | undefined>();
  const [portfolioData, setPortfolioData] = useState<NewPortfolioData | undefined>();
  const [loading, setLoading] = useState(false);

  // Load portfolio data when editing
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!slug || !user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('portfolios_v2')
          .select('*')
          .eq('slug', slug)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Parse portfolio_data JSONB
          const parsedData = typeof data.portfolio_data === 'string'
            ? JSON.parse(data.portfolio_data)
            : data.portfolio_data;

          setPortfolioData({
            id: data.id,
            user_id: data.user_id,
            slug: data.slug,
            is_published: data.is_published,
            is_frozen: data.is_frozen,
            sections: parsedData.sections || [],
            theme: parsedData.theme || {
              primaryColor: '#3B82F6',
              secondaryColor: '#10B981',
              headingColor: '#1F2937',
              bodyColor: '#6B7280',
            },
            navbar: parsedData.navbar,
            created_at: data.created_at,
            updated_at: data.updated_at,
          });
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
        alert('Failed to load portfolio');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname.startsWith('/portfolio/') && slug) {
      setView('editor');
      setEditingSlug(slug);
      loadPortfolio();
    } else if (location.pathname === '/dashboard/create') {
      setView('editor');
      setEditingSlug(undefined);
      setPortfolioData(undefined);
    } else {
      setView('dashboard');
      setEditingSlug(undefined);
      setPortfolioData(undefined);
    }
  }, [location.pathname, slug, user, navigate]);

  const handleSave = async (data: NewPortfolioData, publish: boolean) => {
    if (!user) {
      alert('You must be logged in to save a portfolio');
      navigate('/login');
      return;
    }

    try {
      // Cleanup unused images if updating existing portfolio
      if (data.id) {
        // Get current portfolio data first
        const { data: currentPortfolio } = await supabase
          .from('portfolios_v2')
          .select('portfolio_data')
          .eq('id', data.id)
          .single();

        if (currentPortfolio) {
          const currentData = typeof currentPortfolio.portfolio_data === 'string'
            ? JSON.parse(currentPortfolio.portfolio_data)
            : currentPortfolio.portfolio_data;

          const oldPortfolioData: NewPortfolioData = {
            ...data,
            sections: currentData.sections || [],
            theme: currentData.theme,
            navbar: currentData.navbar,
          };

          // Cleanup orphaned images
          await cleanupUnusedImages(oldPortfolioData, data);
        }
      }

      // Save to database
      const portfolioToSave = {
        user_id: user.id,
        slug: data.slug.toLowerCase().replace(/\s+/g, '-'), // Normalize slug
        is_published: publish,
        portfolio_data: JSON.stringify({
          sections: data.sections,
          theme: data.theme,
          navbar: data.navbar,
        }),
      };

      const { error } = editingSlug && data.id
        ? await supabase
            .from('portfolios_v2')
            .update(portfolioToSave)
            .eq('id', data.id)
            .eq('user_id', user.id)
            .select()
            .single()
        : await supabase
            .from('portfolios_v2')
            .insert(portfolioToSave)
            .select()
            .single();

      if (error) throw error;

      alert(publish ? 'Portfolio published successfully!' : 'Portfolio saved successfully!');
    } catch (error: any) {
      console.error('Error saving portfolio:', error);
      alert(`Failed to save portfolio: ${error.message}`);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (view === 'editor') {
    console.log('[DashboardApp] Editor view', { loading, portfolioData, editingSlug });

    if (loading) {
      console.log('[DashboardApp] Showing loading spinner');
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-xl text-slate-600">Loading portfolio...</div>
          </div>
        </div>
      );
    }

    console.log('[DashboardApp] Rendering NewPortfolioEditor');
    return (
      <NewPortfolioEditor
        initialData={portfolioData}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Dashboard
      onEditPortfolio={(portfolioId) => {
        // portfolioId is actually the slug now
        if (portfolioId) {
          navigate(`/portfolio/${portfolioId}/edit`);
        } else {
          navigate('/dashboard/create');
        }
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
      <Route path="/portfolio/:slug/edit" element={
        <ProtectedRoute>
          <DashboardApp />
        </ProtectedRoute>
      } />
      <Route path="/editor" element={
        <ProtectedRoute>
          <EditorRoute />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUserList />} />
      </Route>

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