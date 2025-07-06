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

export default function SentenceStructureGame() {
    const { gameId } = useParams()
    const [gameData, setGameData] = useState(null)
    const [sentences, setSentences] = useState([])
    const [current, setCurrent] = useState(0)
    const [scrambled, setScrambled] = useState([])
    const [answer, setAnswer] = useState([])
    const [score, setScore] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [finished, setFinished] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')
    const [maxAttempts, setMaxAttempts] = useState(20)

    useEffect(() => {
        const fetchGame = async () => {
            const { data, error } = await supabase
                .from('games')
                .select('game_content, name, max_retries')
                .eq('id', gameId)
                .single()
            if (error || !data) {
                setError('بازی پیدا نشد یا خطا در بارگذاری بازی')
                return
            }
            setGameData(data)
            const sents = data.game_content?.sentences || []
            setSentences(sents)
            setMaxAttempts(data.max_retries || 20)
            if (sents.length > 0) setScrambled(shuffle(sents[0].split(' ')))
        }
        fetchGame()
    }, [gameId])

    useEffect(() => {
        if (sentences.length > 0 && current < sentences.length) {
            setScrambled(shuffle(sentences[current].split(' ')))
            setAnswer([])
            setFeedback('')
        }
    }, [current, sentences])

    const handleWordClick = (word, fromAnswer) => {
        if (finished || submitted) return
        if (fromAnswer) {
            setAnswer(answer.filter((w, i) => i !== answer.indexOf(word)))
            setScrambled([...scrambled, word])
        } else {
            setScrambled(scrambled.filter((w, i) => i !== scrambled.indexOf(word)))
            setAnswer([...answer, word])
        }
    }

    const handleCheck = () => {
        if (answer.join(' ') === sentences[current]) {
            setScore(s => s + 1)
            setFeedback('✅ درست!')
            setTimeout(() => {
                if (current + 1 < sentences.length) setCurrent(c => c + 1)
                else setFinished(true)
            }, 1000)
        } else {
            setFeedback('❌ اشتباه! جواب صحیح: ' + sentences[current])
            setTimeout(() => {
                if (current + 1 < sentences.length) setCurrent(c => c + 1)
                else setFinished(true)
            }, 2000)
        }
    }

    const handleSubmit = async () => {
        if (submitted) return
        setSubmitted(true)
        try {
            const { error } = await supabase
                .from('student_game_status')
                .insert({
                    student_id: 'YOUR_STUDENT_ID', // Replace with actual student ID
                    game_id: gameId,
                    game_name: gameData.name,
                    score: Math.round((score / sentences.length) * 100),
                    completed_at: new Date().toISOString(),
                })
                .select()
                .single()
            if (error) throw error
            alert('بازی با موفقیت ثبت شد!')
        } catch (err) {
            alert('خطا در ثبت بازی. لطفاً دوباره تلاش کنید.')
        }
    }

    if (error) return <Alert severity="error">{error}</Alert>
    if (!gameData || sentences.length === 0) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
            <Paper sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', boxShadow: 6 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    📝 بازی ساختار جمله: {gameData.name}
                </Typography>
                {!finished ? (
                    <>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            کلمات را به ترتیب صحیح بچینید:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {answer.map((word, i) => (
                                <Button key={i} variant="contained" color="primary" onClick={() => handleWordClick(word, true)}>
                                    {word}
                                </Button>
                            ))}
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {scrambled.map((word, i) => (
                                <Button key={i} variant="outlined" color="secondary" onClick={() => handleWordClick(word, false)}>
                                    {word}
                                </Button>
                            ))}
                        </Box>
                        {feedback && <Alert severity={feedback.startsWith('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>{feedback}</Alert>}
                        {answer.length === sentences[current].split(' ').length && !feedback && (
                            <Button variant="contained" fullWidth onClick={handleCheck}>
                                بررسی جمله
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            امتیاز شما: {Math.round((score / sentences.length) * 100)} از 100
                        </Alert>
                        {submitted && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                امتیاز شما: {Math.round((score / sentences.length) * 100)} | تلاش‌های استفاده‌شده: {sentences.length} | تلاش‌های باقی‌مانده: {maxAttempts - sentences.length}
                            </Alert>
                        )}
                        {!submitted && (
                            <Button variant="contained" fullWidth onClick={handleSubmit}>
                                ثبت و اتمام بازی
                            </Button>
                        )}
                    </>
                )}
            </Paper>
        </Box>
    )
} 