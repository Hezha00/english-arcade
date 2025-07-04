import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, Grid,
    Button, CircularProgress, Box
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function TeacherDashboard() {
    const [teacher, setTeacher] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTeacher = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return setLoading(false)

            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error && error.code === 'PGRST116') {
                await supabase.from('teachers').insert({ id: user.id, email: user.email })
                setTeacher({ id: user.id, email: user.email })
            } else {
                setTeacher(data)
            }

            setLoading(false)
        }

        fetchTeacher()
    }, [])

    if (loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Container dir="rtl" sx={{ py: 4, mt: { xs: 8, md: 4 } }}>
            <Box
                dir="rtl"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    transform: 'translateX(250px)',
                    mt: -5
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" fontWeight="bold" color="#fff">
                        خوش آمدید، {teacher?.email}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                🎮 ساخت بازی جدید
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                بازی‌های آموزشی بسازید و به کلاس‌ها اختصاص دهید.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{ mt: 2 }}
                                onClick={() => navigate('/create-game')}
                            >
                                ساخت بازی
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                📊 مشاهده نتایج
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                عملکرد دانش‌آموزان را بررسی کنید.
                            </Typography>
                            <Button
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={() => navigate('/teacher-analytics')}
                            >
                                تحلیل نتایج
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    )
}
