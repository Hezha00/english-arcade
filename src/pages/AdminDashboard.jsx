import React from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    return (
        <Box
            sx={{
                height: '100vh',
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2
            }}
        >
            <Box
                sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(6px)',
                    textAlign: 'center'
                }}
                dir="rtl"
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🎛️ داشبورد ادمین
                </Typography>

                <Stack spacing={2} sx={{ mt: 3 }}>
                    <Button variant="outlined" onClick={() => navigate('/admin-create-license')}>
                        🧾 ساخت لایسنس جدید
                    </Button>

                    <Button variant="outlined" onClick={() => navigate('/admin-license-list')}>
                        📋 لیست لایسنس‌ها
                    </Button>

                    <Button variant="contained" color="error" onClick={handleLogout}>
                        خروج از حساب
                    </Button>
                </Stack>
            </Box>
        </Box>
    )
}
