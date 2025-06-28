import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Grid, Paper, Box
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function StudentAchievements() {
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (!saved) navigate('/student-login')
        else setStudent(JSON.parse(saved))
    }, [])

    if (!student) return null

    const getBadgeEmoji = (badge) => {
        if (badge?.includes('قهرمان')) return '🏆'
        if (badge?.includes('حرفه‌ای')) return '🏅'
        if (badge?.includes('متوسط')) return '🎖'
        if (badge?.includes('تمرین')) return '🔰'
        return '❓'
    }

    return (
        <Container dir="rtl" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>دستاوردهای من</Typography>

            <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h1">
                            {getBadgeEmoji(student.badge)}
                        </Typography>
                        <Typography variant="subtitle1">{student.badge || 'بدون نشان'}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">🔥</Typography>
                        <Typography variant="subtitle2">
                            مجموع امتیاز: {student.total_score || 0}
                        </Typography>
                    </Paper>
                </Grid>
                {/* Add more achievements here if needed */}
            </Grid>
        </Container>
    )
}
