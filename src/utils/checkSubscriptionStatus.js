import { supabase } from '../supabaseClient'

export async function checkSubscriptionStatus(teacherId) {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('end_date', { ascending: false })
        .limit(1)
        .single()

    if (error || !data) return false

    const today = new Date()
    const end = new Date(data.end_date)

    return end >= today
}
