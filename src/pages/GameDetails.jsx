// GameDetails.jsx
import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Button, Chip, Divider, TextField, CircularProgress, MenuItem, Select, InputLabel, FormControl
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
    const [sort, setSort] = useState('desc') // 'desc', 'asc', 'student'

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
            // Fetch scores for this game (all students) from the new view
            const { data: results, error: resultsError } = await supabase
                .from('game_results_with_names')
                .select('score, completed_at, student_name, display_game_name, teacher_name')
                .eq('game_id', gameId)
            setScores(results || [])
            setLoading(false)
        }
        fetchGameAndScores()
    }, [gameId])

    if (loading) return <CircularProgress sx={{ mt: 5 }} />
    if (!game) return <Typography color="error" sx={{ mt: 5 }}>بازی پیدا نشد</Typography>

    const type = game.game_content?.type || 'memory-puzzle'
    const config = GAME_TYPE_REGISTRY[type]

    // Sorting logic
    const sortedScores = [...scores].sort((a, b) => {
        if (sort === 'desc') return b.score - a.score
        if (sort === 'asc') return a.score - b.score
        if (sort === 'student') return (a.student_name || '').localeCompare(b.student_name || '')
        return 0
    })

    return (
        <Container dir="rtl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                {game.name}
            </Typography>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 4, color: '#222' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>{config?.label || "نوع بازی نامشخص"}</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{game.description || config?.description || ""}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}><b>راهنمای معلم:</b> {config?.howToMake || ""}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}><b>راهنمای دانش‌آموز:</b> {config?.howToPlay || ""}</Typography>
            </Paper>
            <Typography variant="h6" gutterBottom>🎓 نمرات دانش‌آموزان</Typography>
            <FormControl sx={{ mb: 3, minWidth: 180 }} size="small">
                <InputLabel id="sort-label">مرتب‌سازی بر اساس</InputLabel>
                <Select
                    labelId="sort-label"
                    value={sort}
                    label="مرتب‌سازی بر اساس"
                    onChange={e => setSort(e.target.value)}
                >
                    <MenuItem value="desc">امتیاز (بیشترین)</MenuItem>
                    <MenuItem value="asc">امتیاز (کمترین)</MenuItem>
                    <MenuItem value="student">نام دانش‌آموز</MenuItem>
                </Select>
            </FormControl>
            {scores.length === 0 ? (
                <Typography color="text.secondary">📭 هنوز کسی بازی را انجام نداده</Typography>
            ) : (
                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 4, color: '#222' }}>
                    <List>
                        {sortedScores.map((s, i) => {
                            // Color coding: 15-20 green, 10-14 yellow, below 10 red
                            let scoreColor = 'error';
                            if (s.score >= 15) scoreColor = 'success';
                            else if (s.score >= 10) scoreColor = 'warning';
                            return (
                                <React.Fragment key={i}>
                                    <ListItem sx={{
                                        py: 3, px: 2, mb: 2, borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.35)',
                                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                                        display: 'flex', alignItems: 'center',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.25)',
                                    }}>
                                        <ListItemText
                                            primary={<span style={{ fontWeight: 600, fontSize: 18, color: '#222', display: 'block', textAlign: 'center' }}>{s.student_name || s.student_id}</span>}
                                            secondary={<>
                                                <span style={{ color: '#666', fontSize: 14, display: 'block', textAlign: 'center' }}>{`📅 ${moment(s.completed_at).format('jYYYY/jMM/jDD')}`}</span>
                                                <span style={{ display: 'block', color: '#222', fontSize: 17, marginTop: 2, textAlign: 'center' }}>{s.display_game_name}</span>
                                                <span style={{ display: 'block', color: '#222', fontSize: 15, marginTop: 2, textAlign: 'center' }}>👨‍🏫 معلم: {s.teacher_name || '---'}</span>
                                            </>}
                                            sx={{ mr: 2, textAlign: 'center' }}
                                        />
                                        <Chip label={`${s.score} از 20`} color={scoreColor} sx={{ fontWeight: 'bold', fontSize: 16, color: '#fff', bgcolor: scoreColor === 'success' ? '#22c55e' : scoreColor === 'warning' ? '#fbbf24' : '#ef4444', minWidth: 90, textAlign: 'center' }} />
                                    </ListItem>
                                    {i < scores.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            )
                        })}
                    </List>
                </Paper>
            )}
        </Container>
    )
}
