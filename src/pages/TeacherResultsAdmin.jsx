import React, { useEffect, useState } from 'react'
import {
    Container, Typography, FormControl, InputLabel, Select,
    MenuItem, List, ListItem, ListItemText, IconButton, Divider, Button, Box, Paper
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function TeacherResultsAdmin() {
    const [classrooms, setClassrooms] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [results, setResults] = useState([])

    useEffect(() => {
        fetchClassrooms()
    }, [])

    useEffect(() => {
        if (selectedClass) fetchResults()
    }, [selectedClass])

    const fetchClassrooms = async () => {
        const { data: auth } = await supabase.auth.getUser()
        const teacherAuthId = auth?.user?.id
        const { data } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherAuthId)

        setClassrooms(data || [])
    }

    const fetchResults = async () => {
        const { data } = await supabase
            .from('results')
            .select('*')
            .eq('classroom', selectedClass)
            .order('submitted_at', { ascending: false })

        setResults(data || [])
    }

    const handleDeleteResult = async (resultId) => {
        const confirmed = window.confirm('آیا از حذف این نتیجه مطمئن هستید؟')
        if (!confirmed) return

        const { error } = await supabase
            .from('results')
            .delete()
            .eq('id', resultId)

        if (!error) {
            setResults(results.filter((r) => r.id !== resultId))
        }
    }

    const handleResetStudent = async (studentId, username) => {
        const confirmed = window.confirm(`ریست کل امتیاز و نشان دانش‌آموز ${username}؟`)
        if (!confirmed) return

        const { error } = await supabase
            .from('students')
            .update({ total_score: 0, badge: null })
            .eq('id', studentId)

        if (!error) {
            alert('امتیاز با موفقیت ریست شد ✅')
        }
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>مدیریت نتایج دانش‌آموزان</Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>کلاس</InputLabel>
                    <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {classrooms.map(cls => (
                            <MenuItem key={cls.name} value={cls.name}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <List>
                    {results.map(r => (
                        <React.Fragment key={r.id}>
                            <ListItem
                                secondaryAction={
                                    <Box>
                                        <IconButton
                                            edge="end"
                                            title="حذف نتیجه"
                                            onClick={() => handleDeleteResult(r.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            title="ریست دانش‌آموز"
                                            onClick={() => handleResetStudent(r.student_id, r.username)}
                                        >
                                            <RestartAltIcon />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={`${r.username} — ${r.score} از ${r.total}`}
                                    secondary={`تاریخ: ${new Date(r.submitted_at).toLocaleDateString('fa-IR')}`}
                                    sx={{ textAlign: 'right' }}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Container>
        </TeacherLayout>
    )
}
