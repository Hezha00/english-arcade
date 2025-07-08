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

export default function MemoryPuzzleGame() {
    const { gameId } = useParams()
    const [gameData, setGameData] = useState(null)
    const [cards, setCards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [matched, setMatched] = useState([])
    const [attempts, setAttempts] = useState(0)
    const [maxAttempts, setMaxAttempts] = useState(20)
    const [timeLeft, setTimeLeft] = useState(180)
    const [initialTimeLimit, setInitialTimeLimit] = useState(180); // For time_spent calculation
    const [timerActive, setTimerActive] = useState(false)
    const [finished, setFinished] = useState(false)
    const [score, setScore] = useState(0)
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const fetchGame = async () => {
            const { data, error } = await supabase
                .from('games')
                .select('game_content, name, max_retries, duration_min')
                .eq('id', gameId)
                .single()
            if (error || !data) {
                setError('بازی پیدا نشد یا خطا در بارگذاری بازی')
                return
            }
            setGameData(data)
            setMaxAttempts(data.max_retries || 20)
            const initialTime = (data.duration_min || 3) * 60;
            setTimeLeft(initialTime);
            setInitialTimeLimit(initialTime); // Store initial time limit
            // Prepare cards
            const pairs = (data.game_content?.items || []).slice(0, 8)
            const cardList = shuffle([
                ...pairs.map((p, i) => ({ id: i, text: p.word, type: 'en', pair: p.match })),
                ...pairs.map((p, i) => ({ id: i + 8, text: p.match, type: 'fa', pair: p.word }))
            ])
            setCards(cardList)
        }
        fetchGame()
    }, [gameId])

    useEffect(() => {
        if (!finished && timerActive && timeLeft > 0) {
            const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(t)
        }
        if (timeLeft === 0 && !finished) {
            setFinished(true)
        }
    }, [timerActive, timeLeft, finished])

    useEffect(() => {
        if (matched.length === 16 && !finished) {
            setFinished(true)
            setScore(100)
        }
    }, [matched, finished])

    const handleFlip = idx => {
        if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx) || finished) return
        setFlipped([...flipped, idx])
        if (flipped.length === 1) {
            setAttempts(a => a + 1)
            setTimerActive(true)
        }
    }

    useEffect(() => {
        if (flipped.length === 2) {
            const [i1, i2] = flipped
            if (
                cards[i1] &&
                cards[i2] &&
                ((cards[i1].type === 'en' && cards[i2].type === 'fa' && cards[i1].pair === cards[i2].text) ||
                    (cards[i1].type === 'fa' && cards[i2].type === 'en' && cards[i1].pair === cards[i2].text))
            ) {
                setTimeout(() => {
                    setMatched(m => [...m, i1, i2])
                    setFlipped([])
                }, 800)
            } else {
                setTimeout(() => setFlipped([]), 1200)
            }
        }
    }, [flipped, cards])

    useEffect(() => {
        if ((attempts >= maxAttempts || timeLeft === 0) && !finished) {
            setFinished(true)
            setScore(Math.round((matched.length / 16) * 100))
        }
    }, [attempts, maxAttempts, timeLeft, matched, finished])

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
            studentId = studentInfo?.id; // Assuming 'id' is the field for student's ID
            if (!studentId) throw new Error("Student ID not found in localStorage data.");
        } catch (parseError) {
            console.error("Error parsing student data from localStorage:", parseError);
            alert('خطا در پردازش اطلاعات دانش‌آموز.');
            setSubmitted(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('student_game_status')
                .insert({
                    student_id: studentId,
                    game_id: gameId,
                    game_name: gameData.name,
                    score: score,
                    attempts: attempts,
                    time_spent: initialTimeLimit - timeLeft,
                    completed_at: new Date().toISOString(),
                })
                .select()
                .single()

            if (error) {
                throw error
            }
            alert('بازی با موفقیت ثبت شد!')
            // Optionally, redirect or update UI after successful submission
        } catch (err) {
            console.error('Error submitting game:', err)
            alert('خطا در ثبت بازی. لطفاً دوباره تلاش کنید.')
        }
    }

    if (error) return <Alert severity="error">{error}</Alert>
    if (!gameData || cards.length !== 16) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
            <Paper sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', boxShadow: 6 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🧩 بازی حافظه: {gameData.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    کلمات انگلیسی را با معنی فارسی آن‌ها تطبیق دهید. هر بار دو کارت را برگردانید. اگر جفت باشند، باز می‌مانند.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>⏰ زمان: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Typography>
                    <Typography>🔄 تلاش: {attempts} / {maxAttempts}</Typography>
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
                                        cursor: isFlipped || finished ? 'default' : 'pointer',
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
                    <Alert severity={score === 100 ? 'success' : 'info'} sx={{ mt: 2 }}>
                        {score === 100 ? '🎉 عالی! همه جفت‌ها را پیدا کردید.' : `امتیاز شما: ${score} از 100`}
                    </Alert>
                )}
                {finished && !submitted && (
                    <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
                        ثبت و اتمام بازی
                    </Button>
                )}
                {submitted && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        امتیاز شما: {score} | تلاش‌های استفاده‌شده: {attempts} | تلاش‌های باقی‌مانده: {maxAttempts - attempts}
                    </Alert>
                )}
            </Paper>
        </Box>
    )
} 