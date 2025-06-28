import React, { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    LinearProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function Games() {
    const [games, setGames] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchGames()
    }, [])

    const fetchGames = async () => {
        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id

        const { data, error } = await supabase
            .from('games')
            .select('*')
            .or(`teacher_id.eq.${teacherId},is_global.eq.true`)
            .order('created_at', { ascending: false })

        if (!error) setGames(data)
    }

    const handleUpload = async () => {
        if (!file) return
        setUploading(true)

        const fileExt = file.name.split('.').pop()
        const filename = `${Date.now()}.${fileExt}`

        const { data: user } = await supabase.auth.getUser()
        const teacherId = user.user.id

        const { data, error: uploadError } = await supabase
            .storage
            .from('games')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error(uploadError.message)
            setUploading(false)
            return
        }

        const fileUrl = `https://gtslmgyxwnnyatvkrehv.supabase.co/storage/v1/object/public/games/${filename}`

        const { error: insertError } = await supabase.from('games').insert([
            {
                name,
                description,
                file_url: fileUrl,
                is_global: false,
                teacher_id: teacherId
            }
        ])

        if (!insertError) {
            setName('')
            setDescription('')
            setFile(null)
            fetchGames()
        }

        setUploading(false)
    }

    return (
        <TeacherLayout>
            <Container dir="rtl">
                <Typography variant="h6" gutterBottom>بازی‌های من</Typography>

                <Box sx={{ mb: 4 }}>
                    <TextField
                        label="نام بازی"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        label="توضیحات"
                        fullWidth
                        margin="normal"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ marginTop: 16 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        sx={{ mt: 2 }}
                    >
                        آپلود بازی
                    </Button>
                    {uploading && <LinearProgress sx={{ mt: 1 }} />}
                </Box>

                <List>
                    {games.map(game => (
                        <React.Fragment key={game.id}>
                            <ListItem>
                                <ListItemText
                                    primary={`${game.name} ${game.is_global ? '(سراسری)' : ''}`}
                                    secondary={game.description || 'بدون توضیح'}
                                    sx={{ textAlign: 'right' }}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Container>
        </TeacherLayout>
    )
}
