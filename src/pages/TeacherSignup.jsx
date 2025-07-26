import React, { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'

export default function TeacherSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const [emailValid, setEmailValid] = useState(false)
  const [emailTaken, setEmailTaken] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  useEffect(() => {
    if (!email) {
      setEmailValid(false)
      setEmailTaken(false)
      return
    }

    const timeout = setTimeout(async () => {
      const normalized = email.trim().toLowerCase()
      const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(normalized)
      setEmailValid(isGmail)

      if (!isGmail) {
        setEmailTaken(false)
        return
      }

      setCheckingEmail(true)
      const { data, error } = await supabase.rpc('is_email_taken', {
        email_input: normalized
      })

      if (error) {
        console.error('❌ Error checking email:', error.message)
      }

      setEmailTaken(!!data)
      setCheckingEmail(false)
    }, 500)

    return () => clearTimeout(timeout)
  }, [email])

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    setSent(false)

    const normalizedEmail = email.trim().toLowerCase()

    const { data, error: signErr } = await supabase.auth.signUp({
      email: normalizedEmail,
      password
    })

    if (signErr) {
      console.error('❌ Signup failed:', signErr.message)
      setError('ثبت‌نام انجام نشد. لطفاً اطلاعات وارد شده را بررسی کنید.')
      setLoading(false)
      return
    }

    // Upsert into teachers table with auth_id = user.id
    const user = data?.user
    if (user?.id) {
      await supabase.from('teachers').upsert({ auth_id: user.id }, { onConflict: ['auth_id'] })
    }

    setSent(true)
    setLoading(false)
  }

  const buttonDisabled =
    !email || !password || loading || !emailValid || emailTaken

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper dir="rtl" sx={{ p: 4, width: 400, borderRadius: 4, boxShadow: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ✍️ ثبت‌نام معلم
        </Typography>

        <TextField
          fullWidth
          label="ایمیل (فقط Gmail)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!email && (!emailValid || emailTaken)}
          helperText={
            checkingEmail
              ? 'در حال بررسی ایمیل...'
              : !email
                ? ''
                : !emailValid
                  ? 'فقط ایمیل‌های Gmail مجاز هستند.'
                  : emailTaken
                    ? 'این ایمیل قبلاً ثبت شده است.'
                    : '✅ ایمیل قابل استفاده است.'
          }
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="رمز عبور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {sent && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✅ لینک تأیید برای ایمیل شما ارسال شد. لطفاً آن را بررسی کرده و سپس وارد شوید.
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleSignup}
          disabled={buttonDisabled}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'ثبت‌نام'}
        </Button>
      </Paper>
    </Box>
  )
}
