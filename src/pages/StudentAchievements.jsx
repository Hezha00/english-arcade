import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Grid, Paper
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

    return (
        <Container dir="rtl" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>دستاوردهای من</Typography>

            <Grid container spacing={2}>
                <Grid sx={{ width: { xs: '50%', md: '33.33%' } }}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h1">🔥</Typography>
                        <Typography variant="subtitle2">
                            مجموع امتیاز: {student.total_score || 0}
                        </Typography>
                    </Paper>
                </Grid>
                {/* Add other non-badge achievements here */}
            </Grid>
        </Container>
    )
}
