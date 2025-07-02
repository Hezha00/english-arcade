import React from 'react'
import {
    Drawer, Box, List, ListItem, ListItemText,
    Toolbar, Typography, Divider, Avatar
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import HistoryIcon from '@mui/icons-material/History'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AssignmentIcon from '@mui/icons-material/Assignment'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useNavigate } from 'react-router-dom'

const drawerWidth = 240

export default function StudentNavbar({ student }) {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('student')
        navigate('/student-login')
    }

    const menuItems = [
        { label: '🏠 داشبورد', icon: <DashboardIcon />, path: '/student-dashboard' },
        { label: '📜 تاریخچه', icon: <HistoryIcon />, path: '/student-results' },
        { label: '🧩 تمرین‌ها', icon: <AssignmentIcon />, path: '/student-assignments' },
        { label: '🎮 بازی‌ها', icon: <SportsEsportsIcon />, path: '/student-games' }
    ]

    return (
        <Drawer
            variant="permanent"
            anchor="right"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box'
                }
            }}
        >
            <Toolbar />
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Avatar
                    sx={{
                        bgcolor: student?.profile_color || '#888',
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 1,
                        fontWeight: 'bold'
                    }}
                >
                    {student?.username?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Typography variant="h6">{student?.username || 'دانش‌آموز'}</Typography>
                <Typography variant="body2" color="text.secondary">
                    کلاس {student?.classroom || '—'}
                </Typography>
            </Box>
            <Divider />
            <List dir="rtl">
                {menuItems.map((item, index) => (
                    <ListItem button key={index} onClick={() => navigate(item.path)}>
                        {item.icon}
                        <ListItemText primary={item.label} sx={{ textAlign: 'right', mr: 2 }} />
                    </ListItem>
                ))}
                <ListItem button onClick={handleLogout}>
                    <LogoutIcon color="error" />
                    <ListItemText primary="🚪 خروج" sx={{ textAlign: 'right', mr: 2 }} />
                </ListItem>
            </List>
        </Drawer>
    )
}
