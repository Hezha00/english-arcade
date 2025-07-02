import React, { useEffect, useState } from 'react'
import {
    Typography, Container, List, ListItem, ListItemText, Divider,
    Button, Box, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import StudentAppWrapper from '../layouts/StudentAppWrapper'

export default function StudentGames() {
    const [games, setGames] = useState([])
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (!saved) navigate('/student-login')
        else setStudent(JSON.parse(saved))
    }, [])

    useEffect(() => {
        if (student) fetchGames()
    }, [student])

    const fetchGames = async () => {
        const { data, error } = await supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false })

        if (error || !data) return

        const filtered = data.filter(g =>
            g.is_global || g.name.includes(student.classroom)
        )

        setGames(filtered)
        setLoading(false)
    }

    const handlePlayGame = async (game) => {
        const gameUrl = game.file_url
        const assignmentId = game.assignment_id || game.id

        // ⏱️ Start a timer
        const startTime = Date.now()

        // ✅ Check if result already exists
        const { data: existing } = await supabase
            .from('results')
            .select('id, finished')
            .eq('student_id', student.id)
            .eq('assignment_id', assignmentId)
            .maybeSingle()

        if (!existing) {
            await supabase.from('results').insert([
                {
                    student_id: student.id,
                    assignment_id: assignmentId,
                    finished: false,
                    type: 'game'
                }
            ])
        }

        // 🎮 Open game
        const gameWindow = window.open(gameUrl, '_blank', 'noopener,noreferrer')

        // 🕒 Polling until window is closed
        const checkWindowClosed = setInterval(async () => {
            if (gameWindow?.closed) {
                clearInterval(checkWindowClosed)

                const endTime = Date.now()
                const duration = Math.floor((endTime - startTime) / 1000)

                const confirmDone = window.confirm('آیا بازی را به پایان رساندید؟')

                if (confirmDone) {
                    await supabase
                        .from('results')
                        .update({ finished: true, time_taken: duration, score: 100 })
                        .eq('student_id', student.id)
                        .eq('assignment_id', assignmentId)
                }
            }
        }, 1000)
    }

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundImage: 'url("/bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    py: 8,
                    px: 2
                }}
            >
                <Container dir="rtl">
                    <Typography variant="h4" fontWeight="bold" color="#fff" gutterBottom>
                        🎮 بازی‌های شما
                    </Typography>

                    {loading ? (
                        <Box textAlign="center" mt={4}><CircularProgress /></Box>
                    ) : games.length === 0 ? (
                        <Typography sx={{ mt: 3 }} variant="body1">
                            📭 هیچ بازی‌ای در حال حاضر فعال نیست.
                        </Typography>
                    ) : (
                        <List sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 3 }}>
                            {games.map(game => (
                                <React.Fragment key={game.id}>
                                    <ListItem
                                        secondaryAction={
                                            <Button
                                                variant="outlined"
                                                onClick={() => handlePlayGame(game)}
                                            >
                                                اجرا
                                            </Button>
                                        }
                                    >
                                        <ListItemText
                                            primary={game.name}
                                            secondary={game.description || 'بدون توضیح'}
                                            sx={{ textAlign: 'right' }}
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Container>
            </Box>
        </StudentAppWrapper>
    )
}
