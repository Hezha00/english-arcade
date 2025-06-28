import React from 'react'
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'

export default function StudentAppWrapper({ children, profileColor = '#1976d2' }) {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('student')
        navigate('/student-login')
    }

    return (
        <Box>
            <AppBar position="static" sx={{ bgcolor: profileColor }} dir="rtl">
                <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Typography variant="h6" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                        🎮 English Arcade
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: { xs: 1, sm: 0 } }}>
                        <Button color="inherit" component={Link} to="/student-assignments">
                            تمرین‌ها
                        </Button>
                        <Button color="inherit" component={Link} to="/student-results">
                            نتایج
                        </Button>
                        <Button color="inherit" onClick={handleLogout}>
                            خروج
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box>{children}</Box>
        </Box>
    )
}
