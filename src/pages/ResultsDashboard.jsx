import React, { useEffect, useState } from 'react'
import {
    Typography, Container, MenuItem, Select, InputLabel, FormControl,
    List, ListItem, ListItemText, Divider
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
        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id

        const { data } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherId)

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
                <Typography variant="h6" gutterBottom>نتایج آزمون‌ها</Typography>

                <FormControl fullWidth sx={{ my: 2 }}>
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

                <List>
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
            </Container>
        </TeacherLayout>
    )
}
