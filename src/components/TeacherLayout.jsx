import React from 'react'
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    List,
    ListItem,
    ListItemText,
    CssBaseline,
    Divider
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const drawerWidth = 240

export default function TeacherLayout({ children }) {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/teacher-login')
    }

    const menuItems = [
        { label: 'کلاس‌ها', path: '/dashboard' },
        { label: 'دانش‌آموزان', path: '/dashboard/students' },
        { label: 'بازی‌ها', path: '/dashboard/games' },
        { label: 'تکالیف', path: '/dashboard/assignments' },
        { label: 'خروج', action: handleLogout }
    ]

    return (
        <Box sx={{ display: 'flex', direction: 'rtl' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        داشبورد معلم
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                anchor="right"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item, index) => (
                            <ListItem
                                button
                                key={index}
                                onClick={() => item.action ? item.action() : navigate(item.path)}
                            >
                                <ListItemText primary={item.label} sx={{ textAlign: 'right' }} />
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
}
