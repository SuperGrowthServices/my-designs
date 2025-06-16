
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const ensureUserRecordsExist = async (user: User) => {
  try {
    // First ensure user exists in users table (without role column)
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking user:', userCheckError);
    }

    // If user doesn't exist in users table, create it
    if (!existingUser) {
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || ''
        });

      if (createUserError) {
        console.error('Error creating user record:', createUserError);
      } else {
        console.log('User record created successfully');
      }
    }

    // Ensure user has at least a buyer role in user_roles table
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') {
      console.error('Error checking user role:', roleCheckError);
    }

    // If no role exists in user_roles, create default buyer role
    if (!existingRole) {
      const { error: createRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'buyer'
        });

      if (createRoleError) {
        console.error('Error creating user role record:', createRoleError);
      } else {
        console.log('User role record created successfully');
      }
    }

    // Then check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile:', checkError);
      return;
    }

    // If profile doesn't exist, create it from auth metadata
    if (!existingProfile) {
      console.log('Creating missing profile for user:', user.id);
      
      const metadata = user.user_metadata || {};
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: metadata.full_name || metadata.name || 'User',
          whatsapp_number: metadata.whatsapp_number || metadata.phone || '',
          location: metadata.location || '',
          business_name: metadata.business_name || null,
          vendor_tags: []
        });

      if (createError) {
        console.error('Error creating profile:', createError);
      } else {
        console.log('Profile created successfully');
      }
    }
  } catch (error) {
    console.error('Error ensuring user records exist:', error);
  }
};
