import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type ProfileData = {
  gender: string;
  age: number;
  address: string;
  phoneNumber: string;
  occupation: string;
  profilePictureUrl: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, profileData?: ProfileData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing completion');
        setLoading(false);
      }
    }, 5000); // 5 second absolute timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || null);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          // Load profile but don't block the auth flow
          loadProfile(session.user.id).catch(console.error);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Load profile but don't block the auth flow
        loadProfile(session.user.id).catch(console.error);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, profileData?: ProfileData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Provide more specific error messages
      if (error.message.includes('Invalid email')) {
        throw new Error('Please use a valid email address. Try a different email format.');
      }
      if (error.message.includes('email already registered')) {
        throw new Error('This email is already registered. Please sign in instead.');
      }
      throw error;
    }

    if (data.user && profileData) {
      let profilePictureUrl = profileData.profilePictureUrl;

      // Upload the profile photo if there's a pending file
      const pendingPhoto = (window as any).pendingProfilePhoto;
      if (pendingPhoto) {
        try {
          const fileExt = pendingPhoto.name.split('.').pop();
          const fileName = `${data.user.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, pendingPhoto);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

          profilePictureUrl = urlData.publicUrl;

          // Clean up
          delete (window as any).pendingProfilePhoto;
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          throw new Error('Account created but photo upload failed. Please try again.');
        }
      }

      // Create complete profile
      const profilePayload = {
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        gender: profileData.gender,
        age: profileData.age,
        address: profileData.address,
        phone_number: profileData.phoneNumber,
        occupation: profileData.occupation,
        profile_picture_url: profilePictureUrl,
        profile_completed: true,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Account created but profile setup failed. Please contact support.');
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
