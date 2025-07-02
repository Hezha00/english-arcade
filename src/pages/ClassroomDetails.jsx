import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Paper, List, ListItem, ListItemText,
    Divider, CircularProgress, Tooltip
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

export default function ClassroomDetails() {
    const { className } = useParams()
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [latestAssignment, setLatestAssignment] = useState(null)
    const [latestGame, setLatestGame] = useState(null)
    const [assignmentStatus, setAssignmentStatus] = useState({})
    const [gameStatus, setGameStatus] = useState({})

    useEffect(() => {
        const fetchData = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id
            const classDecoded = decodeURIComponent(className)

            const { data: studentList } = await supabase
                .from('students')
                .select('id, name, username, password, school, profile_color')
                .eq('teacher_id', uid)
                .eq('classroom', classDecoded)

            setStudents(studentList || [])

            const { data: assignment } = await supabase
                .from('assignments')
                .select('id')
                .eq('teacher_id', uid)
                .eq('classroom', classDecoded)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            setLatestAssignment(assignment)

            const { data: game } = await supabase
                .from('games')
                .select('id')
                .eq('teacher_id', uid)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            setLatestGame(game)

            const studentIds = (studentList || []).map(s => s.id)

            if (assignment) {
                const { data: assStatus } = await supabase
                    .from('student_assignment_status')
                    .select('student_id')
                    .eq('assignment_id', assignment.id)
                    .in('student_id', studentIds)

                const statusMap = {}
                assStatus?.forEach(row => {
                    statusMap[row.student_id] = true
                })
                setAssignmentStatus(statusMap)
            }

            if (game) {
                const { data: gameStat } = await supabase
                    .from('student_game_status')
                    .select('student_id')
                    .eq('game_id', game.id)
                    .in('student_id', studentIds)

                const gameMap = {}
                gameStat?.forEach(row => {
                    gameMap[row.student_id] = true
                })
                setGameStatus(gameMap)
            }

            setLoading(false)
        }

        fetchData()
    }, [className])

    return (
        <TeacherLayout>
            <Box dir="rtl">
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    👩‍🏫 دانش‌آموزان کلاس {decodeURIComponent(className)}
                </Typography>

                {loading ? (
                    <Box sx={{ textAlign: 'center', mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : students.length === 0 ? (
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                        هیچ دانش‌آموزی در این کلاس وجود ندارد.
                    </Typography>
                ) : (
                    <Paper sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2, p: 2 }}>
                        <List>
                            {students.map((s) => (
                                <React.Fragment key={s.id}>
                                    <ListItem
                                        button
                                        secondaryAction={
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Tooltip title="تکلیف">
                                                    {assignmentStatus[s.id] ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <CancelIcon color="error" />
                                                    )}
                                                </Tooltip>
                                                <Tooltip title="بازی">
                                                    {gameStatus[s.id] ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <CancelIcon color="error" />
                                                    )}
                                                </Tooltip>
                                            </Box>
                                        }
                                    >
                                        <ListItemText
                                            primary={s.name}
                                            secondary={
                                                <>
                                                    🧑 نام کاربری: <strong>{s.username}</strong> — 🔐 رمز: <strong>{s.password}</strong><br />
                                                    🏫 مدرسه: {s.school || 'نامشخص'}
                                                </>
                                            }
                                            sx={{ textAlign: 'right' }}
                                        />
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                bgcolor: s.profile_color || 'gray'
                                            }}
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>
        </TeacherLayout>
    )
}
