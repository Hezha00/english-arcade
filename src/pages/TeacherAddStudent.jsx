import React, { useState, useEffect } from 'react'
import {
    TextField, Typography, Paper, Button, Box, Alert, CircularProgress,
    IconButton, InputAdornment, Snackbar
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import { supabase } from '../supabaseClient'

export default function TeacherAddStudent() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [school, setSchool] = useState('')
    const [classroom, setClassroom] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [createdUser, setCreatedUser] = useState(null)
    const [copySuccess, setCopySuccess] = useState(false)
    const [teacherId, setTeacherId] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser()
            setTeacherId(data?.user?.id || null)
        }
        fetchUser()
    }, [])

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789'
        let pass = ''
        for (let i = 0; i < 6; i++) {
            pass += chars[Math.floor(Math.random() * chars.length)]
        }
        setPassword(pass)
    }

    const handleSubmit = async () => {
        setLoading(true)
        setMessage('')
        setCreatedUser(null)

        if (!username || !teacherId || !school || !classroom) {
            setMessage('لطفاً تمام فیلدها را وارد کنید.')
            setLoading(false)
            return
        }

        const finalPassword = password || (() => {
            generatePassword()
            return password
        })()

        const email = `${username}@arcade.dev`

        // Step 1: Create Auth user with role: student
        const { data: auth, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: finalPassword,
            email_confirm: true,
            user_metadata: { role: 'student' }
        })

        if (authError) {
            setMessage(`خطا در ایجاد حساب: ${authError.message}`)
            setLoading(false)
            return
        }

        const authId = auth.user.id

        // Step 2: Insert into students table
        const { error: dbError } = await supabase.from('students').insert({
            username,
            auth_id: authId,
            teacher_id: teacherId,
            school,
            classroom,
            login_streak: 0,
            last_login: null
        })

        if (dbError) {
            setMessage(`خطا در ثبت اطلاعات دانش‌آموز: ${dbError.message}`)
            setLoading(false)
            return
        }

        setCreatedUser({ username, password: finalPassword })
        setUsername('')
        setPassword('')
        setSchool('')
        setClassroom('')
        setLoading(false)
    }

    const handleCopy = () => {
        if (createdUser) {
            const loginInfo = `👤 ${createdUser.username}\n🔑 ${createdUser.password}`
            navigator.clipboard.writeText(loginInfo)
            setCopySuccess(true)
        }
    }

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}
        >
            <Paper
                dir="rtl"
                sx={{
                    p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(6px)', boxShadow: 6, maxWidth: 480, width: '100%'
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    👩‍🏫 افزودن دانش‌آموز جدید
                </Typography>

                <TextField
                    label="نام کاربری"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                    margin="normal"
                />

                <TextField
                    label="رمز عبور (اختیاری)"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={generatePassword}>
                                    <RefreshIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <TextField
                    label="مدرسه"
                    fullWidth
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    margin="normal"
                />

                <TextField
                    label="کلاس"
                    fullWidth
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    margin="normal"
                />

                {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{ mt: 3, py: 1.5 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'افزودن دانش‌آموز'}
                </Button>

                {createdUser && (
                    <Alert severity="success" sx={{ mt: 3, whiteSpace: 'pre-line' }}>
                        👤 {createdUser.username} <br />
                        🔑 {createdUser.password}
                        <IconButton onClick={handleCopy} sx={{ ml: 1 }} title="کپی">
                            <FileCopyIcon fontSize="small" />
                        </IconButton>
                    </Alert>
                )}

                <Snackbar
                    open={copySuccess}
                    autoHideDuration={2500}
                    onClose={() => setCopySuccess(false)}
                    message="کپی شد ✅"
                />
            </Paper>
        </Box>
    )
}
