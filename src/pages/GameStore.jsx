import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, List, ListItem, ListItemText,
    Button, Divider, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { downloadTemplate } from '../utils/downloadTemplate'

export default function GameStore() {
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [teacherId, setTeacherId] = useState(null)

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/games.json')
                const json = await res.json()
                setTemplates(json.templates || [])
            } catch (err) {
                console.error('Error loading templates:', err)
            }
            setLoading(false)
        }

        const fetchTeacher = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.id) setTeacherId(user.id)
        }

        fetchTemplates()
        fetchTeacher()
    }, [])

    const handleDownload = async (template) => {
        try {
            const message = await downloadTemplate(template, teacherId)
            alert(message)
        } catch (err) {
            alert('❌ خطا در دانلود بازی')
        }
    }

    if (loading) return <CircularProgress sx={{ mt: 10 }} />

    return (
        <Container dir="rtl" sx={{ py: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎮 مخزن بازی‌ها
            </Typography>

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
                    <Typography color="text.secondary">📭 هیچ قالبی برای نمایش وجود ندارد</Typography>
                ) : (
                    <List>
                        {templates.map((template, i) => (
                            <React.Fragment key={i}>
                                <ListItem
                                    secondaryAction={
                                        <Button variant="contained" onClick={() => handleDownload(template)}>
                                            دانلود
                                        </Button>
                                    }
                                >
                                    <ListItemText
                                        primary={template.name}
                                        secondary={template.description || 'بدون توضیح'}
                                    />
                                </ListItem>
                                {i < templates.length - 1 && <Divider sx={{ my: 1 }} />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    )
}
