// GameDetails.jsx
import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Button, Chip, Divider, TextField, CircularProgress
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import moment from 'moment-jalaali'

export default function GameDetails() {
    const { gameId, classroom } = useParams()
    const [scores, setScores] = useState([])
    const [deadline, setDeadline] = useState('')
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true)

            const { data: statusData } = await supabase
                .from('student_game_status')
                .select('score, completed_at, student_id, students(name)')
                .eq('game_id', gameId)
                .eq('students.classroom', classroom)

            const { data: assignment } = await supabase
                .from('game_assignments')
                .select('expires_at')
                .eq('game_id', gameId)
                .eq('classroom', classroom)
                .single()

            setScores(statusData || [])
            setDeadline(assignment?.expires_at?.slice(0, 16) || '')
            setLoading(false)
        }

        fetchScores()
    }, [gameId, classroom])

    const handleUpdateDeadline = async () => {
        const { error } = await supabase
            .from('game_assignments')
            .update({ expires_at: deadline })
            .eq('game_id', gameId)
            .eq('classroom', classroom)

        if (error) alert('خطا در بروزرسانی')
        else alert('✅ ضرب‌العجل بروزرسانی شد')
    }

    const handleDeleteAssignment = async () => {
        const confirm = window.confirm('آیا می‌خواهید این بازی را از کل سایت حذف کنید؟ این کار غیرقابل بازگشت است.')
        if (!confirm) return

        // Delete all assignments for this game
        await supabase
            .from('game_assignments')
            .delete()
            .eq('game_id', gameId)

        // Delete all student_game_status for this game
        await supabase
            .from('student_game_status')
            .delete()
            .eq('game_id', gameId)

        // Delete the game itself
        const { error } = await supabase
            .from('games')
            .delete()
            .eq('id', gameId)

        if (error) alert('خطا در حذف بازی')
        else {
            alert('✅ بازی به طور کامل حذف شد')
            navigate('/teacher-games')
        }
    }

    if (loading) return <CircularProgress sx={{ mt: 5 }} />

    return (
        <Container dir="rtl" sx={{ py: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🎯 جزئیات بازی: {gameId} | کلاس: {classroom}
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1">🔒 ضرب‌العجل:</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                            type="datetime-local"
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Button variant="outlined" onClick={handleUpdateDeadline}>
                            ذخیره ضرب‌العجل
                        </Button>
                        <Button variant="contained" color="error" onClick={handleDeleteAssignment}>
                            حذف بازی از کلاس
                        </Button>
                    </Box>
                </Paper>

                <Typography variant="h6" gutterBottom>🎓 نمرات دانش‌آموزان</Typography>
                {scores.length === 0 ? (
                    <Typography color="text.secondary">📭 هنوز کسی بازی را انجام نداده</Typography>
                ) : (
                    <Paper sx={{ p: 3 }}>
                        <List>
                            {scores.map((s, i) => (
                                <React.Fragment key={i}>
                                    <ListItem>
                                        <ListItemText
                                            primary={s.students?.name || s.student_id}
                                            secondary={`📅 ${moment(s.completed_at).format('jYYYY/jMM/jDD')}`}
                                        />
                                        <Chip label={`${s.score}%`} color={s.score >= 80 ? 'success' : s.score >= 50 ? 'warning' : 'error'} />
                                    </ListItem>
                                    {i < scores.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}
            </Container>
    )
}
