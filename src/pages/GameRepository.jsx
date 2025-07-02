import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert
} from '@mui/material'
import TeacherLayout from '../components/TeacherLayout'
import { useNavigate } from 'react-router-dom'

export default function GameRepository() {
    const navigate = useNavigate()
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch('/games.json')
            .then((res) => {
                if (!res.ok) throw new Error('فایل بازی‌ها یافت نشد')
                return res.text()
            })
            .then((text) => {
                if (!text.trim()) return [] // empty file case
                try {
                    const parsed = JSON.parse(text)
                    setGames(Array.isArray(parsed) ? parsed : [])
                } catch {
                    setError('⚠️ فایل games.json معتبر نیست.')
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error('Game fetch failed:', err)
                setError('⚠️ بازی‌ها قابل بارگذاری نیستند یا فایل games.json وجود ندارد.')
                setLoading(false)
            })
    }, [])

    return (
        <TeacherLayout>
            <Box dir="rtl">
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    📂 مخزن بازی‌ها
                </Typography>

                {loading ? (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 3 }}>
                        {error}
                    </Alert>
                ) : games.length === 0 ? (
                    <Typography sx={{ mt: 3 }} color="text.secondary">
                        هیچ بازی‌ای در حال حاضر در مخزن وجود ندارد.
                    </Typography>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {games.map((game) => (
                            <Grid item xs={12} sm={6} md={4} key={game.id}>
                                <Card>
                                    <CardContent sx={{ textAlign: 'right' }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {game.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {game.file}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate(`/assign-game/${game.file}`)}
                                        >
                                            انتخاب و اختصاص
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </TeacherLayout>
    )
}
