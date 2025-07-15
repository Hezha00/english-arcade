import React, { useEffect, useState } from 'react'
import {
    Container, Typography, FormControl, InputLabel, Select,
    MenuItem, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    Box, LinearProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'

// To adjust the heading text, pass a 'title' prop to <TeacherAnalytics title="Your Custom Title" />
export default function TeacherAnalytics({ title = '📊 داشبورد تحلیلی کلاس' }) {
    const [classrooms, setClassrooms] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [gameResults, setGameResults] = useState([])

    useEffect(() => {
        fetchClassrooms()
    }, [])

    useEffect(() => {
        if (selectedClass) fetchGameResults()
    }, [selectedClass])

    const fetchClassrooms = async () => {
        const { data: auth } = await supabase.auth.getUser()
        const teacherAuthId = auth?.user?.id

        const { data } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherAuthId)

        setClassrooms(data || [])
    }

    const fetchGameResults = async () => {
        setLoading(true)
        // Get all students in the selected class
        const { data: students } = await supabase
            .from('students')
            .select('id, name, username')
            .eq('classroom', selectedClass)
        if (!students) {
            setGameResults([])
            setLoading(false)
            return
        }
        const studentIds = students.map(s => s.id)
        // Fetch all game results for these students
        const { data: gameData } = await supabase
            .from('student_game_status')
            .select('student_id, game_id, score, completed_at, game_name')
            .in('student_id', studentIds)
            .order('completed_at', { ascending: false })
        // Join with student info
        const resultsWithNames = (gameData || []).map(r => {
            const student = students.find(s => s.id === r.student_id)
            return {
                ...r,
                student_name: student?.name || student?.username || '---',
                username: student?.username || '---',
                full_name: student?.name || student?.username || '---',
            }
        })
        setGameResults(resultsWithNames)
        setLoading(false)
    }

    const getTopPerformers = () => {
        const grouped = {}
        gameResults.forEach((r) => {
            if (!grouped[r.student_name]) grouped[r.student_name] = { total: 0, attempts: 0 }
            grouped[r.student_name].total += r.score
            grouped[r.student_name].attempts += 1
        })
        const leaderboard = Object.entries(grouped).map(([name, stats]) => ({
            full_name: name,
            avg: stats.total / stats.attempts
        }))
        return leaderboard.sort((a, b) => b.avg - a.avg).slice(0, 5)
    }

    const classroomAverage = () => {
        if (!gameResults.length) return 0
        const total = gameResults.reduce((sum, r) => sum + r.score, 0)
        return (total / gameResults.length).toFixed(2)
    }

    return (
        <Container dir="rtl" maxWidth="md" sx={{ mt: { xs: 6, md: 4 }, mb: 6 }}>
            {/* Page title in standard teacher-side style */}
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                {title}
            </Typography>
            <Box
                dir="rtl"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <FormControl fullWidth sx={{ my: 3, maxWidth: 400 }}>
                    <InputLabel id="classroom-select-label" htmlFor="classroom-select">کلاس</InputLabel>
                    <Select
                        labelId="classroom-select-label"
                        id="classroom-select"
                        name="classroom"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        label="کلاس"
                        sx={{ fontSize: 18 }}
                    >
                        {classrooms.map(cls => (
                            <MenuItem key={cls.name} value={cls.name} sx={{ fontSize: 18 }}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {loading ? (
                    <LinearProgress sx={{ width: '100%', my: 4 }} />
                ) : (
                    <>
                        <Paper
                            sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.20)',
                                backdropFilter: 'blur(8px)',
                                color: '#222',
                                width: '100%',
                                maxWidth: 800,
                                boxShadow: 3,
                            }}
                        >
                            <Typography variant="h6" sx={{ fontSize: 22, mb: 2 }}>
                                میانگین نمرات کلاس: <b>{classroomAverage()}</b>
                            </Typography>
                            {gameResults.length === 0 && selectedClass && (
                                <Typography color="text.secondary" sx={{ mt: 2, fontSize: 18 }}>
                                    هیچ نتیجه‌ای برای این کلاس ثبت نشده است.
                                </Typography>
                            )}
                        </Paper>
                        <Paper
                            sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.20)',
                                backdropFilter: 'blur(8px)',
                                color: '#222',
                                width: '100%',
                                maxWidth: 800,
                                boxShadow: 3,
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                                🔝 ۵ دانش‌آموز برتر
                            </Typography>
                            <Table size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" sx={{ fontSize: 18 }}>ردیف</TableCell>
                                        <TableCell align="center" sx={{ fontSize: 18 }}>نام دانش‌آموز</TableCell>
                                        <TableCell align="center" sx={{ fontSize: 18 }}>میانگین نمره</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getTopPerformers().length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary', fontSize: 18 }}>
                                                هیچ دانش‌آموزی برای این کلاس ثبت نشده است.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        getTopPerformers().map((s, idx) => (
                                            <TableRow key={s.full_name}>
                                                <TableCell align="center" sx={{ fontSize: 18 }}>{idx + 1}</TableCell>
                                                <TableCell align="center" sx={{ fontSize: 18 }}>{s.full_name}</TableCell>
                                                <TableCell align="center" sx={{ fontSize: 18 }}>{s.avg.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', color: '#222', mt: 4, width: '100%', maxWidth: 800, boxShadow: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                                🎮 تاریخچه بازی‌های دانش‌آموزان این کلاس
                            </Typography>
                            <Table size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center" sx={{ fontSize: 18 }}>نام دانش‌آموز</TableCell>
                                        <TableCell align="center" sx={{ fontSize: 18 }}>نام بازی</TableCell>
                                        <TableCell align="center" sx={{ fontSize: 18 }}>امتیاز</TableCell>
                                        <TableCell align="center" sx={{ fontSize: 18 }}>تاریخ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {gameResults.length === 0 && selectedClass ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', fontSize: 18 }}>
                                                هیچ نتیجه‌ای برای این کلاس ثبت نشده است.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        gameResults.map((r, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell align="center" sx={{ fontSize: 18 }}>{r.student_name}</TableCell>
                                                <TableCell align="center" sx={{ fontSize: 18 }}>{r.game_name || '---'}</TableCell>
                                                <TableCell align="center" sx={{ fontSize: 18 }}>{r.score ?? '-'}</TableCell>
                                                <TableCell align="center" sx={{ fontSize: 18 }}>{r.completed_at ? new Date(r.completed_at).toLocaleDateString('fa-IR') : '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    </>
                )}
            </Box>
        </Container>
    )
}
