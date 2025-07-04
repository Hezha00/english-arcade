// useAuthUser.js
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function useAuthUser() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) console.error('Auth fetch error:', error)
            setUser(user)
            setLoading(false)
        }

        getUser()
    }, [])

    return { user, loading }
}
