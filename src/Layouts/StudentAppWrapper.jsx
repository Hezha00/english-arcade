import React, { useEffect } from 'react'
import {
    Box, Typography, List, ListItem, ListItemText, Divider, Button
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'

export default function StudentAppWrapper({ student, children }) {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!student) {
            const saved = localStorage.getItem('student')
            if (!saved) {
                navigate('/student-login')
            }
        }
    }, [student, navigate])

    const menuItems = [
        { label: '🏠 داشبورد', path: '/student-dashboard' },
        { label: '📝 تمرین‌ها', path: '/student-assignments' },
        { label: '🎮 بازی‌ها', path: '/student-games' },
        { label: '📊 نتایج', path: '/student-results' }
    ]

    const handleLogout = () => {
        localStorage.removeItem('student')
        navigate('/student-login')
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'row',
                background: 'none', // index.css handles full-page gradient
                color: '#fff',
                position: 'relative'
            }}
            dir="rtl"
        >
            {/* 🧭 Sidebar */}
            <Box
                sx={{
                    width: 220,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRight: '1px solid #444',
                    py: 4,
                    px: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        🎓 پنل دانش‌آموز
                    </Typography>
                    {student?.name && (
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            خوش آمدید، {student.name}
                        </Typography>
                    )}
                    <List>
                        {menuItems.map((item, i) => (
                            <ListItem
                                key={i}
                                button
                                onClick={() => navigate(item.path)}
                                sx={{
                                    mb: 1,
                                    borderRadius: 2,
                                    backgroundColor:
                                        location.pathname === item.path ? '#6366f1' : 'transparent',
                                    color: location.pathname === item.path ? '#fff' : '#ddd',
                                    '&:hover': {
                                        backgroundColor: '#4f46e5',
                                        color: '#fff'
                                    }
                                }}
                            >
                                <ListItemText primary={item.label} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* 🔓 Logout Button */}
                <Box>
                    <Divider sx={{ mb: 2, borderColor: '#555' }} />
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{
                            borderColor: '#f87171',
                            color: '#f87171',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: '#f87171',
                                color: '#fff',
                                borderColor: '#f87171'
                            }
                        }}
                    >
                        خروج
                    </Button>
                </Box>
            </Box>

            {/* 📦 Main Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    px: 3,
                    py: 4,
                    backdropFilter: 'blur(2px)'
                }}
            >
                {children}
            </Box>
        </Box>
    )
}
