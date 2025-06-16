import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Activity } from 'lucide-react'

interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_table: string | null
  target_id: string | null
  details: any
  created_at: string
  admin: {
    full_name: string
    email: string
  }
}

export const AdminLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          id,
          admin_id,
          action,
          target_table,
          target_id,
          details,
          created_at,
          admin:user_profiles!admin_logs_admin_id_fkey (
            full_name,
            user:users!user_profiles_user_id_fkey (
              email
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const transformedLogs: AdminLog[] = (data || []).map(log => ({
        id: log.id,
        admin_id: log.admin_id,
        action: log.action,
        target_table: log.target_table,
        target_id: log.target_id,
        details: log.details,
        created_at: log.created_at,
        admin: {
          full_name: log.admin?.full_name || 'Unknown Admin',
          email: log.admin?.user?.email || 'No email'
        }
      }))

      setLogs(transformedLogs)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800'
      case 'update':
        return 'bg-blue-100 text-blue-800'
      case 'delete':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-gray-500" />
          <CardTitle>Admin Activity Logs</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] rounded-md">
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.admin.full_name}
                      </p>
                      <p className="text-sm text-gray-500">{log.admin.email}</p>
                    </div>
                    <Badge
                      className={`${getActionColor(log.action)} capitalize`}
                    >
                      {log.action}
                    </Badge>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {log.target_table && (
                        <span className="font-medium">
                          {log.target_table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                      {log.details && (
                        <span className="ml-2">{JSON.stringify(log.details)}</span>
                      )}
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
  
}