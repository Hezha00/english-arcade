import React, { useEffect, useState } from 'react'
import { Container, Typography, Box, List, ListItem, ListItemText, Divider } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function StudentProgress() {
    const [results, setResults] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const student = JSON.parse(localStorage.getItem('student'))
        if (!student) navigate('/student-login')
        else fetchResults(student)
    }, [])

    const fetchResults = async (student) => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        const { data } = await supabase
            .from('results')
            .select('*')
            .eq('student_id', student.id)
            .gte('submitted_at', weekAgo.toISOString())

        setResults(data || [])
    }

    const totalScore = results.reduce((sum, r) => sum + r.score, 0)

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>پیشرفت هفتگی شما</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    مجموع امتیاز این هفته: {totalScore}
                </Typography>

                <List>
                    {results.map(res => (
                        <React.Fragment key={res.id}>
                            <ListItem>
                                <ListItemText
                                    primary={`نمره: ${res.score} / ${res.total}`}
                                    secondary={`تاریخ: ${new Date(res.submitted_at).toLocaleDateString('fa-IR')}`}
                                    sx={{ textAlign: 'right' }}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Container>
        </StudentAppWrapper>
    )
}
