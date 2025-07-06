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
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        async function loadTemplates() {
            try {
                const files = [
                    '/games/word-matching.json',
                    '/games/memory-puzzle.json',
                    '/games/sentence-structure.json'
                ]
                const loaded = await Promise.all(files.map(async (url) => {
                    const res = await fetch(url)
                    if (!res.ok) throw new Error('خطا در بارگذاری قالب: ' + url)
                    return await res.json()
                }))
                setTemplates(loaded)
            } catch (err) {
                setError(err.message || 'خطا در بارگذاری قالب‌ها')
            } finally {
                setLoading(false)
            }
        }
        loadTemplates()
    }, [])

    useEffect(() => {
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

        fetchTeacherAndDownloads()
    }, [])

    const handleDownload = async (template) => {
        if (!teacherId) return alert('❌ حساب کاربری یافت نشد')

        const templateName = template.template_name
        if (downloadedNames.includes(templateName)) {
            alert(`⚠️ بازی "${templateName}" قبلاً دانلود شده است`)
            return
        }

        try {
            const message = await downloadTemplate(template, teacherId)
            alert(message)
            setDownloadedNames([...downloadedNames, templateName])
        } catch (err) {
            alert(err.message || '❌ خطا در دانلود بازی')
        }
    }

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

    if (loading) return <CircularProgress sx={{ mt: 10 }} />
    if (error) return <Typography color="error" sx={{ mt: 10, textAlign: 'center' }}>{error}</Typography>

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
                                const alreadyDownloaded = downloadedNames.includes(template.template_name)
                                return (
                                    <React.Fragment key={i}>
                                        <ListItem>
                                            <Grid container alignItems="center" spacing={2}>
                                                <Grid sx={{ width: '75%' }}>
                                                    <ListItemText
                                                        primary={template.template_name}
                                                        secondary={template.description || 'بدون توضیح'}
                                                        sx={{ textAlign: 'right' }}
                                                    />
                                                </Grid>
                                                <Grid sx={{ width: '25%' }}>
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
