import React, { useEffect, useState } from 'react'
import {
    Container, Typography, FormControl, InputLabel, Select,
    MenuItem, Paper, Table, TableHead, TableRow, TableCell, TableBody,
    Box, LinearProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'

export default function TeacherAnalytics() {
    const [classrooms, setClassrooms] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchClassrooms()
    }, [])

    useEffect(() => {
        if (selectedClass) fetchResults()
    }, [selectedClass])

    const fetchClassrooms = async () => {
        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id

        const { data } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherId)

        setClassrooms(data || [])
    }

    const fetchResults = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('results')
            .select('*')
            .eq('classroom', selectedClass)
        setResults(data || [])
        setLoading(false)
    }

    const getTopPerformers = () => {
        const grouped = {}

        results.forEach((r) => {
            if (!grouped[r.username]) grouped[r.username] = { total: 0, attempts: 0 }
            grouped[r.username].total += r.score
            grouped[r.username].attempts += 1
        })

        const leaderboard = Object.entries(grouped).map(([user, stats]) => ({
            username: user,
            avg: stats.total / stats.attempts
        }))

        return leaderboard.sort((a, b) => b.avg - a.avg).slice(0, 5)
    }

    const classroomAverage = () => {
        if (!results.length) return 0
        const total = results.reduce((sum, r) => sum + r.score, 0)
        return (total / results.length).toFixed(2)
    }

    return (
        <Container dir="rtl" sx={{ mt: { xs: 6, md: 1 } }}>
            <Box
                dir="rtl"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    transform: 'translateX(250px)',
                    mt: -2
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                        📊 داشبورد تحلیلی کلاس
                    </Typography>
                </Box>

                <FormControl fullWidth sx={{ my: 3 }}>
                    <InputLabel>کلاس</InputLabel>
                    <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {classrooms.map(cls => (
                            <MenuItem key={cls.name} value={cls.name}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {loading ? (
                    <LinearProgress />
                ) : (
                    <>
                        <Paper
                            sx={{
                                p: 3,
                                mb: 4,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff'
                            }}
                        >
                            <Typography variant="h6">
                                میانگین نمرات کلاس: {classroomAverage()}
                            </Typography>
                        </Paper>

                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff'
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                🔝 ۵ دانش‌آموز برتر
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">ردیف</TableCell>
                                        <TableCell align="center">نام کاربری</TableCell>
                                        <TableCell align="center">میانگین نمره</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getTopPerformers().map((s, idx) => (
                                        <TableRow key={s.username}>
                                            <TableCell align="center">{idx + 1}</TableCell>
                                            <TableCell align="center">{s.username}</TableCell>
                                            <TableCell align="center">{s.avg.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </>
                )}
            </Box>
        </Container>
    )
}
