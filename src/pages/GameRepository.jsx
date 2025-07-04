import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem, ListItemText,
    Button, Divider, CircularProgress, Grid, Box
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { downloadTemplate } from '../utils/downloadTemplate'

export default function GameRepository() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [teacherId, setTeacherId] = useState(null)
    const [downloadedNames, setDownloadedNames] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/games.json')
                const json = await res.json()
                setTemplates(json.templates || [])
            } catch (err) {
                console.error('خطا در بارگذاری قالب‌ها:', err)
            }
            setLoading(false)
        }

        const fetchTeacherAndDownloads = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.id) {
                setTeacherId(user.id)

                const { data: downloads } = await supabase
                    .from('downloaded_games')
                    .select('template_name')
                    .eq('teacher_id', user.id)

                const names = downloads?.map(d => d.template_name) || []
                setDownloadedNames(names)
            }
        }

        fetchTemplates()
        fetchTeacherAndDownloads()
    }, [])

    const handleDownload = async (template) => {
        if (!teacherId) return alert('❌ حساب کاربری یافت نشد')

        if (downloadedNames.includes(template.name)) {
            alert(`⚠️ بازی "${template.name}" قبلاً دانلود شده است`)
            return
        }

        try {
            const message = await downloadTemplate(template, teacherId)
            alert(message)
            setDownloadedNames([...downloadedNames, template.name])
        } catch (err) {
            alert(err.message || '❌ خطا در دانلود بازی')
        }
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
                    <Typography variant="h5" fontWeight="bold">🎮 فروشگاه بازی‌ها</Typography>
                </Box>

                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff'
                    }}
                >
                    {templates.length === 0 ? (
                        <Typography color="text.secondary">📭 هیچ بازی‌ای برای نمایش وجود ندارد</Typography>
                    ) : (
                        <List>
                            {templates.map((template, i) => {
                                const alreadyDownloaded = downloadedNames.includes(template.name)
                                return (
                                    <React.Fragment key={i}>
                                        <ListItem>
                                            <Grid container alignItems="center" spacing={2}>
                                                <Grid item xs={9}>
                                                    <ListItemText
                                                        primary={template.name}
                                                        secondary={template.description || 'بدون توضیح'}
                                                        sx={{ textAlign: 'right' }}
                                                    />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        disabled={alreadyDownloaded}
                                                        onClick={() => handleDownload(template)}
                                                        sx={{
                                                            backgroundColor: alreadyDownloaded ? '#ccc' : undefined,
                                                            color: alreadyDownloaded ? '#666' : undefined
                                                        }}
                                                    >
                                                        {alreadyDownloaded ? 'قبلاً دانلود شده' : 'دانلود'}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                        {i < templates.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </React.Fragment>
                                )
                            })}
                        </List>
                    )}
                </Paper>
            </Box>
        </Container>
    )
}
