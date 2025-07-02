import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Avatar, Chip, Divider, FormControl, InputLabel, Select, MenuItem, Button, LinearProgress
} from '@mui/material'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import StudentAppWrapper from '../layouts/StudentAppWrapper'
import { supabase } from '../supabaseClient'
import moment from 'moment-jalaali'
import { useNavigate } from 'react-router-dom'

export default function StudentResultsHistory() {
    const [results, setResults] = useState([])
    const [filter, setFilter] = useState('all')
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) setStudent(JSON.parse(saved))
        else navigate('/student-login')
    }, [navigate])

    useEffect(() => {
        const fetchResults = async () => {
            const { data, error } = await supabase
                .from('results')
                .select('score, time_taken, finished, created_at, assignments(title, type)')
                .order('created_at', { ascending: false })

            console.log('Fetched results:', data, error)
            setResults(data || [])
        }

        fetchResults()
    }, [])

    const filtered = results.filter(r => {
        if (filter === 'all') return true
        if (filter === 'finished') return r.finished
        if (filter === 'ongoing') return !r.finished
        return true
    })

    if (!student) return <LinearProgress sx={{ mt: 10 }} />

    return (
        <StudentAppWrapper student={student}>
            <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
                <Container dir="rtl" maxWidth="md">
                    <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                        تاریخچه نتایج
                    </Typography>

                    <FormControl sx={{ mb: 2, minWidth: 180 }}>
                        <InputLabel id="filter-label">نمایش</InputLabel>
                        <Select
                            labelId="filter-label"
                            value={filter}
                            label="نمایش"
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <MenuItem value="all">همه</MenuItem>
                            <MenuItem value="finished">تمام شده</MenuItem>
                            <MenuItem value="ongoing">در حال انجام</MenuItem>
                        </Select>
                    </FormControl>

                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                        {filtered.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Typography variant="h6" gutterBottom>📭 هنوز نتیجه‌ای ثبت نشده است</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    وقتی تمرینی را کامل کنید، نمرات شما در اینجا نمایش داده می‌شود.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    sx={{ mt: 3 }}
                                    onClick={() => navigate('/student-assignments')}
                                >
                                    مشاهده تمرین‌ها
                                </Button>
                            </Box>
                        ) : (
                            <List>
                                {filtered.map((r, index) => {
                                    const minutes = Math.floor(r.time_taken / 60) || 0
                                    const seconds = r.time_taken % 60 || 0
                                    const scoreColor = r.score >= 80 ? 'success' : r.score >= 50 ? 'warning' : 'error'

                                    return (
                                        <React.Fragment key={index}>
                                            <ListItem>
                                                <Avatar sx={{ bgcolor: '#4f46e5', ml: 2 }}>
                                                    {r.assignments?.type === 'game'
                                                        ? <SportsEsportsIcon />
                                                        : <AssignmentTurnedInIcon />}
                                                </Avatar>
                                                <ListItemText
                                                    primary={r.assignments?.title || '---'}
                                                    secondary={`⏱ زمان: ${minutes}:${seconds
                                                        .toString()
                                                        .padStart(2, '0')} — 📅 تاریخ: ${moment(r.created_at).format('jYYYY/jMM/jDD')}`}
                                                />
                                                <Chip label={`${r.score}%`} color={scoreColor} />
                                            </ListItem>
                                            {index < filtered.length - 1 && <Divider sx={{ my: 1 }} />}
                                        </React.Fragment>
                                    )
                                })}
                            </List>
                        )}
                    </Paper>
                </Container>
            </Box>
        </StudentAppWrapper>
    )
}
