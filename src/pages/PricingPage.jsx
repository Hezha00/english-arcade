import React, { useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import TelegramIcon from '@mui/icons-material/Telegram'
import PhoneIcon from '@mui/icons-material/Phone'
import CloseIcon from '@mui/icons-material/Close'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Snackbar from '@mui/material/Snackbar'

export default function PricingPage() {
    const navigate = useNavigate()
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarMsg, setSnackbarMsg] = useState('')

    const plans = [
        {
            id: 1,
            name: 'طرح یک ساله',
            originalPrice: '1,500,000',
            discountedPrice: '990,000',
            duration: '1 سال',
            offer: 'تخفیف ویژه',
            features: [
                'دسترسی کامل به تمام امکانات',
                'پشتیبانی 24/7',
                'به‌روزرسانی‌های رایگان',
                'گزارش‌گیری پیشرفته'
            ]
        },
        {
            id: 2,
            name: 'طرح دو ساله',
            originalPrice: '3,500,000',
            discountedPrice: '1,990,000',
            duration: '2 سال',
            offer: 'تخفیف ویژه',
            features: [
                'همه امکانات طرح یک ساله',
                '20% تخفیف اضافی',
                'اولویت در پشتیبانی',
                'امکانات ویژه'
            ]
        },
        {
            id: 3,
            name: 'طرح سه ساله',
            originalPrice: '4,500,000',
            discountedPrice: '2,990,000',
            duration: '3 سال',
            offer: 'تخفیف ویژه',
            features: [
                'همه امکانات طرح‌های قبلی',
                '35% تخفیف اضافی',
                'پشتیبانی VIP',
                'امکانات انحصاری'
            ]
        }
    ]

    const handleBuy = (plan) => {
        const text = `درخواست خرید اشتراک:\nنوع پلن: ${plan.name}\nمدت: ${plan.duration}\nقیمت: ${plan.discountedPrice} تومان\nلطفا این پیام را به پشتیبانی ارسال کنید.`
        navigator.clipboard.writeText(text)
        setSnackbarMsg('اطلاعات پلن کپی شد! لطفا این پیام را به پشتیبانی (تلگرام یا تلفن) ارسال کنید.')
        setSnackbarOpen(true)
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 4,
                background: 'none',
                color: '#fff'
            }}
        >
            <Box dir="rtl" sx={{ maxWidth: 900, width: '100%' }}>
                <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ mb: 1 }}>
                    🎯 طرح‌های اشتراک
                </Typography>
                <Typography variant="body1" textAlign="center" sx={{ mb: 4, color: '#ddd' }}>
                    با خرید هر یک از طرح‌های زیر، به امکانات کامل سایت و پشتیبانی ویژه دسترسی خواهید داشت. برای خرید، کافیست روی دکمه خرید کلیک کنید تا اطلاعات پلن کپی شود و سپس آن را به پشتیبانی ارسال نمایید.
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                        gap: 3,
                        mb: 4
                    }}
                >
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                    borderColor: 'rgba(255,255,255,0.4)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Chip
                                    icon={<LocalOfferIcon />}
                                    label={plan.offer}
                                    sx={{
                                        mb: 2,
                                        bgcolor: '#4ade80',
                                        color: '#fff',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                                    {plan.name}
                                </Typography>
                                <Typography variant="body2" color="#ccc" sx={{ mb: 2 }}>
                                    مدت زمان: {plan.duration}
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            textDecoration: 'line-through',
                                            color: '#999',
                                            mb: 1
                                        }}
                                    >
                                        {plan.originalPrice} تومان
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        sx={{
                                            color: '#4ade80',
                                            textShadow: '0 0 10px rgba(74,222,128,0.5)'
                                        }}
                                    >
                                        {plan.discountedPrice} تومان
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    {plan.features.map((feature, idx) => (
                                        <Typography key={idx} variant="body2" sx={{ color: '#ddd', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            ✅ {feature}
                                        </Typography>
                                    ))}
                                </Box>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(to right, #4ade80, #22d3ee)',
                                        color: '#fff',
                                        borderRadius: 2,
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            background: 'linear-gradient(to right, #22d3ee, #06b6d4)'
                                        }
                                    }}
                                    onClick={() => handleBuy(plan)}
                                    endIcon={<ContentCopyIcon />}
                                >
                                    خرید این اشتراک 
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.10)', textAlign: 'center', color: '#fff', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        برای خرید اشتراک و دریافت راهنمایی، با ما تماس بگیرید:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Button startIcon={<PhoneIcon />} href="tel:+989018700603" sx={{ color: '#333', fontWeight: 'bold' }}>
                            09018700603
                        </Button>
                        <Button startIcon={<TelegramIcon />} href="https://t.me/Hezha_kh00" target="_blank" sx={{ color: '#0088cc', fontWeight: 'bold' }}>
                            تلگرام
                        </Button>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#888', textAlign: 'center', mb: 2 }}>
                        با خرید اشتراک، به همه امکانات سایت و پشتیبانی ویژه دسترسی خواهید داشت!
                    </Typography>
                </Paper>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/teacher-login')}
                        sx={{
                            color: '#fff',
                            borderColor: '#aaa',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderColor: '#fff'
                            }
                        }}
                    >
                        بازگشت به ورود
                    </Button>
                </Box>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMsg}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                />
            </Box>
        </Box>
    )
} 