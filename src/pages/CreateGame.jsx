import React, { useState, useEffect } from 'react'
import {
    Box, Paper, Typography, TextField, Button,
    Alert, CircularProgress, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate, useLocation } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

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
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [createdGameId, setCreatedGameId] = useState(null)
    // Add state for game type, time limit, and max attempts:
    const [gameType, setGameType] = useState('word-matching')
    const [durationMin, setDurationMin] = useState(3)
    const [maxRetries, setMaxRetries] = useState(20)
    const [sentencesText, setSentencesText] = useState('')

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
        if (wordPairs.length > 1) {
            setWordPairs(wordPairs.filter((_, i) => i !== index))
        }
    }

    const duplicatePair = (index) => {
        const pairToDuplicate = wordPairs[index]
        const newPair = { 
            english: `${pairToDuplicate.english} (کپی)`, 
            persian: `${pairToDuplicate.persian} (کپی)` 
        }
        const updated = [...wordPairs]
        updated.splice(index + 1, 0, newPair)
        setWordPairs(updated)
    }

    const validateForm = () => {
        if (!name.trim()) {
            setError('نام بازی الزامی است')
            return false
        }
        
        if (wordPairs.length === 0) {
            setError('حداقل یک جفت کلمه باید اضافه شود')
            return false
        }

        const invalidPairs = wordPairs.filter(p => !p.english.trim() || !p.persian.trim())
        if (invalidPairs.length > 0) {
            setError('تمام جفت‌های کلمه باید کامل باشند')
            return false
        }

        if (gameType === 'memory-puzzle' && wordPairs.length !== 8) {
            setError('برای بازی حافظه باید دقیقاً ۸ جفت کلمه وارد کنید')
            return false
        }

        if (gameType === 'sentence-structure' && sentencesText.trim().split('\n').filter(s => s.trim()).length === 0) {
            setError('حداقل یک جمله باید وارد شود')
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setError('')
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) {
                throw new Error('کاربر یافت نشد')
            }

            const teacherId = user.id

            // Create game content structure
            const gameContent = gameType === 'word-matching'
                ? {
                    type: 'word-matching',
                    version: '1.0',
                    created_at: new Date().toISOString(),
                    items: wordPairs.map(({ english, persian }, index) => ({
                        id: index + 1,
                        word: english.trim(),
                        match: persian.trim(),
                        difficulty: 'medium'
                    })),
                    settings: {
                        timeLimit: 300,
                        maxRetries: 3,
                        shuffleWords: true,
                        showHints: true
                    }
                }
                : gameType === 'memory-puzzle'
                    ? {
                        type: 'memory-puzzle',
                        version: '1.0',
                        created_at: new Date().toISOString(),
                        items: wordPairs.map(({ english, persian }, index) => ({
                            id: index + 1,
                            word: english.trim(),
                            match: persian.trim()
                        })),
                        settings: {
                            gridSize: 4,
                            timeLimit: durationMin * 60,
                            maxRetries: maxRetries
                        }
                    }
                    : {
                        type: 'sentence-structure',
                        version: '1.0',
                        created_at: new Date().toISOString(),
                        sentences: sentencesText.trim().split('\n').filter(s => s.trim()),
                        settings: {
                            timeLimit: durationMin * 60,
                            maxRetries: maxRetries
                        }
                    }

            // Set expiration date (7 days from now)
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

            // Insert game directly into database
            const { data: gameData, error: insertError } = await supabase
                .from('games')
                .insert({
                    name: name.trim(),
                    description: description.trim() || 'بازی تطبیق کلمات انگلیسی و فارسی',
                    teacher_id: teacherId,
                    file_url: null, // We'll store content in game_content instead
                    is_global: false,
                    created_at: new Date().toISOString(),
                    duration_min: durationMin,
                    max_retries: maxRetries,
                    expires_at: expiresAt,
                    game_content: gameContent,
                    is_active: true
                })
                .select('id, name')
                .single()

            if (insertError) {
                console.error('Game creation error:', insertError)
                throw new Error('خطا در ذخیره بازی: ' + insertError.message)
            }

            setCreatedGameId(gameData.id)
            setShowSuccessDialog(true)
            setLoading(false)

        } catch (err) {
            console.error('Error creating game:', err)
            setError(err.message || 'خطا در ایجاد بازی')
            setLoading(false)
        }
    }

    const handleAssignGame = () => {
        setShowSuccessDialog(false)
        navigate(`/assign-game/${createdGameId}`)
    }

    const handleGoToGames = () => {
        setShowSuccessDialog(false)
        navigate('/teacher-games')
    }

    const handleQuickAssign = async (classroom) => {
        if (!createdGameId) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return

            const { error } = await supabase.from('game_assignments').insert({
                game_id: createdGameId,
                classroom: classroom,
                teacher_id: user.id,
                assigned_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true
            })

            if (error) {
                console.error('Assignment error:', error)
                alert('خطا در اختصاص بازی: ' + error.message)
            } else {
                alert(`✅ بازی به کلاس "${classroom}" اختصاص یافت`)
            }
        } catch (err) {
            console.error('Quick assign error:', err)
            alert('خطا در اختصاص سریع بازی')
        }
    }

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }} dir="rtl">
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
                    🎮 ساخت بازی جدید
                </Typography>

                <Typography variant="body2" color="#ddd" sx={{ mb: 3 }}>
                    بازی‌های تطبیق کلمات برای یادگیری بهتر زبان انگلیسی
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'grid', gap: 3 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="#ccc">نوع بازی</Typography>
                        <Button
                            variant={gameType === 'word-matching' ? 'contained' : 'outlined'}
                            onClick={() => setGameType('word-matching')}
                            sx={{ mr: 1 }}
                        >
                            تطبیق کلمه
                        </Button>
                        <Button
                            variant={gameType === 'memory-puzzle' ? 'contained' : 'outlined'}
                            onClick={() => setGameType('memory-puzzle')}
                        >
                            بازی حافظه
                        </Button>
                        <Button
                            variant={gameType === 'sentence-structure' ? 'contained' : 'outlined'}
                            onClick={() => setGameType('sentence-structure')}
                        >
                            ساختار جمله
                        </Button>
                    </Box>

                    <TextField
                        label="نام بازی"
                        fullWidth
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="مثال: کلمات فصل اول"
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />
                    
                    <TextField
                        label="توضیحات (اختیاری)"
                        fullWidth
                        multiline
                        rows={2}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="توضیح مختصری درباره بازی..."
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' } }}
                    />

                    {gameType === 'memory-puzzle' && wordPairs.length > 8 && setWordPairs(wordPairs.slice(0, 8))}
                    {gameType === 'sentence-structure' && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="#ccc">جملات (هر جمله در یک خط)</Typography>
                            <TextField
                                multiline
                                minRows={4}
                                fullWidth
                                value={sentencesText}
                                onChange={e => setSentencesText(e.target.value)}
                                placeholder="مثال:\nI am learning English.\nThe cat is sleeping on the sofa."
                                sx={{ mt: 1, input: { color: '#fff' }, label: { color: '#ccc' } }}
                            />
                        </Box>
                    )}

                    <TextField
                        label="زمان (دقیقه)"
                        type="number"
                        value={durationMin}
                        onChange={e => setDurationMin(Number(e.target.value))}
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' }, mt: 2 }}
                        inputProps={{ min: 1, max: 30 }}
                    />
                    <TextField
                        label="حداکثر تلاش‌ها"
                        type="number"
                        value={maxRetries}
                        onChange={e => setMaxRetries(Number(e.target.value))}
                        sx={{ input: { color: '#fff' }, label: { color: '#ccc' }, mt: 2 }}
                        inputProps={{ min: 1, max: 99 }}
                    />

                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            🔠 جفت‌های کلمه
                            <Chip 
                                label={`${wordPairs.length} کلمه`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                            />
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {wordPairs.map((pair, index) => (
                                <Box 
                                    key={index} 
                                    sx={{ 
                                        display: 'flex', 
                                        gap: 2, 
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <TextField
                                        label="کلمه انگلیسی"
                                        value={pair.english}
                                        onChange={e => updatePair(index, 'english', e.target.value)}
                                        placeholder="مثال: Hello"
                                        sx={{ flex: 1, input: { color: '#fff' }, label: { color: '#ccc' } }}
                                    />
                                    <TextField
                                        label="معنی فارسی"
                                        value={pair.persian}
                                        onChange={e => updatePair(index, 'persian', e.target.value)}
                                        placeholder="مثال: سلام"
                                        sx={{ flex: 1, input: { color: '#fff' }, label: { color: '#ccc' } }}
                                    />
                                    <IconButton
                                        onClick={() => duplicatePair(index)}
                                        sx={{ color: '#4ade80' }}
                                        title="کپی کردن"
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => removePair(index)}
                                        disabled={wordPairs.length === 1}
                                        title="حذف"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>

                        <Button 
                            onClick={addPair} 
                            variant="outlined" 
                            startIcon={<AddIcon />}
                            sx={{ 
                                mt: 2, 
                                color: '#fff', 
                                borderColor: '#fff',
                                '&:hover': {
                                    borderColor: '#4ade80',
                                    color: '#4ade80'
                                }
                            }}
                        >
                            افزودن جفت جدید
                        </Button>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            py: 1.5,
                            background: 'linear-gradient(to right, #6366f1, #4f46e5)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                                background: 'linear-gradient(to right, #4f46e5, #4338ca)'
                            }
                        }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            '🎮 ساخت و ذخیره بازی'
                        )}
                    </Button>
                </Box>
            </Paper>

            {/* Success Dialog */}
            <Dialog 
                open={showSuccessDialog} 
                onClose={() => setShowSuccessDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    ✅ بازی با موفقیت ساخته شد!
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                        بازی "{name}" آماده است. حالا می‌توانید آن را به کلاس‌ها اختصاص دهید.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button 
                        variant="outlined" 
                        onClick={handleGoToGames}
                        sx={{ minWidth: 120 }}
                    >
                        مشاهده بازی‌ها
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAssignGame}
                        sx={{ 
                            minWidth: 120,
                            background: 'linear-gradient(to right, #6366f1, #4f46e5)'
                        }}
                    >
                        اختصاص به کلاس
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
