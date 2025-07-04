import React, { useState, useEffect } from 'react'
import {
    Box, Typography, Paper, TextField, MenuItem,
    Button, Alert, Divider, FormControlLabel, Switch
} from '@mui/material'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterMomentJalaali } from '@mui/x-date-pickers/AdapterMomentJalaali'
import moment from 'moment-jalaali'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

moment.loadPersian({ dialect: 'persian-modern' })

export default function NewAssignmentForm() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [classroom, setClassroom] = useState('')
    const [dueDate, setDueDate] = useState(null)
    const [maxAttempts, setMaxAttempts] = useState(1)
    const [isActive, setIsActive] = useState(false)
    const [message, setMessage] = useState('')
    const [classrooms, setClassrooms] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const load = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id

            const { data: studentClassrooms } = await supabase
                .from('students')
                .select('classroom')
                .eq('teacher_id', uid)

            const unique = [...new Set((studentClassrooms || []).map(s => s.classroom))]
            setClassrooms(unique)
        }
        load()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        const { data: auth } = await supabase.auth.getUser()
        const uid = auth?.user?.id

        const { data: classroomExists } = await supabase
            .from('classrooms')
            .select('*')
            .eq('name', classroom)
            .eq('teacher_id', uid)
            .single()

        if (!classroomExists) {
            const { error: classError } = await supabase
                .from('classrooms')
                .insert([{ name: classroom, teacher_id: uid }])
            if (classError) {
                setMessage('❌ خطا در ایجاد کلاس')
                setLoading(false)
                return
            }
        }

        const { data, error } = await supabase.from('assignments').insert([{
            title,
            classroom,
            teacher_id: uid,
            description,
            type: 'quiz',
            max_attempts: Number(maxAttempts),
            due_at: dueDate ? dueDate.toDate().toISOString() : null,
            is_active: isActive,
            created_at: new Date().toISOString()
        }])

        if (error) {
            console.error('assignment insert error:', error)
            setMessage('❌ خطا در ثبت تکلیف')
            setLoading(false)
        } else {
            setMessage('✅ تکلیف ثبت شد')
            const newId = data?.[0]?.id
            setTimeout(() => {
                if (newId) {
                    navigate(`/add-questions?assignmentId=${newId}`)
                } else {
                    navigate('/teacher-assignments-list')
                }
            }, 1000)
        }
    }

    return (
        <Box dir="rtl" sx={{ maxWidth: 700, mx: 'auto', py: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                📝 ساخت تکلیف جدید
            </Typography>
            <Paper sx={{
                p: 3,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                color: '#fff'
            }}>
                <TextField
                    label="عنوان تکلیف"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="توضیحات"
                    fullWidth
                    multiline
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="کلاس"
                    fullWidth
                    select
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    sx={{ mb: 2 }}
                >
                    {classrooms.map((c, i) => (
                        <MenuItem key={i} value={c}>{c}</MenuItem>
                    ))}
                    {classroom && !classrooms.includes(classroom) && (
                        <MenuItem value={classroom}>{`➕ ایجاد کلاس جدید: ${classroom}`}</MenuItem>
                    )}
                </TextField>

                <LocalizationProvider dateAdapter={AdapterMomentJalaali}>
                    <DatePicker
                        label="تاریخ تحویل (تقویم شمسی)"
                        value={dueDate}
                        onChange={(newDate) => setDueDate(newDate)}
                        renderInput={(params) => (
                            <TextField {...params} fullWidth sx={{ mb: 2 }} />
                        )}
                    />
                </LocalizationProvider>

                <TextField
                    label="حداکثر تلاش"
                    type="number"
                    fullWidth
                    inputProps={{ min: 1, max: 10 }}
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <FormControlLabel
                    control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                    label="فعال‌سازی این تکلیف برای دانش‌آموزان"
                />

                {message && (
                    <Alert
                        severity={message.includes('✅') ? 'success' : 'error'}
                        sx={{ my: 2 }}
                    >
                        {message}
                    </Alert>
                )}

                <Divider sx={{ my: 2 }} />
                <Button
                    variant="contained"
                    disabled={loading || !title || !classroom}
                    onClick={handleSave}
                >
                    {loading ? 'در حال ذخیره...' : 'ثبت نهایی تکلیف'}
                </Button>
            </Paper>
        </Box>
    )
}
