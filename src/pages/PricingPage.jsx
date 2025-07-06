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

export default function PricingPage() {
    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [contactDialogOpen, setContactDialogOpen] = useState(false)

    const plans = [
        {
            id: 1,
            name: 'طرح یک ساله',
            originalPrice: '1,500,000',
            discountedPrice: '990,000',
            duration: '1 سال',
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
            features: [
                'همه امکانات طرح‌های قبلی',
                '35% تخفیف اضافی',
                'پشتیبانی VIP',
                'امکانات انحصاری'
            ]
        }
    ]

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan)
        setContactDialogOpen(true)
    }

    const handleContactMethod = (method) => {
        if (method === 'telegram') {
            window.open('https://t.me/your_telegram_username', '_blank')
        } else if (method === 'phone') {
            window.open('tel:+989123456789')
        }
        setContactDialogOpen(false)
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
            <Box dir="rtl" sx={{ maxWidth: 1200, width: '100%' }}>
                <Typography 
                    variant="h3" 
                    fontWeight="bold" 
                    textAlign="center" 
                    sx={{ mb: 1 }}
                >
                    🎯 طرح‌های اشتراک
                </Typography>
                
                <Typography 
                    variant="h6" 
                    textAlign="center" 
                    sx={{ mb: 4, color: '#ddd' }}
                >
                    بهترین قیمت‌ها با تخفیف ویژه! ⚡
                </Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
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
                                    label="تخفیف ویژه"
                                    sx={{
                                        mb: 2,
                                        bgcolor: '#ff6b6b',
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

                                <Box sx={{ mb: 3 }}>
                                    {plan.features.map((feature, index) => (
                                        <Typography
                                            key={index}
                                            variant="body2"
                                            sx={{
                                                mb: 1,
                                                color: '#ddd',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            ✅ {feature}
                                        </Typography>
                                    ))}
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handlePlanSelect(plan)}
                                    sx={{
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                                        color: '#fff',
                                        borderRadius: 2,
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                            background: 'linear-gradient(to right, #4f46e5, #4338ca)'
                                        }
                                    }}
                                >
                                    خرید کنید
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                <Box sx={{ textAlign: 'center' }}>
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
            </Box>

            {/* Contact Method Dialog */}
            <Dialog
                open={contactDialogOpen}
                onClose={() => setContactDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    انتخاب روش تماس
                    <IconButton
                        onClick={() => setContactDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                        برای خرید {selectedPlan?.name}، لطفاً یکی از روش‌های زیر را انتخاب کنید:
                    </Typography>
                    
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            اطلاعات تماس:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            📱 تلفن: 09123456789
                        </Typography>
                        <Typography variant="body2">
                            📧 تلگرام: @your_telegram_username
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<TelegramIcon />}
                            onClick={() => handleContactMethod('telegram')}
                            sx={{
                                py: 2,
                                px: 4,
                                background: '#0088cc',
                                '&:hover': { background: '#006699' }
                            }}
                        >
                            تلگرام
                        </Button>
                        
                        <Button
                            variant="contained"
                            startIcon={<PhoneIcon />}
                            onClick={() => handleContactMethod('phone')}
                            sx={{
                                py: 2,
                                px: 4,
                                background: '#4caf50',
                                '&:hover': { background: '#388e3c' }
                            }}
                        >
                            تماس تلفنی
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    )
} 