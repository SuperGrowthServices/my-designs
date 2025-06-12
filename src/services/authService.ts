import { AuthResult } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { ensureUserRecordsExist } from './userRecordService';

export const signUp = async (
  email: string, 
  password: string, 
  fullName: string, 
  whatsappNumber: string, 
  location: string,
  toast: any
) => {
  try {
    console.log('Starting signup process...');
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          whatsapp_number: whatsappNumber,
          location
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    console.log('Signup successful, user data:', data);

    if (data.user && !data.session) {
      // Email confirmation required
      return { error: null, needsConfirmation: true };
    }

    if (data.user && data.session) {
      // User is immediately signed in
      // Create user records immediately for signup but don't show redirect toast
      await ensureUserRecordsExist(data.user);
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to EasyCarParts.ae! You can now browse and request parts."
      });
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { error };
  }
};

export const authSignIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      data: data ? { user: data.user, session: data.session } : null,
      error
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error
    };
  }
};

export const signOut = async (toast: any) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  } catch (error) {
    console.error('Unexpected signout error:', error);
  }
};
