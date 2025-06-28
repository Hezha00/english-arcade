import React, { useEffect, useState } from 'react'
import {
    Container, Typography, List, ListItem, ListItemText,
    Divider, Box, FormControl, InputLabel, Select, MenuItem,
    Paper
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function TeacherFeedbackDashboard() {
    const [classrooms, setClassrooms] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [feedbackList, setFeedbackList] = useState([])

    useEffect(() => {
        fetchClassrooms()
    }, [])

    useEffect(() => {
        if (selectedClass) fetchFeedback()
    }, [selectedClass])

    const fetchClassrooms = async () => {
        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id

        const { data } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherId)

        setClassrooms(data || [])
    }

    const fetchFeedback = async () => {
        const { data } = await supabase
            .from('feedback')
            .select('*')
            .eq('classroom', selectedClass)
            .order('submitted_at', { ascending: false })

        setFeedbackList(data || [])
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    بازخوردهای دانش‌آموزان درباره آزمون‌ها
                </Typography>

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

                <Paper variant="outlined" sx={{ p: 2 }}>
                    <List>
                        {feedbackList.map((f) => (
                            <React.Fragment key={f.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {f.username}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {[...Array(f.rating)].map((_, i) => (
                                                        <StarIcon key={i} sx={{ color: '#ffc107' }} />
                                                    ))}
                                                    <Typography variant="caption">({f.rating})</Typography>
                                                </Box>
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                {f.comment && (
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {f.comment}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(f.submitted_at).toLocaleDateString('fa-IR')}
                                                </Typography>
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