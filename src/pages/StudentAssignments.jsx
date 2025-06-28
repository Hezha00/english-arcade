import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, Grid, Button, Chip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import AssignmentIcon from '@mui/icons-material/Assignment'
import StudentAppWrapper from '../layouts/StudentAppWrapper'


export default function StudentAssignments() {
    const [assignments, setAssignments] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const student = JSON.parse(localStorage.getItem('student'))
        if (!student) {
            navigate('/student-login')
            return
        }

        // Fetch real assignments from Supabase later
        setAssignments([
            {
                id: 1,
                title: 'تمرین گرامر',
                classroom: 'کلاس ۹۴',
                status: 'درحال انجام',
                type: 'game'
            },
            {
                id: 2,
                title: 'تست واژگان',
                classroom: 'کلاس ۹۴',
                status: 'کامل شده',
                type: 'quiz'
            }
        ])
    }, [])

    return (
        <StudentAppWrapper>
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundImage: 'url("/bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    py: 8,
                    px: 2
                }}
            >
                <Container maxWidth="lg" dir="rtl">
                    <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                        تمرین‌های شما
                    </Typography>

                    <Grid container spacing={3} mt={2}>
                        {assignments.map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Paper
                                    elevation={4}
                                    sx={{
                                        p: 3,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'blur(6px)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {item.title}
                                        </Typography>

                                        <Chip
                                            label={item.status}
                                            color={item.status === 'کامل شده' ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ mb: 1 }}
                                        />

                                        <Typography variant="body2" color="text.secondary">
                                            کلاس: {item.classroom}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                                            نوع: {item.type === 'game' ? 'بازی' : 'آزمون'}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={
                                            item.type === 'game' ? <SportsEsportsIcon /> : <AssignmentIcon />
                                        }
                                        onClick={() =>
                                            navigate(
                                                item.type === 'game'
                                                    ? `/play-game?id=${item.id}`
                                                    : `/student-quiz/${item.id}`
                                            )
                                        }
                                    >
                                        {item.type === 'game' ? 'شروع بازی' : 'شروع آزمون'}
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
        </StudentAppWrapper>
    )
}
