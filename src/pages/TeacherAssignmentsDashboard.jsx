import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, Box, List, ListItem, ListItemText, Button, Divider
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { checkSubscriptionStatus } from '../utils/checkSubscriptionStatus'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
dayjs.extend(jalaliday)

export default function TeacherAssignmentsDashboard() {
    const [teacher, setTeacher] = useState(null)
    const [assignments, setAssignments] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const loadDashboard = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id

            if (!uid) {
                navigate('/teacher-login')
                return
            }

            const isActive = await checkSubscriptionStatus(uid)
            if (!isActive) {
                navigate('/renew-subscription')
                return
            }

            const { data: teacherRow } = await supabase
                .from('teachers')
                .select('*')
                .eq('auth_id', uid)
                .single()

            setTeacher(teacherRow)

            const { data: allAssignments } = await supabase
                .from('assignments')
                .select('*')
                .eq('teacher_id', uid)
                .order('created_at', { ascending: false })

            setAssignments(allAssignments || [])
        }

        loadDashboard()
    }, [])

    const subscriptionDate = teacher?.subscription_expires
        ? dayjs(teacher.subscription_expires).calendar('jalali').format('YYYY/MM/DD')
        : null

    return (
        <Container dir="rtl" sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
                🎓 خوش آمدید، {teacher?.username || 'معلم عزیز'}
            </Typography>

            {subscriptionDate && (
                <Typography sx={{ mb: 2 }}>
                    🗓 اشتراک فعال تا <strong>{subscriptionDate}</strong>
                </Typography>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">📘 تمرین‌های فعال</Typography>
                    <Button variant="contained" onClick={() => navigate('/create-assignment')}>
                        + تمرین جدید
                    </Button>
                </Box>

                {assignments.length === 0 ? (
                    <Typography>فعلاً تمرینی ایجاد نشده است.</Typography>
                ) : (
                    <List>
                        {assignments.map(a => (
                            <ListItem
                                key={a.id}
                                secondaryAction={
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate(`/add-questions?id=${a.id}`)}
                                    >
                                        ویرایش
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={a.title}
                                    secondary={`کلاس: ${a.classroom} | مهلت: ${new Date(a.due_date).toLocaleDateString('fa-IR')}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    🎮 بازی‌های فعال
                </Typography>
                <Typography color="text.secondary">بخش بازی‌ها به زودی اضافه خواهد شد.</Typography>
            </Paper>
        </Container>
    )
}
