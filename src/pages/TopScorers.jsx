import React, { useEffect, useState } from 'react'
import {
    Typography, Container, FormControl, InputLabel, Select, MenuItem, List, ListItemText, ListItem, Divider
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function TopScorers() {
    const [classrooms, setClassrooms] = useState([])
    const [selected, setSelected] = useState('')
    const [leaders, setLeaders] = useState([])

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

    useEffect(() => {
        if (selected) fetchLeaders()
    }, [selected])

    const fetchLeaders = async () => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const { data } = await supabase
            .from('results')
            .select('*')
            .eq('classroom', selected)
            .gte('submitted_at', weekAgo.toISOString())

        const grouped = {}
        data.forEach(r => {
            if (!grouped[r.username]) grouped[r.username] = 0
            grouped[r.username] += r.score
        })

        const top = Object.entries(grouped)
            .map(([username, score]) => ({ username, score }))
            .sort((a, b) => b.score - a.score)

        setLeaders(top)
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>دانش‌آموزان برتر این هفته</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>کلاس</InputLabel>
                    <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
                        {classrooms.map(cls => (
                            <MenuItem key={cls.name} value={cls.name}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <List>
                    {leaders.map((s, i) => (
                        <React.Fragment key={i}>
                            <ListItem>
                                <ListItemText
                                    primary={`${i + 1}. ${s.username}`}
                                    secondary={`امتیاز هفتگی: ${s.score}`}
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
