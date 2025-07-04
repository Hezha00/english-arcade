import React, { useEffect, useState } from 'react'
import {
    Container, Typography, TextField, Button, FormControl, InputLabel,
    Select, MenuItem, Box, Paper, Radio, RadioGroup, FormControlLabel, Alert
} from '@mui/material'
import { supabase } from '../supabaseClient'

export default function AddQuestions() {
    const [assignments, setAssignments] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [lockedAssignment, setLockedAssignment] = useState(null)

    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState(['', '', '', ''])
    const [correctIndex, setCorrectIndex] = useState('')
    const [audioUrl, setAudioUrl] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState(false)

    useEffect(() => {
        fetchAssignments()
    }, [])

    useEffect(() => {
        const idFromURL = new URLSearchParams(window.location.search).get('assignmentId')
        if (idFromURL) {
            setSelectedId(idFromURL)
            setLockedAssignment(idFromURL)
        }
    }, [])

    const fetchAssignments = async () => {
        const { data: auth } = await supabase.auth.getUser()
        const uid = auth?.user?.id

        const { data, error } = await supabase
            .from('assignments')
            .select('id, title')
            .eq('teacher_id', uid)

        if (error) {
            console.error('Error loading assignments:', error)
        } else {
            setAssignments(data || [])
        }
    }

    const handleSubmit = async () => {
        const trimmedOptions = options.map(opt => opt.trim())

        if (!selectedId || !questionText.trim() || correctIndex === '' || trimmedOptions.some((o) => !o)) {
            setMessage('همه گزینه‌ها و متن سؤال الزامی هستند.')
            setError(true)
            return
        }

        const { error } = await supabase.from('questions').insert([{
            assignment_id: selectedId,
            question_text: questionText.trim(),
            options: trimmedOptions,
            correct_index: parseInt(correctIndex),
            audio_url: audioUrl.trim() || null
        }])

        if (error) {
            console.error('❌ Insert error:', error)
            setMessage('خطا در ذخیره سؤال.')
            setError(true)
            return
        }

        setQuestionText('')
        setOptions(['', '', '', ''])
        setCorrectIndex('')
        setAudioUrl('')
        setMessage('✅ سؤال با موفقیت اضافه شد')
        setError(false)
    }

    return (
        <Container dir="rtl" maxWidth="sm" sx={{ mt: 4 }}>
            <Paper
                sx={{
                    p: 4,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 4,
                    color: '#fff'
                }}
            >
                <Typography variant="h6" gutterBottom>
                    {lockedAssignment
                        ? 'افزودن سؤال به تمرین انتخاب‌شده'
                        : 'افزودن سؤال به تمرین'}
                </Typography>

                {!lockedAssignment && (
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
                )}

                {lockedAssignment && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        تمرین انتخاب‌شده: {assignments.find(a => a.id === selectedId)?.title || '...'}
                    </Typography>
                )}

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
                            const updated = [...options]
                            updated[i] = e.target.value
                            setOptions(updated)
                        }}
                    />
                ))}

                <TextField
                    label="لینک صوتی (اختیاری)"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
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
                    <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2 }}>
                        {message}
                    </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" fullWidth onClick={handleSubmit}>
                        افزودن سؤال
                    </Button>
                </Box>
            </Paper>
        </Container>
    )
}
