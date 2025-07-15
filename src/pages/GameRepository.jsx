import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem, ListItemText,
    Button, Divider, CircularProgress, Grid, Box, Tooltip, IconButton
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { downloadTemplate } from '../utils/downloadTemplate'
import DeleteIcon from '@mui/icons-material/Delete';

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
                    '/games/memory-puzzle.json',
                    '/games/emoji-word-matching.json',
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

    const handleUninstall = async (template) => {
        if (!teacherId) return alert('❌ حساب کاربری یافت نشد');
        if (!window.confirm(`آیا مطمئن هستید که می‌خواهید بازی "${template.template_name}" را حذف کنید؟`)) return;
        try {
            const { error } = await supabase
                .from('downloaded_games')
                .delete()
                .eq('teacher_id', teacherId)
                .eq('template_name', template.template_name);
            if (error) throw error;
            setDownloadedNames(downloadedNames.filter(name => name !== template.template_name));
            alert('بازی از لیست دانلودهای شما حذف شد.');
        } catch (err) {
            alert('❌ خطا در حذف بازی: ' + (err.message || err));
        }
    };

    const gameTypeRegistry = {
      'memory-puzzle': {
        label: 'بازی حافظه',
        createPath: '/create-memory-puzzle',
      },
    }

    if (loading) return <CircularProgress sx={{ mt: 10 }} />
    if (error) return <Typography color="error" sx={{ mt: 10, textAlign: 'center' }}>{error}</Typography>

    return (
        <Container dir="rtl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    🎮 فروشگاه بازی‌ها
                </Typography>
                <Paper sx={{ p: 3, borderRadius: 4, maxWidth: 800, width: '100%', mb: 4, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', boxShadow: 6 }}>
                    {templates.length === 0 ? (
                        <Typography color="text.secondary">📭 هیچ بازی‌ای برای نمایش وجود ندارد</Typography>
                    ) : (
                        <List>
                            {templates.map((template, i) => {
                                const alreadyDownloaded = downloadedNames.includes(template.template_name)
                                return (
                                    <React.Fragment key={i}>
                                        <ListItem>
                                            <Grid container alignItems="center" spacing={2} direction="row-reverse">
                                                {/* Uninstall button far left visually (first in row-reverse) */}
                                                <Grid item sx={{ width: '10%', display: 'flex', justifyContent: 'flex-end' }}>
                                                    
                                                    <Tooltip title="حذف از دانلودهای من">
                                                        <span>
                                                            <IconButton
                                                                color="error"
                                                                disabled={!alreadyDownloaded}
                                                                onClick={() => handleUninstall(template)}
                                                                aria-label="حذف از دانلودهای من"
                                                            >
                                                                <DeleteIcon sx={{ color: '#e53935' }} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Grid>
                                                {/* Game info center */}
                                                <Grid item sx={{ width: '65%' }}>
                                                    <ListItemText
                                                        primary={template.template_name}
                                                        secondary={template.description || 'بدون توضیح'}
                                                        sx={{ textAlign: 'right' }}
                                                    />
                                                </Grid>
                                                {/* Download button far right visually (last in row-reverse) */}
                                                <Grid item sx={{ width: '25%', display: 'flex', justifyContent: 'flex-start' }}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        disabled={alreadyDownloaded}
                                                        onClick={() => handleDownload(template)}
                                                        sx={{ backgroundColor: alreadyDownloaded ? '#ccc' : undefined, color: alreadyDownloaded ? '#666' : undefined }}
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
