
import StudentAppWrapper from '../layouts/StudentAppWrapper'

import React, { useEffect, useState } from 'react'
import { Container, Typography, List, ListItem, ListItemText, Divider, Box, Button, Paper } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import Chip from '@mui/material/Chip'
import moment from 'moment-jalaali'

export default function StudentResults() {
    const [results, setResults] = useState([])
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) setStudent(JSON.parse(saved))
        else navigate('/student-login')
    }, [navigate])

    useEffect(() => {
        const fetchResults = async () => {
            if (!student?.id) return
            try {
                const { data, error } = await supabase
                    .from('student_game_status')
                    .select('score, completed_at, game:games(name)')
                    .eq('student_id', student.id)
                    .order('completed_at', { ascending: false })
                if (error) {
                    console.error('Supabase error fetching results:', error)
                }
                setResults(data || [])
                console.log('Student object:', student)
                console.log('Fetched results:', data)
            } catch (err) {
                console.error('JS error fetching results:', err)
            }
        }
        fetchResults()
    }, [student])

    // After fetching results, calculate average score
    const allScores = results.map(r => r.score)
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh' }}>
                <Paper sx={{
                    p: 6,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    color: '#222',
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: 3,
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3, color: '#222' }}>
                        نتایج بازی‌های شما
                    </Typography>
                    {results.length === 0 ? (
                        <Box textAlign="center" py={4}>
                            <Typography variant="h6" gutterBottom>📭 هنوز نتیجه‌ای ثبت نشده</Typography>
                            <Typography variant="body2" color="text.secondary">
                                وقتی بازی‌ای را کامل کنید، امتیاز شما در اینجا نمایش داده می‌شود.
                            </Typography>
                            <Button
                                variant="outlined"
                                sx={{ mt: 3 }}
                                onClick={() => navigate('/student-games')}
                            >
                                بازی‌های قابل انجام
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" color="#4f46e5" sx={{ mb: 4, textAlign: 'center' }}>
                                میانگین امتیاز کل بازی‌ها: {avgScore} از 20
                            </Typography>
                            <List sx={{ width: '100%' }}>
                                {results.slice(0, 20).map((r, index) => {
                                    const scoreColor = r.score >= 16 ? 'success' : r.score >= 10 ? 'warning' : 'error'
                                    const date = r.completed_at
                                        ? moment(r.completed_at).format('jYYYY/jMM/jDD')
                                        : '---'
                                    return (
                                        <React.Fragment key={index}>
                                            <ListItem sx={{ py: 3, px: 2 }}>
                                                <SportsEsportsIcon style={{ marginLeft: 8, color: '#4f46e5' }} />
                                                <ListItemText
                                                    primary={r.game?.name || '---'}
                                                    secondary={`📅 تاریخ: ${date}`}
                                                    sx={{ mr: 2, color: '#222' }}
                                                />
                                                <Chip label={`${r.score} از 20`} color={scoreColor} sx={{ fontWeight: 'bold', fontSize: 16, color: '#fff', bgcolor: scoreColor === 'success' ? '#22c55e' : scoreColor === 'warning' ? '#f59e42' : '#ef4444' }} />
                                            </ListItem>
                                            {index < results.length - 1 && <Divider sx={{ my: 2 }} />}
                                        </React.Fragment>
                                    )
                                })}
                            </List>
                        </>
                    )}
                </Paper>
            </Container>
        </StudentAppWrapper>
    )
}
