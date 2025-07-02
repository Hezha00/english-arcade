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

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setErrorMsg('')

        const { data: auth, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error || !auth?.user) {
            console.error('❌ Login error:', error?.message)
            setErrorMsg('ورود ناموفق. لطفاً اطلاعات را بررسی کنید.')
            setIsLoading(false)
            return
        }

        const uid = auth.user.id

        const { data: teacher, error: dbErr } = await supabase
            .from('teachers')
            .select('*')
            .eq('auth_id', uid)
            .single()

        if (dbErr?.code === 'PGRST116') {
            const insert = await supabase.from('teachers').insert([
                {
                    auth_id: uid,
                    email: auth.user.email,
                    username: 'placeholder',
                    role: 'teacher',
                    created_at: new Date().toISOString()
                }
            ])

            if (insert.error) {
                console.error('❌ Insert failed:', insert.error.message)
                setErrorMsg('خطا در ایجاد حساب معلم. لطفاً دوباره تلاش کنید.')
                setIsLoading(false)
                return
            }
        }

        const isAdmin =
            (teacher?.role && teacher.role.toLowerCase() === 'admin') ||
            email.toLowerCase() === 'master@admin.com'

        navigate(isAdmin ? '/admin-dashboard' : '/dashboard')
        setIsLoading(false)
    }

    return (
        <Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                dir="rtl"
                sx={{
                    width: 400,
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'white',
                    boxShadow: 6
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    👨‍🏫 ورود معلم
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="ایمیل"
                        margin="normal"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <TextField
                        fullWidth
                        label="رمز عبور"
                        type="password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {errorMsg && <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isLoading}
                        sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ورود'}
                    </Button>
                </form>

                {/* 🔁 Add Signup Prompt */}
                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                    هنوز حساب ندارید؟{' '}
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
