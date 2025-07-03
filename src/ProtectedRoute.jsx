import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { ensureTeacherProfile } from './utils/ensureTeacherProfile'
dayjs.extend(utc)

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function validateSessionAndSubscription() {
            // ✅ Restore session first
            const { data: sessionData } = await supabase.auth.getSession()
            const session = sessionData?.session

            if (!session) {
                navigate('/teacher-login')
                return
            }

            // ✅ Get teacher profile
            const teacher = await ensureTeacherProfile()
            if (!teacher) {
                navigate('/teacher-login')
                return
            }

            // ✅ Check subscription expiration
            const expires = teacher.subscription_expires
                ? dayjs.utc(teacher.subscription_expires)
                : null

            if (!expires || expires.isBefore(dayjs.utc())) {
                navigate('/renew-subscription')
                return
            }

            // ✅ All good
            setLoading(false)
        }

        validateSessionAndSubscription()
    }, [])

    if (loading) return <div>در حال بررسی اشتراک و ورود...</div>

    return <>{children}</>
}
