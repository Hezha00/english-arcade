import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function shuffle(array) {
    let arr = array.slice()
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

// Utility to normalize any score to be out of 20
function normalizeScore(score, maxScore) {
    if (maxScore === 20) return score;
    if (!maxScore || maxScore === 0) return 0;
    return Math.round((score / maxScore) * 20);
}

export default function MemoryPuzzleGame() {
    const { gameId } = useParams()
    const [gameData, setGameData] = useState(null)
    const [cards, setCards] = useState([])
    const [flipped, setFlipped] = useState([]) // indices of currently flipped cards
    const [matched, setMatched] = useState([]) // indices of matched cards
    const [moves, setMoves] = useState(0)
    const [finished, setFinished] = useState(false)
    const [score, setScore] = useState(0)
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [isResolving, setIsResolving] = useState(false) // prevent clicks while resolving
    // Add a state for live score
    const [liveScore, setLiveScore] = useState(0)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Update live score after each move
    useEffect(() => {
        // Each correct match: +5, each incorrect: -1 (not below 0)
        // We'll track this by counting matches and mistakes
        // We'll need to count mistakes, so add a state for that
    }, [])

    // Add a state for mistakes
    const [mistakes, setMistakes] = useState(0)

    // Modify handleFlip to update score and mistakes
    const handleFlip = idx => {
        if (isResolving || flipped.length === 2 || flipped.includes(idx) || matched.includes(idx) || finished) return
        const newFlipped = [...flipped, idx]
        setFlipped(newFlipped)
        if (newFlipped.length === 2) {
            setIsResolving(true)
            setMoves(m => m + 1)
            const [i1, i2] = newFlipped
            if (
                cards[i1] &&
                cards[i2] &&
                ((cards[i1].type === 'en' && cards[i2].type === 'fa' && cards[i1].pair === cards[i2].text) ||
                    (cards[i1].type === 'fa' && cards[i2].type === 'en' && cards[i1].pair === cards[i2].text))
            ) {
                // Match!
                setTimeout(() => {
                    setMatched(m => [...m, i1, i2])
                    setFlipped([])
                    setIsResolving(false)
                    setLiveScore(s => Math.min(40, s + 5))
                }, 700)
            } else {
                // Not a match
                setTimeout(() => {
                    setFlipped([])
                    setIsResolving(false)
                    setMistakes(m => m + 1)
                    setLiveScore(s => Math.max(0, s - 1))
                }, 1000)
            }
        }
    }

    // Show live score out of 20
    const normalizedScore = Math.round((liveScore / 40) * 20)

    // When all matched, set finished
    useEffect(() => {
        if (matched.length === 16 && !finished) {
            setFinished(true)
        }
    }, [matched, finished])

    // Visual feedback for correct matches
    const isMatched = idx => matched.includes(idx)
    const isFlipped = idx => flipped.includes(idx) || matched.includes(idx)

    // Fetch game data and set up cards
    useEffect(() => {
        const fetchGame = async () => {
            setError('')
            try {
                const { data, error } = await supabase
                    .from('games')
                    .select('game_content, name')
                    .eq('id', gameId)
                    .single()
                if (error || !data) {
                    setError('بازی پیدا نشد یا خطا در بارگذاری بازی')
                    return
                }
                setGameData(data)
                // Prepare cards: 8 pairs (english/persian)
                const pairs = (data.game_content?.items || []).slice(0, 8)
                const cardList = shuffle([
                    ...pairs.map((p, i) => ({ id: i, text: p.word, type: 'en', pair: p.match })),
                    ...pairs.map((p, i) => ({ id: i + 8, text: p.match, type: 'fa', pair: p.word }))
                ])
                setCards(cardList)
            } catch (err) {
                setError('خطا در بارگذاری بازی')
            }
        }
        fetchGame()
    }, [gameId])

    // Submit score to student_game_status
    const handleSubmit = async () => {
        if (submitted) return;
        setSubmitted(true);
        setLoading(true);
        try {
            const studentInfoString = localStorage.getItem('student');
            if (!studentInfoString) throw new Error('اطلاعات دانش‌آموز یافت نشد.');
            const studentInfo = JSON.parse(studentInfoString);
            const studentId = studentInfo?.id;
            if (!studentId) throw new Error('شناسه دانش‌آموز یافت نشد.');
            // Fetch previous attempts
            const { data: existingStatus, error: fetchError, status } = await supabase
                .from('student_game_status')
                .select('attempts')
                .eq('student_id', studentId)
                .eq('game_id', gameId)
                .single();
            if (fetchError && status !== 406) throw fetchError;
            const prevAttempts = (status === 406) ? 0 : (existingStatus?.attempts || 0);
            const { error: upsertError } = await supabase
                .from('student_game_status')
                .upsert({
                    student_id: studentId,
                    game_id: gameId,
                    score: normalizedScore,
                    attempts: prevAttempts + 1,
                    time_spent: moves,
                    completed_at: new Date().toISOString(),
                }, { onConflict: ['student_id', 'game_id'] });
            if (upsertError) throw upsertError;
            // Redirect to results page after successful save
            navigate('/student-results');
        } catch (err) {
            setError(err.message || 'خطا در ثبت نتیجه بازی.');
        } finally {
            setLoading(false);
        }
    };

    if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
    if (!gameData || cards.length !== 16) return <CircularProgress sx={{ mt: 10 }} />

    // Responsive 4x4 grid
    return (
        <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
            <Paper sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', color: '#222', boxShadow: 8 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#222', fontWeight: 'bold' }}>
                    🧩 بازی حافظه: {gameData?.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                    کلمات انگلیسی را با معنی فارسی آن‌ها تطبیق دهید. 
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ color: '#222', fontWeight: 'bold' }}>تعداد حرکات: {moves}</Typography>
                    <Typography sx={{ color: '#222', fontWeight: 'bold' }}>امتیاز فعلی: {normalizedScore} از 20</Typography>
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 2,
                    mb: 3,
                    width: '100%',
                    maxWidth: 400,
                    mx: 'auto',
                }}>
                    {cards.map((card, idx) => (
                        <Box
                            key={idx}
                            onClick={() => handleFlip(idx)}
                            sx={{
                                width: '100%',
                                height: 80,
                                borderRadius: 2,
                                bgcolor: isFlipped(idx) ? '#fff' : 'rgba(255,255,255,0.08)',
                                color: isFlipped(idx) ? '#222' : 'transparent',
                                boxShadow: isFlipped(idx) ? 4 : 1,
                                border: isMatched(idx) ? '3px solid #22c55e' : isFlipped(idx) ? '2px solid #888' : '2px solid transparent',
                                cursor: isFlipped(idx) || finished || flipped.length === 2 || isResolving ? 'default' : 'pointer',
                                transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
                                userSelect: 'none',
                                outline: isMatched(idx) ? '2px solid #22c55e' : 'none',
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span style={{
                                opacity: isFlipped(idx) ? 1 : 0,
                                transition: 'opacity 0.3s',
                                fontWeight: 'bold',
                                fontSize: 22,
                                color: isMatched(idx) ? '#22c55e' : '#222',
                            }}>{card.text}</span>
                        </Box>
                    ))}
                </Box>
                {finished && (
                    <Alert severity={normalizedScore === 20 ? 'success' : 'info'} sx={{ mt: 2 }}>
                        {normalizedScore === 20 ? '🎉 عالی! همه جفت‌ها را پیدا کردید.' : `امتیاز شما: ${normalizedScore} از 20`}
                    </Alert>
                )}
                {finished && !submitted && (
                    <Button variant="contained" fullWidth sx={{ mt: 2, background: 'linear-gradient(90deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 'bold' }} onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'ثبت و اتمام بازی'}
                    </Button>
                )}
                {submitted && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        امتیاز شما: {normalizedScore} از 20 | تعداد حرکات: {moves}
                    </Alert>
                )}
            </Paper>
        </Box>
    )
} 