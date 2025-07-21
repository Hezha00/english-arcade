import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Paper, List, ListItem, ListItemText,
    Divider, CircularProgress, IconButton, Tooltip, Grid,
    Dialog, DialogTitle, DialogContent, TextField, Button
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ClassroomDetails() {
    const { className: classroomIdParam } = useParams()
    const classroomId = decodeURIComponent(classroomIdParam)

    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [sessionReady, setSessionReady] = useState(false)
    const [teacherId, setTeacherId] = useState(null)
    const [schoolName, setSchoolName] = useState('')
    const [yearLevel, setYearLevel] = useState('')
    const [classroomName, setClassroomName] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const { data: sessionData } = await supabase.auth.getSession()
            const session = sessionData?.session
            if (!session) {
                setSessionReady(true)
                return
            }

            const uid = session.user.id
            setTeacherId(uid)

            const { data: studentList } = await supabase
                .from('students')
                .select('id, name, username, password, school, profile_color, classroom_id, year_level, classroom:classroom_id(name)')
                .eq('teacher_id', uid)
                .eq('classroom_id', classroomId)

            setStudents(studentList || [])
            if (studentList?.length > 0) {
                setSchoolName(studentList[0].school || '')
                setYearLevel(studentList[0].year_level || '')
                setClassroomName(studentList[0].classroom?.name || '')
            } else {
                // Fetch classroom name if no students
                const { data: cls } = await supabase
                    .from('classrooms')
                    .select('name')
                    .eq('id', classroomId)
                    .single()
                setClassroomName(cls?.name || '')
            }
            setSessionReady(true)
            setLoading(false)
        }

        fetchData()
    }, [classroomId])

    const generateUsername = (first) =>
        `${first.toLowerCase()}${Math.floor(100 + Math.random() * 900)}`

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
        return Array.from({ length: 6 }, () =>
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('')
    }

    const handleCopy = (s) => {
        const payload = `👤 ${s.name}\n🔐 username: ${s.username}\n🔐 password: ${s.password}`
        navigator.clipboard.writeText(payload).then(() => {
            alert(`✅ اطلاعات "${s.name}" کپی شد`)
        }).catch(() => {
            alert('❌ خطا در کپی کردن اطلاعات')
        })
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm('آیا مطمئن هستید که می‌خواهید این دانش‌آموز را حذف کنید؟')
        if (!confirmed) return

        const { error } = await supabase.from('students').delete().eq('id', id)
        if (error) {
            alert('❌ خطا در حذف دانش‌آموز')
        } else {
            setStudents(prev => prev.filter(s => s.id !== id))
            alert('✅ دانش‌آموز حذف شد')
        }
    }

    const handleCreateStudent = async () => {
        const first = firstName.trim()
        const last = lastName.trim()
        if (!first || !last || !yearLevel || !schoolName || !teacherId) {
            alert('اطلاعات ناقص: نام، نام خانوادگی، کلاس یا مدرسه یافت نشد')
            return
        }

        const fullName = `${first} ${last}`
        const username = generateUsername(first)
        const password = generatePassword()

        const payload = {
            teacher_id: teacherId,
            classroom: classroomId, // <-- correct key
            school: schoolName,
            year_level: yearLevel,
            first_name: first,
            last_name: last
        }

        const { data, error } = await supabase.functions.invoke('add_student_to_class', {
            body: payload
        })

        if (error || !data || !data.username) {
            alert('❌ خطا در ثبت‌نام دانش‌آموز')
        } else {
            setDialogOpen(false)
            setFirstName('')
            setLastName('')
            setStudents(prev => [...prev, {
                id: Math.random().toString(36).slice(2),
                name: data.name,
                username: data.username,
                password: data.password,
                school: schoolName,
                year_level: yearLevel
            }])
            alert(`✅ "${data.name}" با نام کاربری "${data.username}" اضافه شد`)
        }
    }

    if (!sessionReady) {
        return (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>🔐 در حال بررسی اعتبار ورود...</Typography>
            </Box>
        )
    }

    return (
        <Box dir="rtl" sx={{ py: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                👩‍🏫 دانش‌آموزان کلاس {classroomName}
            </Typography>

            <Button
                variant="outlined"
                sx={{ mb: 2 }}
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
            >
                افزودن دانش‌آموز
            </Button>

            {loading ? (
                <Box sx={{ textAlign: 'center', mt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : students.length === 0 ? (
                <Typography sx={{ mt: 2 }} color="text.secondary">
                    هیچ دانش‌آموزی در این کلاس وجود ندارد.
                </Typography>
            ) : (
                <Paper sx={{
                    mt: 2,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    p: 2,
                    color: '#fff'
                }}>
                    <List>
                        {students.map((s) => (
                            <React.Fragment key={s.id}>
                                <ListItem disablePadding>
                                    <Grid container alignItems="center" sx={{ px: 2, py: 1 }}>
                                        <Grid sx={{ width: '8.33%' }}>
                                            <Tooltip title="حذف دانش‌آموز">
                                                <IconButton onClick={() => handleDelete(s.id)}>
                                                    <DeleteIcon sx={{ color: '#f00' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid sx={{ width: '8.33%' }}>
                                            <Tooltip title="کپی اطلاعات">
                                                <IconButton onClick={() => handleCopy(s)}>
                                                    <ContentCopyIcon sx={{ color: '#fff' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                        <Grid sx={{ width: '83.33%' }}>
                                            <ListItemText
                                                primary={s.name}
                                                secondary={
                                                    <>
                                                        🧑 نام کاربری: <strong>{s.username}</strong> — 🔐 رمز: <strong>{s.password}</strong><br />
                                                        🏫 مدرسه: {s.school || 'نامشخص'} — 📚 پایه: {s.year_level || 'ثبت نشده'}
                                                    </>
                                                }
                                                sx={{ textAlign: 'right' }}
                                            />
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm" dir="rtl">
                <DialogTitle>➕ افزودن دانش‌آموز جدید</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth label="نام"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth label="نام خانوادگی"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        sx={{ mb: 3 }}
                    />
                    <Button variant="contained" fullWidth onClick={handleCreateStudent}>
                        ثبت دانش‌آموز
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    )
}
