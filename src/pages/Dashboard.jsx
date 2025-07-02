import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Card, CardContent, Divider, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'
import dayjs from 'dayjs'
import jalali from 'dayjs/plugin/calendar'
import jalaliday from 'jalaliday'
import { ensureTeacherProfile } from '../utils/ensureTeacherProfile'

dayjs.extend(jalaliday)
dayjs.calendar('jalali')

export default function Dashboard() {
    const [teacher, setTeacher] = useState(null)
    const [assignments, setAssignments] = useState([])
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [daysLeft, setDaysLeft] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const teacherData = await ensureTeacherProfile()
            if (!teacherData) return

            setTeacher(teacherData)

            if (teacherData.subscription_expires) {
                const todayUtc = dayjs.utc()
                const expiry = dayjs.utc(teacherData.subscription_expires)
                const diff = expiry.diff(todayUtc, 'day')
                setDaysLeft(diff)
            }

            const { data: latestAssignments } = await supabase
                .from('assignments')
                .select('id, title, created_at, classroom')
                .eq('teacher_id', teacherData.auth_id)
                .order('created_at', { ascending: false })
                .limit(3)

            const { data: latestGames } = await supabase
                .from('games')
                .select('id, name, created_at')
                .eq('teacher_id', teacherData.auth_id)
                .order('created_at', { ascending: false })
                .limit(3)

            setAssignments(latestAssignments || [])
            setGames(latestGames || [])
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <TeacherLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress />
                </Box>
            </TeacherLayout>
        )
    }

    return (
        <TeacherLayout>
            <Box dir="rtl">
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    سلام، {teacher?.username || 'معلم عزیز'} 👋
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                    🕓 اشتراک شما تا تاریخ{' '}
                    {dayjs(teacher.subscription_expires).calendar('jalali').format('YYYY/MM/DD')} معتبر است.
                    {daysLeft !== null && ` (${daysLeft} روز باقی‌مانده)`}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>🗂️ آخرین تکالیف</Typography>
                {assignments.length === 0 ? (
                    <Typography color="text.secondary">هیچ تکلیفی ایجاد نشده است.</Typography>
                ) : (
                    assignments.map((a) => (
                        <Card key={a.id} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold">{a.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    کلاس: {a.classroom} — تاریخ:{' '}
                                    {dayjs(a.created_at).calendar('jalali').format('YYYY/MM/DD')}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>🎮 بازی‌های اخیر</Typography>
                {games.length === 0 ? (
                    <Typography color="text.secondary">هیچ بازی‌ اختصاص داده نشده است.</Typography>
                ) : (
                    games.map((g) => (
                        <Card key={g.id} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold">{g.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    تاریخ اضافه شدن:{' '}
                                    {dayjs(g.created_at).calendar('jalali').format('YYYY/MM/DD')}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </TeacherLayout>
    )
}
