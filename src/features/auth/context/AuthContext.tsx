import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { db } from '@/offline/database/dexie-db';
import { generateUUID } from '@/lib/utils';
import type { Profile } from '@/types';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isPlatformAdmin: boolean;
  isLiveSupabase: boolean;
  login: (email: string, password?: string) => Promise<{ error: Error | null }>;
  register: (fullName: string, email: string, password?: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }) => Promise<{ error: Error | null }>;
  setDemoPlatformAdmin: (isAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'sewdesk_active_user';
const LOCAL_STORAGE_IS_ADMIN_KEY = 'sewdesk_is_platform_admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const isLive = isSupabaseConfigured();

  const loadProfile = async (userId: string, emailStr?: string) => {
    try {
      if (isLive) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data && !error) {
          setProfile(data as Profile);
          await db.profiles.put(data as Profile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data));
          // Check platform admin status
          const { data: adminData } = await supabase
            .from('platform_admins')
            .select('id')
            .eq('profile_id', userId)
            .maybeSingle();

          setIsPlatformAdmin(Boolean(adminData));
          return;
        }
      }

      // Check Dexie / Local fallback
      const localProfile = await db.profiles.get(userId);
      if (localProfile) {
        setProfile(localProfile);
      } else if (emailStr) {
        const fallbackProfile: Profile = {
          id: userId,
          full_name: emailStr.split('@')[0],
          email: emailStr,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await db.profiles.put(fallbackProfile);
        setProfile(fallbackProfile);
      }

      const storedAdmin = localStorage.getItem(LOCAL_STORAGE_IS_ADMIN_KEY);
      setIsPlatformAdmin(storedAdmin === 'true');
    } catch (err) {
      console.warn('Error loading user profile:', err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isLive) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await loadProfile(currentSession.user.id, currentSession.user.email);
          }
        } else {
          // Local fallback session
          const storedUserJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (storedUserJson) {
            try {
              const parsed = JSON.parse(storedUserJson);
              const mockUser: User = {
                id: parsed.id,
                app_metadata: {},
                user_metadata: { full_name: parsed.full_name },
                aud: 'authenticated',
                created_at: parsed.created_at,
                email: parsed.email,
              } as User;
              setUser(mockUser);
              setProfile(parsed);
              const storedAdmin = localStorage.getItem(LOCAL_STORAGE_IS_ADMIN_KEY);
              setIsPlatformAdmin(storedAdmin === 'true');
            } catch {
              localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    if (isLive) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await loadProfile(newSession.user.id, newSession.user.email);
        } else {
          setProfile(null);
          setIsPlatformAdmin(false);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isLive]);

  const login = async (email: string, password = 'Password123!'): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      if (isLive) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return { error: null };
      }

      // Local persistence mode
      let existingProfile = await db.profiles.where('email').equalsIgnoreCase(email).first();
      if (!existingProfile) {
        const newId = generateUUID();
        existingProfile = {
          id: newId,
          full_name: email.split('@')[0],
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await db.profiles.put(existingProfile);
      }

      const mockUser: User = {
        id: existingProfile.id,
        app_metadata: {},
        user_metadata: { full_name: existingProfile.full_name },
        aud: 'authenticated',
        created_at: existingProfile.created_at,
        email: existingProfile.email,
      } as User;

      setUser(mockUser);
      setProfile(existingProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(existingProfile));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password = 'Password123!'
  ): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      if (isLive) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        if (data.user) {
          // Upsert profile row — must succeed before onboarding calls createBusiness()
          // The auth trigger (handle_new_user) should have already created the row,
          // but we upsert here as a defensive guarantee.
          const { error: profileError } = await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              full_name: fullName,
              email,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
          if (profileError) {
            console.warn('Profile upsert after registration returned an error:', profileError.message);
            // Don't throw — the trigger may have already created the row; RLS warning is non-fatal.
          }
        }
        return { error: null };
      }

      // Local fallback mode
      const newId = generateUUID();
      const newProfile: Profile = {
        id: newId,
        full_name: fullName,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await db.profiles.put(newProfile);

      const mockUser: User = {
        id: newId,
        app_metadata: {},
        user_metadata: { full_name: fullName },
        aud: 'authenticated',
        created_at: newProfile.created_at,
        email,
      } as User;

      setUser(mockUser);
      setProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isLive) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsPlatformAdmin(false);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem('sewdesk_active_business_id');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    try {
      if (isLive) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id, user.email);
    }
  };

  const updateProfile = async (updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<{ error: Error | null }> => {
    const userId = user?.id || profile?.id;
    if (!userId) {
      return { error: new Error('No active user found.') };
    }

    try {
      const now = new Date().toISOString();
      const updatedFields = {
        ...updates,
        updated_at: now,
      };

      if (isLive) {
        // 1. Update public.profiles table in Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updatedFields)
          .eq('id', userId);

        if (profileError) {
          const { error: upsertErr } = await supabase.from('profiles').upsert(
            {
              id: userId,
              email: user?.email || profile?.email || '',
              full_name: updates.full_name || profile?.full_name || 'Tailor',
              ...updatedFields,
            },
            { onConflict: 'id' }
          );
          if (upsertErr) throw upsertErr;
        }

        // 2. Also update Supabase auth metadata if full_name is changed
        if (updates.full_name) {
          try {
            await supabase.auth.updateUser({
              data: { full_name: updates.full_name },
            });
          } catch (metaErr) {
            console.warn('Could not update auth user metadata:', metaErr);
          }
        }
      }

      // 3. Update Dexie DB
      const localExisting = await db.profiles.get(userId);
      const baseFullName = updates.full_name || localExisting?.full_name || profile?.full_name || 'Tailor';
      const newProfile: Profile = {
        id: userId,
        email: localExisting?.email || profile?.email || user?.email || '',
        full_name: baseFullName,
        phone: updates.phone !== undefined ? updates.phone : (localExisting?.phone || profile?.phone || null),
        avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : (localExisting?.avatar_url || profile?.avatar_url || null),
        created_at: localExisting?.created_at || profile?.created_at || now,
        updated_at: now,
      };
      await db.profiles.put(newProfile);

      // 4. Update localStorage cache
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newProfile));

      // 5. Update React states immediately
      setProfile(newProfile);
      if (user && updates.full_name) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            full_name: updates.full_name,
          },
        });
      }

      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { error: err as Error };
    }
  };

  const setDemoPlatformAdmin = (isAdmin: boolean) => {
    setIsPlatformAdmin(isAdmin);
    localStorage.setItem(LOCAL_STORAGE_IS_ADMIN_KEY, isAdmin ? 'true' : 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isPlatformAdmin,
        isLiveSupabase: isLive,
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
        updateProfile,
        setDemoPlatformAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

