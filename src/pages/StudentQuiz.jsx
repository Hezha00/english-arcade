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
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) setStudent(JSON.parse(saved))
        else navigate('/student-login')
    }, [navigate])

    useEffect(() => {
        const fetchGame = async () => {
            const { data: game } = await supabase
                .from('games')
                .select('file_url, name')
                .eq('id', gameId)
                .single()

            if (!game?.file_url) return

            const res = await fetch(game.file_url)
            const json = await res.json()

            setGameData({ name: game.name, wordPairs: json.word_pairs })
            setAnswers(Array(json.word_pairs.length).fill(''))
            setLoading(false)
        }

        fetchGame()
    }, [gameId])

    const handleChange = (index, value) => {
        const updated = [...answers]
        updated[index] = value
        setAnswers(updated)
    }

    const handleSubmit = async () => {
        let correct = 0
        gameData.wordPairs.forEach((pair, i) => {
            if (answers[i].trim().toLowerCase() === pair.english.trim().toLowerCase()) {
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

    return (
        <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
            <Container dir="rtl" maxWidth="md">
                <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                    🎮 بازی: {gameData?.name}
                </Typography>

                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                    {submitted ? (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            ✅ بازی با موفقیت ثبت شد | نمره شما: {score}%
                        </Alert>
                    ) : (
                        <>
                            {gameData.wordPairs.map((pair, i) => (
                                <TextField
                                    key={i}
                                    fullWidth
                                    label={`ترجمه "${pair.persian}"`}
                                    value={answers[i]}
                                    onChange={e => handleChange(i, e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            ))}

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSubmit}
                                disabled={answers.some(a => !a.trim())}
                            >
                                ثبت پاسخ‌ها
                            </Button>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    )
}
