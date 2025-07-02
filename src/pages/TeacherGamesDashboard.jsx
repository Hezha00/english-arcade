import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Button, Card, CardContent, Grid, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)

export default function TeacherGamesDashboard() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchGames = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id

            const { data: teacherGames } = await supabase
                .from('games')
                .select('*')
                .eq('teacher_id', uid)
                .order('created_at', { ascending: false })

            setGames(teacherGames || [])
            setLoading(false)
        }

        fetchGames()
    }, [])

    return (
        <TeacherLayout>
            <Box dir="rtl">
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🎮 بازی‌های اختصاص داده‌شده
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => navigate('/game-repository')}
                    sx={{ mt: 2, mb: 3 }}
                >
                    افزودن بازی جدید
                </Button>

                {loading ? (
                    <CircularProgress />
                ) : games.length === 0 ? (
                    <Typography>هیچ بازی‌ای اختصاص داده نشده است.</Typography>
                ) : (
                    <Grid container spacing={2}>
                        {games.map((game) => (
                            <Grid item xs={12} sm={6} md={4} key={game.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {game.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            {game.description || 'بدون توضیحات'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            افزوده‌شده: {dayjs(game.created_at).calendar('jalali').format('YYYY/MM/DD')}
                                        </Typography>
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
