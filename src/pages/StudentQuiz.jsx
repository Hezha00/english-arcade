import React, { useEffect, useState } from 'react'
import {
    Typography, Container, Box, Button, RadioGroup,
    Radio, FormControlLabel, LinearProgress, TextField
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import StudentAppWrapper from '../layouts/StudentAppWrapper'


export default function StudentQuiz() {
    const { assignmentId } = useParams()
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [current, setCurrent] = useState(0)
    const [answers, setAnswers] = useState({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)

    // Feedback state
    const [feedbackRating, setFeedbackRating] = useState(null)
    const [feedbackText, setFeedbackText] = useState('')
    const [feedbackSent, setFeedbackSent] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (!saved) {
            navigate('/student-login')
        } else {
            const parsed = JSON.parse(saved)
            setStudent(parsed)
            fetchQuestions()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate])


    const fetchQuestions = async () => {
        const { data } = await supabase
            .from('questions')
            .select('*')
            .eq('assignment_id', assignmentId)

        setQuestions(data || [])
        setLoading(false)
    }

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [current]: parseInt(value) })
    }

    const handleNext = () => {
        if (current < questions.length - 1) {
            setCurrent(current + 1)
        }
    }

    const handlePrev = () => {
        if (current > 0) {
            setCurrent(current - 1)
        }
    }

    const handleSubmit = async () => {
        let correct = 0
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct_index) correct++
        })

        await supabase.from('results').insert([
            {
                assignment_id: assignmentId,
                student_id: student.id,
                username: student.username,
                classroom: student.classroom,
                score: correct,
                total: questions.length
            }
        ])

        // Optional badge logic skipped for brevity here
        const newTotal = (student.total_score || 0) + correct
        await supabase.from('students')
            .update({ total_score: newTotal })
            .eq('id', student.id)

        const updated = { ...student, total_score: newTotal }
        localStorage.setItem('student', JSON.stringify(updated))
        setStudent(updated)

        setScore(correct)
        setSubmitted(true)
    }

    const handleSubmitFeedback = async () => {
        if (!feedbackRating) {
            alert('لطفاً یک امتیاز ستاره‌ای انتخاب کنید.')
            return
        }

        const { error } = await supabase.from('feedback').insert([
            {
                assignment_id: assignmentId,
                student_id: student.id,
                username: student.username,
                rating: feedbackRating,
                comment: feedbackText
            }
        ])

        if (!error) {
            setFeedbackSent(true)
        }
    }

    if (loading) return <LinearProgress sx={{ mt: 10 }} />
    if (!questions.length) return <Typography sx={{ mt: 10 }} align="center">سؤالی یافت نشد</Typography>

    const q = questions[current]

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    سوال {current + 1} از {questions.length}
                </Typography>

                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {q.question_text}
                </Typography>

                {q.audio_url && (
                    <audio controls style={{ marginBottom: '1rem' }}>
                        <source src={q.audio_url} type="audio/mpeg" />
                        مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
                    </audio>
                )}

                <RadioGroup
                    value={answers[current] ?? ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                >
                    {q.options.map((opt, i) => (
                        <FormControlLabel
                            key={i}
                            value={i}
                            control={<Radio />}
                            label={opt}
                        />
                    ))}
                </RadioGroup>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button onClick={handlePrev} disabled={current === 0}>
                        قبلی
                    </Button>
                    <Button onClick={handleNext} disabled={current === questions.length - 1}>
                        بعدی
                    </Button>
                </Box>

                {!submitted && current === questions.length - 1 && (
                    <Button variant="contained" sx={{ mt: 3 }} onClick={handleSubmit}>
                        ارسال پاسخ‌ها
                    </Button>
                )}

                {submitted && (
                    <>
                        <Typography variant="h6" color="success.main" sx={{ mt: 4 }}>
                            امتیاز شما: {score} از {questions.length}
                        </Typography>

                        {!feedbackSent && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle1">بازخورد شما درباره این آزمون:</Typography>
                                <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <Button key={r} onClick={() => setFeedbackRating(r)}>
                                            {'⭐'.repeat(r)}
                                        </Button>
                                    ))}
                                </Box>
                                <TextField
                                    fullWidth
                                    label="یادداشت دلخواه (اختیاری)"
                                    multiline
                                    rows={2}
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                />
                                <Button
                                    variant="outlined"
                                    sx={{ mt: 2 }}
                                    onClick={handleSubmitFeedback}
                                >
                                    ثبت بازخورد
                                </Button>
                            </Box>
                        )}

                        {feedbackSent && (
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                🙏 با تشکر از بازخورد شما!
                            </Typography>
                        )}
                    </>
                )}
            </Container>
        </StudentAppWrapper>
    )
}
