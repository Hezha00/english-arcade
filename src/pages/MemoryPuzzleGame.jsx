import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, Button, Grid, CircularProgress, Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
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

    useEffect(() => {
        const fetchGame = async () => {
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
        }
        fetchGame()
    }, [gameId])

    // Handle card click
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
                }, 700)
            } else {
                // Not a match
                setTimeout(() => {
                    setFlipped([])
                    setIsResolving(false)
                }, 1000)
            }
        }
    }

    // Check for game finish
    useEffect(() => {
        if (matched.length === 16 && !finished) {
            setFinished(true)
            setScore(20) // always 20 for full match
        }
    }, [matched, finished])

    // Score is out of 20, proportional to pairs found
    const normalizedScore = finished ? 20 : Math.round((matched.length / 16) * 20)

    const handleSubmit = async () => {
        if (submitted) return
        setSubmitted(true)
        const studentInfoString = localStorage.getItem('student');
        if (!studentInfoString) {
            alert('خطا: اطلاعات دانش‌آموز یافت نشد. لطفاً دوباره وارد شوید.');
            setSubmitted(false); // Allow retry
            return;
        }
        let studentId;
        try {
            const studentInfo = JSON.parse(studentInfoString);
            studentId = studentInfo?.id;
            if (!studentId) throw new Error("Student ID not found in localStorage data.");
        } catch (parseError) {
            console.error("Error parsing student data from localStorage:", parseError);
            alert('خطا در پردازش اطلاعات دانش‌آموز.');
            setSubmitted(false);
            return;
        }
        try {
            // Get current attempts (if any)
            console.log('[MemoryPuzzleGame] Submitting result:', {
                student_id: studentId,
                game_id: gameId,
                game_name: gameData.name,
                score: normalizedScore,
                moves,
                completed_at: new Date().toISOString()
            });
            const { data: existingStatus, error: fetchError } = await supabase
                .from('student_game_status')
                .select('attempts')
                .eq('student_id', studentId)
                .eq('game_id', gameId)
                .single()
            if (fetchError) console.error('[MemoryPuzzleGame] Error fetching existing status:', fetchError);
            const prevAttempts = existingStatus?.attempts || 0;
            const { error: upsertError, data: upsertData } = await supabase
                .from('student_game_status')
                .upsert({
                    student_id: studentId,
                    game_id: gameId,
                    game_name: gameData.name,
                    score: normalizedScore,
                    attempts: prevAttempts + 1,
                    time_spent: moves, // moves as time_spent for now
                    completed_at: new Date().toISOString(),
                }, { onConflict: ['student_id', 'game_id'] })
            if (upsertError) {
                console.error('[MemoryPuzzleGame] Error upserting result:', upsertError);
                alert('خطا در ثبت بازی. لطفاً دوباره تلاش کنید.')
            } else {
                console.log('[MemoryPuzzleGame] Upserted result:', upsertData);
                alert('بازی با موفقیت ثبت شد!')
            }
        } catch (err) {
            console.error('[MemoryPuzzleGame] JS error submitting game:', err)
            alert('خطا در ثبت بازی. لطفاً دوباره تلاش کنید.')
        }
    }

    if (error) return <Alert severity="error">{error}</Alert>
    if (!gameData || cards.length !== 16) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
            <Paper sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)', color: '#222', boxShadow: 8 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#4f46e5' }}>
                    🧩 بازی حافظه: {gameData.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#333' }}>
                    کلمات انگلیسی را با معنی فارسی آن‌ها تطبیق دهید. هر بار دو کارت را برگردانید. اگر جفت باشند، باز می‌مانند.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ color: '#4f46e5' }}>تعداد حرکات: {moves}</Typography>
                    <Typography sx={{ color: '#4f46e5' }}>امتیاز فعلی: {normalizedScore} از 20</Typography>
                </Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {cards.map((card, idx) => {
                        const isFlipped = flipped.includes(idx) || matched.includes(idx)
                        return (
                            <Grid item xs={3} key={idx}>
                                <Box
                                    onClick={() => handleFlip(idx)}
                                    sx={{
                                        height: 70,
                                        borderRadius: 2,
                                        bgcolor: isFlipped ? '#fff' : 'rgba(255,255,255,0.08)',
                                        color: isFlipped ? '#4f46e5' : 'transparent',
                                        boxShadow: isFlipped ? 4 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                        cursor: isFlipped || finished || flipped.length === 2 || isResolving ? 'default' : 'pointer',
                                        transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
                                        border: isFlipped ? '2px solid #4f46e5' : '2px solid transparent',
                                        userSelect: 'none',
                                        position: 'relative',
                                        perspective: 600,
                                    }}
                                >
                                    <span style={{
                                        opacity: isFlipped ? 1 : 0,
                                        transition: 'opacity 0.3s',
                                    }}>{card.text}</span>
                                </Box>
                            </Grid>
                        )
                    })}
                </Grid>
                {finished && (
                    <Alert severity={normalizedScore === 20 ? 'success' : 'info'} sx={{ mt: 2 }}>
                        {normalizedScore === 20 ? '🎉 عالی! همه جفت‌ها را پیدا کردید.' : `امتیاز شما: ${normalizedScore} از 20`}
                    </Alert>
                )}
                {finished && !submitted && (
                    <Button variant="contained" fullWidth sx={{ mt: 2, background: 'linear-gradient(90deg, #6366f1, #4f46e5)', color: '#fff', fontWeight: 'bold' }} onClick={handleSubmit}>
                        ثبت و اتمام بازی
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