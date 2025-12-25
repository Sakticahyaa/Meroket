import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PortfolioV2, TIER_LIMITS } from '../lib/supabase';
import { Plus, CreditCard as Edit, Trash2, Eye, LogOut, User, Shield } from 'lucide-react';
import { ProfileEdit } from './ProfileEdit';
import { getTierBadge, canCreatePortfolio, isAdmin } from '../lib/tierUtils';

type DashboardProps = {
  onEditPortfolio: (portfolioId?: string) => void;
};

export function Dashboard({ onEditPortfolio }: DashboardProps) {
  const { user, profile, signOut } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [portfolioCount, setPortfolioCount] = useState(0);

  useEffect(() => {
    loadPortfolios();
    loadPortfolioCount();
  }, []);

  const loadPortfolios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios_v2')
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

  const loadPortfolioCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('portfolios_v2')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setPortfolioCount(count || 0);
    } catch (err) {
      console.error('Failed to load portfolio count:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return;

    try {
      const { error } = await supabase
        .from('portfolios_v2')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPortfolios(portfolios.filter(p => p.id !== id));
      await loadPortfolioCount();
    } catch {
      alert('Failed to delete portfolio');
    }
  };

  const handleCreatePortfolio = async () => {
    if (!profile) return;

    const validation = await canCreatePortfolio(user!.id, profile.user_tier);
    if (!validation.allowed) {
      alert(validation.message);
      return;
    }

    onEditPortfolio();
  };

  const userTier = profile?.user_tier || 'free';
  const tierLimits = TIER_LIMITS[userTier];
  const tierBadge = getTierBadge(userTier);
  const canCreateMore = portfolioCount < tierLimits.portfolios;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-900">Meroket</h1>
          <div className="flex items-center gap-4">
            {/* Tier Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white ${tierBadge.color}`}
              >
                {tierBadge.label}
              </span>
              <span className="text-sm text-slate-600">
                {portfolioCount}/{tierLimits.portfolios} portfolios
              </span>
            </div>

            {isAdmin(profile) && (
              <a
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <Shield className="w-4 h-4" />
                Admin
              </a>
            )}

            <div className="h-6 w-px bg-slate-200"></div>

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
              {portfolioCount === 0
                ? `Create your first portfolio to get started (${portfolioCount}/${tierLimits.portfolios} used)`
                : `You're using ${portfolioCount} of ${tierLimits.portfolios} portfolios on the ${tierBadge.label} plan`}
            </p>
            {!canCreateMore && (
              <p className="text-amber-600 text-sm mt-1">
                ⚠️ Portfolio limit reached. Upgrade your plan to create more.
              </p>
            )}
          </div>
          <button
            onClick={handleCreatePortfolio}
            disabled={!canCreateMore}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg ${
              canCreateMore
                ? 'bg-red-900 text-white hover:bg-red-800'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
            Create Portfolio
          </button>
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
                onClick={handleCreatePortfolio}
                className="px-6 py-3 bg-red-900 text-white rounded-lg hover:bg-red-800"
              >
                Create Your Portfolio
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => {
              // Extract hero section data from portfolio_data
              const heroSection = portfolio.portfolio_data?.sections?.find(
                (s) => s.type === 'hero'
              );
              const heroData = (heroSection?.type === 'hero' ? heroSection.data : {}) as any;
              const portfolioTitle = heroData.title || portfolio.slug;

              // Get background for preview
              let bgStyle: any = { background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)' };
              if (heroData.backgroundType === 'color') {
                bgStyle = { backgroundColor: heroData.backgroundColor || '#f1f5f9' };
              } else if (heroData.backgroundType === 'gradient') {
                const direction = heroData.gradientDirection === 'horizontal' ? '90deg' :
                                heroData.gradientDirection === 'vertical' ? '180deg' : '135deg';
                bgStyle = {
                  background: `linear-gradient(${direction}, ${heroData.gradientStart || '#f1f5f9'}, ${heroData.gradientEnd || '#cbd5e1'})`
                };
              } else if (heroData.backgroundType === 'image' && heroData.backgroundImage) {
                bgStyle = {
                  backgroundImage: `url(${heroData.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                };
              }

              return (
                <div key={portfolio.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-48 flex items-center justify-center" style={bgStyle}>
                    {!heroData.backgroundImage && (
                      <div className="text-slate-400 text-4xl font-bold">
                        {portfolio.slug.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {portfolioTitle}
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
                          href={`/${portfolio.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                      )}
                      <button
                        onClick={() => onEditPortfolio(portfolio.slug)}
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
              );
            })}
          </div>
        )}
      </div>

      {showProfileEdit && (
        <ProfileEdit onClose={() => setShowProfileEdit(false)} />
      )}
    </div>
  );
}
