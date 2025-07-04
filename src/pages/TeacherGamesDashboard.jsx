import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem,
    ListItemText, Button, Divider, CircularProgress,
    Grid, Box
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function TeacherGamesDashboard() {
    const [downloads, setDownloads] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDownloads = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.id) return

            const { data, error } = await supabase
                .from('downloaded_games')
                .select('*')
                .eq('teacher_id', user.id)
                .order('downloaded_at', { ascending: false })

            if (error) console.error(error)
            setDownloads(data || [])
            setLoading(false)
        }

        fetchDownloads()
    }, [])

    const handleCreateGame = (template) => {
        navigate('/create-game', {
            state: {
                templateName: template.template_name,
                fileUrl: template.file_url
            }
        })
    }

    if (loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Container dir="rtl" sx={{ py: 4, mt: { xs: 10, md: 1 } }}>
            <Box
                dir="rtl"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    transform: 'translateX(250px)',
                    mt: -5
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">🎮 بازی‌های من</Typography>
                </Box>

                <Button
                    variant="outlined"
                    sx={{ mb: 3 }}
                    onClick={() => navigate('/game-store')}
                >
                    رفتن به فروشگاه بازی‌ها
                </Button>

                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff'
                    }}
                >
                    {downloads.length === 0 ? (
                        <Typography color="text.secondary">📭 هنوز هیچ بازی‌ای دانلود نشده</Typography>
                    ) : (
                        <List>
                            {downloads.map((template, i) => (
                                <React.Fragment key={template.id}>
                                    <ListItem>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={9}>
                                                <ListItemText
                                                    primary={template.template_name}
                                                    secondary={`دانلود شده در: ${new Date(template.downloaded_at).toLocaleDateString('fa-IR')}`}
                                                    sx={{ textAlign: 'right' }}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
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
        </Container>
    )
}
