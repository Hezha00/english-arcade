import { supabase } from '../supabaseClient'

export async function ensureTeacherProfile() {
    const { data: session } = await supabase.auth.getSession()
    const user = session?.session?.user
    const uid = user?.id
    const email = user?.email

    if (!uid) return null

    const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('auth_id', uid)
        .single()

    if (error?.code === 'PGRST116') {
        const insert = await supabase.from('teachers').insert([
            {
                auth_id: uid,
                email,
                username: email?.split('@')[0] ?? 'placeholder',
                role: 'teacher',
                created_at: new Date().toISOString()
            }
        ])
        if (insert.error) return null
        return insert.data?.[0] ?? null
    }

    return teacher
}
