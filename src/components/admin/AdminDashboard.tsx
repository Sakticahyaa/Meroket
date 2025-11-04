import { useState, useEffect } from 'react';
import { Users, TrendingUp, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type DashboardStats = {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  hyperUsers: number;
  newUsersToday: number;
};

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    hyperUsers: 0,
    newUsersToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get total users count
      const { count: totalUsers, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get tier breakdown
      const { data: tierData, error: tierError } = await supabase
        .from('profiles')
        .select('user_tier');

      if (tierError) throw tierError;

      const freeUsers = tierData?.filter((p) => p.user_tier === 'free').length || 0;
      const proUsers = tierData?.filter((p) => p.user_tier === 'pro').length || 0;
      const hyperUsers = tierData?.filter((p) => p.user_tier === 'hyper').length || 0;

      // Get new users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { count: newUsersToday, error: newUsersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      if (newUsersError) throw newUsersError;

      setStats({
        totalUsers: totalUsers || 0,
        freeUsers,
        proUsers,
        hyperUsers,
        newUsersToday: newUsersToday || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your Meroket platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalUsers}</div>
          <div className="text-sm text-slate-600">Total Users</div>
        </div>

        {/* New Users Today */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.newUsersToday}</div>
          <div className="text-sm text-slate-600">New Today</div>
        </div>

        {/* Free Users */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stats.freeUsers}</div>
          <div className="text-sm text-slate-600">Free Tier</div>
          <div className="text-xs text-slate-500 mt-1">
            {((stats.freeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
          </div>
        </div>

        {/* Premium Users (Pro + Hyper) */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {stats.proUsers + stats.hyperUsers}
          </div>
          <div className="text-sm text-slate-600">Premium Users</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.proUsers} Pro · {stats.hyperUsers} Hyper
          </div>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Tier Distribution</h2>
        <div className="space-y-4">
          {/* Free Tier */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Free</span>
              <span className="text-sm text-slate-600">
                {stats.freeUsers} ({((stats.freeUsers / stats.totalUsers) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-slate-500 h-2 rounded-full transition-all"
                style={{ width: `${(stats.freeUsers / stats.totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Pro Tier */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Pro</span>
              <span className="text-sm text-slate-600">
                {stats.proUsers} ({((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(stats.proUsers / stats.totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Hyper Tier */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Hyper</span>
              <span className="text-sm text-slate-600">
                {stats.hyperUsers} ({((stats.hyperUsers / stats.totalUsers) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(stats.hyperUsers / stats.totalUsers) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
