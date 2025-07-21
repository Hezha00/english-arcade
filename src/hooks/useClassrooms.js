// useClassrooms.js
// Returns classrooms as [{id, name}] for use with classroom_id selectors. Fully migrated from legacy classroom text field.
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
                .from('classrooms')
                .select('id, name')
                .eq('teacher_id', user.id)

            if (error) console.error('Classroom fetch error:', error)

            setClassrooms(data || [])
            setLoading(false)
        }

        fetchClassrooms()
    }, [])

    return { classrooms, loading }
}
