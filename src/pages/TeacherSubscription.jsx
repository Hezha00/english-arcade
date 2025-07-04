// TeacherSubscription.jsx
import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Paper, TextField, Button, Alert, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function TeacherSubscription() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchEmail = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setEmail(user?.email || '')
        }

        fetchEmail()
    }, [])

    const handleSubscribe = async () => {
        setLoading(true)
        setStatus('')

        const { data: { user } } = await supabase.auth.getUser()
        const teacherId = user?.id

        const { error } = await supabase
            .from('subscriptions')
            .upsert({ teacher_id: teacherId, email })

        if (error) {
            setStatus('❌ خطا در ثبت اشتراک')
        } else {
            setStatus('✅ اشتراک ثبت شد')
        }

        setLoading(false)
    }

    return (
        <TeacherLayout>
            <Box dir="rtl" sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    📬 اشتراک ایمیلی
                </Typography>

                <Paper sx={{ p: 3, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="ایمیل"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {status && (
                        <Alert severity={status.includes('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
                            {status}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleSubscribe}
                        disabled={loading || !email}
                    >
                        {loading ? <CircularProgress size={24} /> : 'ثبت اشتراک'}
                    </Button>
                </Paper>
            </Box>
        </TeacherLayout>
    )
}
