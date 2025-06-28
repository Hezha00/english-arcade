import React, { useState } from 'react'
import {
    Box, Paper, Typography, TextField, Button, Alert, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'

export default function TeacherSignup() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSignup = async () => {
        setLoading(true)
        setError('')
        setSent(false)

        const { error } = await supabase.auth.signUp({
            email,
            options: {
                emailRedirectTo: 'http://localhost:5173/teacher-subscription'
            }
        })

        if (error) {
            setError('خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.')
        } else {
            setSent(true)
        }

        setLoading(false)
    }

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover'
            }}
        >
            <Paper
                dir="rtl"
                sx={{
                    p: 4, borderRadius: 4,
                    maxWidth: 400, width: '100%',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(6px)'
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    ✉️ ثبت‌نام معلم
                </Typography>

                <Typography fontSize={14} color="text.secondary" mb={2}>
                    لطفاً ایمیل خود را وارد کنید. یک لینک تأیید برای شما ارسال خواهد شد.
                </Typography>

                <TextField
                    fullWidth
                    label="ایمیل"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                />

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {sent && <Alert severity="success" sx={{ mb: 2 }}>ایمیل ارسال شد ✅ لطفاً صندوق ایمیل خود را بررسی کنید.</Alert>}

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSignup}
                    disabled={loading}
                    sx={{ fontWeight: 'bold', py: 1.4 }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'ارسال لینک تأیید'}
                </Button>
            </Paper>
        </Box>
    )
}
