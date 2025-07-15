import React, { useEffect, useState } from 'react'
import {
    Typography, Container, MenuItem, Select, InputLabel, FormControl,
    List, ListItem, ListItemText, Divider, Box
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function ResultsDashboard() {
    const [results, setResults] = useState([])
    const [classrooms, setClassrooms] = useState([])
    const [selectedClass, setSelectedClass] = useState('')

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

    return (
        <TeacherLayout>
            <Container dir="rtl">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>نتایج آزمون‌ها</Typography>
                    <FormControl fullWidth sx={{ my: 2, maxWidth: 400 }}>
                        <InputLabel>انتخاب کلاس</InputLabel>
                        <Select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            {classrooms.map((c) => (
                                <MenuItem key={c.name} value={c.name}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <List sx={{ maxWidth: 800, width: '100%' }}>
                        {results.map((r) => (
                            <React.Fragment key={r.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={`${r.username} - نمره: ${r.score} / ${r.total}`}
                                        secondary={`کلاس: ${r.classroom} | تاریخ: ${new Date(r.submitted_at).toLocaleDateString('fa-IR')}`}
                                        sx={{ textAlign: 'right' }}
                                    />
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            </Container>
        </TeacherLayout>
    )
}
