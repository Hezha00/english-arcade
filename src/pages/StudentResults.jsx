
import StudentAppWrapper from '../layouts/StudentAppWrapper'

import React, { useEffect, useState } from 'react'
import { Container, Typography, List, ListItem, ListItemText, Divider } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function StudentResults() {
    const [results, setResults] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const student = JSON.parse(localStorage.getItem('student'))
        if (!student) navigate('/student-login')
        else fetchResults(student.username)
    }, [])

    const fetchResults = async (username) => {
        const { data } = await supabase
            .from('results')
            .select('*')
            .eq('username', username)
            .order('submitted_at', { ascending: false })

        setResults(data || [])
    }

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>نتایج آزمون‌های شما</Typography>

                <List>
                    {results.map(res => (
                        <React.Fragment key={res.id}>
                            <ListItem>
                                <ListItemText
                                    primary={`نمره: ${res.score} از ${res.total}`}
                                    secondary={`کلاس: ${res.classroom} | تاریخ: ${new Date(res.submitted_at).toLocaleDateString('fa-IR')}`}
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
