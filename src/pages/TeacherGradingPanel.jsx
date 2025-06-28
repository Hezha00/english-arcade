import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem, ListItemText,
    Divider, TextField, Button, Box
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function TeacherGradingPanel() {
    const [submissions, setSubmissions] = useState([])

    useEffect(() => {
        fetchSubmissions()
    }, [])

    const fetchSubmissions = async () => {
        const { data } = await supabase
            .from('essay_submissions')
            .select('*')
            .order('submitted_at', { ascending: false })

        setSubmissions(data || [])
    }

    const handleGrade = async (id, idx) => {
        const submission = submissions[idx]
        const { error } = await supabase
            .from('essay_submissions')
            .update({
                teacher_score: submission.tempScore,
                teacher_comment: submission.tempComment
            })
            .eq('id', id)

        if (!error) {
            alert('نمره ثبت شد ✅')
            fetchSubmissions()
        }
    }

    const updateTempValue = (idx, field, value) => {
        const copy = [...submissions]
        copy[idx][field] = value
        setSubmissions(copy)
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    📝 تصحیح پاسخ‌های تشریحی
                </Typography>

                <Paper sx={{ mt: 3 }}>
                    <List>
                        {submissions.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <Typography fontWeight="bold">
                                                {s.username} — {s.assignment_title}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography sx={{ mt: 1, mb: 1 }}>
                                                    پاسخ دانش‌آموز: {s.answer_text}
                                                </Typography>

                                                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                                    <TextField
                                                        label="نمره (از ۱۰)"
                                                        type="number"
                                                        size="small"
                                                        value={s.tempScore ?? s.teacher_score ?? ''}
                                                        onChange={(e) => updateTempValue(idx, 'tempScore', e.target.value)}
                                                        sx={{ width: 100 }}
                                                    />
                                                    <TextField
                                                        label="نظر معلم"
                                                        size="small"
                                                        fullWidth
                                                        value={s.tempComment ?? s.teacher_comment ?? ''}
                                                        onChange={(e) => updateTempValue(idx, 'tempComment', e.target.value)}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => handleGrade(s.id, idx)}
                                                    >
                                                        ثبت نمره
                                                    </Button>
                                                </Box>
                                            </>
                                        }
                                    />
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            </Container>
        </TeacherLayout>
    )
}
