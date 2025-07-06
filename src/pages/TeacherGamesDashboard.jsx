import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem,
    ListItemText, Button, Divider, CircularProgress,
    Grid, Box
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const gameTypeRegistry = {
  'word-matching': {
    label: 'تطبیق کلمه',
    createPath: '/create-word-matching',
  },
  'memory-puzzle': {
    label: 'بازی حافظه',
    createPath: '/create-memory-puzzle',
  },
  'sentence-structure': {
    label: 'ساختار جمله',
    createPath: '/create-sentence-structure',
  },
}

export default function TeacherGamesDashboard() {
    const [downloads, setDownloads] = useState([])
    const [assignedGames, setAssignedGames] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return

            const teacherId = user.id

            const [downloadedRes, assignedRes] = await Promise.all([
                supabase
                    .from('downloaded_games')
                    .select('*')
                    .eq('teacher_id', teacherId)
                    .order('downloaded_at', { ascending: false }),

                supabase.rpc('get_teacher_game_assignments', { teacher_auth_id: teacherId })
            ])

            if (downloadedRes.error) console.error(downloadedRes.error)
            setDownloads(downloadedRes.data || [])

            if (assignedRes.error) console.error(assignedRes.error)
            setAssignedGames(assignedRes.data || [])

            setLoading(false)
        }

        fetchData()
    }, [])

    const handleCreateGame = (template) => {
        navigate('/create-game', {
            state: {
                templateName: template.template_name,
                fileUrl: template.file_url
            }
        })
    }

    const handleViewDetails = (gameId) => {
        navigate(`/teacher-game/${gameId}/details`)
    }

    if (loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Container dir="rtl" sx={{ py: 4, mt: { xs: 10, md: 1 } }}>
            {/* 🧩 My Downloaded Templates Section */}
            <Box sx={{ transform: 'translateX(250px)', mt: -5 }}>
                <Typography variant="h5" fontWeight="bold">🎮 بازی‌های من</Typography>
                <Button
                    variant="outlined"
                    sx={{ my: 2 }}
                    onClick={() => navigate('/game-store')}
                >
                    رفتن به فروشگاه بازی‌ها
                </Button>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 3, p: 2 }}>
  {Object.entries(gameTypeRegistry).map(([type, { label, createPath }]) => (
    <Button key={type} variant="contained" onClick={() => navigate(createPath)}>
      ساخت بازی جدید {label}
    </Button>
  ))}
</Box>

                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff' }}>
                    {downloads.length === 0 ? (
                        <Typography color="text.secondary">📭 هنوز هیچ بازی‌ای دانلود نشده</Typography>
                    ) : (
                        <List>
                            {downloads.map((template, i) => (
                                <React.Fragment key={template.id}>
                                    <ListItem>
                                        <Grid container spacing={2}>
                                            <Grid sx={{ width: { xs: '75%', md: '90%' } }}>
                                                <ListItemText
                                                    primary={template.template_name}
                                                    secondary={`دانلود شده در: ${new Date(template.downloaded_at).toLocaleDateString('fa-IR')}`}
                                                    sx={{ textAlign: 'right' }}
                                                />
                                            </Grid>
                                            <Grid sx={{ width: { xs: '25%', md: '10%' } }}>
                                                <Button variant="contained" fullWidth onClick={() => handleCreateGame(template)}>
                                                    ساخت بازی
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    {i < downloads.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>

            {/* 📊 Newly Added Section: Assigned Games */}
            <Box sx={{ mt: 8 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">🎓 بازی‌های اختصاص‌داده‌شده</Typography>

                <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(6px)', color: '#fff' }}>
                    {assignedGames.length === 0 ? (
                        <Typography color="text.secondary">📭 هنوز هیچ بازی‌ای اختصاص داده نشده</Typography>
                    ) : (
                        <List>
                            {assignedGames.map((g, i) => (
                                <React.Fragment key={`${g.game_id}-${g.classroom}`}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`${g.game_name} 🎯`}
                                            secondary={`🧑‍🏫 کلاس: ${g.classroom} | 👨‍🎓 تعداد دانش‌آموزان: ${g.student_count}`}
                                            sx={{ textAlign: 'right' }}
                                        />
                                        <Button onClick={() => handleViewDetails(g.game_id)} variant="outlined">
                                            مشاهده جزئیات
                                        </Button>
                                    </ListItem>
                                    {i < assignedGames.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Box>
        </Container>
    )
}