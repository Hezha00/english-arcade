// useTeacherProfile.js
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function useTeacherProfile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return setLoading(false)

            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error && error.code === 'PGRST116') {
                await supabase.from('teachers').insert({ id: user.id, email: user.email })
                setProfile({ id: user.id, email: user.email })
            } else {
                setProfile(data)
            }

            setLoading(false)
        }

        fetchProfile()
    }, [])

    return { profile, loading }
}
