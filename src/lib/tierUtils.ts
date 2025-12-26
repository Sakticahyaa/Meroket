import { Profile, UserTier, TIER_LIMITS, supabase } from './supabase';

/**
 * Check if a user has admin role
 */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin';
}

/**
 * Get tier limits for a specific tier
 */
export function getTierLimits(tier: UserTier) {
  return TIER_LIMITS[tier];
}

/**
 * Validate if user can create a new portfolio based on their tier
 */
export async function canCreatePortfolio(userId: string, userTier: UserTier): Promise<{ allowed: boolean; message?: string }> {
  try {
    // Get user's current portfolio count
    const { count, error } = await supabase
      .from('portfolios_v2')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    const limits = getTierLimits(userTier);
    const currentCount = count || 0;

    if (currentCount >= limits.portfolios) {
      return {
        allowed: false,
        message: `You've reached your portfolio limit (${limits.portfolios} for ${userTier.toUpperCase()} tier). Please upgrade or delete an existing portfolio.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking portfolio limit:', error);
    return { allowed: false, message: 'Error checking portfolio limits' };
  }
}

/**
 * Validate if user can add sections to a portfolio based on their tier
 */
export function canAddSection(currentSectionCount: number, userTier: UserTier): { allowed: boolean; message?: string } {
  const limits = getTierLimits(userTier);

  if (currentSectionCount >= limits.sections) {
    return {
      allowed: false,
      message: `You've reached your section limit (${limits.sections} for ${userTier.toUpperCase()} tier). Please upgrade your plan.`,
    };
  }

  return { allowed: true };
}

/**
 * Validate if user can add project cards based on their tier
 */
export function canAddProjectCard(currentProjectCount: number, userTier: UserTier): { allowed: boolean; message?: string } {
  const limits = getTierLimits(userTier);

  if (currentProjectCount >= limits.projects) {
    return {
      allowed: false,
      message: `You've reached your project card limit (${limits.projects} for ${userTier.toUpperCase()} tier). Please upgrade your plan.`,
    };
  }

  return { allowed: true };
}

/**
 * Count total project cards across all experience and project sections
 */
export function countTotalProjectCards(sections: any[]): number {
  const experienceCards = sections
    .filter((section) => section.type === 'experience')
    .reduce((total, section) => total + (section.cards?.length || 0), 0);

  const projectItems = sections
    .filter((section) => section.type === 'projects')
    .reduce((total, section) => total + (section.items?.length || 0), 0);

  return experienceCards + projectItems;
}

/**
 * Freeze a portfolio (mark as frozen in database)
 */
export async function freezePortfolio(portfolioId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('portfolios_v2')
      .update({ is_frozen: true, updated_at: new Date().toISOString() })
      .eq('id', portfolioId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error freezing portfolio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unfreeze a portfolio (mark as not frozen in database)
 */
export async function unfreezePortfolio(portfolioId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('portfolios_v2')
      .update({ is_frozen: false, updated_at: new Date().toISOString() })
      .eq('id', portfolioId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error unfreezing portfolio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Apply tier demotion logic - freeze excess portfolios
 */
export async function applyTierDemotion(
  userId: string,
  newTier: UserTier
): Promise<{ success: boolean; frozenCount: number; error?: string }> {
  try {
    const limits = getTierLimits(newTier);

    // Get all user's portfolios, ordered by published status and creation date
    const { data: portfolios, error: fetchError } = await supabase
      .from('portfolios_v2')
      .select('*')
      .eq('user_id', userId)
      .order('is_published', { ascending: false })
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    if (!portfolios || portfolios.length <= limits.portfolios) {
      // User is within limits, no need to freeze anything
      return { success: true, frozenCount: 0 };
    }

    // Keep the first N portfolios (prioritizing published ones), freeze the rest
    const portfoliosToKeep = portfolios.slice(0, limits.portfolios);
    const portfoliosToFreeze = portfolios.slice(limits.portfolios);

    // Unfreeze the ones we're keeping
    for (const portfolio of portfoliosToKeep) {
      if (portfolio.is_frozen) {
        await unfreezePortfolio(portfolio.id);
      }
    }

    // Freeze the excess ones
    for (const portfolio of portfoliosToFreeze) {
      await freezePortfolio(portfolio.id);
    }

    return { success: true, frozenCount: portfoliosToFreeze.length };
  } catch (error: any) {
    console.error('Error applying tier demotion:', error);
    return { success: false, frozenCount: 0, error: error.message };
  }
}

/**
 * Check if a portfolio exceeds tier limits and should be frozen
 */
export function shouldFreezeDueToLimits(
  sectionCount: number,
  projectCount: number,
  userTier: UserTier
): { shouldFreeze: boolean; reason?: string } {
  const limits = getTierLimits(userTier);

  if (sectionCount > limits.sections) {
    return {
      shouldFreeze: true,
      reason: `Portfolio has ${sectionCount} sections, exceeding ${userTier.toUpperCase()} tier limit of ${limits.sections}`,
    };
  }

  if (projectCount > limits.projects) {
    return {
      shouldFreeze: true,
      reason: `Portfolio has ${projectCount} project cards, exceeding ${userTier.toUpperCase()} tier limit of ${limits.projects}`,
    };
  }

  return { shouldFreeze: false };
}

/**
 * Get tier display name with badge color
 */
export function getTierBadge(tier: UserTier): { label: string; color: string } {
  const badges = {
    free: { label: 'FREE', color: 'bg-slate-500' },
    pro: { label: 'PRO', color: 'bg-blue-600' },
    hyper: { label: 'HYPER', color: 'bg-purple-600' },
  };

  return badges[tier];
}
