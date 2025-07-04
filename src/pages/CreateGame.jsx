import React, { useState, useEffect } from 'react'
import {
    Box, Paper, Typography, TextField, Button,
    Alert, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CreateGame() {
    const navigate = useNavigate()
    const location = useLocation()

    const incomingName = location.state?.templateName || ''
    const incomingUrl = location.state?.fileUrl || ''

    const [name, setName] = useState(incomingName)
    const [description, setDescription] = useState('')
    const [wordPairs, setWordPairs] = useState([{ english: '', persian: '' }])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!incomingUrl) return
            try {
                const res = await fetch(incomingUrl)
                const json = await res.json()
                if (json.word_pairs) setWordPairs(json.word_pairs)
            } catch (err) {
                console.warn('خطا در بارگذاری قالب', err)
            }
        }

        fetchTemplate()
    }, [incomingUrl])

    const addPair = () => {
        setWordPairs([...wordPairs, { english: '', persian: '' }])
    }

    const updatePair = (index, field, value) => {
        const updated = [...wordPairs]
        updated[index][field] = value
        setWordPairs(updated)
    }

    const removePair = index => {
        setWordPairs(wordPairs.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        setError('')
        setLoading(true)

        if (!name || wordPairs.some(p => !p.english || !p.persian)) {
            setError('تمام فیلدها باید پر شوند')
            setLoading(false)
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        const teacherId = user?.id
        const filename = `game_${Date.now()}.json`
        const blob = new Blob([JSON.stringify({ word_pairs: wordPairs })], {
            type: 'application/json'
        })

        const { error: uploadError } = await supabase.storage
            .from('games')
            .upload(filename, blob, { contentType: 'application/json' })

        if (uploadError) {
            setError('خطا در آپلود فایل')
            setLoading(false)
            return
        }

        const { publicUrl } = supabase.storage.from('games').getPublicUrl(filename)

        const { data, error: insertError } = await supabase
            .from('games')
            .insert({
                name,
                description,
                teacher_id: teacherId,
                file_url: publicUrl,
                is_global: true,
                created_at: new Date().toISOString()
            })
            .select('id')
            .single()

        if (insertError) {
            setError('خطا در ذخیره بازی')
            setLoading(false)
            return
        }

        alert('✅ بازی ساخته شد، حالا آن را به کلاس اختصاص دهید')
        navigate(`/assign-game/${data.id}`)
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }} dir="rtl">
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff'
                }}
            >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    ساخت بازی جدید
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    label="نام بازی"
                    fullWidth
                    value={name}
                    onChange={e => setName(e.target.value)}
                    sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }}
                />
                <TextField
                    label="توضیحات"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    sx={{ mb: 2, input: { color: '#fff' }, label: { color: '#ccc' } }}
                />

                <Typography variant="subtitle1" sx={{ mt: 3 }}>
                    🔠 جفت‌های کلمه:
                </Typography>

                {wordPairs.map((pair, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="انگلیسی"
                            value={pair.english}
                            onChange={e => updatePair(index, 'english', e.target.value)}
                            fullWidth
                            sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                        />
                        <TextField
                            label="فارسی"
                            value={pair.persian}
                            onChange={e => updatePair(index, 'persian', e.target.value)}
                            fullWidth
                            sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                        />
                        <Button
                            color="error"
                            onClick={() => removePair(index)}
                            disabled={wordPairs.length === 1}
                        >
                            حذف
                        </Button>
                    </Box>
                ))}

                <Button onClick={addPair} variant="outlined" sx={{ mt: 2, color: '#fff', borderColor: '#fff' }}>
                    افزودن جفت جدید
                </Button>

                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        mt: 3,
                        py: 1.5,
                        background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                        color: '#fff',
                        fontWeight: 600,
                        '&:hover': {
                            transform: 'scale(1.03)',
                            boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                            background: 'linear-gradient(to right, #4f46e5, #4338ca)'
                        }
                    }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'ذخیره و ادامه'}
                </Button>
            </Paper>
        </Box>
    )
}
