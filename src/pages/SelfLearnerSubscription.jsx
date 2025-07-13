import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Card, CardContent, Chip, TextField } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    id: 1,
    name: 'بسته ی برنز',
    originalPrice: '۲۰۰,۰۰۰',
    discountedPrice: '۱۵۰,۰۰۰',
    duration: '۱ ماه',
    offer: 'تخفیف ویژه',
    features: [
      'دسترسی کامل به بخش یادگیری و آزمون',
      'پشتیبانی معمولی',
      'امکان مشاهده نتایج و پیشرفت'
    ]
  },
  {
    id: 2,
    name: 'بسته ی نقره ای',
    originalPrice: '۵۵۰,۰۰۰',
    discountedPrice: '۴۰۰,۰۰۰',
    duration: '۳ ماه',
    offer: 'تخفیف ویژه',
    features: [
      'همه امکانات بسته برنز',
      'پشتیبانی سریع‌تر',
      'دسترسی به آپدیت‌های ویژه'
    ]
  },
  {
    id: 3,
    name: 'بسته ی طلایی',
    originalPrice: '۱,۸۰۰,۰۰۰',
    discountedPrice: '۱,۳۰۰,۰۰۰',
    duration: '۹ ماه',
    offer: 'تخفیف ویژه',
    features: [
      'همه امکانات بسته‌های قبلی',
      'پشتیبانی VIP',
      'دسترسی زودتر به امکانات جدید',
      'اولویت در پاسخگویی'
    ]
  },
  {
    id: 4,
    name: 'بسته ی الماس',
    originalPrice: '۲,۴۰۰,۰۰۰',
    discountedPrice: '۱,۶۰۰,۰۰۰',
    duration: '۱۲ ماه',
    offer: 'تخفیف ویژه',
    features: [
      'همه امکانات بسته‌های قبلی',
      'پشتیبانی اختصاصی و ۲۴ ساعته',
      'دسترسی انحصاری به محتوا و امکانات آینده',
      'عضویت VIP و مشاوره رایگان'
    ]
  }
];

function handleBuy(plan) {
  const text = `درخواست خرید اشتراک:\nنوع پلن: ${plan.name}\nمدت: ${plan.duration}\nقیمت: ${plan.discountedPrice} تومان\nلطفا این پیام را به پشتیبانی ارسال کنید.`;
  navigator.clipboard.writeText(text);
  alert('اطلاعات پلن کپی شد! لطفا این پیام را به پشتیبانی (تلگرام یا تلفن) ارسال کنید.');
}

export default function SelfLearnerSubscription() {
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseMsg, setLicenseMsg] = useState('');
  const [user, setUser] = useState(null);
  const [hasSub, setHasSub] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('student'));
    setUser(u);
    if (u) {
      supabase
        .from('self_learner_subscriptions')
        .select('*')
        .eq('self_learner_id', u.id)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .maybeSingle()
        .then(({ data }) => setHasSub(!!data));
    }
  }, []);
  useEffect(() => {
    if (hasSub) {
      navigate('/student-dashboard');
    }
  }, [hasSub, navigate]);

  async function handleActivateLicense() {
    setLicenseMsg('');
    try {
      if (!licenseKey) return setLicenseMsg('لطفا کد لایسنس را وارد کنید.');
      // Check license validity
      const { data: lic } = await supabase
        .from('self_learner_licenses')
        .select('*')
        .eq('license_key', licenseKey)
        .eq('is_used', false)
        .maybeSingle();
      if (!lic) {
        setLicenseMsg('کد لایسنس معتبر نیست یا قبلا استفاده شده است.');
        return;
      }
      // Get plan info
      const { data: plan } = await supabase
        .from('self_learner_plans')
        .select('*')
        .eq('id', lic.plan_id)
        .maybeSingle();
      if (!plan) {
        setLicenseMsg('پلن مربوط به این لایسنس پیدا نشد.');
        return;
      }
      // Calculate end date
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + plan.duration_months);
      // Create subscription
      const { error: subErr } = await supabase
        .from('self_learner_subscriptions')
        .insert({
          self_learner_id: user.id,
          plan_id: plan.id,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          license_id: lic.id
        });
      if (subErr) {
        setLicenseMsg('خطا در فعال‌سازی اشتراک.');
        return;
      }
      // Mark license as used
      await supabase
        .from('self_learner_licenses')
        .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
        .eq('id', lic.id);
      setLicenseMsg('اشتراک شما با موفقیت فعال شد!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setLicenseMsg('یک خطای غیرمنتظره رخ داد. لطفا دوباره تلاش کنید.');
      console.error('Activation error:', err);
    }
  }

  if (!user) {
    return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Typography>لطفا ابتدا وارد شوید.</Typography></Box>;
  }
  if (hasSub) {
    return <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}><Typography>شما اشتراک فعال دارید و می‌توانید از امکانات سایت استفاده کنید.</Typography></Box>;
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
          🧑‍💻 اشتراک دانش آموز مستقل
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 4, color: '#ddd' }}>
          بسته‌های نقره‌ای، طلایی و الماس شامل پشتیبانی سریع‌تر، دسترسی به امکانات ویژه و حتی مشاوره اختصاصی هستند. با انتخاب بسته‌های بالاتر، تجربه‌ای VIP و کامل‌تر خواهید داشت!
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
                >
                  خرید این اشتراک
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.10)', textAlign: 'center', color: '#fff', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            برای خرید اشتراک و دریافت نام کاربری و رمز عبور، با ما تماس بگیرید:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
            <Button startIcon={<PhoneIcon />} href="tel:+989123456789" sx={{ color: '#333', fontWeight: 'bold' }}>
              ۰۹۱۲۳۴۵۶۷۸۹
            </Button>
            <Button startIcon={<TelegramIcon />} href="https://t.me/Hezha_kh00" target="_blank" sx={{ color: '#0088cc', fontWeight: 'bold' }}>
              telegram
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: '#888', textAlign: 'center', mb: 2 }}>
            یادگیرنده مستقل هستید؟ با خرید اشتراک، بدون نیاز به معلم یا کلاس، به همه امکانات یادگیری و آزمون دسترسی خواهید داشت!
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <TextField
              label="کد لایسنس"
              value={licenseKey}
              onChange={e => setLicenseKey(e.target.value)}
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' }, mb: 1, width: 250 }}
            />
            <Button variant="contained" onClick={handleActivateLicense} sx={{ background: 'linear-gradient(to right, #4ade80, #22d3ee)', color: '#fff', fontWeight: 'bold' }}>
              فعال‌سازی اشتراک با لایسنس
            </Button>
            {licenseMsg && <Typography sx={{ color: licenseMsg.includes('موفق') ? '#4ade80' : '#f87171', mt: 1 }}>{licenseMsg}</Typography>}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
} 