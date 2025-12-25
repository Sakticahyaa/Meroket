import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'admin';
export type UserTier = 'free' | 'pro' | 'hyper';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  gender: string | null;
  age: number | null;
  address: string | null;
  phone_number: string | null;
  occupation: string | null;
  profile_picture_url: string | null;
  profile_completed: boolean;
  role: UserRole;
  user_tier: UserTier;
  tier_scheduled_at: string | null;
  tier_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Portfolio = {
  id: string;
  user_id: string;
  slug: string;
  is_published: boolean;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  profile_image_url: string | null;
  profile_description: string | null;
  additional_content: string | null;
  bg_color: string;
  title_color: string;
  hero_title_color?: string;
  hero_subtitle_color?: string;
  heading_color: string;
  body_color: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  portfolio_id: string;
  position: number;
  title: string | null;
  description: string | null;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  position: number;
  created_at: string;
};

export type PreviewData = {
  slug: string;
  is_published: boolean;
  hero_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  profile_image_url: string | null;
  profile_description: string | null;
  additional_content: string | null;
  bg_color: string;
  title_color: string;
  hero_title_color?: string;
  hero_subtitle_color?: string;
  heading_color: string;
  body_color: string;
  projects: Array<{
    position: number;
    title: string;
    description: string;
    main_image_url: string;
    project_images: Array<{
      image_url: string;
      position: number;
    }>;
  }>;
};

// New Section-based types
export type SectionType = 'hero' | 'about' | 'skills' | 'projects' | 'testimonials' | 'contact';

export type HeroSection = {
  type: 'hero';
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: 'horizontal' | 'vertical' | 'diagonal';
  backgroundImage?: string;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
};

export type AboutSection = {
  type: 'about';
  title: string;
  description: string;
  image?: string;
  imageShape: 'circle' | 'square' | 'rounded' | 'hexagon' | 'triangle';
  imageBorder: boolean;
  borderColor?: string;
};

export type SkillCard = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  iconType: 'image' | 'lucide';
};

export type SkillsSection = {
  type: 'skills';
  title: string;
  cards: SkillCard[];
};

export type ProjectCard = {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image?: string;
  tags?: string[];
};

export type ProjectsSection = {
  type: 'projects';
  title: string;
  cards: ProjectCard[];
};

export type TestimonialCard = {
  id: string;
  text: string;
  author: string;
  role?: string;
};

export type TestimonialsSection = {
  type: 'testimonials';
  title: string;
  cards: TestimonialCard[];
};

export type ContactSection = {
  type: 'contact';
  title: string;
  method: 'email' | 'whatsapp';
  email?: string;
  whatsappNumber?: string;
  showForm: boolean;
};

export type PortfolioSection =
  | HeroSection
  | AboutSection
  | SkillsSection
  | ProjectsSection
  | TestimonialsSection
  | ContactSection;

// Wrapper type for sections as stored in database (with id and data wrapper)
export type StoredSection = {
  id: string;
  type: SectionType;
  data: HeroSection | AboutSection | SkillsSection | ProjectsSection | TestimonialsSection | ContactSection;
};

export type NewPortfolioData = {
  id?: string;
  user_id?: string;
  slug: string;
  is_published: boolean;
  is_frozen?: boolean;
  sections: PortfolioSection[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    headingColor: string;
    bodyColor: string;
  };
  created_at?: string;
  updated_at?: string;
};

// Database table structure for portfolios_v2
export type PortfolioV2 = {
  id: string;
  user_id: string;
  slug: string;
  is_published: boolean;
  is_frozen: boolean;
  portfolio_data: {
    sections: StoredSection[];
    theme?: {
      primaryColor: string;
      secondaryColor: string;
      headingColor: string;
      bodyColor: string;
    };
  };
  created_at: string;
  updated_at: string;
};

// Tier Limits Configuration
export type TierLimits = {
  portfolios: number;
  sections: number;
  projects: number;
};

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    portfolios: 1,
    sections: 5,
    projects: 5,
  },
  pro: {
    portfolios: 3,
    sections: 10,
    projects: 25,
  },
  hyper: {
    portfolios: 5,
    sections: 10,
    projects: 100,
  },
};

// Tier Schedule type
export type TierSchedule = {
  id: string;
  user_id: string;
  profile_id: string;
  from_tier: UserTier;
  to_tier: UserTier;
  start_date: string;
  end_date: string | null;
  is_permanent: boolean;
  is_executed: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
};
