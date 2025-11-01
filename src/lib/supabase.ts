import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
