import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const ensureUserRecordsExist = async (user: User) => {
  try {
    // 🔍 Upsert into users table by id
    console.log('Upserting user record for:', user.id);
    const { error: upsertUserError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || ''
      }, {
        onConflict: 'id' // safer than email
      });

    if (upsertUserError) {
      console.error('Error upserting user record:', upsertUserError);
    } else {
      console.log('User record ensured in users table');
    }

    // ✅ Ensure at least a buyer role in user_roles table
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') {
      console.error('Error checking user role:', roleCheckError);
    }

    if (!existingRole) {
      console.log('Creating default buyer role for:', user.id);
      const { error: createRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'buyer'
        });

      if (createRoleError) {
        console.error('Error creating user role:', createRoleError);
      } else {
        console.log('User role created successfully');
      }
    }

    // 📦 Ensure user profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking profile:', checkError);
      return;
    }

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
    console.error('Unexpected error ensuring user records:', error);
  }
};
