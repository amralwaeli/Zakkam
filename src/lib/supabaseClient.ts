import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://rlfajdsgsbvnmjgcfwpv.supabase.co'
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZmFqZHNnc2J2bm1qZ2Nmd3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5Mzk2NDIsImV4cCI6MjA5MjUxNTY0Mn0.lvi7fxRUC99kOpvZ7TPLu8AXkEUYi6AFtTBpzwg28lo'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase env vars are missing; using the built-in public project config instead.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
