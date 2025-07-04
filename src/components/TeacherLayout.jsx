import React from 'react'
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Typography,
    CssBaseline,
    Button
} from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'

const drawerWidth = 240

export default function TeacherLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation()

    const navItems = [
        { label: '🏠 داشبورد', path: '/teacher-dashboard' },
        { label: '📚 کلاس‌ها', path: '/classrooms' },
        { label: '🎮 فروشگاه بازی‌ها', path: '/game-repository' },
        { label: '🗂️ بازی‌های من', path: '/teacher-games' },
        { label: '📈 تحلیل‌ها', path: '/teacher-analytics' },
        { label: '⚙️ تنظیمات', path: '/account-settings' }
    ]

    const handleLogout = () => {
        localStorage.removeItem('teacher')
        navigate('/teacher-login')
    }

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                width: '100vw',
                background: 'none', // Let index.css handle it
                color: '#fff',
                position: 'relative'
            }}
            dir="rtl"
        >
            <CssBaseline />

            {/* 🧭 Sidebar */}
            <Drawer
                variant="permanent"
                anchor="right"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        px: 2,
                        py: 4,
                        borderLeft: '1px solid #444',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }
                }}
            >
                {/* Top section */}
                <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        👨‍🏫 پنل معلم
                    </Typography>
                    <List>
                        {navItems.map((item, i) => (
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

                {/* Bottom section */}
                <Box>
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
            </Drawer>

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
