import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType } from '@/types/auth';
import { ensureUserRecordsExist } from '@/services/userRecordService';
import { signUp as authSignUp, authSignIn, signOut as authSignOut } from '@/services/authService';
import { SignInResponse, SignUpData } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  const fetchUserRoles = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Failed to fetch roles:', error);
        return [];
      }

      return data.map((r) => r.role);
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  };

  const updateUserWithRoles = async (currentSession: Session) => {
    if (!currentSession?.user) return currentSession;

    try {
      const roles = await fetchUserRoles(currentSession.user.id);

      const updatedUser = {
        ...currentSession.user,
        user_metadata: {
          ...currentSession.user.user_metadata,
          roles
        }
      };

      const updatedSession = {
        ...currentSession,
        user: updatedUser
      };

      return updatedSession;
    } catch (error) {
      console.error('Error updating user with roles:', error);
      return currentSession;
    }
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: any = null;

    const initialize = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session with retry logic
        let sessionData = null;
        let retries = 3;
        
        while (retries > 0 && !sessionData) {
          const { data } = await supabase.auth.getSession();
          sessionData = data;
          
          if (!sessionData.session && retries > 1) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          retries--;
        }

        if (!mounted) return;

        if (sessionData.session?.user) {
          console.log('Found existing session:', sessionData.session.user.id);
          
          // Update session and user with roles
          const sessionWithRoles = await updateUserWithRoles(sessionData.session);
          
          if (mounted) {
            setSession(sessionWithRoles);
            setUser(sessionWithRoles.user);
          }
        } else {
          console.log('No existing session found');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener first
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        try {
          if (session?.user) {
            // Update session with roles
            const sessionWithRoles = await updateUserWithRoles(session);
            
            if (mounted) {
              setSession(sessionWithRoles);
              setUser(sessionWithRoles.user);
            }
          } else {
            setSession(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
        
        if (mounted && initialized) {
          setLoading(false);
        }
      });

      return subscription;
    };

    // Initialize auth
    initialize();
    
    // Set up listener
    authSubscription = setupAuthListener();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    return authSignUp(data);
  };

  const signIn = async (email: string, password: string): Promise<SignInResponse> => {
    try {
      setLoading(true);
      const result = await authSignIn(email, password);

      if (!result.data?.user) {
        return {
          data: null,
          error: result.error || new Error('No user data returned'),
          role: undefined
        };
      }

      // Fetch user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', result.data.user.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        return {
          data: result.data,
          error: null,
          role: 'buyer'
        };
      }

      return {
        data: result.data,
        error: null,
        role: roleData?.role || 'buyer'
      };
      
    } catch (error) {
      console.error('SignIn error in AuthContext:', error);
      return {
        data: null,
        error: error as Error,
        role: undefined
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    return authSignOut(toast);
  };

  const value = {
    user,
    session,
    loading: loading || !initialized,
    signUp,
    signIn,
    signOut
  };

  // Show loading spinner until auth is fully initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};