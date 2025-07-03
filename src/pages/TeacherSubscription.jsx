import React, { useEffect, useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    Alert,
    TextField,
    Button,
    Snackbar,
    CircularProgress
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
    const [licenseStatus, setLicenseStatus] = useState('idle') // idle, checking, valid, invalid
    const [checking, setChecking] = useState(false)
    const [snack, setSnack] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        async function loadTeacher() {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id
            const email = auth?.user?.email || ''
            const isSuperAdmin = email === 'superadminkhaledi@arcade.dev'

            let { data: record } = await supabase
                .from('teachers')
                .select('*')
                .eq('auth_id', uid)
                .single()

            if (!record) {
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
                record = inserted
            }

            setTeacher(record)

            if (
                !isSuperAdmin &&
                (!record.subscription_expires ||
                    dayjs(record.subscription_expires).isBefore(dayjs()))
            ) {
                setExpired(true)
            }
        }

        loadTeacher()
    }, [])

    const durationToMonths = txt => {
        if (txt.includes('24')) return 24
        if (txt.includes('6')) return 6
        if (txt.includes('3')) return 3
        return 1
    }

    const handleBuy = () => {
        // Instruct teacher to contact you for purchase
        window.open('https://t.me/Hezha_kh00', '_blank')
    }

    const validateLicense = async code => {
        const trimmed = code.trim().toUpperCase()
        if (!trimmed || trimmed.length < 4) {
            setLicenseStatus('idle')
            return
        }
        setLicenseStatus('checking')
        const { data: lic, error } = await supabase
            .from('licenses')
            .select('id')
            .eq('code', trimmed)
            .eq('is_used', false)
            .maybeSingle()

        setLicenseStatus(!error && lic ? 'valid' : 'invalid')
    }

    const handleActivateKey = async () => {
        setChecking(true)
        const code = key.trim().toUpperCase()
        const { data: lic, error: fetchErr } = await supabase
            .from('licenses')
            .select('*')
            .eq('code', code)
            .eq('is_used', false)
            .maybeSingle()

        if (fetchErr || !lic) {
            setSnack('❌ کد لایسنس معتبر نیست یا قبلا استفاده شده')
            setChecking(false)
            return
        }

        const months = durationToMonths(lic.duration)
        const payload = {
            input_teacher_id: teacher.auth_id,
            duration_months: months,
            license_code_input: lic.code,
            license_id: lic.id
        }

        const { error: rpcErr } = await supabase.rpc(
            'set_teacher_subscription',
            payload
        )

        if (rpcErr) {
            console.error('RPC error full:', rpcErr)
            setSnack(`❌ خطا در فعال‌سازی: ${rpcErr.message}`)
        } else {
            // Refresh teacher record
            const { data: updated } = await supabase
                .from('teachers')
                .select('*')
                .eq('auth_id', teacher.auth_id)
                .single()
            setTeacher(updated)
            setExpired(false)
            setSnack('✅ اشتراک با موفقیت فعال شد')
        }

        setChecking(false)
    }

    const licenseFeedback = () => {
        switch (licenseStatus) {
            case 'checking':
                return 'در حال بررسی...'
            case 'valid':
                return '✅ کد معتبر است'
            case 'invalid':
                return '❌ کد نامعتبر است'
            default:
                return ''
        }
    }

    // If subscription still valid, show dashboard link
    if (!expired) {
        return (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography variant="h5" fontWeight="bold">
                    ✅ اشتراک شما فعال است
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    انقضا:{' '}
                    {teacher?.subscription_expires
                        ? dayjs(teacher.subscription_expires)
                            .calendar('jalali')
                            .format('YYYY/MM/DD')
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

    // Expired flow: contact admin + input code + purchase prompt
    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                    backdropFilter: 'blur(6px)',
                    textAlign: 'center'
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    اشتراک شما منقضی شده است
                </Typography>

                <Alert severity="error" sx={{ mb: 2 }}>
                    اگر لایسنس دارید و این یک اشتباه است، لطفاً با مدیر سایت تماس بگیرید.
                </Alert>

                <Typography sx={{ mb: 1 }}>
                    <strong>☎️ تماس:</strong> ۰۹۰۱۸۷۰۰۶۰۳ (خالدی)
                </Typography>
                <Typography sx={{ mb: 3 }}>
                    <strong>💬 تلگرام:</strong>{' '}
                    <a
                        href="https://t.me/Hezha_kh00"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        @Hezha_kh00
                    </a>
                </Typography>

                <Typography sx={{ mb: 2 }}>
                    اگر لایسنس ندارید، می‌توانید با مدیر هماهنگ و یک کد جدید دریافت کنید.
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ my: 2 }}>
                    وارد کردن کد لایسنس
                </Typography>

                <TextField
                    fullWidth
                    label="کد لایسنس"
                    value={key}
                    onChange={e => {
                        setKey(e.target.value)
                        validateLicense(e.target.value)
                    }}
                    helperText={licenseFeedback()}
                    FormHelperTextProps={{
                        sx: {
                            color:
                                licenseStatus === 'valid'
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
                    sx={{ py: 1.5, mt: 1 }}
                >
                    {checking ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'فعال‌سازی اشتراک'
                    )}
                </Button>

                <Typography sx={{ mt: 3, fontWeight: 'bold' }}>
                    💳 خرید اشتراک
                </Typography>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleBuy}
                    sx={{ mt: 1 }}
                >
                    تماس برای خرید لایسنس
                </Button>

                <Button
                    variant="text"
                    sx={{ mt: 3 }}
                    onClick={() => navigate('/')}
                >
                    بازگشت به صفحه اصلی
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
