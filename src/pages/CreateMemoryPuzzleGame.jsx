import React, { useState } from 'react'
import { Box, Paper, Typography, TextField, Button, Alert, Chip, IconButton } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

export default function CreateMemoryPuzzleGame() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [wordPairs, setWordPairs] = useState([{ english: '', persian: '' }])
  const [timeLimit, setTimeLimit] = useState(180) // seconds
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const addPair = () => wordPairs.length < 8 && setWordPairs([...wordPairs, { english: '', persian: '' }])
  const updatePair = (i, field, value) => {
    const updated = [...wordPairs]
    updated[i][field] = value
    setWordPairs(updated)
  }
  const removePair = i => setWordPairs(wordPairs.length > 1 ? wordPairs.filter((_, idx) => idx !== i) : wordPairs)

  const validate = () => {
    if (!name.trim()) {
      setError('نام بازی الزامی است');
      return false;
    }
    if (wordPairs.length !== 8) {
      setError('دقیقاً ۸ جفت کلمه باید وارد شود');
      return false;
    }
    if (wordPairs.some(p => !p.english.trim() || !p.persian.trim())) {
      setError('همه جفت‌ها باید کامل باشند');
      return false;
    }
    setError(''); // Clear error if validation passes
    return true;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('حساب معلم یافت نشد')
      const gameContent = {
        type: 'memory-puzzle',
        version: '1.0',
        created_at: new Date().toISOString(),
        items: wordPairs.map(({ english, persian }, i) => ({ id: i + 1, word: english.trim(), match: persian.trim() })),
        settings: { gridSize: 4, timeLimit: timeLimit, maxRetries: 20 }
      }
      const { data, error: insertError } = await supabase.from('games').insert({
        name: name.trim(),
        description: description.trim() || 'بازی حافظه',
        teacher_id: user.id,
        file_url: null,
        is_global: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        duration_min: Math.ceil(timeLimit / 60),
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
        <Typography variant="h5" fontWeight="bold" gutterBottom>ساخت بازی حافظه</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>بازی با موفقیت ساخته شد!</Alert>}
        <TextField label="نام بازی" fullWidth value={name} onChange={e => setName(e.target.value)} sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }} />
        <TextField label="توضیحات (اختیاری)" fullWidth value={description} onChange={e => setDescription(e.target.value)} sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }} />
        {/* Time limit selector */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight="bold" sx={{ mb: 1 }}>محدودیت زمانی (ثانیه):</Typography>
          <TextField
            type="number"
            inputProps={{ min: 30, max: 900, step: 10 }}
            value={timeLimit}
            onChange={e => setTimeLimit(Math.max(30, Math.min(900, Number(e.target.value))))}
            sx={{ width: 120, bgcolor: '#fff', borderRadius: 2 }}
          />
          <Typography variant="caption" sx={{ ml: 2, color: '#ccc' }}>
            (بین ۳۰ تا ۹۰۰ ثانیه)
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>جفت‌های کلمه <Chip label={`${wordPairs.length} / 8`} size="small" color="primary" variant="outlined" /></Typography>
        {wordPairs.map((pair, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField label="کلمه انگلیسی" value={pair.english} onChange={e => updatePair(i, 'english', e.target.value)} sx={{ flex: 1, input: { color: '#fff' }, label: { color: '#ccc' } }} />
            <TextField label="معنی فارسی" value={pair.persian} onChange={e => updatePair(i, 'persian', e.target.value)} sx={{ flex: 1, input: { color: '#fff' }, label: { color: '#ccc' } }} />
            <IconButton onClick={() => removePair(i)} color="error" disabled={wordPairs.length === 1}><DeleteIcon /></IconButton>
          </Box>
        ))}
        <Button onClick={addPair} variant="outlined" startIcon={<AddIcon />} sx={{ color: '#fff', borderColor: '#fff', mt: 1, mb: 3 }} disabled={wordPairs.length >= 8}>
          افزودن جفت جدید
        </Button>
        <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading} sx={{ py: 1.5, fontWeight: 600, fontSize: '1.1rem', background: 'linear-gradient(to right, #6366f1, #4f46e5)', color: '#fff', '&:hover': { background: 'linear-gradient(to right, #4f46e5, #4338ca)' } }}>
          {loading ? 'در حال ذخیره...' : 'ساخت و ذخیره بازی'}
        </Button>
      </Paper>
    </Box>
  )
} 