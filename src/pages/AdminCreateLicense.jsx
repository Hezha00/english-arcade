import React, { useState, useEffect } from 'react'
import {
    Box, Paper, Typography, TextField, Button, Snackbar, MenuItem
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const plans = [
    { label: '۱ ماه', value: '1 month' },
    { label: '۳ ماه', value: '3 months' },
    { label: '۶ ماه', value: '6 months' },
    { label: '۲ سال', value: '24 months' }
]

export default function AdminCreateLicense() {
    const [duration, setDuration] = useState('1 month')
    const [code, setCode] = useState('')
    const [snack, setSnack] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // 🔐 Check admin role on load
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id

            const { data: teacher, error } = await supabase
                .from('teachers')
                .select('role')
                .eq('auth_id', uid)
                .single()

            if (error || teacher?.role !== 'admin') {
                navigate('/not-authorized')
            }
        }

        checkAdmin()
    }, [navigate])

    // 🧪 Generate random license code
    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let output = ''
        for (let i = 0; i < 8; i++) {
            output += chars[Math.floor(Math.random() * chars.length)]
        }
        setCode(output)
    }

    // ✅ Insert new license
    const handleCreate = async () => {
        if (!code || !duration) {
            setSnack('لطفاً کد و مدت زمان را وارد کنید')
            return
        }

        setLoading(true)

        const { error } = await supabase.from('licenses').insert([
            {
                code,
                duration,
                is_used: false
            }
        ])

        setLoading(false)

        if (error) {
            console.error('❌ Supabase insert error:', error.message)
            setSnack('❌ خطا در ایجاد لایسنس: ' + error.message)
        } else {
            setSnack('✅ لایسنس با موفقیت ثبت شد')
            setCode('')
        }
    }

    return (
        <Box
            sx={{
                height: '100vh',
                background: 'linear-gradient(to bottom right, #0f2027, #203a43, #2c5364)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2
            }}
        >
            <Paper
                dir="rtl"
                sx={{
                    p: 4,
                    borderRadius: 3,
                    maxWidth: 480,
                    width: '100%',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(6px)'
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    🔑 ایجاد لایسنس جدید
                </Typography>

                <TextField
                    select
                    fullWidth
                    label="مدت زمان اشتراک"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    sx={{ my: 2 }}
                >
                    {plans.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                            {p.label}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    fullWidth
                    label="کد لایسنس"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    sx={{ mb: 2 }}
                />

                <Button
                    fullWidth
                    variant="outlined"
                    onClick={generateCode}
                    sx={{ mb: 2 }}
                >
                    🔁 تولید کد تصادفی
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    {loading ? 'در حال ثبت...' : 'ثبت لایسنس'}
                </Button>

                <Snackbar
                    open={!!snack}
                    autoHideDuration={3000}
                    onClose={() => setSnack('')}
                    message={snack}
                />
            </Paper>
        </Box>
    )
}
