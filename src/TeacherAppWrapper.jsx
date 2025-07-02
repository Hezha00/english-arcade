import React from 'react'
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function TeacherAppWrapper({ children }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/teacher-login')
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'transparent' // let index.css gradient background show
            }}
        >
            <AppBar position="static" sx={{ bgcolor: '#0d47a1' }} dir="rtl">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6">🎯 داشبورد معلم</Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button color="inherit" component={Link} to="/teacher-assignments">
                            تمرین‌ها
                        </Button>
                        <Button color="inherit" component={Link} to="/create-assignment">
                            + تمرین جدید
                        </Button>
                        <Button color="inherit" component={Link} to="/teacher-results-admin">
                            نمرات
                        </Button>
                        <Button color="inherit" component={Link} to="/teacher-analytics">
                            آمار
                        </Button>
                        <Button color="inherit" onClick={handleLogout}>
                            خروج
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box sx={{ flex: 1, p: 2 }}>{children}</Box>
        </Box>
    )
}
