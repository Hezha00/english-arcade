import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem, ListItemText,
    Button, Divider, CircularProgress, Box, Grid
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { DatePicker } from 'zaman'

export default function AssignGame() {
    const { gameId } = useParams()
    const [classrooms, setClassrooms] = useState([])
    const [gameName, setGameName] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [loading, setLoading] = useState(true)
    const [teacherId, setTeacherId] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.id) setTeacherId(user.id)

            const { data: game } = await supabase
                .from('games')
                .select('name')
                .eq('id', gameId)
                .single()

            const { data: students } = await supabase
                .from('students')
                .select('classroom')
                .not('classroom', 'is', null)

            const uniqueClasses = [...new Set(students.map(s => s.classroom))]

            setGameName(game?.name || '')
            setClassrooms(uniqueClasses)
            setLoading(false)
        }

        fetchData()
    }, [gameId])

    const handleAssign = async (classroom) => {
        if (!selectedDate) {
            alert('📅 لطفاً تاریخ ضرب‌العجل را انتخاب کنید')
            return
        }

        if (!teacherId) {
            alert('❌ حساب کاربری یافت نشد')
            return
        }

        const { error } = await supabase.from('game_assignments').insert({
            game_id: gameId,
            classroom,
            teacher_id: teacherId,
            assigned_at: new Date().toISOString()
        })

        if (error) {
            console.error('Supabase error:', error)
            alert('❌ خطا در اختصاص بازی: ' + error.message)
        } else {
            alert(`✅ بازی "${gameName}" به کلاس "${classroom}" اختصاص یافت`)
        }
    }

    if (loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Container dir="rtl" sx={{ py: 4, mt: { xs: 10, md: 12 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🎮 اختصاص بازی: {gameName}
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>📅 تاریخ ضرب‌العجل</Typography>
                    <DatePicker
                        onChange={(e) => setSelectedDate(e.value)}
                        locale="fa"
                        calendarType="jalali"
                        hasTime
                        round="x2"
                        accentColor="#4f46e5"
                        direction="rtl"
                    />
                </Paper>
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>📚 لیست کلاس‌ها</Typography>
                <Paper sx={{ p: 3 }}>
                    {classrooms.length === 0 ? (
                        <Typography color="text.secondary">هیچ کلاسی برای نمایش وجود ندارد</Typography>
                    ) : (
                        <List>
                            {classrooms.map((classroom, i) => (
                                <React.Fragment key={i}>
                                    <ListItem>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={9}>
                                                <ListItemText
                                                    primary={`کلاس: ${classroom}`}
                                                    secondary={`بازی: ${gameName}`}
                                                    sx={{ textAlign: 'right' }}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => handleAssign(classroom)}
                                                >
                                                    اختصاص
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    {i < classrooms.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>
        </Container>
    )
}
