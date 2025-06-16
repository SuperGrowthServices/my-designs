import { AuthResult, SignUpData } from '@/types/auth';  // Import the types from auth.ts
import { supabase } from '@/integrations/supabase/client';
import { ensureUserRecordsExist } from './userRecordService';

export const signUp = async (data: SignUpData) => {
  try {
    console.log('Starting signup process...', data);
    const redirectUrl = `${window.location.origin}/`;
    
    // 1. First create the auth user
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: data.userData.full_name,
          whatsapp_number: data.userData.whatsapp_number
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    if (authData.user) {
      const userId = authData.user.id;

      // 2. Create user record in users table with upsert to avoid duplicates
      const { error: userError } = await supabase
        .from('users')
        .upsert([{
          id: userId,
          email: data.email,
        }], {
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (userError) throw userError;

      // 3. Create user profile with upsert
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          id: userId,
          user_id: userId,
          full_name: data.userData.full_name,
          whatsapp_number: data.userData.whatsapp_number,
          location: data.userData.location,
          business_name: data.userData.business_name,
          vendor_tags: data.userData.vendor_tags,
          google_maps_url: data.userData.google_maps_url,
          application_status: data.userData.role === 'vendor' ? 'pending' : 'not_applied',
          application_submitted_at: data.userData.role === 'vendor' ? new Date().toISOString() : null
        }], {
          onConflict: 'id',
          ignoreDuplicates: true
        });

      if (profileError) throw profileError;

      // 4. Create user role with upsert
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert([{
          user_id: userId,
          role: data.userData.role,
          is_approved: data.userData.role === 'buyer' // Only buyers are auto-approved
        }], {
          onConflict: 'user_id',
          ignoreDuplicates: true
        });

      if (roleError) throw roleError;
    }

    if (!authData.session) {
      return { error: null, needsConfirmation: true };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { error: error as Error };
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
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        variant: "success"
      });
    }
  } catch (error) {
    console.error('Unexpected signout error:', error);
    toast({
      title: "Unexpected error",
      description: "An unexpected error occurred while signing out.",
      variant: "destructive"
    });
  }
};
function toast(arg0: { title: string; description: string; }) {
  throw new Error('Function not implemented.');
}

