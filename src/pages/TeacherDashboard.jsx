import React, { useEffect, useState } from 'react'
import {
    Box, Container, Typography, Paper, TableContainer, Table,
    TableHead, TableBody, TableRow, TableCell, Chip
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherAppWrapper from '../TeacherAppWrapper'
import moment from 'moment-jalaali'

export default function TeacherDashboard() {
    const [summary, setSummary] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('results')
                .select('assignment_id, finished, score, created_at, students(username), assignments(title)')
                .order('created_at', { ascending: false })

            if (error || !data) return

            const grouped = {}

            data.forEach((r) => {
                const key = r.assignment_id
                if (!grouped[key]) {
                    grouped[key] = {
                        assignment_id: r.assignment_id,
                        title: r.assignments?.title || '---',
                        totalAttempts: 0,
                        finishedCount: 0,
                        scores: [],
                        lastUpdated: r.created_at
                    }
                }

                grouped[key].totalAttempts += 1
                if (r.finished) grouped[key].finishedCount += 1
                if (typeof r.score === 'number') grouped[key].scores.push(r.score)

                if (r.created_at > grouped[key].lastUpdated) {
                    grouped[key].lastUpdated = r.created_at
                }
            })

            const summaryArray = Object.values(grouped).map((item) => ({
                ...item,
                avgScore:
                    item.scores.length > 0
                        ? Math.round(item.scores.reduce((a, b) => a + b, 0) / item.scores.length)
                        : '—'
            }))

            setSummary(summaryArray)
        }

        fetchData()
    }, [])

    return (
        <TeacherAppWrapper>
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', py: 8 }}>
                <Container maxWidth="lg" dir="rtl">
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        📊 داشبورد کلاس
                    </Typography>

                    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                        {summary.length === 0 ? (
                            <Typography>هیچ داده‌ای برای نمایش وجود ندارد.</Typography>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>تمرین</TableCell>
                                            <TableCell align="center">تعداد دانش‌آموز</TableCell>
                                            <TableCell align="center">تعداد ارسال شده</TableCell>
                                            <TableCell align="center">میانگین نمره</TableCell>
                                            <TableCell align="center">آخرین فعالیت</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {summary.map((row) => (
                                            <TableRow key={row.assignment_id}>
                                                <TableCell>{row.title}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row.totalAttempts}
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row.finishedCount}
                                                        color="success"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {typeof row.avgScore === 'number' ? `${row.avgScore}%` : '—'}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {moment(row.lastUpdated).format('jYYYY/jMM/jDD')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Container>
            </Box>
        </TeacherAppWrapper>
    )
}
