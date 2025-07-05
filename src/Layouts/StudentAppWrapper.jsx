import React, { useEffect, useState } from 'react'
import {
    Box, Typography, List, ListItem, ListItemText, Divider, Button, IconButton
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { useNavigate, useLocation } from 'react-router-dom'

export default function StudentAppWrapper({ student, children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [open, setOpen] = useState(true)

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
                background: 'none',
                color: '#fff',
                position: 'relative'
            }}
            dir="rtl"
        >
            <Box
                sx={{
                    width: open ? 220 : 64,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRight: '1px solid #444',
                    py: 4,
                    px: open ? 2 : 1,
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                        {open && (
                            <Typography variant="h6" fontWeight="bold">
                                🎓 پنل دانش‌آموز
                            </Typography>
                        )}
                        <IconButton onClick={() => setOpen(!open)} sx={{ color: '#fff' }}>
                            {open ? <MenuOpenIcon /> : <MenuIcon />}
                        </IconButton>
                    </Box>

                    {student?.name && open && (
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
                                    },
                                    justifyContent: open ? 'flex-start' : 'center'
                                }}
                            >
                                {open ? (
                                    <ListItemText primary={item.label} />
                                ) : (
                                    <Typography variant="body2">
                                        {item.label.slice(0, 2)}
                                    </Typography>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Box>

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
                            },
                            display: open ? 'inline-flex' : 'none'
                        }}
                    >
                        خروج
                    </Button>
                </Box>
            </Box>

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
