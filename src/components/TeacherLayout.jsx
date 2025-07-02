import React, { useState } from 'react'
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
    Divider,
    IconButton,
    Tooltip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const drawerWidth = 240

export default function TeacherLayout({ children }) {
    const navigate = useNavigate()
    const [drawerOpen, setDrawerOpen] = useState(true)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/teacher-login')
    }

    const menuItems = [
        { label: '🏠 داشبورد', path: '/dashboard' },
        { label: '🏫 کلاس‌ها', path: '/classrooms' },
        { label: '🎮 بازی‌ها', path: '/teacher-games' },
        { label: '📘 تکالیف', path: '/teacher-assignments-list' },
        { label: '⚙️ تنظیمات حساب', path: '/account-settings' },
        { label: '🚪 خروج', action: handleLogout }
    ]

    return (
        <Box sx={{ display: 'flex', direction: 'rtl' }}>
            <CssBaseline />

            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap>
                        🎯 داشبورد معلم
                    </Typography>

                    <Tooltip title={drawerOpen ? 'بستن منو' : 'نمایش منو'}>
                        <IconButton
                            color="inherit"
                            edge="end"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                        >
                            {drawerOpen ? <ChevronRightIcon /> : <MenuIcon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="persistent"
                anchor="right"
                open={drawerOpen}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        transition: '0.3s ease-in-out'
                    }
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item, index) => (
                            <ListItem
                                key={index}
                                button // ✅ shorthand for button={true}, safely supported by MUI
                                onClick={() =>
                                    item.action ? item.action() : navigate(item.path)
                                }
                            >
                                <ListItemText
                                    primary={item.label}
                                    sx={{ textAlign: 'right' }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Divider />
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
}
