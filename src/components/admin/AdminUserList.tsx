import React, { useState, useEffect } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { supabase, Profile, UserTier } from '../../lib/supabase';
import { getTierBadge, applyTierDemotion } from '../../lib/tierUtils';

export function AdminUserList() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<UserTier | 'all'>('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    const matchesTier = filterTier === 'all' || user.user_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const handleTierChange = async (userId: string, profileId: string, newTier: UserTier) => {
    const confirmMessage = `Are you sure you want to change this user's tier to ${newTier.toUpperCase()}?`;
    if (!confirm(confirmMessage)) return;

    try {
      // Update user tier
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_tier: newTier,
          tier_scheduled_at: new Date().toISOString(),
          tier_expires_at: null, // null means permanent
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // Apply demotion logic if downgrading
      const user = users.find((u) => u.id === profileId);
      if (user) {
        const tierHierarchy = { free: 0, pro: 1, hyper: 2 };
        if (tierHierarchy[newTier] < tierHierarchy[user.user_tier]) {
          await applyTierDemotion(userId, newTier);
        }
      }

      // Reload users
      await loadUsers();
      alert('Tier updated successfully!');
    } catch (error: any) {
      console.error('Error updating tier:', error);
      alert(`Failed to update tier: ${error.message}`);
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
        <p className="text-slate-600">Manage users and their subscription tiers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as UserTier | 'all')}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="hyper">Hyper</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tier
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map((user) => {
              const tierBadge = getTierBadge(user.user_tier);
              const isExpanded = expandedUserId === user.id;

              return (
                <React.Fragment key={user.id}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile_picture_url ? (
                          <img
                            src={user.profile_picture_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <span className="text-slate-600 font-medium">
                              {user.full_name?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{user.full_name || 'N/A'}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${tierBadge.color}`}
                      >
                        {tierBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-600" />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row - Tier Management */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-slate-50">
                        <div className="max-w-2xl">
                          <h4 className="font-medium text-slate-900 mb-3">Change User Tier</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <button
                              onClick={() => handleTierChange(user.id, user.id, 'free')}
                              disabled={user.user_tier === 'free'}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                user.user_tier === 'free'
                                  ? 'border-slate-500 bg-slate-500 text-white'
                                  : 'border-slate-200 hover:border-slate-500 text-slate-700'
                              } disabled:opacity-50`}
                            >
                              <div className="font-medium">Free</div>
                              <div className="text-xs mt-1">1 portfolio, 5 sections</div>
                            </button>
                            <button
                              onClick={() => handleTierChange(user.id, user.id, 'pro')}
                              disabled={user.user_tier === 'pro'}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                user.user_tier === 'pro'
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-slate-200 hover:border-blue-600 text-slate-700'
                              } disabled:opacity-50`}
                            >
                              <div className="font-medium">Pro</div>
                              <div className="text-xs mt-1">3 portfolios, 10 sections</div>
                            </button>
                            <button
                              onClick={() => handleTierChange(user.id, user.id, 'hyper')}
                              disabled={user.user_tier === 'hyper'}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                user.user_tier === 'hyper'
                                  ? 'border-purple-600 bg-purple-600 text-white'
                                  : 'border-slate-200 hover:border-purple-600 text-slate-700'
                              } disabled:opacity-50`}
                            >
                              <div className="font-medium">Hyper</div>
                              <div className="text-xs mt-1">5 portfolios, 10 sections</div>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-500">No users found</div>
        )}
      </div>
    </div>
  );
}
