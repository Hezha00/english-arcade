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
    const navigate = useNavigate()

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id

            const { data: teacher } = await supabase
                .from('teachers')
                .select('role')
                .eq('auth_id', uid)
                .single()

            if (teacher?.role !== 'admin') {
                navigate('/not-authorized')
            }
        }

        checkAdmin()
    }, [navigate])

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let output = ''
        for (let i = 0; i < 8; i++) {
            output += chars[Math.floor(Math.random() * chars.length)]
        }
        setCode(output)
    }

    const handleCreate = async () => {
        if (!code || !duration) return

        const { error } = await supabase.from('licenses').insert({
            code,
            duration,
            is_used: false
        })

        if (error) {
            setSnack('❌ خطا در ایجاد لایسنس')
        } else {
            setSnack('✅ لایسنس با موفقیت ثبت شد')
            setCode('')
        }
    }

    return (
        <Box
            sx={{
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
                    p: 4, borderRadius: 3, maxWidth: 480, width: '100%',
                    bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)'
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
                >
                    ثبت لایسنس
                </Button>

                <Snackbar
                    open={!!snack}
                    autoHideDuration={2500}
                    onClose={() => setSnack('')}
                    message={snack}
                />
            </Paper>
        </Box>
    )
}
