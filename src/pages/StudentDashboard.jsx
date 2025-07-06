import React, { useEffect, useState } from 'react'
import {
    Typography, Container, Paper, Box, Grid, Button
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

    if (!student) return null

    return (
        <Container
            dir="rtl"
            sx={{
                mt: 4,
                backdropFilter: 'blur(6px)',
                color: '#fff'
            }}
        >
            <Typography variant="h5" gutterBottom>
                👋 سلام، {student.name || student.username} عزیز!
            </Typography>

            <Typography>🎓 مدرسه: {student.school}</Typography>
            <Typography>📚 پایه: {student.year_level || 'ثبت نشده'}</Typography>
            <Typography>🏫 کلاس: {student.classroom}</Typography>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff'
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            🎯 امتیاز کل شما
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {student.total_score ?? 0} امتیاز
                        </Typography>
                    </Paper>
                </Grid>

                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff'
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            📊 آزمون‌ها و نتایج
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 1, color: '#fff', borderColor: '#fff' }}
                            onClick={() => navigate('/student-results')}
                        >
                            مشاهده نتایج من
                        </Button>
                    </Paper>
                </Grid>

                <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff'
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            🎮 بازی‌های آموزشی
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 1, color: '#fff', borderColor: '#fff' }}
                            onClick={() => navigate('/student-games')}
                        >
                            شروع بازی
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}
