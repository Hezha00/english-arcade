import React, { useEffect, useState } from 'react'
import {
    Box, Paper, Typography, Alert, TextField, Button, Snackbar
} from '@mui/material'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'

const plans = [
    { label: '۱ ماه', price: 150000, duration: '1 month' },
    { label: '۳ ماه', price: 350000, duration: '3 months' },
    { label: '۶ ماه', price: 600000, duration: '6 months' },
    { label: '۲ سال', price: 1500000, duration: '24 months' }
]

export default function TeacherSubscription() {
    const [teacher, setTeacher] = useState(null)
    const [expired, setExpired] = useState(false)
    const [key, setKey] = useState('')
    const [snack, setSnack] = useState('')
    const [checking, setChecking] = useState(false)

    useEffect(() => {
        const fetchTeacher = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id
            const email = auth?.user?.email || ''
            const isSuperAdmin = email === 'superadminkhaledi@arcade.dev'

            let { data: teacherRecord } = await supabase
                .from('teachers')
                .select('*')
                .eq('auth_id', uid)
                .single()

            // Create teacher row if not found
            if (!teacherRecord) {
                const { data: inserted } = await supabase
                    .from('teachers')
                    .insert({
                        auth_id: uid,
                        username: email.split('@')[0],
                        role: 'teacher',
                        subscription_expires: null,
                        license_code: null
                    })
                    .select()
                    .single()

                teacherRecord = inserted
            }

            setTeacher(teacherRecord)

            if (!isSuperAdmin &&
                (!teacherRecord?.subscription_expires ||
                    dayjs(teacherRecord.subscription_expires).isBefore(dayjs()))
            ) {
                setExpired(true)
            }
        }

        fetchTeacher()
    }, [])

    const handleBuy = (duration) => {
        const link = `https://yourpayment.com/pay?plan=${encodeURIComponent(duration)}`
        window.open(link, '_blank')
    }

    const handleActivateKey = async () => {
        setChecking(true)

        const { data: license, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('code', key)
            .eq('is_used', false)
            .single()

        if (error || !license) {
            setSnack('کد لایسنس معتبر نیست ❌')
            setChecking(false)
            return
        }

        const alreadyUsedByAnother = license.teacher_id && license.teacher_id !== teacher.auth_id
        if (alreadyUsedByAnother) {
            setSnack('این لایسنس قبلاً برای کاربر دیگری استفاده شده است ❌')
            setChecking(false)
            return
        }

        let expireDate = dayjs()
        if (license.duration === '1 month') expireDate = expireDate.add(1, 'month')
        if (license.duration === '3 months') expireDate = expireDate.add(3, 'month')
        if (license.duration === '6 months') expireDate = expireDate.add(6, 'month')
        if (license.duration === '24 months') expireDate = expireDate.add(24, 'month')

        await supabase.from('teachers')
            .update({ subscription_expires: expireDate.toISOString(), license_code: license.code })
            .eq('auth_id', teacher.auth_id)

        await supabase.from('licenses')
            .update({ is_used: true, teacher_id: teacher.auth_id, redeemed_at: new Date() })
            .eq('id', license.id)

        setSnack('✅ اشتراک فعال شد')
        setChecking(false)
        setExpired(false)
    }

    if (!expired) {
        return (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Typography variant="h5" fontWeight="bold">✅ اشتراک شما فعال است</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    انقضا: {teacher?.subscription_expires?.slice(0, 10).replace(/-/g, '/')}
                </Typography>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
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
                    p: 4, borderRadius: 3,
                    maxWidth: 500, width: '100%',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(6px)'
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ❗ اشتراک شما منقضی شده است ❗
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    برای ادامه استفاده از امکانات معلم، لطفاً اشتراک خود را تمدید کنید.
                </Alert>

                <Typography>
                    اگر فکر می‌کنید اشتراک شما به اشتباه منقضی شده است، لطفاً با من تماس بگیرید:
                    <br />
                    ☎️ <strong>هیزا خالدی — ۰۹۰۱۸۷۰۰۶۰۳</strong>
                </Typography>

                <Typography sx={{ mt: 3, mb: 1 }} fontWeight="bold">
                    💳 گزینه‌های تمدید:
                </Typography>

                {plans.map(p => (
                    <Button
                        key={p.duration}
                        fullWidth
                        sx={{ my: 0.5 }}
                        onClick={() => handleBuy(p.duration)}
                        variant="outlined"
                    >
                        {p.label} — {p.price.toLocaleString('fa-IR')} تومان
                    </Button>
                ))}

                <Typography sx={{ mt: 4 }}>🎟 اگر لایسنس خریدید:</Typography>
                <TextField
                    fullWidth
                    label="کد لایسنس"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    margin="normal"
                />
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleActivateKey}
                    disabled={checking}
                    sx={{ py: 1.2 }}
                >
                    فعال‌سازی اشتراک
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
