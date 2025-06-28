
import StudentAppWrapper from '../layouts/StudentAppWrapper'
import React, { useEffect, useState } from 'react'
import {
    Typography, Container, Button, Box
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) {
            setStudent(JSON.parse(saved))
        } else {
            navigate('/student-login')
        }
    }, [])

    const logout = () => {
        localStorage.removeItem('student')
        navigate('/student-login')
    }

    if (!student) return null

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    خوش آمدید، {student.username}
                </Typography>
                <Typography>مدرسه: {student.school}</Typography>
                <Typography>پایه: {student.year_level}</Typography>
                <Typography>کلاس: {student.classroom}</Typography>

                <Box
                    sx={{
                        mt: 2,
                        width: 100,
                        height: 100,
                        backgroundColor: student.profile_color || '#ccc',
                        borderRadius: '50%'
                    }}
                />

                <Typography variant="h6" sx={{ mt: 2 }}>
                    نشان شما: {student.badge || '❓'}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                    مجموع امتیاز: {student.total_score ?? 0}
                </Typography>

                <Button sx={{ mt: 4 }} variant="outlined" onClick={logout}>
                    خروج
                </Button>
            </Container>
        </StudentAppWrapper>
    )
}