import { supabase } from '@/integrations/supabase/client'

interface LogAdminActionParams {
  adminId: string
  action: string
  targetTable?: string
  targetId?: string
  details?: any
}

export const logAdminAction = async ({
  adminId,
  action,
  targetTable,
  targetId,
  details
}: LogAdminActionParams) => {
  try {
    const { error } = await supabase
      .from('admin_logs')
      .insert([
        {
          admin_id: adminId,
          action,
          target_table: targetTable,
          target_id: targetId,
          details
        }
      ])

    if (error) throw error
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}