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

export default function StudentLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

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

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('username', username.trim())
            .eq('password', password.trim())
            .maybeSingle()

        if (error || !data) {
            setErrorMsg('❌ نام کاربری یا رمز عبور اشتباه است')
            setIsLoading(false)
            return
        }

        localStorage.setItem('student', JSON.stringify(data))
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
                color: '#fff'
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
                    color: '#fff'
                }}
            >
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
