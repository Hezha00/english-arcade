// useStudentProfile.js
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function useStudentProfile() {
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) {
            setStudent(JSON.parse(saved))
            setLoading(false)
            return
        }

        const fetchStudent = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return setLoading(false)

            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('auth_id', user.id)
                .single()

            if (error) {
                setErrorMsg('خطا در دریافت اطلاعات دانش‌آموز.');
            }
            setStudent(data)
            setLoading(false)
        }

        fetchStudent()
    }, [])

    return { student, loading, errorMsg }
}
