
import StudentAppWrapper from '../layouts/StudentAppWrapper'

import React, { useEffect, useState } from 'react'
import { Container, Typography, List, ListItem, ListItemText, Divider, Box, Button, Paper } from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import Chip from '@mui/material/Chip'
import moment from 'moment-jalaali'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

export default function StudentResults() {
    const [results, setResults] = useState([])
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()
    const [sort, setSort] = useState('desc') // 'desc', 'asc', 'teacher'

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
                    .from('game_results_with_names')
                    .select('score, completed_at, display_game_name, teacher_name, student_name')
                    .eq('student_id', student.id)
                    .order('completed_at', { ascending: false })
                if (error) {
                    console.error('Supabase error fetching results:', error)
                }
                setResults(data || [])
            } catch (err) {
                console.error('JS error fetching results:', err)
            }
        }
        fetchResults()
    }, [student])

    // Sorting logic
    const sortedResults = [...results].sort((a, b) => {
        if (sort === 'desc') return b.score - a.score
        if (sort === 'asc') return a.score - b.score
        if (sort === 'teacher') return (a.teacher_name || '').localeCompare(b.teacher_name || '')
        return 0
    })

    // After fetching results, calculate average score
    const allScores = results.map(r => r.score)
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh' }}>
                <Paper sx={{
                    p: 6,
                    bgcolor: 'rgba(255,255,255,0.20)',
                    color: '#222',
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: 3,
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(255,255,255,0.35)',
                }}>
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', mb: 3, color: '#222' }}>
                        نتایج بازی‌های شما
                    </Typography>
                    <FormControl sx={{ mb: 3, minWidth: 180 }} size="small">
                        <InputLabel id="sort-label">مرتب‌سازی بر اساس</InputLabel>
                        <Select
                            labelId="sort-label"
                            value={sort}
                            label="مرتب‌سازی بر اساس"
                            onChange={e => setSort(e.target.value)}
                        >
                            <MenuItem value="desc">امتیاز (بیشترین)</MenuItem>
                            <MenuItem value="asc">امتیاز (کمترین)</MenuItem>
                            <MenuItem value="teacher">نام معلم</MenuItem>
                        </Select>
                    </FormControl>
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
                            <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', color: '#222', fontWeight: 600 }}>
                                میانگین امتیاز کل بازی‌ها: {avgScore} از 20
                            </Typography>
                            <List sx={{ width: '100%' }}>
                                {sortedResults.slice(0, 20).map((r, index) => {
                                    let scoreColor = 'error';
                                    if (r.score >= 15) scoreColor = 'success';
                                    else if (r.score >= 10) scoreColor = 'warning';
                                    const date = r.completed_at
                                        ? moment(r.completed_at).format('jYYYY/jMM/jDD')
                                        : '---';
                                    return (
                                        <React.Fragment key={index}>
                                            <ListItem sx={{
                                                py: 3, px: 2, mb: 2, borderRadius: 3,
                                                bgcolor: 'rgba(255,255,255,0.35)',
                                                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                                                display: 'flex', alignItems: 'center',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid rgba(255,255,255,0.25)',
                                            }}>
                                                <SportsEsportsIcon style={{ marginLeft: 12, color: '#7c3aed', fontSize: 32 }} />
                                                <ListItemText
                                                    primary={<span style={{ fontWeight: 600, fontSize: 18, color: '#222' }}>{r.display_game_name || '---'}</span>}
                                                    secondary={<>
                                                        <span style={{ color: '#666', fontSize: 14 }}>{`📅 تاریخ: ${date}`}</span>
                                                        <span style={{ color: '#888', fontSize: 13, display: 'block', marginTop: 2 }}>👨‍🏫 معلم: {r.teacher_name || '---'}</span>
                                                    </>}
                                                    sx={{ mr: 2 }}
                                                />
                                                <Chip label={`${r.score} از 20`} color={scoreColor} sx={{ fontWeight: 'bold', fontSize: 16, color: '#fff', bgcolor: scoreColor === 'success' ? '#22c55e' : scoreColor === 'warning' ? '#fbbf24' : '#ef4444', minWidth: 90, textAlign: 'center' }} />
                                            </ListItem>
                                            {index < results.length - 1 && <Divider sx={{ my: 1 }} />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </>
                    )}
                </Paper>
            </Container>
        </StudentAppWrapper>
    )
}
