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
  const { toast } = useToast();

  const fetchUserRoles = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
    if (error) {
      console.error('Failed to fetch roles:', error);
      return [];
    }

    return data.map((r) => r.role);
  };

  const attachRolesToUserMetadata = async (session: Session) => {
    if (!session?.user) return;

    const roles = await fetchUserRoles(session.user.id);

    const updatedUser = {
      ...session.user,
      user_metadata: {
        ...session.user.user_metadata,
        roles
      }
    };

    // Update state with new metadata
    setSession({
      ...session,
      user: updatedUser
    });

    setUser(updatedUser);
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoles(session.user.id); // Fetch roles for initial session
      }
      setLoading(false);
    });

    // 2. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id); // Add logging
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserRoles(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const signUp = async (data: SignUpData) => {
    return authSignUp(data);
  };

  const signIn = async (email: string, password: string): Promise<SignInResponse> => {
    try {
      setLoading(true);
      const result = await authSignIn(email, password);

      // Handle case where result doesn't have data
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
        // Return successful auth but with default role
        return {
          data: result.data,
          error: null,
          role: 'buyer'
        };
      }

      // Return successful result with role
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
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
