import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Grid, Paper,
    CircularProgress, Chip, Button, Stack
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import StudentAppWrapper from '../layouts/StudentAppWrapper'
import moment from 'moment-jalaali'

export default function StudentAssignments() {
    const [assignments, setAssignments] = useState([])
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) setStudent(JSON.parse(saved))
        else navigate('/student-login')
    }, [navigate])

    useEffect(() => {
        const fetchData = async () => {
            if (!student) return

            // ✅ Step 1: Get active assignments for this student's classroom
            const { data: allAssignments } = await supabase
                .from('assignments')
                .select('id, title, due_at, type, classroom, created_at')
                .eq('classroom', student.classroom)
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            // ✅ Step 2: Get this student’s result records
            const { data: studentResults } = await supabase
                .from('results')
                .select('assignment_id, finished')
                .eq('student_id', student.id)

            const resultMap = {}
            studentResults?.forEach(r => {
                resultMap[r.assignment_id] = r.finished
            })

            const today = new Date()

            const processed = allAssignments?.map(a => {
                const deadline = a.due_at ? new Date(a.due_at) : null
                const expired = deadline ? deadline < today : false
                const finished = resultMap[a.id] || false

                return {
                    assignment_id: a.id,
                    title: a.title,
                    deadline,
                    type: a.type,
                    isExpired: expired,
                    isFinished: finished,
                    created_at: a.created_at,
                    dueColor: expired
                        ? 'error'
                        : deadline?.toDateString() === today.toDateString()
                            ? 'warning'
                            : 'success'
                }
            }) || []

            // Sort: unfinished and unexpired assignments first
            processed.sort((a, b) => {
                if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1
                return new Date(b.deadline || 0) - new Date(a.deadline || 0)
            })

            setAssignments(processed)
            setLoading(false)
        }

        fetchData()
    }, [student])

    if (!student) return null

    return (
        <StudentAppWrapper student={student}>
            <Box sx={{ background: 'url(/bg.png)', minHeight: '100vh', py: 8, px: 2 }}>
                <Container maxWidth="lg" dir="rtl">
                    <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                        تمرین‌های شما
                    </Typography>

                    {loading ? (
                        <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
                    ) : assignments.length === 0 ? (
                        <Typography mt={3}>📭 تمرینی برای نمایش وجود ندارد.</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {assignments.map((a) => (
                                <Grid item xs={12} sm={6} md={4} key={a.assignment_id}>
                                    <Paper sx={{ p: 3, borderRadius: 4, bgcolor: a.isExpired ? '#f1f1f1' : 'rgba(255,255,255,0.95)' }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {a.title}
                                        </Typography>
                                        <Stack direction="row" spacing={1} mb={1}>
                                            <Chip
                                                label={a.isFinished ? 'انجام شده' : a.isExpired ? 'پایان یافته' : 'در حال انجام'}
                                                color={a.isFinished ? 'success' : a.isExpired ? 'default' : 'warning'}
                                                size="small"
                                            />
                                            {a.deadline && (
                                                <Chip
                                                    label={`موعد: ${moment(a.deadline).format('jYYYY/jMM/jDD')}`}
                                                    color={a.dueColor}
                                                    size="small"
                                                />
                                            )}
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            نوع: {a.type === 'game' ? 'بازی' : 'آزمون'}
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            sx={{ mt: 2 }}
                                            disabled={a.isExpired}
                                            onClick={() =>
                                                navigate(a.type === 'game'
                                                    ? `/play-game?id=${a.assignment_id}`
                                                    : `/student-quiz/${a.assignment_id}`)
                                            }
                                        >
                                            {a.isFinished ? '📄 مشاهده مجدد' : '▶️ شروع'}
                                        </Button>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>
        </StudentAppWrapper>
    )
}
