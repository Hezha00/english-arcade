import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Chip, Divider, Button, LinearProgress
} from '@mui/material'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { supabase } from '../supabaseClient'
import moment from 'moment-jalaali'
import { useNavigate } from 'react-router-dom'

export default function StudentResultsHistory() {
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
            const { data } = await supabase
                .from('student_game_status')
                .select('score, completed_at, game:games(name)')
                .eq('student_id', student.id)
                .order('completed_at', { ascending: false })
            setResults(data || [])
        }
        fetchResults()
    }, [student])

    if (!student) return <LinearProgress sx={{ mt: 10 }} />

    // After fetching results, calculate average score
    const allScores = results.map(r => r.score)
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

    return (
        <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
            <Container dir="rtl" maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh' }}>
                <Paper sx={{
                    p: 6,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.20)',
                    backdropFilter: 'blur(8px)',
                    color: '#222',
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: 3,
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography variant="h4" fontWeight="bold" color="#222" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                        تاریخچه بازی‌ها
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
                                میانگین امتیاز کل بازی‌ها: {avgScore}%
                            </Typography>
                            <List sx={{ width: '100%' }}>
                                {results.slice(0, 20).map((r, index) => {
                                    const scoreColor = r.score >= 80 ? 'success' : r.score >= 50 ? 'warning' : 'error'
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
                                                    sx={{ mr: 2 }}
                                                />
                                                <Chip label={`${r.score}%`} color={scoreColor} />
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
        </Box>
    )
}
