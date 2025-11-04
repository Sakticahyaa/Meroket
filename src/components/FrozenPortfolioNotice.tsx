import { AlertTriangle, Lock } from 'lucide-react';
import { UserTier } from '../lib/supabase';
import { getTierBadge } from '../lib/tierUtils';

interface FrozenPortfolioNoticeProps {
  userTier: UserTier;
  reason?: string;
}

export function FrozenPortfolioNotice({ userTier, reason }: FrozenPortfolioNoticeProps) {
  const tierBadge = getTierBadge(userTier);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Portfolio Frozen</h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white ${tierBadge.color} mt-1`}>
              {tierBadge.label} PLAN
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-1">This portfolio has been frozen</p>
              <p className="text-amber-800">
                {reason || 'Your account was downgraded and this portfolio exceeds your current tier limits.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">What this means:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>You cannot edit or publish this portfolio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>The portfolio remains visible if it was published</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <span>Your other portfolios within limits remain active</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">To unfreeze this portfolio:</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">1.</span>
              <span>Upgrade your plan to increase your portfolio limits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">2.</span>
              <span>Or delete other portfolios to stay within your current limit</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">3.</span>
              <span>Reduce sections/projects in this portfolio to meet tier requirements</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => alert('Upgrade feature coming soon!')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
