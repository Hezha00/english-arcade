import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function SessionGuard({ children }) {
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const restoreSession = async () => {
            const { data: sessionData } = await supabase.auth.getSession()
            if (!sessionData?.session) {
                navigate('/teacher-login')
                return
            }
            setSession(sessionData.session)
            setLoading(false)
        }

        restoreSession()

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session || null)
        })

        return () => {
            listener?.subscription?.unsubscribe()
        }
    }, [navigate])

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>🔐 در حال بررسی ورود...</div>

    return <>{children}</>
}
