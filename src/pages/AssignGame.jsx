import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem, ListItemText,
    Button, Divider, CircularProgress, Box, Grid, Chip, Snackbar, Alert, IconButton
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { DatePicker } from 'zaman'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function AssignGame() {
    const { gameId } = useParams()
    const [classrooms, setClassrooms] = useState([])
    const [gameName, setGameName] = useState('')
    const [selectedDates, setSelectedDates] = useState({})
    const [loading, setLoading] = useState(true)
    const [teacherId, setTeacherId] = useState(null)
    const [assignedClassrooms, setAssignedClassrooms] = useState([])
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user?.id) {
                setSnackbar({ open: true, message: '❌ خطا در دریافت اطلاعات معلم', severity: 'error' })
                setLoading(false)
                return
            }
            setTeacherId(user.id)

            // Get game name
            const { data: game } = await supabase
                .from('games')
                .select('name')
                .eq('id', gameId)
                .single()
            setGameName(game?.name || '')

            // Get teacher's own classrooms
            let myClasses = []
            let classError = null
            try {
                const { data, error } = await supabase
                    .from('classrooms')
                    .select('name')
                    .eq('teacher_id', user.id)
                if (error) throw error
                myClasses = data
            } catch (err) {
                classError = err
                myClasses = []
            }
            if (!myClasses || myClasses.length === 0) {
                setSnackbar({ open: true, message: 'شما کلاسی برای اختصاص ندارید. لطفاً ابتدا کلاس خود را ایجاد کنید.', severity: 'warning' })
                setClassrooms([])
                setLoading(false)
                return
            }
            setClassrooms(myClasses.map(c => c.name) || [])

            // Get already assigned classrooms for this game
            const { data: assignments } = await supabase
                .from('game_assignments')
                .select('classroom')
                .eq('game_id', gameId)
            setAssignedClassrooms(assignments?.map(a => a.classroom) || [])
            setLoading(false)
        }
        fetchData()
    }, [gameId])

    const handleAssign = async (classroom) => {
        const expires_at = selectedDates[classroom]
        if (!expires_at) {
            setSnackbar({ open: true, message: '📅 لطفاً تاریخ ضرب‌العجل را انتخاب کنید', severity: 'warning' })
            return
        }
        if (!teacherId) {
            setSnackbar({ open: true, message: '❌ حساب کاربری یافت نشد', severity: 'error' })
            return
        }
        const { error } = await supabase.from('game_assignments').insert({
            game_id: gameId,
            classroom,
            teacher_id: teacherId,
            assigned_at: new Date().toISOString(),
            expires_at,
            is_active: true
        })
        if (error) {
            setSnackbar({ open: true, message: '❌ خطا در اختصاص بازی: ' + error.message, severity: 'error' })
        } else {
            setAssignedClassrooms([...assignedClassrooms, classroom])
            setSnackbar({ open: true, message: `✅ بازی "${gameName}" به کلاس "${classroom}" اختصاص یافت`, severity: 'success' })
        }
    }

    const handleDateChange = (classroom, value) => {
        setSelectedDates({ ...selectedDates, [classroom]: value })
    }

    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false })

    const handleRefresh = async () => {
        setLoading(true)
        // Re-fetch assignments
        const { data: assignments } = await supabase
            .from('game_assignments')
            .select('classroom')
            .eq('game_id', gameId)
        setAssignedClassrooms(assignments?.map(a => a.classroom) || [])
        setLoading(false)
    }

    if (loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Container dir="rtl" sx={{ py: 4, mt: { xs: 10, md: 12 } }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🎮 اختصاص بازی: {gameName}
                </Typography>
                <IconButton onClick={handleRefresh} title="بروزرسانی">
                    <RefreshIcon />
                </IconButton>
            </Box>
            <Box>
                <Typography variant="h6" gutterBottom>📚 لیست کلاس‌های شما</Typography>
                <Paper sx={{ p: 3 }}>
                    {classrooms.length === 0 ? (
                        <Typography color="text.secondary">هیچ کلاسی برای نمایش وجود ندارد</Typography>
                    ) : (
                        <List>
                            {classrooms.map((classroom, i) => {
                                const alreadyAssigned = assignedClassrooms.includes(classroom)
                                return (
                                    <React.Fragment key={i}>
                                        <ListItem>
                                            <Grid container alignItems="center" spacing={2}>
                                                <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                                                    <ListItemText
                                                        primary={`کلاس: ${classroom}`}
                                                        secondary={`بازی: ${gameName}`}
                                                        sx={{ textAlign: 'right' }}
                                                    />
                                                </Grid>
                                                <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                                                    <DatePicker
                                                        onChange={e => handleDateChange(classroom, e.value)}
                                                        locale="fa"
                                                        calendarType="jalali"
                                                        hasTime
                                                        round="x2"
                                                        accentColor="#4f46e5"
                                                        direction="rtl"
                                                        disabled={alreadyAssigned}
                                                        placeholder="تاریخ ضرب‌العجل"
                                                    />
                                                </Grid>
                                                <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
                                                    <Button
                                                        variant={alreadyAssigned ? 'outlined' : 'contained'}
                                                        color={alreadyAssigned ? 'success' : 'primary'}
                                                        fullWidth
                                                        onClick={() => handleAssign(classroom)}
                                                        disabled={alreadyAssigned}
                                                        startIcon={alreadyAssigned ? <CheckCircleIcon /> : null}
                                                    >
                                                        {alreadyAssigned ? 'اختصاص داده شده' : 'اختصاص'}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        {i < classrooms.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </React.Fragment>
                                )
                            })}
                        </List>
                    )}
                </Paper>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}
