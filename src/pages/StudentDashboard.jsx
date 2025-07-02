import React, { useEffect, useState } from 'react'
import {
    Typography, Container, Box, Paper
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import StudentAppWrapper from '../layouts/StudentAppWrapper'

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

    if (!student) return null

    return (
        <StudentAppWrapper student={student}>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    👋 سلام، {student.name || student.username} عزیز!
                </Typography>

                <Typography>🎓 مدرسه: {student.school}</Typography>
                <Typography>📚 پایه: {student.year_level || 'ثبت نشده'}</Typography>
                <Typography>🏫 کلاس: {student.classroom}</Typography>

                <Box
                    sx={{
                        mt: 2,
                        width: 100,
                        height: 100,
                        backgroundColor: student.profile_color || '#ccc',
                        borderRadius: '50%'
                    }}
                />

                <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
                    <Typography variant="h6">🏅 نشان شما: {student.badge || '❓'}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        🎯 مجموع امتیاز شما: {student.total_score ?? 0}
                    </Typography>
                </Paper>
            </Container>
        </StudentAppWrapper>
    )
}
