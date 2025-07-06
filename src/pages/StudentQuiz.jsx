import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, Button, CircularProgress,
    TextField, Alert
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function StudentQuiz() {
    const { gameId } = useParams()
    const [student, setStudent] = useState(null)
    const [gameData, setGameData] = useState(null)
    const [answers, setAnswers] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(null)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const [maxAttempts, setMaxAttempts] = useState(3)

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) setStudent(JSON.parse(saved))
        else navigate('/student-login')
    }, [navigate])

    useEffect(() => {
        const fetchGame = async () => {
            setError('')
            setLoading(true)
            const { data: game, error: dbError } = await supabase
                .from('games')
                .select('file_url, name, game_content, max_retries')
                .eq('id', gameId)
                .single()
            if (dbError || !game) {
                setError('بازی پیدا نشد یا مشکلی در دریافت اطلاعات بازی وجود دارد.')
                setLoading(false)
                return
            }
            // Prefer game_content if available
            if (game.game_content && game.game_content.items) {
                setGameData({ name: game.name, wordPairs: game.game_content.items })
                setAnswers(Array(game.game_content.items.length).fill(''))
                setMaxAttempts(game.max_retries || 3)
                setLoading(false)
                return
            }
            if (!game.file_url) {
                setError('آدرس فایل بازی موجود نیست.')
                setLoading(false)
                return
            }
            try {
                const res = await fetch(game.file_url)
                const json = await res.json()
                if (!json.word_pairs) throw new Error('فرمت فایل بازی نامعتبر است.')
                setGameData({ name: game.name, wordPairs: json.word_pairs })
                setAnswers(Array(json.word_pairs.length).fill(''))
                setMaxAttempts(game.max_retries || 3)
            } catch (err) {
                setError('خطا در بارگذاری فایل بازی یا فرمت نامعتبر است.')
            }
            setLoading(false)
        }
        fetchGame()
    }, [gameId])

    const handleChange = (index, value) => {
        const updated = [...answers]
        updated[index] = value
        setAnswers(updated)
    }

    const getEnglish = (pair) => pair.english || pair.word || ''
    const getPersian = (pair) => pair.persian || pair.match || ''

    const handleSubmit = async () => {
        let correct = 0
        gameData.wordPairs.forEach((pair, i) => {
            if (answers[i].trim().toLowerCase() === getEnglish(pair).trim().toLowerCase()) {
                correct++
            }
        })

        const percentage = Math.round((correct / gameData.wordPairs.length) * 100)
        setScore(percentage)
        setSubmitted(true)

        await supabase.from('student_game_status').insert({
            student_id: student.id,
            game_id: gameId,
            score: percentage,
            completed_at: new Date().toISOString()
        })
    }

    if (!student || loading) return <CircularProgress sx={{ mt: 10 }} />
    if (error) return <Alert severity="error" sx={{ mt: 10 }}>{error}</Alert>

    return (
        <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
            <Container dir="rtl" maxWidth="md">
                <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                    🎮 بازی: {gameData?.name}
                </Typography>
                <Typography variant="body1" color="#333" sx={{ mb: 2, bgcolor: '#fff', p: 2, borderRadius: 2 }}>
                    به معنی فارسی هر کلمه انگلیسی پاسخ دهید. جواب‌ها باید به انگلیسی وارد شوند.
                </Typography>
                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                    {submitted ? (
                        <>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                ✅ بازی با موفقیت ثبت شد | نمره شما: {score}%
                            </Alert>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                نمره شما: {score}% | تلاش‌های استفاده‌شده: {attempts} | تلاش‌های باقی‌مانده: {maxAttempts - attempts}
                            </Alert>
                        </>
                    ) : (
                        <>
                            {gameData.wordPairs.map((pair, i) => (
                                <TextField
                                    key={i}
                                    fullWidth
                                    label={`ترجمه "${getPersian(pair)}"`}
                                    value={answers[i]}
                                    onChange={e => handleChange(i, e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            ))}

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSubmit}
                                disabled={answers.some(a => !a.trim()) || submitted}
                                sx={{ mt: 2 }}
                            >
                                ثبت و اتمام بازی
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    )
}
