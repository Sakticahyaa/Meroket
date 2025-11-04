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
  const [schedulingTier, setSchedulingTier] = useState<UserTier | null>(null);
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [isPermanent, setIsPermanent] = useState(true);

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
    setSchedulingTier(newTier);
    setScheduleStartDate('');
    setScheduleEndDate('');
    setIsPermanent(true);
  };

  const handleScheduleTierChange = async (userId: string, profileId: string) => {
    if (!schedulingTier) return;

    // Validation
    if (!isPermanent) {
      if (!scheduleStartDate) {
        alert('Please select a start date');
        return;
      }
      if (!scheduleEndDate) {
        alert('Please select an end date');
        return;
      }
      if (new Date(scheduleEndDate) <= new Date(scheduleStartDate)) {
        alert('End date must be after start date');
        return;
      }
    }

    const confirmMessage = isPermanent
      ? `Change user's tier to ${schedulingTier.toUpperCase()} permanently?`
      : `Change user's tier to ${schedulingTier.toUpperCase()} from ${scheduleStartDate} to ${scheduleEndDate}?`;

    if (!confirm(confirmMessage)) return;

    try {
      const now = new Date().toISOString();
      const startDate = isPermanent ? now : new Date(scheduleStartDate).toISOString();
      const endDate = isPermanent ? null : new Date(scheduleEndDate).toISOString();

      // Update user tier
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_tier: schedulingTier,
          tier_scheduled_at: startDate,
          tier_expires_at: endDate,
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      // Apply demotion logic if downgrading
      const user = users.find((u) => u.id === profileId);
      if (user) {
        const tierHierarchy = { free: 0, pro: 1, hyper: 2 };
        if (tierHierarchy[schedulingTier] < tierHierarchy[user.user_tier]) {
          await applyTierDemotion(userId, schedulingTier);
        }
      }

      // Reset state
      setSchedulingTier(null);
      setScheduleStartDate('');
      setScheduleEndDate('');
      setIsPermanent(true);

      // Reload users
      await loadUsers();
      alert('Tier updated successfully!');
    } catch (error: any) {
      console.error('Error updating tier:', error);
      alert(`Failed to update tier: ${error.message}`);
    }
  };

  const handleCancelScheduling = () => {
    setSchedulingTier(null);
    setScheduleStartDate('');
    setScheduleEndDate('');
    setIsPermanent(true);
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
                        <div className="max-w-3xl">
                          <h4 className="font-medium text-slate-900 mb-3">Change User Tier</h4>

                          {/* Tier Selection */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <button
                              onClick={() => handleTierChange(user.id, user.id, 'free')}
                              disabled={user.user_tier === 'free'}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                schedulingTier === 'free'
                                  ? 'border-slate-500 bg-slate-500 text-white'
                                  : user.user_tier === 'free'
                                  ? 'border-slate-300 bg-slate-100 text-slate-400'
                                  : 'border-slate-200 hover:border-slate-500 text-slate-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <div className="font-medium">Free</div>
                              <div className="text-xs mt-1">1 portfolio, 5 sections</div>
                            </button>
                            <button
                              onClick={() => handleTierChange(user.id, user.id, 'pro')}
                              disabled={user.user_tier === 'pro'}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                schedulingTier === 'pro'
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : user.user_tier === 'pro'
                                  ? 'border-blue-200 bg-blue-100 text-blue-400'
                                  : 'border-slate-200 hover:border-blue-600 text-slate-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <div className="font-medium">Pro</div>
                              <div className="text-xs mt-1">3 portfolios, 10 sections</div>
                            </button>
                            <button
                              onClick={() => handleTierChange(user.id, user.id, 'hyper')}
                              disabled={user.user_tier === 'hyper'}
                              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                                schedulingTier === 'hyper'
                                  ? 'border-purple-600 bg-purple-600 text-white'
                                  : user.user_tier === 'hyper'
                                  ? 'border-purple-200 bg-purple-100 text-purple-400'
                                  : 'border-slate-200 hover:border-purple-600 text-slate-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <div className="font-medium">Hyper</div>
                              <div className="text-xs mt-1">5 portfolios, 10 sections</div>
                            </button>
                          </div>

                          {/* Scheduling UI */}
                          {schedulingTier && (
                            <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-white">
                              <h5 className="font-medium text-slate-900 mb-3">Schedule Tier Change</h5>

                              {/* Permanent Toggle */}
                              <div className="flex items-center gap-2 mb-4">
                                <input
                                  type="checkbox"
                                  id="permanent"
                                  checked={isPermanent}
                                  onChange={(e) => setIsPermanent(e.target.checked)}
                                  className="w-4 h-4 text-red-900 rounded focus:ring-red-900"
                                />
                                <label htmlFor="permanent" className="text-sm text-slate-700">
                                  Permanent (No expiration)
                                </label>
                              </div>

                              {/* Date Pickers */}
                              {!isPermanent && (
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                      Start Date
                                    </label>
                                    <input
                                      type="date"
                                      value={scheduleStartDate}
                                      onChange={(e) => setScheduleStartDate(e.target.value)}
                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                      End Date
                                    </label>
                                    <input
                                      type="date"
                                      value={scheduleEndDate}
                                      onChange={(e) => setScheduleEndDate(e.target.value)}
                                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleScheduleTierChange(user.id, user.id)}
                                  className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
                                >
                                  Confirm Change
                                </button>
                                <button
                                  onClick={handleCancelScheduling}
                                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
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
