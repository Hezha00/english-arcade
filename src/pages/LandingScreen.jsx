import React from 'react'
import {
    Box,
    Button,
    Container,
    Paper,
    Typography
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import SchoolIcon from '@mui/icons-material/School'
import BadgeIcon from '@mui/icons-material/Badge'

export default function LandingScreen() {
    const navigate = useNavigate()

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                background: 'none', // Let index.css handle background
                color: '#fff'
            }}
        >
            <Container maxWidth="xs" dir="rtl">
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff'
                    }}
                >
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                        English Arcade
                    </Typography>

                    <Typography variant="body1" color="#ddd" sx={{ mb: 4 }}>
                        لطفاً نقش خود را انتخاب کنید
                    </Typography>

                    <Button
                        fullWidth
                        onClick={() => navigate('/student-login')}
                        startIcon={<SchoolIcon />}
                        sx={{
                            mb: 2,
                            fontSize: '1rem',
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            color: '#fff',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.03)',
                                boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                                background: 'linear-gradient(to right, #4f46e5, #4338ca)'
                            }
                        }}
                    >
                        👩‍🎓 دانش‌آموز هستم
                    </Button>

                    <Button
                        fullWidth
                        onClick={() => navigate('/teacher-login')}
                        startIcon={<BadgeIcon />}
                        variant="outlined"
                        sx={{
                            fontSize: '1rem',
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            color: '#fff',
                            borderColor: '#aaa',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderColor: '#fff',
                                transform: 'scale(1.03)'
                            }
                        }}
                    >
                        👨‍🏫 معلم هستم
                    </Button>
                </Paper>
            </Container>
        </Box>
    )
}
