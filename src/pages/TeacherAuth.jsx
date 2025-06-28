import React, { useState } from 'react'
import {
    TextField, Typography, Paper, Button, Box,
    Alert, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function TeacherAuth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async () => {
        setIsLoading(true)
        setErrorMsg('')

        const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error || !auth?.user) {
            setErrorMsg('ورود ناموفق. لطفاً اطلاعات را بررسی کنید.')
            setIsLoading(false)
            return
        }

        const uid = auth.user.id
        const { data: teacher, error: dbError } = await supabase
            .from('teachers')
            .select('*')
            .eq('auth_id', uid)
            .single()

        if (dbError || !teacher) {
            setErrorMsg('اطلاعات معلم یافت نشد.')
            setIsLoading(false)
            return
        }

        const isAdmin =
            (teacher.role && teacher.role.toLowerCase() === 'admin') ||
            email.toLowerCase() === 'master@admin.com'

        navigate(isAdmin ? '/admin-dashboard' : '/teacher-assignments')
        setIsLoading(false)
    }

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <Paper
                dir="rtl"
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 6
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    👨‍🏫 ورود معلم
                </Typography>

                <TextField
                    fullWidth
                    label="ایمیل"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="رمز عبور"
                    type="password"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                    disabled={isLoading}
                    sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ورود'}
                </Button>

                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                    حساب ندارید؟{' '}
                    <span
                        onClick={() => navigate('/teacher-signup')}
                        style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ثبت‌نام کنید
                    </span>
                </Typography>
            </Paper>
        </Box>
    )
}
