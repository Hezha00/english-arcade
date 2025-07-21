import React, { useState, useEffect } from 'react'
import {
    TextField,
    Typography,
    Paper,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function StudentLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const [pricingOpen, setPricingOpen] = useState(false);

    useEffect(() => {
        document.body.className = 'login'
        return () => {
            document.body.className = ''
        }
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setErrorMsg('')

        const email = `${username.trim()}@arcade.dev`
        // 1. Try to sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: password.trim()
        })
        if (authError || !authData?.user) {
            setErrorMsg('❌ نام کاربری یا رمز عبور اشتباه است')
            setIsLoading(false)
            return
        }
        // 2. Fetch student row by auth_id
        const { data: student, error: dbError } = await supabase
            .from('students')
            .select('*')
            .eq('auth_id', authData.user.id)
            .maybeSingle()
        if (dbError || !student) {
            setErrorMsg('❌ حساب کاربری پیدا نشد')
            setIsLoading(false)
            return
        }
        // 3. Ensure students table has a row with id = authData.user.id
        const { data: idRow, error: idRowError } = await supabase
            .from('students')
            .select('id')
            .eq('id', authData.user.id)
            .maybeSingle();
        if (!idRow) {
            // Use upsert to guarantee the row exists or is updated
            await supabase.from('students').upsert({
                id: authData.user.id,
                username: student.username,
                auth_id: authData.user.id,
                teacher_id: student.teacher_id,
                school: student.school,
                classroom_id: student.classroom_id,
                login_streak: student.login_streak,
                last_login: student.last_login
            }, { onConflict: ['id'] });
        }
        localStorage.setItem('student', JSON.stringify(student))
        navigate('/student-dashboard')
        setIsLoading(false)
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none', // Background handled globally
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
                    🎓 ورود دانش‌آموز
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
                            background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            color: '#fff',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.03)',
                                boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                                background: 'linear-gradient(to right, #4f46e5, #4338ca)'
                            }
                        }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ورود'}
                    </Button>
                </form>

                <Typography variant="body2" sx={{ mt: 3, color: '#ccc' }}>
                    اگر نام کاربری یا رمز عبور ندارید، از معلم خود دریافت کنید ✋
                </Typography>
            </Paper>
        </Box>
    )
}
