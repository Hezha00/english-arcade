import React, { useState } from 'react'
import {
    Container, Paper, Typography, RadioGroup, FormControlLabel,
    Radio, Button, Box, Alert
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function RenewSubscription() {
    const [plan, setPlan] = useState('1_month')
    const [status, setStatus] = useState('')
    const navigate = useNavigate()

    const handleFakePayment = async () => {
        setStatus('⏳ در حال ثبت تمدید اشتراک...')

        const { data: auth, error: authError } = await supabase.auth.getUser()
        const teacherId = auth?.user?.id

        if (!teacherId || authError) {
            setStatus('⚠️ خطا در شناسایی حساب کاربری')
            return
        }

        const planToMonths = {
            '1_month': 1,
            '3_months': 3,
            '6_months': 6,
            '12_months': 12
        }

        const months = planToMonths[plan] || 1

        const { error: rpcError } = await supabase.rpc('set_teacher_subscription', {
            input_teacher_id: teacherId,
            duration_months: months,
            license_code_input: `PLAN_${plan}` // Just for logging; no license_id needed
            // license_id is now optional and omitted 🎉
        })

        if (rpcError) {
            console.error('❌ RPC Error:', rpcError.message)
            setStatus('❌ تمدید اشتراک ناموفق بود: ' + rpcError.message)
        } else {
            setStatus('✅ تمدید انجام شد! انتقال به داشبورد...')
            setTimeout(() => navigate('/teacher-assignments'), 1500)
        }
    }

    return (
        <Container maxWidth="sm" dir="rtl" sx={{ mt: 6 }}>
            <Paper
                sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(6px)'
                }}
            >
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    تمدید اشتراک
                </Typography>

                <RadioGroup value={plan} onChange={(e) => setPlan(e.target.value)} sx={{ mt: 2 }}>
                    <FormControlLabel value="1_month" control={<Radio />} label="۱ ماه - ۵۰٬۰۰۰ تومان" />
                    <FormControlLabel value="3_months" control={<Radio />} label="۳ ماه - ۱۳۵٬۰۰۰ تومان" />
                    <FormControlLabel value="6_months" control={<Radio />} label="۶ ماه - ۲۴۵٬۰۰۰ تومان" />
                    <FormControlLabel value="12_months" control={<Radio />} label="۱ سال - ۴۵۰٬۰۰۰ تومان" />
                </RadioGroup>

                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" fullWidth onClick={handleFakePayment}>
                        پرداخت شبیه‌سازی شده (Zarinpal در آینده)
                    </Button>

                    <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/teacher-subscription')}
                    >
                        🎟 من لایسنس دارم — فعال‌سازی با کد
                    </Button>
                </Box>

                {status && (
                    <Alert sx={{ mt: 2 }} severity="info">
                        {status}
                    </Alert>
                )}
            </Paper>
        </Container>
    )
}
