// TopScorers.jsx
import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Paper, List, ListItem, ListItemText,
    Chip, Divider, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'
import moment from 'moment-jalaali'

export default function TopScorers() {
    const [scores, setScores] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTopScores = async () => {
            const { data, error } = await supabase
                .from('student_game_status')
                .select('score, completed_at, student_id, students(name)')
                .order('score', { ascending: false })
                .limit(20)

            if (error) console.error(error)
            setScores(data || [])
            setLoading(false)
        }

        fetchTopScores()
    }, [])

    if (loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <TeacherLayout>
            <Box dir="rtl" sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🏆 برترین نمرات
                </Typography>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    {scores.length === 0 ? (
                        <Typography color="text.secondary">📭 هنوز نمره‌ای ثبت نشده</Typography>
                    ) : (
                        <List>
                            {scores.map((s, i) => (
                                <React.Fragment key={i}>
                                    <ListItem>
                                        <ListItemText
                                            primary={s.students?.name || s.student_id}
                                            secondary={`📅 ${moment(s.completed_at).format('jYYYY/jMM/jDD')}`}
                                        />
                                        <Chip label={`${s.score}%`} color={s.score >= 80 ? 'success' : s.score >= 50 ? 'warning' : 'error'} />
                                    </ListItem>
                                    {i < scores.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>
        </TeacherLayout>
    )
}
