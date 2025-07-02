import { supabase } from '../supabaseClient'
import { ensureTeacherProfile } from './ensureTeacherProfile'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export async function checkSubscriptionStatus() {
    const teacher = await ensureTeacherProfile()
    if (!teacher?.subscription_expires) return false

    const now = dayjs.utc()
    const expires = dayjs.utc(teacher.subscription_expires)

    return expires.isAfter(now)
}
