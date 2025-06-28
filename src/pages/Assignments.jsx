import React, { useEffect, useState } from 'react'
import {
    Typography, Box, TextField, Button, FormControl,
    InputLabel, Select, MenuItem, IconButton, Grid
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function Assignments() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState('')
    const [classroom, setClassroom] = useState('')
    const [classrooms, setClassrooms] = useState([])
    const [questions, setQuestions] = useState([
        { text: '', options: ['', '', '', ''], correctIndex: 0 }
    ])

    useEffect(() => {
        fetchClassrooms()
    }, [])

    const fetchClassrooms = async () => {
        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id

        const { data } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherId)

        setClassrooms(data || [])
    }

    const handleQuestionChange = (i, key, value) => {
        const updated = [...questions]
        if (key === 'text') updated[i].text = value
        else if (key === 'correctIndex') updated[i].correctIndex = parseInt(value)
        else updated[i].options[key] = value
        setQuestions(updated)
    }

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }])
    }

    const removeQuestion = (i) => {
        const updated = [...questions]
        updated.splice(i, 1)
        setQuestions(updated)
    }

    const handleSubmit = async () => {
        const { data: session } = await supabase.auth.getUser()
        const teacherId = session.user.id

        const { data, error } = await supabase.from('assignments').insert([
            { title, description, deadline, classroom, teacher_id: teacherId }
        ]).select()

        if (error) {
            alert('خطا در ذخیره‌سازی آزمون')
            return
        }

        const assignmentId = data[0].id

        const formatted = questions.map(q => ({
            assignment_id: assignmentId,
            question_text: q.text,
            options: q.options,
            correct_index: q.correctIndex
        }))

        await supabase.from('questions').insert(formatted)

        setTitle('')
        setDescription('')
        setDeadline('')
        setClassroom('')
        setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0 }])
        alert('آزمون با موفقیت ذخیره شد ✅')
    }

    return (
        <TeacherLayout>
            <Typography variant="h6" gutterBottom>ایجاد آزمون</Typography>

            <Box sx={{ mb: 3 }}>
                <TextField label="عنوان" fullWidth margin="normal" value={title}
                    onChange={e => setTitle(e.target.value)} />
                <TextField label="توضیحات" fullWidth margin="normal" value={description}
                    onChange={e => setDescription(e.target.value)} />
                <TextField label="مهلت ارسال" type="date" fullWidth margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={deadline} onChange={e => setDeadline(e.target.value)} />
                <FormControl fullWidth margin="normal">
                    <InputLabel>کلاس</InputLabel>
                    <Select value={classroom} onChange={e => setClassroom(e.target.value)}>
                        {classrooms.map(cls => (
                            <MenuItem key={cls.name} value={cls.name}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>سوالات:</Typography>
            {questions.map((q, i) => (
                <Box key={i} sx={{ border: '1px solid #ccc', p: 2, mb: 2, borderRadius: 2 }}>
                    <TextField
                        label={`متن سوال ${i + 1}`}
                        fullWidth margin="dense"
                        value={q.text}
                        onChange={e => handleQuestionChange(i, 'text', e.target.value)}
                    />
                    <Grid container spacing={2}>
                        {[0, 1, 2, 3].map(j => (
                            <Grid item xs={6} key={j}>
                                <TextField
                                    label={`گزینه ${j + 1}`}
                                    fullWidth margin="dense"
                                    value={q.options[j]}
                                    onChange={e => handleQuestionChange(i, j, e.target.value)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>گزینه صحیح</InputLabel>
                        <Select
                            value={q.correctIndex}
                            label="گزینه صحیح"
                            onChange={e => handleQuestionChange(i, 'correctIndex', e.target.value)}
                        >
                            {q.options.map((opt, idx) => (
                                <MenuItem key={idx} value={idx}>{`گزینه ${idx + 1}`}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeQuestion(i)}
                        sx={{ mt: 1 }}
                        startIcon={<Delete />}
                    >
                        حذف سوال
                    </Button>
                </Box>
            ))}
            <Button
                variant="outlined"
                onClick={addQuestion}
                startIcon={<Add />}
                sx={{ mb: 3 }}
            >
                افزودن سوال جدید
            </Button>

            <Button variant="contained" onClick={handleSubmit}>
                ذخیره آزمون
            </Button>
        </TeacherLayout>
    )
}
