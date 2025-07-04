// useClassrooms.js
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function useClassrooms() {
    const [classrooms, setClassrooms] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchClassrooms = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return setLoading(false)

            const { data, error } = await supabase
                .from('students')
                .select('classroom')
                .eq('teacher_id', user.id)

            if (error) console.error('Classroom fetch error:', error)

            const unique = [...new Set(data?.map(s => s.classroom))]
            setClassrooms(unique)
            setLoading(false)
        }

        fetchClassrooms()
    }, [])

    return { classrooms, loading }
}
