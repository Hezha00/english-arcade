import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, Box, Button, CircularProgress
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

            // Use auth_id instead of id
            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('auth_id', user.id)
                .single()

            if (error && error.code === 'PGRST116') {
                await supabase.from('teachers').insert({ auth_id: user.id, email: user.email })
                setTeacher({ auth_id: user.id, email: user.email })
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box
                    dir="rtl"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 3,
                        maxWidth: 800,
                        mx: 'auto',
                        p: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, width: '100%' }}>
                        <Typography variant="h4" fontWeight="bold" color="#fff">
                            خوش آمدید، {teacher?.username}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff',
                                flex: 1,
                                minWidth: 280
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

                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff',
                                flex: 1,
                                minWidth: 280
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
                    </Box>
                </Box>
            </Box>
        </Container>
    )
}
