import React, { useEffect, useState } from 'react'
import {
    Container,
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    Chip,
    Divider,
    CircularProgress
} from '@mui/material'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import moment from 'moment-jalaali'

export default function StudentGames() {
    const [games, setGames] = useState([])
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [playCounts, setPlayCounts] = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) setStudent(JSON.parse(saved))
        else navigate('/student-login')
    }, [navigate])

    useEffect(() => {
        const fetchGames = async () => {
            if (!student?.id) return
            // Use the RPC for reliability
            const { data, error } = await supabase
                .rpc('get_student_games', { student_auth_id: student.auth_id })
            if (error) console.error(error)
            setGames(data || [])
            setLoading(false)

            // Fetch play counts for each game
            if (data && data.length > 0) {
                const gameIds = data.map(g => g.game_id)
                const { data: statusData } = await supabase
                    .from('student_game_status')
                    .select('game_id, student_id')
                    .eq('student_id', student.id)
                    .in('game_id', gameIds)
                // Count plays per game
                const counts = {}
                statusData?.forEach(row => {
                    counts[row.game_id] = (counts[row.game_id] || 0) + 1
                })
                setPlayCounts(counts)
            }
        }
        fetchGames()
    }, [student])

    if (!student || loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Box
            sx={{
                background: 'url(/bg.png)',
                minHeight: '100vh',
                py: 8,
                px: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
            }}
        >
            <Container dir="rtl" maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh' }}>
                <Paper sx={{
                    p: 6,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.20)',
                    backdropFilter: 'blur(8px)',
                    color: '#222',
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: 3,
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography variant="h4" fontWeight="bold" color="#222" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                        بازی‌های قابل انجام
                    </Typography>
                    {games.length === 0 ? (
                        <Typography color="text.secondary">
                            📭 هیچ بازی‌ای برای کلاس شما اختصاص داده نشده
                        </Typography>
                    ) : (
                        <List sx={{ width: '100%' }}>
                            {games.map((g, i) => {
                                const played = playCounts[g.game_id] || 0
                                const maxRetries = g.max_retries || 1
                                const canPlay = played < maxRetries
                                return (
                                    <React.Fragment key={i}>
                                        <ListItem sx={{ py: 3, px: 2 }}
                                            secondaryAction={
                                                <Button
                                                    variant="contained"
                                                    onClick={() => navigate(`/student-quiz/${g.game_id}`)}
                                                    disabled={!canPlay}
                                                >
                                                    {canPlay ? 'شروع بازی' : 'تعداد دفعات مجاز تمام شد'}
                                                </Button>
                                            }
                                        >
                                            <SportsEsportsIcon style={{ marginLeft: 8, color: '#4f46e5' }} />
                                            <ListItemText
                                                primary={g.game_name || '---'}
                                                secondary={`کلاس: ${g.classroom} | ضرب‌العجل: ${g.expires_at
                                                        ? moment(g.expires_at).format('jYYYY/jMM/jDD HH:mm')
                                                        : '---'
                                                    } | دفعات انجام‌شده: ${played} / ${maxRetries}`}
                                                sx={{ mr: 2 }}
                                            />
                                            <Chip label={canPlay ? 'فعال' : 'غیرفعال'} color={canPlay ? 'success' : 'default'} />
                                        </ListItem>
                                        {i < games.length - 1 && <Divider sx={{ my: 2 }} />}
                                    </React.Fragment>
                                )
                            })}
                        </List>
                    )}
                </Paper>
            </Container>
        </Box>
    )
}
