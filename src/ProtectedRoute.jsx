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
        const checkAccess = async () => {
            const teacher = await ensureTeacherProfile()
            if (!teacher) {
                navigate('/teacher-login')
                return
            }

            const expires = teacher.subscription_expires
                ? dayjs.utc(teacher.subscription_expires)
                : null

            if (!expires || expires.isBefore(dayjs.utc())) {
                navigate('/renew-subscription')
                return
            }

            setLoading(false)
        }

        checkAccess()
    }, [])

    if (loading) return <div>در حال بررسی اشتراک...</div>

    return <>{children}</>
}
