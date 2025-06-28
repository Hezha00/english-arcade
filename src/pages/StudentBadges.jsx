import React, { useEffect, useState } from 'react'
import {
    Chip, Avatar
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import StudentAppWrapper from '../layouts/StudentAppWrapper'

import {
    Container, Typography, Box, Grid, Paper, Tooltip
} from '@mui/material'



export default function StudentBadges() {
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (!saved) {
            navigate('/student-login')
        } else {
            const parsed = JSON.parse(saved)
            setStudent(parsed)
        }
    }, [])

    const badgeList = [
        { id: 'streak', label: '🔥 زنجیره حضور', earned: student?.login_streak >= 5 },
        { id: 'score100', label: '🏆 نمره کامل', earned: student?.total_score >= 100 },
        { id: 'badge', label: '🏅 نشان ویژه', earned: !!student?.badge }
    ]

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    🏅 نشان‌ها و افتخارات
                </Typography>

                <Paper sx={{ p: 3 }}>
                    {badgeList.map((b) => (
                        <Box
                            key={b.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                my: 2
                            }}
                        >
                            <Typography>{b.label}</Typography>
                            {b.earned ? (
                                <Chip
                                    color="success"
                                    label="دریافت شد"
                                    avatar={<Avatar>✔</Avatar>}
                                />
                            ) : (
                                <Chip
                                    label="هنوز دریافت نشده"
                                    color="default"
                                />
                            )}
                        </Box>
                    ))}
                </Paper>
            </Container>
        </StudentAppWrapper>
    )
}
