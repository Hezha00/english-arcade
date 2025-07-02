import React, { useEffect, useState } from 'react'
import {
    Box, Paper, Typography, CircularProgress
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'
import dayjs from 'dayjs'
import jalali from 'dayjs/plugin/calendar'
import jalaliday from 'jalaliday'
import { ensureTeacherProfile } from '../utils/ensureTeacherProfile'

dayjs.extend(jalaliday)
dayjs.calendar('jalali')

export default function AccountSettings() {
    const [teacher, setTeacher] = useState(null)
    const [loading, setLoading] = useState(true)
    const [daysLeft, setDaysLeft] = useState(null)

    useEffect(() => {
        const fetchTeacher = async () => {
            const teacherData = await ensureTeacherProfile()
            if (!teacherData) return

            setTeacher(teacherData)

            if (teacherData.subscription_expires) {
                const now = dayjs.utc()
                const expiry = dayjs.utc(teacherData.subscription_expires)
                const diff = expiry.diff(now, 'day')
                setDaysLeft(diff)
            }

            setLoading(false)
        }

        fetchTeacher()
    }, [])

    return (
        <TeacherLayout>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper
                    dir="rtl"
                    sx={{
                        maxWidth: 500,
                        mx: 'auto',
                        p: 4,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        borderRadius: 4,
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        ⚙️ تنظیمات حساب
                    </Typography>

                    <Typography sx={{ mt: 2 }}><strong>نام کاربری:</strong> {teacher.username}</Typography>
                    <Typography sx={{ mt: 1 }}><strong>ایمیل:</strong> {teacher.email}</Typography>

                    {teacher.subscription_expires && (
                        <>
                            <Typography sx={{ mt: 2 }}>
                                <strong>تاریخ انقضای اشتراک:</strong>{' '}
                                {dayjs(teacher.subscription_expires).calendar('jalali').format('YYYY/MM/DD')}
                            </Typography>
                            <Typography sx={{ mt: 1, color: daysLeft <= 7 ? 'red' : 'green' }}>
                                {daysLeft >= 0
                                    ? `⌛ ${daysLeft} روز باقی‌مانده`
                                    : `⛔ اشتراک شما منقضی شده`}
                            </Typography>
                        </>
                    )}
                </Paper>
            )}
        </TeacherLayout>
    )
}
