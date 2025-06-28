import React, { useEffect, useState } from 'react'
import {
    Container, Typography, TextField, Button, FormControl,
    InputLabel, Select, MenuItem, Box, Paper, Alert
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function CreateAssignment() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [classrooms, setClassrooms] = useState([])
    const [selectedClassroom, setSelectedClassroom] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState(false)

    useEffect(() => {
        fetchClassrooms()
    }, [])

    const fetchClassrooms = async () => {
        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id

        const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherId)

        if (error) console.error(error)
        else setClassrooms(data)
    }

    const handleSubmit = async () => {
        if (!title || !selectedClassroom) {
            setError(true)
            setMessage('عنوان و کلاس الزامی هستند.')
            return
        }

        const { error } = await supabase.from('assignments').insert([
            {
                title,
                description,
                due_date: dueDate,
                classroom: selectedClassroom
            }
        ])

        if (error) {
            setMessage('خطایی رخ داد.')
            setError(true)
        } else {
            setMessage('تمرین با موفقیت ایجاد شد ✅')
            setError(false)
            setTitle('')
            setDescription('')
            setDueDate('')
            setSelectedClassroom('')
        }
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" maxWidth="sm" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        ایجاد تمرین جدید
                    </Typography>

                    <TextField
                        label="عنوان تمرین"
                        fullWidth
                        margin="normal"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <TextField
                        label="توضیحات (اختیاری)"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <TextField
                        label="تاریخ تحویل (اختیاری)"
                        fullWidth
                        type="date"
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>کلاس</InputLabel>
                        <Select
                            value={selectedClassroom}
                            onChange={(e) => setSelectedClassroom(e.target.value)}
                        >
                            {classrooms.map((cls) => (
                                <MenuItem key={cls.id} value={cls.name}>
                                    {cls.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {message && (
                        <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2 }}>
                            {message}
                        </Alert>
                    )}

                    <Box sx={{ mt: 3 }}>
                        <Button variant="contained" fullWidth onClick={handleSubmit}>
                            ثبت تمرین
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </TeacherLayout>
    )
}
