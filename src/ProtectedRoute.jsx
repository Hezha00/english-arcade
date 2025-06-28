import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) navigate('/teacher-login')
            setLoading(false)
        }

        checkUser()
    }, [])

    if (loading) return <div>در حال بارگذاری...</div>

    return <>{children}</>
}
