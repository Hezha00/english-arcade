// GameDetails.jsx
import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Button, Chip, Divider, TextField, CircularProgress
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import moment from 'moment-jalaali'

const GAME_TYPE_REGISTRY = {
  'memory-puzzle': {
    label: 'بازی حافظه',
    description: 'یک بازی حافظه با جفت‌سازی کلمات انگلیسی و فارسی.',
    howToPlay: 'دو کارت را همزمان برگردانید و جفت انگلیسی-فارسی را پیدا کنید. اگر جفت درست باشد، کارت‌ها باز می‌مانند. هدف: همه جفت‌ها را پیدا کنید.',
    howToMake: '۸ جفت کلمه مرتبط انگلیسی-فارسی وارد کنید. کلمات باید ساده و قابل فهم باشند. از کلمات تکراری خودداری کنید.'
  }
};

export default function GameDetails() {
    const { gameId } = useParams()
    const [game, setGame] = useState(null)
    const [scores, setScores] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchGameAndScores() {
            setLoading(true)
            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single()
            if (gameError || !gameData) {
                setGame(null)
                setLoading(false)
                return
            }
            setGame(gameData)
            // Fetch scores for this game (all students)
            const { data: statusData } = await supabase
                .from('student_game_status')
                .select('score, completed_at, student_id, students(name)')
                .eq('game_id', gameId)
            setScores(statusData || [])
            setLoading(false)
        }
        fetchGameAndScores()
    }, [gameId])

    if (loading) return <CircularProgress sx={{ mt: 5 }} />
    if (!game) return <Typography color="error" sx={{ mt: 5 }}>بازی پیدا نشد</Typography>

    const type = game.game_content?.type || 'memory-puzzle'
    const config = GAME_TYPE_REGISTRY[type]

    return (
        <Container dir="rtl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                {game.name}
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{config.label}</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{game.description || config.description}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}><b>راهنمای معلم:</b> {config.howToMake}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}><b>راهنمای دانش‌آموز:</b> {config.howToPlay}</Typography>
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
