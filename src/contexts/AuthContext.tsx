import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContextType } from '@/types/auth';
import { ensureUserRecordsExist } from '@/services/userRecordService';
import { signUp as authSignUp, signIn as authSignIn, signOut as authSignOut } from '@/services/authService';

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
    console.log("thisis role ",data)

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
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          await ensureUserRecordsExist(session.user);
          const roles = await fetchUserRoles(session.user.id);
          console.log('User roles:', roles); // ✅ Just log it here
        }, 0);
      }

      setLoading(false);
    }
  );

  supabase.auth.getSession().then(async ({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      const roles = await fetchUserRoles(session.user.id);
      console.log('User roles on reload:', roles); // ✅ Also log here for reloads
    }

    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);


  const signUp = async (email: string, password: string, fullName: string, whatsappNumber: string, location: string) => {
    return authSignUp(email, password, fullName, whatsappNumber, location, toast);
  };

  const signIn = async (email: string, password: string) => {
    return authSignIn(email, password);
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
