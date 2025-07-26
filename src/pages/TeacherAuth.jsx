import React, { useState } from 'react'
import {
    TextField,
    Typography,
    Paper,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TeacherAuth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setErrorMsg('')

        const { data: auth, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error || !auth?.user) {
            console.error('❌ Login error:', error?.message)
            setErrorMsg('ورود ناموفق. لطفاً اطلاعات را بررسی کنید.')
            setIsLoading(false)
            return
        }

        const uid = auth.user.id

        // Always upsert into teachers table with auth_id = uid
        await supabase.from('teachers').upsert({ auth_id: uid }, { onConflict: ['auth_id'] })

        // Attempt to fetch existing teacher profile
        const { data: existingTeacher, error: fetchErr } = await supabase
            .from('teachers')
            .select('*')
            .eq('auth_id', uid)
            .single()

        let teacherProfile = existingTeacher;

        // If teacher profile doesn't exist (PGRST116: 0 rows), create it
        if (fetchErr?.code === 'PGRST116') {
            const { data: newTeacherData, error: insertError } = await supabase
                .from('teachers')
                .insert([
                    {
                        auth_id: uid,
                        email: auth.user.email,
                        username: 'placeholder', // Default username
                        role: 'teacher',         // Default role
                        created_at: new Date().toISOString()
                    }
                ])
                .select() // Select the newly inserted row
                .single(); // Expect a single row back

            if (insertError || !newTeacherData) {
                console.error('❌ Insert failed:', insertError?.message);
                setErrorMsg('خطا در ایجاد حساب معلم. لطفاً دوباره تلاش کنید.');
                setIsLoading(false);
                return;
            }
            teacherProfile = newTeacherData; // Use the newly created profile
        } else if (fetchErr) {
            // Handle other errors during the initial fetch
            console.error('❌ DB error fetching teacher:', fetchErr.message);
            setErrorMsg('خطا در بازیابی اطلاعات معلم.');
            setIsLoading(false);
            return;
        }

        // Ensure teacherProfile is not null before accessing properties
        if (!teacherProfile) {
            console.error('❌ Teacher profile is null after fetch/insert attempt.');
            setErrorMsg('خطا در پردازش اطلاعات حساب معلم.');
            setIsLoading(false);
            return;
        }

        const isAdmin =
            (teacherProfile.role && teacherProfile.role.toLowerCase() === 'admin') ||
            email.toLowerCase() === 'master@admin.com'

        navigate(isAdmin ? '/admin-dashboard' : '/teacher-dashboard')
        setIsLoading(false)
    }

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none', // Gradient handled globally
                color: '#fff',
                flexDirection: 'column',
            }}
        >
            <Paper
                dir="rtl"
                elevation={0}
                sx={{
                    width: 400,
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    position: 'relative',
                }}
            >
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
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    👨‍🏫 ورود معلم
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="ایمیل"
                        margin="normal"
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />

                    <TextField
                        fullWidth
                        label="رمز عبور"
                        type="password"
                        margin="normal"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />

                    {errorMsg && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {errorMsg}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            color: '#fff',
                            '&:hover': {
                                transform: 'scale(1.03)',
                                background: 'linear-gradient(to right, #4f46e5, #4338ca)'
                            }
                        }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ورود'}
                    </Button>
                </form>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: '#ccc' }}>
                    هنوز حساب ندارید؟{' '}
                    <span
                        onClick={() => navigate('/pricing')}
                        style={{
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        مشاهده طرح‌ها
                    </span>
                </Typography>
            </Paper>
        </Box>
    )
}
