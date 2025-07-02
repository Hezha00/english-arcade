import React, { useEffect, useState } from 'react'
import {
    Box, Paper, Typography, Alert, TextField,
    Button, Snackbar, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import jalali from 'dayjs/plugin/calendar'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)
dayjs.calendar('jalali')

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
    const [licenseStatus, setLicenseStatus] = useState('idle') // 'idle', 'checking', 'valid', 'invalid'

    const navigate = useNavigate()

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

            if (
                !isSuperAdmin &&
                (!teacherRecord?.subscription_expires ||
                    dayjs(teacherRecord.subscription_expires).isBefore(dayjs()))
            ) {
                setExpired(true)
            }
        }

        fetchTeacher()
    }, [])

    const durationToMonths = (text) => {
        if (!text) return 1
        if (text.includes('24')) return 24
        if (text.includes('6')) return 6
        if (text.includes('3')) return 3
        return 1
    }

    const handleBuy = (duration) => {
        const link = `https://yourpayment.com/pay?plan=${encodeURIComponent(duration)}`
        window.open(link, '_blank')
    }

    const validateLicense = async (code) => {
        if (!code || code.trim().length < 4) {
            setLicenseStatus('idle')
            return
        }

        setLicenseStatus('checking')

        const { data: license, error } = await supabase
            .from('licenses')
            .select('id')
            .eq('code', code.trim().toUpperCase())
            .eq('is_used', false)
            .maybeSingle()

        if (!error && license) {
            setLicenseStatus('valid')
        } else {
            setLicenseStatus('invalid')
        }
    }

    const handleActivateKey = async () => {
        setChecking(true)

        const { data: license, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('code', key.trim().toUpperCase())
            .eq('is_used', false)
            .maybeSingle()

        if (error || !license) {
            setSnack('کد لایسنس معتبر نیست ❌')
            setChecking(false)
            return
        }

        const months = durationToMonths(license.duration)

        const { error: rpcError } = await supabase.rpc('set_teacher_subscription', {
            input_teacher_id: teacher.auth_id,
            duration_months: months,
            license_code_input: license.code,
            license_id: license.id
        })

        if (rpcError) {
            console.error('RPC error:', rpcError.message)
            setSnack('خطا در فعال‌سازی لایسنس ❌')
            setChecking(false)
            return
        }

        const { data: updated } = await supabase
            .from('teachers')
            .select('*')
            .eq('auth_id', teacher.auth_id)
            .single()

        setTeacher(updated)
        setSnack('✅ اشتراک فعال شد')
        setChecking(false)
        setExpired(false)
    }

    const getLicenseFeedback = () => {
        switch (licenseStatus) {
            case 'valid':
                return '✅ لایسنس معتبر است'
            case 'invalid':
                return '❌ لایسنس نامعتبر است یا قبلاً استفاده شده'
            case 'checking':
                return 'در حال بررسی...'
            default:
                return ''
        }
    }

    if (!expired) {
        return (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography variant="h5" fontWeight="bold">✅ اشتراک شما فعال است</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    انقضا:
                    {' '}
                    {teacher?.subscription_expires
                        ? dayjs(teacher.subscription_expires).calendar('jalali').format('YYYY/MM/DD')
                        : '—'}
                </Typography>
                <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/teacher-assignments')}
                >
                    بازگشت به داشبورد
                </Button>
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
                    p: 4,
                    borderRadius: 3,
                    maxWidth: 500,
                    width: '100%',
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
                    onChange={(e) => {
                        const val = e.target.value
                        setKey(val)
                        validateLicense(val)
                    }}
                    helperText={getLicenseFeedback()}
                    FormHelperTextProps={{
                        sx: {
                            color: licenseStatus === 'valid'
                                ? 'green'
                                : licenseStatus === 'invalid'
                                    ? 'red'
                                    : 'inherit'
                        }
                    }}
                    margin="normal"
                />

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleActivateKey}
                    disabled={checking || licenseStatus !== 'valid'}
                    sx={{ py: 1.2 }}
                >
                    {checking ? <CircularProgress size={24} color="inherit" /> : 'فعال‌سازی اشتراک'}
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
