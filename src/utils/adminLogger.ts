
import { supabase } from '@/integrations/supabase/client';

export const logAdminAction = async (
  action: string, 
  targetId: string, 
  details: any, 
  adminId?: string
) => {
  try {
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action,
        target_table: 'user_profiles',
        target_id: targetId,
        details
      });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};
