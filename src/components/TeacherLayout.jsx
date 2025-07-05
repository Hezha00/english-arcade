import React, { useState } from 'react'
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Typography,
    CssBaseline,
    Button,
    IconButton
} from '@mui/material'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate, useLocation } from 'react-router-dom'

const drawerWidth = 240

export default function TeacherLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [open, setOpen] = useState(true)

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
                color: '#fff',
                position: 'relative'
            }}
            dir="rtl"
        >
            <CssBaseline />

            <Drawer
                variant="permanent"
                anchor="right"
                open={open}
                sx={{
                    width: open ? drawerWidth : 64,
                    flexShrink: 0,
                    transition: 'width 0.3s ease',
                    [`& .MuiDrawer-paper`]: {
                        width: open ? drawerWidth : 64,
                        boxSizing: 'border-box',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        px: open ? 2 : 1,
                        py: 4,
                        borderLeft: '1px solid #444',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'width 0.3s ease'
                    }
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        {open && (
                            <Typography variant="h6" fontWeight="bold">
                                👨‍🏫 پنل معلم
                            </Typography>
                        )}
                        <IconButton onClick={() => setOpen(!open)} sx={{ color: '#fff' }}>
                            {open ? <MenuOpenIcon /> : <MenuIcon />}
                        </IconButton>
                    </Box>
                    <List>
                        {navItems.map((item, i) => (
                            <ListItem
                                key={i}
                                button
                                onClick={() => navigate(item.path)}
                                sx={{
                                    mb: 1,
                                    borderRadius: 2,
                                    backgroundColor: location.pathname === item.path ? '#6366f1' : 'transparent',
                                    color: location.pathname === item.path ? '#fff' : '#ddd',
                                    '&:hover': {
                                        backgroundColor: '#4f46e5',
                                        color: '#fff'
                                    },
                                    justifyContent: open ? 'flex-start' : 'center'
                                }}
                            >
                                <ListItemText
                                    primary={item.label}
                                    sx={{
                                        display: open ? 'block' : 'none',
                                        textAlign: 'right'
                                    }}
                                />
                                {!open && <Typography variant="body2">{item.label.slice(0, 2)}</Typography>}
                            </ListItem>
                        ))}
                    </List>
                </Box>

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
                            },
                            display: open ? 'inline-flex' : 'none'
                        }}
                    >
                        خروج
                    </Button>
                </Box>
            </Drawer>

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
