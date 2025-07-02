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
                px: 2
            }}
        >
            <Container maxWidth="xs" dir="rtl">
                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(6px)'
                    }}
                >
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                        English Arcade
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
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
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#e0e7ff',
                                borderColor: '#6366f1',
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
