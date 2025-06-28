import React, { useState } from 'react'
import {
    TextField, Typography, Paper, Button, Box,
    Alert, CircularProgress
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function StudentLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async () => {
        setIsLoading(true)
        setMessage('')
        const email = `${username}@arcade.dev`

        // 1️⃣ Authenticate using Supabase Auth (hidden email format)
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (loginError) {
            setMessage('نام کاربری یا رمز عبور اشتباه است.')
            setIsLoading(false)
            return
        }

        // 2️⃣ Get current Auth user info
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setMessage('ورود انجام نشد.')
            setIsLoading(false)
            return
        }

        // 3️⃣ Fetch linked student row using auth.uid()
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('auth_id', user.id)
            .single()

        if (studentError || !student) {
            setMessage('اطلاعات کاربر یافت نشد.')
            setIsLoading(false)
            return
        }

        // 4️⃣ Update login streak
        const last = student.last_login ? new Date(student.last_login) : null
        const today = new Date()
        const isNewDay = !last || today.toDateString() !== last.toDateString()
        let streak = student.login_streak || 0
        if (isNewDay) {
            const diff = last ? (today - last) / (1000 * 60 * 60 * 24) : 2
            streak = diff <= 1.5 ? streak + 1 : 1
        }

        const now = new Date()
        await supabase
            .from('students')
            .update({ login_streak: streak, last_login: now })
            .eq('id', student.id)

        const updated = { ...student, login_streak: streak, last_login: now.toISOString() }
        localStorage.setItem('student', JSON.stringify(updated))
        navigate('/student-assignments')
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
                    👩‍🎓 ورود دانش‌آموز
                </Typography>

                <TextField
                    fullWidth
                    label="نام کاربری"
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                />

                <TextField
                    fullWidth
                    label="رمز عبور"
                    type="password"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}

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
            </Paper>
        </Box>
    )
}
