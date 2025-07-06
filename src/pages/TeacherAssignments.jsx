import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Grid, Card, CardContent, Button, Chip, Stack
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function TeacherAssignments() {
    const navigate = useNavigate()
    const [assignments, setAssignments] = useState([])

    useEffect(() => {
        const load = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id

            const { data } = await supabase
                .from('assignments')
                .select('*, questions(count)')
                .eq('teacher_id', uid)
                .order('created_at', { ascending: false })

            setAssignments(data || [])
        }

        load()
    }, [])

    const grouped = assignments.reduce((acc, a) => {
        acc[a.classroom] = acc[a.classroom] || []
        acc[a.classroom].push(a)
        return acc
    }, {})

    return (
        <TeacherLayout>
            <Box dir="rtl">
                <Typography variant="h5" fontWeight="bold">📘 لیست تکالیف</Typography>

                <Button
                    variant="contained"
                    sx={{ mt: 2, mb: 3 }}
                    onClick={() => navigate('/add-assignment')}
                >
                    افزودن تکلیف جدید
                </Button>

                {Object.entries(grouped).map(([classroom, items]) => (
                    <Box key={classroom} sx={{ mb: 4 }}>
                        <Typography variant="h6">کلاس: {classroom}</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {items.map((a) => (
                                <Grid sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }} key={a.id}>
                                    <Card>
                                        <CardContent sx={{ textAlign: 'right' }}>
                                            <Typography fontWeight="bold">{a.title}</Typography>
                                            <Stack direction="row" spacing={1} mt={1} mb={1}>
                                                <Chip label={`سوالات: ${a.questions?.length || 0}`} size="small" />
                                                <Chip
                                                    label={a.is_active ? '✅ فعال' : '⛔️ غیرفعال'}
                                                    color={a.is_active ? 'success' : 'default'}
                                                    size="small"
                                                />
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                تاریخ ایجاد: {new Date(a.created_at).toLocaleDateString('fa-IR')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>
        </TeacherLayout>
    )
}
