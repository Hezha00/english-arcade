import React, { useEffect, useState } from 'react'
import {
    Typography, Container, Paper, Box, Grid, Button
} from '@mui/material'

import { useNavigate } from 'react-router-dom'
import StudentNavbar from '../components/StudentNavbar';
import { Drawer, List, ListItem, ListItemText, Toolbar, Avatar, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import { differenceInDays, parseISO } from 'date-fns';


export default function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [selectedBook, setSelectedBook] = useState('');
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState(null);
    useEffect(() => {
        const saved = localStorage.getItem('student');
        if (saved) {
            setStudent(JSON.parse(saved));
        } else {
            navigate('/student-login');
        }
        const sub = localStorage.getItem('self_learner_subscription');
        if (sub) {
            setSubscription(JSON.parse(sub));
        }
    }, [navigate]);

    const books = [
        { value: 'prospect1', label: 'Prospect 1' },
        { value: 'prospect2', label: 'Prospect 2' },
        { value: 'prospect3', label: 'Prospect 3' },
        { value: 'vision1', label: 'Vision 1' },
        { value: 'vision2', label: 'Vision 2' },
        { value: 'vision3', label: 'Vision 3' }
    ];

    if (!student) return null;

    // Check if this is an independent student (no classroom, school, or teacher)
    const isIndependent = !student.classroom && !student.school && !student.teacher_id;

    if (isIndependent) {
        // Calculate days left
        let daysLeft = null;
        let isExpired = false;
        let errorMsg = '';
        try {
            if (subscription) {
                const now = new Date();
                const start = new Date(subscription.start_date);
                const end = new Date(subscription.end_date);
                console.log('Dashboard subscription check:', { start, end, now, subscription });
                daysLeft = differenceInDays(end, now);
                isExpired = !(start <= now && end >= now);
            } else {
                isExpired = true;
                errorMsg = 'اشتراک پیدا نشد.';
                console.log('Dashboard: No subscription found in localStorage.');
            }
        } catch (err) {
            isExpired = true;
            errorMsg = 'یک خطای غیرمنتظره رخ داد.';
            console.error('Dashboard unexpected error:', err);
        }
        useEffect(() => {
            if (isExpired) {
                navigate('/self-learner-subscription');
            }
        }, [isExpired, navigate]);
        if (isExpired) return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                <Typography>{errorMsg || 'اشتراک شما منقضی شده یا معتبر نیست.'}</Typography>
            </Box>
        );
        // Sidebar menu for self-learner
        const menuItems = [
            { label: '🏠 داشبورد', icon: <DashboardIcon />, path: '/student-dashboard' },
            { label: '📜 نتایج', icon: <HistoryIcon />, path: '/student-results' },
            { label: '📖 یادگیری', icon: <SchoolIcon />, path: '/independent-learning' },
            { label: '📝 آزمون', icon: <QuizIcon />, path: '/independent-test' }
        ];
        const handleLogout = () => {
            localStorage.removeItem('student');
            localStorage.removeItem('self_learner_subscription');
            navigate('/self-learner-login');
        };
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', background: 'none', color: '#fff' }}>
                <Drawer
                    variant="permanent"
                    anchor="right"
                    sx={{
                        width: 220,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 220,
                            boxSizing: 'border-box',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            borderLeft: '1px solid #444',
                        }
                    }}
                >
                    <Toolbar />
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: '#6366f1', width: 64, height: 64, mx: 'auto', mb: 1, fontWeight: 'bold' }}>
                            {student?.username?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Typography variant="h6">{student?.username || 'دانش‌آموز مستقل'}</Typography>
                        {daysLeft !== null && (
                            <Typography variant="body2" color={daysLeft <= 7 ? 'error' : 'success'}>
                                {daysLeft >= 0
                                    ? `⌛ ${daysLeft} روز باقی‌مانده`
                                    : `⛔ اشتراک شما منقضی شده`}
                            </Typography>
                        )}
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
                <Box sx={{ flexGrow: 1, p: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        👋 سلام، {student.name || student.username} عزیز!
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                        شما به عنوان دانش‌آموز مستقل وارد شده‌اید. لطفاً کتاب مورد نظر خود را انتخاب کنید:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                        {books.map((book) => (
                            <Button
                                key={book.value}
                                variant={selectedBook === book.value ? 'contained' : 'outlined'}
                                sx={{ minWidth: 120, fontWeight: 'bold', color: '#fff', borderColor: '#fff', background: selectedBook === book.value ? 'linear-gradient(to right, #6366f1, #4f46e5)' : 'none' }}
                                onClick={() => setSelectedBook(book.value)}
                            >
                                {book.label}
                            </Button>
                        ))}
                    </Box>
                    {selectedBook && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                        📖 بخش یادگیری (فلش‌کارت)
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff' }}
                                        onClick={() => navigate(`/independent-learning/${selectedBook}`)}
                                    >
                                        شروع یادگیری
                                    </Button>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                        📝 بخش آزمون (تست)
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff' }}
                                        onClick={() => navigate(`/independent-test/${selectedBook}`)}
                                    >
                                        شروع آزمون
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <Container
            dir="rtl"
            sx={{
                mt: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '80vh',
                color: '#fff',
                px: { xs: 1, sm: 4, md: 8 },
                maxWidth: '1200px',
            }}
        >
            <Typography variant="h5" gutterBottom>
                👋 سلام، {student.name || student.username} عزیز!
            </Typography>

            <Typography sx={{ mb: 2 }}>🎓 مدرسه: {student.school}</Typography>
            <Typography sx={{ mb: 2 }}>📚 پایه: {student.year_level || 'ثبت نشده'}</Typography>
            <Typography sx={{ mb: 4 }}>🏫 کلاس: {student.classroom}</Typography>

            <Grid container spacing={5} sx={{ mt: 1, justifyContent: 'center', width: '100%' }}>
                <Grid sx={{ width: { xs: '100%', md: '33%' }, display: 'flex', justifyContent: 'center' }}>
                    <Paper
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.20)',
                            backdropFilter: 'blur(8px)',
                            color: '#222',
                            minWidth: 250,
                            maxWidth: 350,
                            boxShadow: 3,
                            textAlign: 'center',
                            mb: 2,
                            mx: 2,
                            my: 2,
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            🎯 امتیاز کل شما
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {student.total_score ?? 0} امتیاز
                        </Typography>
                    </Paper>
                </Grid>
                <Grid sx={{ width: { xs: '100%', md: '33%' }, display: 'flex', justifyContent: 'center' }}>
                    <Paper
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.20)',
                            backdropFilter: 'blur(8px)',
                            color: '#222',
                            minWidth: 250,
                            maxWidth: 350,
                            boxShadow: 3,
                            textAlign: 'center',
                            mb: 2,
                            mx: 2,
                            my: 2,
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            📊 آزمون‌ها و نتایج
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 1, color: '#4f46e5', borderColor: '#4f46e5' }}
                            onClick={() => navigate('/student-results')}
                        >
                            مشاهده نتایج من
                        </Button>
                    </Paper>
                </Grid>
                <Grid sx={{ width: { xs: '100%', md: '33%' }, display: 'flex', justifyContent: 'center' }}>
                    <Paper
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.20)',
                            backdropFilter: 'blur(8px)',
                            color: '#222',
                            minWidth: 250,
                            maxWidth: 350,
                            boxShadow: 3,
                            textAlign: 'center',
                            mb: 2,
                            mx: 2,
                            my: 2,
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                            🎮 بازی‌های آموزشی
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 1, color: '#4f46e5', borderColor: '#4f46e5' }}
                            onClick={() => navigate('/student-games')}
                        >
                            شروع بازی
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}
