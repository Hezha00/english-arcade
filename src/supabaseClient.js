import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gtslmgyxwnnyatvkrehv.supabase.co'
const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0c2xtZ3l4d25ueWF0dmtyZWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwOTc2MTEsImV4cCI6MjA2NjY3MzYxMX0.WM3kcJ1sGzqgdDyDh8bTHyjXkFeNgTXfnfYjwFK3wvo'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
