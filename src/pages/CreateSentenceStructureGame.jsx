import React, { useState } from 'react'
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function CreateSentenceStructureGame() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sentencesText, setSentencesText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    if (!name.trim()) return setError('نام بازی الزامی است')
    if (sentencesText.trim().split('\n').filter(s => s.trim()).length === 0) return setError('حداقل یک جمله باید وارد شود')
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('حساب معلم یافت نشد')
      const gameContent = {
        type: 'sentence-structure',
        version: '1.0',
        created_at: new Date().toISOString(),
        sentences: sentencesText.trim().split('\n').filter(s => s.trim()),
        settings: { timeLimit: 180, maxRetries: 20 }
      }
      const { data, error: insertError } = await supabase.from('games').insert({
        name: name.trim(),
        description: description.trim() || 'بازی ساختار جمله',
        teacher_id: user.id,
        file_url: null,
        is_global: false,
        created_at: new Date().toISOString(),
        duration_min: 3,
        max_retries: 20,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        game_content: gameContent,
        is_active: true
      }).select('id').single()
      if (insertError) throw insertError
      setSuccess(true)
      setTimeout(() => navigate(`/assign-game/${data.id}`), 1200)
    } catch (err) {
      setError(err.message || 'خطا در ایجاد بازی')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }} dir="rtl">
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>ساخت بازی ساختار جمله</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>بازی با موفقیت ساخته شد!</Alert>}
        <TextField label="نام بازی" fullWidth value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }} />
        <TextField label="توضیحات (اختیاری)" fullWidth value={description} onChange={e => setDescription(e.target.value)} sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }} />
        <Typography variant="subtitle1" sx={{ mb: 2 }}>جملات (هر جمله در یک خط)</Typography>
        <TextField
          multiline
          minRows={4}
          fullWidth
          value={sentencesText}
          onChange={e => setSentencesText(e.target.value)}
          placeholder="مثال:\nI am learning English.\nThe cat is sleeping on the sofa."
          sx={{ mt: 1, mb: 3, input: { color: '#fff' }, label: { color: '#ccc' } }}
        />
        <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading} sx={{ py: 1.5, fontWeight: 600, fontSize: '1.1rem', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff', '&:hover': { background: 'linear-gradient(to right, #4f46e5, #4338ca)' } }}>
          {loading ? 'در حال ذخیره...' : 'ساخت و ذخیره بازی'}
        </Button>
      </Paper>
    </Box>
  )
} 