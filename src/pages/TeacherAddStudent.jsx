import React, { useState, useEffect } from 'react'
import {
    TextField, Typography, Paper, Button, Box, Alert, CircularProgress,
    IconButton, InputAdornment, Snackbar, MenuItem, Select, InputLabel, FormControl
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import { supabase } from '../supabaseClient'

export default function TeacherAddStudent() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [school, setSchool] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [createdUser, setCreatedUser] = useState(null)
    const [copySuccess, setCopySuccess] = useState(false)
    const [teacherId, setTeacherId] = useState(null)
    const [classroom_id, setClassroomId] = useState('')
    const [classrooms, setClassrooms] = useState([])

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser()
            setTeacherId(data?.user?.id || null)
            if (data?.user?.id) {
                const { data: cls } = await supabase
                    .from('classrooms')
                    .select('id, name')
                    .eq('teacher_id', data.user.id)
                setClassrooms(cls || [])
            }
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

        if (!username || !firstName || !lastName || !teacherId || !school || !classroom_id) {
            setMessage('❌ لطفاً تمام فیلدها را وارد کنید.')
            setLoading(false)
            return
        }

        const { data: existingStudent } = await supabase
            .from('students')
            .select('id')
            .eq('username', username)
            .maybeSingle()
        if (existingStudent) {
            setMessage('❌ این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید.')
            setLoading(false)
            return
        }

        const finalPassword = password || (() => {
            generatePassword()
            return password
        })()

        const email = `${username}@arcade.dev`

        const { data: auth, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: finalPassword,
            email_confirm: true,
            user_metadata: { role: 'student' }
        })

        if (authError) {
            setMessage(`❌ خطا در ایجاد حساب: ${authError.message}`)
            setLoading(false)
            return
        }

        const authId = auth.user.id

        const { error: dbError } = await supabase.from('students').insert({
            id: authId,
            username,
            password: finalPassword,
            auth_id: authId,
            teacher_id: teacherId,
            school,
            classroom_id,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            login_streak: 0,
            last_login: null
        })

        if (dbError) {
            await supabase.auth.admin.deleteUser(authId)
            setMessage(`❌ خطا در ثبت اطلاعات دانش‌آموز: ${dbError.message}`)
            setLoading(false)
            return
        }

        setCreatedUser({ username, password: finalPassword })
        setUsername('')
        setPassword('')
        setFirstName('')
        setLastName('')
        setSchool('')
        setClassroomId('')
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
                    label="نام"
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    margin="normal"
                />

                <TextField
                    label="نام خانوادگی"
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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

                <FormControl fullWidth margin="normal">
                    <InputLabel>کلاس</InputLabel>
                    <Select
                        value={classroom_id}
                        onChange={(e) => setClassroomId(e.target.value)}
                        label="کلاس"
                    >
                        {classrooms.map((cls) => (
                            <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

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
