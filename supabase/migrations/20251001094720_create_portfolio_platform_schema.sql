/*
  # Portfolio Platform Database Schema

  ## Overview
  This migration creates a complete SaaS portfolio platform database with user authentication,
  portfolio management, and image gallery functionality.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, FK to auth.users) - Primary key
  - `email` (text) - User's email
  - `full_name` (text) - User's display name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `portfolios`
  Main portfolio data with all sections and styling
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - Portfolio owner
  - `slug` (text, unique) - Custom URL path (e.g., 'john-doe')
  - `is_published` (boolean) - Publication status
  - `hero_image_url` (text) - Hero section background image
  - `hero_title` (text) - Hero overlay text
  - `hero_subtitle` (text) - Hero subtitle text
  - `profile_image_url` (text) - Profile section photo
  - `profile_description` (text) - About me content
  - `additional_content` (text) - Section 7 flexible content
  - `bg_color` (text) - Background color (hex or gradient)
  - `title_color` (text) - Title text color
  - `heading_color` (text) - Heading text color
  - `body_color` (text) - Body text color
  - `created_at` (timestamptz) - Portfolio creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `projects`
  Individual project entries (4 per portfolio)
  - `id` (uuid) - Primary key
  - `portfolio_id` (uuid, FK to portfolios) - Parent portfolio
  - `position` (integer) - Display order (1-4)
  - `title` (text) - Project name
  - `description` (text) - Project description
  - `main_image_url` (text) - Primary display image
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `project_images`
  Gallery images for each project (up to 4 images)
  - `id` (uuid) - Primary key
  - `project_id` (uuid, FK to projects) - Parent project
  - `image_url` (text) - Gallery image URL
  - `position` (integer) - Display order in gallery
  - `created_at` (timestamptz) - Upload timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only read their own data
  - Users can update/delete their own portfolios and projects
  - Published portfolios are publicly readable by slug
  - Anonymous users can view published portfolios

  ### Policies
  - Separate policies for SELECT, INSERT, UPDATE, DELETE
  - Authentication required for data modification
  - Public read access for published portfolios

  ## Notes
  - Free tier: 1 portfolio per user (enforced at application level)
  - Each portfolio has exactly 4 project sections
  - Each project can have up to 4 gallery images
  - Slugs must be unique across all portfolios
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE NOT NULL,
  is_published boolean DEFAULT false,
  hero_image_url text,
  hero_title text,
  hero_subtitle text,
  profile_image_url text,
  profile_description text,
  additional_content text,
  bg_color text DEFAULT '#ffffff',
  title_color text DEFAULT '#000000',
  heading_color text DEFAULT '#1a1a1a',
  body_color text DEFAULT '#4a4a4a',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL CHECK (position >= 1 AND position <= 4),
  title text,
  description text,
  main_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(portfolio_id, position)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create project_images table
CREATE TABLE IF NOT EXISTS project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  position integer NOT NULL CHECK (position >= 1 AND position <= 4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, position)
);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Portfolios Policies
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published portfolios"
  ON portfolios FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Projects Policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published portfolio projects"
  ON projects FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = projects.portfolio_id
      AND portfolios.is_published = true
    )
  );

CREATE POLICY "Users can insert projects to own portfolios"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Project Images Policies
CREATE POLICY "Users can view own project images"
  ON project_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.id = projects.portfolio_id
      WHERE projects.id = project_images.project_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published project images"
  ON project_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.id = projects.portfolio_id
      WHERE projects.id = project_images.project_id
      AND portfolios.is_published = true
    )
  );

CREATE POLICY "Users can insert images to own projects"
  ON project_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.id = projects.portfolio_id
      WHERE projects.id = project_images.project_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project images"
  ON project_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.id = projects.portfolio_id
      WHERE projects.id = project_images.project_id
      AND portfolios.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.id = projects.portfolio_id
      WHERE projects.id = project_images.project_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project images"
  ON project_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.id = projects.portfolio_id
      WHERE projects.id = project_images.project_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_projects_portfolio_id ON projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();