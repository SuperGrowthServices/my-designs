import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oiehtcljagqszlxelsdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZWh0Y2xqYWdxc3pseGVsc2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDAyNjIsImV4cCI6MjA2NDYxNjI2Mn0.TixkH-t_zklN47sgONeT4j3ZYs8V4TGZ6g-K13UmfaQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 