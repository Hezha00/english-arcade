// Use this updated version of AssignGame.jsx
import React, { useEffect, useState } from 'react'
import {
    Box, Typography, TextField, MenuItem, Button, Paper, Alert
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'
import dayjs from 'dayjs'

export default function AssignGame() {
    const { gameId } = useParams()
    const [classrooms, setClassrooms] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [duration, setDuration] = useState('')
    const [maxRetries, setMaxRetries] = useState(1)
    const [deadline, setDeadline] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchClasses = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id

            const { data: students } = await supabase
                .from('students')
                .select('classroom')
                .eq('teacher_id', uid)

            const unique = [...new Set(students.map(s => s.classroom))]
            setClassrooms(unique)
        }

        fetchClasses()
    }, [])

    const handleAssign = async () => {
        const { data: auth } = await supabase.auth.getUser()
        const uid = auth?.user?.id

        const res = await supabase.from('games').insert([
            {
                name: gameId.replace('.html', ''),
                description: `برای کلاس ${selectedClass}`,
                file_url: `/games/${gameId}`,
                teacher_id: uid,
                classroom: selectedClass,
                is_global: false,
                created_at: new Date().toISOString(),
                duration_min: duration ? parseInt(duration) : null,
                max_retries: maxRetries ? parseInt(maxRetries) : null,
                expires_at: deadline || null
            }
        ])

        if (res.error) {
            setMessage('❌ ذخیره نشد')
        } else {
            setMessage('✅ بازی اختصاص داده شد')
            setTimeout(() => navigate('/teacher-games'), 1500)
        }
    }

    return (
        <TeacherLayout>
            <Box dir="rtl" sx={{ maxWidth: 500, mx: 'auto' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🎯 اختصاص بازی: {gameId}
                </Typography>

                <Paper sx={{ p: 3, mt: 2 }}>
                    <TextField
                        fullWidth
                        select
                        label="کلاس"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        {classrooms.map((c, i) => (
                            <MenuItem key={i} value={c}>{c}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="مدت بازی (دقیقه)"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="حداکثر دفعات تکرار"
                        type="number"
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="ضرب‌العجل"
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    {message && (
                        <Alert severity={message.includes('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
                            {message}
                        </Alert>
                    )}

                    <Button variant="contained" onClick={handleAssign} disabled={!selectedClass}>
                        ذخیره و اختصاص
                    </Button>
                </Paper>
            </Box>
        </TeacherLayout>
    )
}
