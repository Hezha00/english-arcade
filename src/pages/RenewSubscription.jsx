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
        const teacher = await supabase.auth.getUser()
        const teacherId = teacher?.data?.user?.id

        if (!teacherId) {
            setStatus('خطا در شناسایی کاربر')
            return
        }

        const months = {
            '1_month': 1,
            '3_months': 3,
            '6_months': 6,
            '12_months': 12
        }

        const now = new Date()
        const end = new Date()
        end.setMonth(end.getMonth() + months[plan])

        const { error } = await supabase.from('subscriptions').insert([
            {
                teacher_id: teacherId,
                plan,
                start_date: now.toISOString(),
                end_date: end.toISOString(),
                is_active: true
            }
        ])

        if (error) {
            setStatus('پرداخت شبیه‌سازی شده موفق نبود')
        } else {
            setStatus('پرداخت موفق! انتقال به داشبورد...')
            setTimeout(() => navigate('/teacher-assignments'), 1500)
        }
    }

    return (
        <Container maxWidth="sm" dir="rtl" sx={{ mt: 6 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    تمدید اشتراک
                </Typography>

                <RadioGroup value={plan} onChange={(e) => setPlan(e.target.value)}>
                    <FormControlLabel value="1_month" control={<Radio />} label="1 ماه - ۵۰٬۰۰۰ تومان" />
                    <FormControlLabel value="3_months" control={<Radio />} label="3 ماه - ۱۳۵٬۰۰۰ تومان" />
                    <FormControlLabel value="6_months" control={<Radio />} label="6 ماه - ۲۴۵٬۰۰۰ تومان" />
                    <FormControlLabel value="12_months" control={<Radio />} label="1 سال - ۴۵۰٬۰۰۰ تومان" />
                </RadioGroup>

                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" fullWidth onClick={handleFakePayment}>
                        پرداخت شبیه‌سازی شده (Zarinpal در آینده)
                    </Button>
                </Box>

                {status && (
                    <Alert sx={{ mt: 2 }} severity="info">{status}</Alert>
                )}
            </Paper>
        </Container>
    )
}

