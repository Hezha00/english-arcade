// useTeacherProfile.js
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function useTeacherProfile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return setLoading(false)

            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('auth_id', user.id)
                .single()

            if (error && error.code === 'PGRST116') {
                await supabase.from('teachers').insert({ auth_id: user.id, email: user.email })
                setProfile({ auth_id: user.id, email: user.email })
            } else {
                setProfile(data)
            }

            if (error) {
                setErrorMsg('خطا در دریافت اطلاعات معلم.');
            }

            setLoading(false)
        }

        fetchProfile()
    }, [])

    return { profile, loading, errorMsg }
}
