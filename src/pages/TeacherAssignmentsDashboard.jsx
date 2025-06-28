import React, { useEffect, useState } from 'react'
import {
    Container, Typography, Paper, Box, List, ListItem, ListItemText, Button
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { checkSubscriptionStatus } from '../utils/checkSubscriptionStatus'

export default function TeacherAssignmentsDashboard() {
    const [assignments, setAssignments] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const verifySubscriptionAndFetch = async () => {
            const { data: session } = await supabase.auth.getUser()
            const id = session?.user?.id

            if (!id) {
                navigate('/teacher-login')
                return
            }

            const active = await checkSubscriptionStatus(id)
            if (!active) {
                navigate('/renew-subscription')
                return
            }

            // Fetch teacher's assignments
            const { data, error } = await supabase
                .from('assignments')
                .select('*')
                .eq('teacher_id', id)
                .order('created_at', { ascending: false })

            if (!error) {
                setAssignments(data)
            }
        }

        verifySubscriptionAndFetch()
    }, [])

    return (
        <Container dir="rtl" sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom>
                📝 تمرین‌های من
            </Typography>

            <Paper sx={{ mt: 3, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="contained" onClick={() => navigate('/create-assignment')}>
                        + ساخت تمرین جدید
                    </Button>
                </Box>

                {assignments.length === 0 ? (
                    <Typography variant="body1">هیچ تمرینی وجود ندارد.</Typography>
                ) : (
                    <List>
                        {assignments.map((a) => (
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
                                    secondary={`مربوط به کلاس: ${a.classroom} — مهلت: ${new Date(
                                        a.due_date
                                    ).toLocaleDateString('fa-IR')}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    )
}
