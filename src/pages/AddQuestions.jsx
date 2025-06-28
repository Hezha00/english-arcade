import React, { useEffect, useState } from 'react'
import {
    Container, Typography, TextField, Button, FormControl, InputLabel,
    Select, MenuItem, Box, Paper, Radio, RadioGroup, FormControlLabel
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function AddQuestions() {
    const [assignments, setAssignments] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState(['', '', '', ''])
    const [correctIndex, setCorrectIndex] = useState('')
    const [audioUrl, setAudioUrl] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchAssignments()
    }, [])

    const fetchAssignments = async () => {
        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id
        const { data } = await supabase
            .from('assignments')
            .select('*')
            .eq('teacher_id', teacherId)

        setAssignments(data || [])
    }

    const handleSubmit = async () => {
        if (!selectedId || !questionText || correctIndex === '' || options.some((o) => !o)) {
            setMessage('همه گزینه‌ها و سؤال را وارد کنید.')
            return
        }

        await supabase.from('questions').insert([
            {
                assignment_id: selectedId,
                question_text: questionText,
                options,
                correct_index: parseInt(correctIndex),
                audio_url: audioUrl || null
            }
        ])

        setQuestionText('')
        setOptions(['', '', '', ''])
        setCorrectIndex('')
        setAudioUrl('')
        setMessage('سؤال اضافه شد ✅')
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" maxWidth="sm" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6">افزودن سؤال به تمرین</Typography>

                    <FormControl fullWidth sx={{ my: 2 }}>
                        <InputLabel>انتخاب تمرین</InputLabel>
                        <Select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            {assignments.map((a) => (
                                <MenuItem key={a.id} value={a.id}>{a.title}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="متن سؤال"
                        fullWidth
                        multiline
                        rows={2}
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                    />

                    {options.map((opt, i) => (
                        <TextField
                            key={i}
                            label={`گزینه ${i + 1}`}
                            fullWidth
                            margin="normal"
                            value={opt}
                            onChange={(e) => {
                                const copy = [...options]
                                copy[i] = e.target.value
                                setOptions(copy)
                            }}
                        />
                    ))}

                    <TextField
                        label="لینک صوتی (اختیاری)"
                        fullWidth
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        sx={{ mt: 2 }}
                    />

                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <Typography>گزینه صحیح:</Typography>
                        <RadioGroup
                            row
                            value={correctIndex}
                            onChange={(e) => setCorrectIndex(e.target.value)}
                        >
                            {options.map((_, i) => (
                                <FormControlLabel
                                    key={i}
                                    value={i.toString()}
                                    control={<Radio />}
                                    label={i + 1}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    {message && (
                        <Typography sx={{ color: 'green', mt: 2 }}>{message}</Typography>
                    )}

                    <Box sx={{ mt: 3 }}>
                        <Button variant="contained" fullWidth onClick={handleSubmit}>
                            افزودن سؤال
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </TeacherLayout>
    )
}
