import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function SelfLearnerSignup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  // Step 1: Gmail and password
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.endsWith('@gmail.com')) {
      setError('ایمیل باید با @gmail.com تمام شود.');
      return;
    }
    setLoading(true);
    // Check if email is taken
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: emailPassword,
      options: { emailRedirectTo: null }
    });
    if (signUpError) {
      setError('این ایمیل قبلا ثبت شده یا معتبر نیست.');
      setLoading(false);
      return;
    }
    // Get user id
    const user = data.user;
    if (!user) {
      setError('خطا در ثبت نام.');
      setLoading(false);
      return;
    }
    setStep(2);
    setLoading(false);
    // Save user id for next step
    window._selfLearnerSignupUid = user.id;
  };

  // Step 2: Profile info
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !userPassword || !firstName || !lastName || !city || !phone) {
      setError('همه فیلدها الزامی هستند.');
      return;
    }
    if (!/^[0-9]{11}$/.test(phone) || !phone.startsWith('09')) {
      setError('شماره تلفن باید ۱۱ رقم و با 09 شروع شود.');
      return;
    }
    if (!/^[a-zA-Z]+$/.test(firstName) || !/^[a-zA-Z]+$/.test(lastName) || !/^[a-zA-Z ]+$/.test(city)) {
      setError('نام، نام خانوادگی و شهر باید فقط با حروف انگلیسی وارد شوند.');
      return;
    }
    setLoading(true);
    // Check if username is taken
    const { data: exists } = await supabase
      .from('self_learners')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    if (exists) {
      setError('این نام کاربری قبلا ثبت شده است.');
      setLoading(false);
      return;
    }
    // Insert into self_learners
    const uid = window._selfLearnerSignupUid;
    console.log({
      id: uid,
      username,
      password: userPassword,
      first_name: firstName,
      last_name: lastName,
      city,
      phone
    });
    const { error: insertError } = await supabase
      .from('self_learners')
      .insert({
        id: uid,
        username,
        password: userPassword,
        first_name: firstName,
        last_name: lastName,
        city,
        phone
      });
    if (insertError) {
      setError('خطا در ثبت اطلاعات: ' + insertError.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    alert('ثبت نام با موفقیت انجام شد! اکنون می‌توانید وارد شوید.');
    navigate('/self-learner-login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, background: 'none', color: '#fff', flexDirection: 'column' }}>
      <Paper elevation={0} dir="rtl" sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', textAlign: 'center', color: '#fff', position: 'relative' }}>
        {/* Back button in top left of Paper */}
        <Button
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            minWidth: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'rgba(99,102,241,0.18)',
            color: '#fff',
            boxShadow: 2,
            backdropFilter: 'blur(4px)',
            zIndex: 2,
            '&:hover': {
              bgcolor: 'rgba(99,102,241,0.32)',
            },
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          ثبت‌نام دانش‌آموز مستقل
        </Typography>
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <TextField
              fullWidth
              label="ایمیل (فقط Gmail)"
              margin="normal"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            <TextField
              fullWidth
              label="رمز عبور ایمیل"
              type="password"
              margin="normal"
              autoComplete="new-password"
              value={emailPassword}
              onChange={e => setEmailPassword(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.5, fontWeight: 600, fontSize: '1rem', background: 'linear-gradient(to right, #4ade80, #22d3ee)', color: '#fff', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.03)', boxShadow: '0 8px 20px rgba(34,211,238,0.25)', background: 'linear-gradient(to right, #22d3ee, #06b6d4)' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ادامه'}
            </Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleProfileSubmit}>
            <TextField
              fullWidth
              label="نام کاربری (انگلیسی)"
              margin="normal"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            <TextField
              fullWidth
              label="رمز عبور ورود به سایت"
              type="password"
              margin="normal"
              value={userPassword}
              onChange={e => setUserPassword(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            <TextField
              fullWidth
              label="نام (انگلیسی)"
              margin="normal"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            <TextField
              fullWidth
              label="نام خانوادگی (انگلیسی)"
              margin="normal"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            <TextField
              fullWidth
              label="شهر (انگلیسی)"
              margin="normal"
              value={city}
              onChange={e => setCity(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            <TextField
              fullWidth
              label="شماره تلفن (مثال: 09123456789)"
              margin="normal"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
            />
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.5, fontWeight: 600, fontSize: '1rem', background: 'linear-gradient(to right, #4ade80, #22d3ee)', color: '#fff', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.03)', boxShadow: '0 8px 20px rgba(34,211,238,0.25)', background: 'linear-gradient(to right, #22d3ee, #06b6d4)' } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'ثبت نهایی'}
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
} 