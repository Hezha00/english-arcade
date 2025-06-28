import React, { useState } from 'react'
import {
    Box, Paper, Typography, TextField, Button, Alert, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'

export default function TeacherSignup() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)

    const handleSignup = async () => {
        setLoading(true)
        setError('')
        setSent(false)

        if (!email || !firstName || !lastName) {
            setError('لطفاً تمام فیلدها را پر کنید.')
            setLoading(false)
            return
        }

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
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2
            }}
        >
            <Paper
                dir="rtl"
                sx={{
                    p: 4, maxWidth: 420, width: '100%',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    borderRadius: 4, backdropFilter: 'blur(8px)',
                    boxShadow: 6
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    ✍️ ثبت‌نام معلم
                </Typography>

                <Typography fontSize={14} mb={2}>
                    لطفاً اطلاعات خود را وارد کنید.
                </Typography>

                <TextField
                    fullWidth
                    label="نام"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="نام خانوادگی"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="ایمیل"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                />

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {sent && <Alert severity="success" sx={{ mb: 2 }}>ایمیل تأیید ارسال شد ✅ لطفاً صندوق ایمیل خود را بررسی کنید.</Alert>}

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSignup}
                    disabled={loading}
                    sx={{ py: 1.3, fontWeight: 'bold' }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'ارسال لینک تأیید'}
                </Button>
            </Paper>
        </Box>
    )
}
