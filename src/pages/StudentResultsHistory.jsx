import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Avatar, Chip, Divider
} from '@mui/material'
import { supabase } from '../supabaseClient'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import StudentAppWrapper from '../layouts/StudentAppWrapper'


export default function StudentResultsHistory() {
    const [results, setResults] = useState([])

    useEffect(() => {
        const fetchResults = async () => {
            const student = JSON.parse(localStorage.getItem('student'))
            if (!student?.id) return

            const { data, error } = await supabase
                .from('results')
                .select('*, assignments(title, type)')
                .eq('student_id', student.id)
                .order('created_at', { ascending: false })

            if (!error) setResults(data)
        }

        fetchResults()
    }, [])

    return (
        <StudentAppWrapper>
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundImage: 'url("/bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    py: 8,
                    px: 2
                }}
            >
                <Container maxWidth="md" dir="rtl">
                    <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                        تاریخچه نتایج
                    </Typography>

                    <Paper sx={{ mt: 3, p: 3, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 4 }}>
                        <List>
                            {results.map((r, index) => {
                                const minutes = Math.floor(r.time_taken / 60)
                                const seconds = r.time_taken % 60
                                const scoreColor =
                                    r.score >= 80 ? 'success' : r.score >= 50 ? 'warning' : 'error'

                                return (
                                    <React.Fragment key={r.id || index}>
                                        <ListItem alignItems="center">
                                            <Avatar sx={{ bgcolor: '#4f46e5', ml: 2 }}>
                                                {r.assignments?.type === 'game'
                                                    ? <SportsEsportsIcon />
                                                    : <AssignmentTurnedInIcon />}
                                            </Avatar>
                                            <ListItemText
                                                primary={r.assignments?.title || 'بدون عنوان'}
                                                secondary={`زمان: ${minutes}:${seconds
                                                    .toString()
                                                    .padStart(2, '0')} دقیقه — تاریخ: ${new Date(
                                                        r.created_at
                                                    ).toLocaleDateString('fa-IR')}`}
                                            />
                                            <Chip label={`${r.score}%`} color={scoreColor} sx={{ fontWeight: 600 }} />
                                        </ListItem>
                                        {index < results.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </React.Fragment>
                                )
                            })}
                            {results.length === 0 && (
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    هیچ نتیجه‌ای ثبت نشده است.
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Container>
            </Box>
        </StudentAppWrapper>
    )
}
