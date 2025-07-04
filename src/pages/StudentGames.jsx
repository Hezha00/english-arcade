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
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (saved) setStudent(JSON.parse(saved))
        else navigate('/student-login')
    }, [navigate])

    useEffect(() => {
        const fetchGames = async () => {
            if (!student?.id) return
            const { data, error } = await supabase
                .from('game_assignments')
                .select('game_id, classroom, games(name), expires_at')
                .eq('classroom', student.classroom)

            if (error) console.error(error)
            setGames(data || [])
            setLoading(false)
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
                px: 2
            }}
        >
            <Container dir="rtl" maxWidth="md">
                <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                    بازی‌های قابل انجام
                </Typography>

                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)' }}>
                    {games.length === 0 ? (
                        <Typography color="text.secondary">
                            📭 هیچ بازی‌ای برای کلاس شما اختصاص داده نشده
                        </Typography>
                    ) : (
                        <List>
                            {games.map((g, i) => (
                                <React.Fragment key={i}>
                                    <ListItem
                                        secondaryAction={
                                            <Button
                                                variant="contained"
                                                onClick={() => navigate(`/student-quiz/${g.game_id}`)}
                                            >
                                                شروع بازی
                                            </Button>
                                        }
                                    >
                                        <SportsEsportsIcon style={{ marginLeft: 8, color: '#4f46e5' }} />
                                        <ListItemText
                                            primary={g.games?.name || '---'}
                                            secondary={`کلاس: ${g.classroom} | ضرب‌العجل: ${g.expires_at
                                                    ? moment(g.expires_at).format('jYYYY/jMM/jDD HH:mm')
                                                    : '---'
                                                }`}
                                        />
                                        <Chip label="فعال" color="success" />
                                    </ListItem>
                                    {i < games.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Container>
        </Box>
    )
}
