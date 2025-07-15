import React, { useState, useEffect } from 'react';
import {
    TextField,
    Typography,
    Paper,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function SelfLearnerLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.body.className = 'login';
        return () => {
            document.body.className = '';
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        try {
            // Find user by username/password
            const { data: user, error: userError } = await supabase
                .from('self_learners')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .maybeSingle();
            console.log('Login user fetch:', { user, userError });
            if (userError || !user) {
                setErrorMsg('❌ نام کاربری یا رمز عبور اشتباه است');
                setIsLoading(false);
                return;
            }
            // Check for most recent subscription
            const { data: subs, error: subError } = await supabase
                .from('self_learner_subscriptions')
                .select('*')
                .eq('self_learner_id', user.id)
                .order('end_date', { ascending: false })
                .limit(1);
            const nowDate = new Date();
            let activeSub = null;
            console.log('Login subscription fetch:', { subs, subError });
            if (subs && subs.length > 0) {
                const sub = subs[0];
                const start = new Date(sub.start_date);
                const end = new Date(sub.end_date);
                console.log('Login subscription check:', { start, end, nowDate, sub });
                if (start <= nowDate && end >= nowDate) {
                    activeSub = sub;
                }
            }
            localStorage.setItem('student', JSON.stringify(user));
            if (activeSub) {
                localStorage.setItem('self_learner_subscription', JSON.stringify(activeSub));
                console.log('Login: Active subscription found, navigating to dashboard.');
                navigate('/student-dashboard');
            } else {
                localStorage.removeItem('self_learner_subscription');
                console.log('Login: No active subscription, navigating to subscription page.');
                navigate('/self-learner-subscription');
            }
        } catch (err) {
            setErrorMsg('یک خطای غیرمنتظره رخ داد. لطفا دوباره تلاش کنید.');
            console.error('Login unexpected error:', err);
        }
        setIsLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                color: '#fff',
                flexDirection: 'column',
            }}
        >
            <Paper
                elevation={0}
                dir="rtl"
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    textAlign: 'center',
                    color: '#fff',
                    position: 'relative',
                }}
            >
                {/* Back button in top left of Paper */}
                <Button
                    onClick={() => navigate(-1)}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        minWidth: 0,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(99,102,241,0.18)',
                        color: '#fff',
                        boxShadow: 2,
                        backdropFilter: 'blur(4px)',
                        zIndex: 2,
                        '&:hover': {
                            bgcolor: 'rgba(99,102,241,0.32)',
                        },
                    }}
                >
                    <ArrowBackIcon />
                </Button>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    🧑‍💻 ورود دانش آموز مستقل
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="نام کاربری"
                        margin="normal"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />

                    <TextField
                        fullWidth
                        label="رمز عبور"
                        type="password"
                        margin="normal"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />

                    {errorMsg && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {errorMsg}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            fontWeight: 600,
                            fontSize: '1rem',
                            background: 'linear-gradient(to right, #4ade80, #22d3ee)',
                            color: '#fff',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.03)',
                                boxShadow: '0 8px 20px rgba(34,211,238,0.25)',
                                background: 'linear-gradient(to right, #22d3ee, #06b6d4)'
                            }
                        }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ورود'}
                    </Button>
                </form>

                <Typography variant="body2" sx={{ mt: 3, color: '#ccc' }}>
                    اگر حساب کاربری ندارید، <Button variant="text" sx={{ color: '#4ade80', fontWeight: 'bold' }} onClick={() => navigate('/self-learner-subscription')}>خرید اشتراک</Button> را بزنید.
                </Typography>
            </Paper>
        </Box>
    );
} 