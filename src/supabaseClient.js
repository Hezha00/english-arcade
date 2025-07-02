import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ✅ Custom fetch to inject `student-id` from localStorage into request headers
const customFetch = async (url, options = {}) => {
    try {
        const student = JSON.parse(localStorage.getItem('student'))
        const headers = new Headers(options.headers || {})

        if (student?.id) {
            headers.set('student-id', student.id)
        }

        return fetch(url, { ...options, headers })
    } catch (err) {
        console.warn('⚠️ Failed to inject student-id header:', err)
        return fetch(url, options)
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    },
    global: {
        fetch: customFetch
    }
})
