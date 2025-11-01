import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Portfolio } from '../lib/supabase';
import { Plus, CreditCard as Edit, Trash2, Eye, LogOut, User } from 'lucide-react';
import { ProfileEdit } from './ProfileEdit';

type DashboardProps = {
  onEditPortfolio: (portfolioId?: string) => void;
};

export function Dashboard({ onEditPortfolio }: DashboardProps) {
  const { user, profile, signOut } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (err) {
      console.error('Failed to load portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete portfolio');
    }
  };

  const canCreateMore = portfolios.length < 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-900">Meroket</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <div className="text-sm">
                <div className="font-medium text-slate-900">{profile?.full_name || 'User'}</div>
                <div className="text-slate-500">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={() => setShowProfileEdit(true)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">My Portfolios</h2>
            <p className="text-slate-600 mt-2">
              {canCreateMore
                ? 'Create your first portfolio to get started'
                : 'You have used your free portfolio (1/1)'}
            </p>
          </div>
          {canCreateMore && (
            <button
              onClick={() => onEditPortfolio()}
              className="flex items-center gap-2 px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800"
            >
              <Plus className="w-5 h-5" />
              Create Portfolio
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : portfolios.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No portfolios yet</h3>
              <p className="text-slate-600 mb-6">
                Create your first portfolio to showcase your work to the world
              </p>
              <button
                onClick={() => onEditPortfolio()}
                className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800"
              >
                Create Your Portfolio
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  {portfolio.hero_image_url ? (
                    <img
                      src={portfolio.hero_image_url}
                      alt={portfolio.slug}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 text-4xl font-bold">
                      {portfolio.slug.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {portfolio.hero_title || portfolio.slug}
                      </h3>
                      <p className="text-sm text-slate-600">meroket.id/{portfolio.slug}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        portfolio.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {portfolio.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {portfolio.is_published && (
                      <a
                        href={`http://meroket.id/${portfolio.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                    )}
                    <button
                      onClick={() => onEditPortfolio(portfolio.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(portfolio.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProfileEdit && (
        <ProfileEdit onClose={() => setShowProfileEdit(false)} />
      )}
    </div>
  );
}
