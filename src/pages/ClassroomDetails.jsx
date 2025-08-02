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
    const [manualSchoolName, setManualSchoolName] = useState('')
    const [manualYearLevel, setManualYearLevel] = useState('')

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

            // First, fetch classroom details
            const { data: classroomData, error: classroomError } = await supabase
                .from('classrooms')
                .select('name, school, year_level')
                .eq('id', classroomId)
                .single()

            if (classroomError) {
                console.error('Error fetching classroom:', classroomError)
                alert('خطا در دریافت اطلاعات کلاس')
                setSessionReady(true)
                setLoading(false)
                return
            }

            // Set classroom details
            setClassroomName(classroomData?.name || '')

            // If classroom doesn't have school/year_level, try to get from teacher profile
            let finalSchoolName = classroomData?.school || ''
            let finalYearLevel = classroomData?.year_level || ''

            if (!finalSchoolName || !finalYearLevel) {
                const { data: teacherProfile } = await supabase
                    .from('teachers')
                    .select('school, year_level')
                    .eq('auth_id', uid)
                    .single()

                if (teacherProfile) {
                    finalSchoolName = finalSchoolName || teacherProfile.school || ''
                    finalYearLevel = finalYearLevel || teacherProfile.year_level || ''
                }
            }

            setSchoolName(finalSchoolName)
            setYearLevel(finalYearLevel)

            // Update classroom with school and year level if they're missing
            if (classroomData && (!classroomData.school || !classroomData.year_level)) {
                const updateData = {}
                if (!classroomData.school && finalSchoolName) updateData.school = finalSchoolName
                if (!classroomData.year_level && finalYearLevel) updateData.year_level = finalYearLevel

                if (Object.keys(updateData).length > 0) {
                    await supabase
                        .from('classrooms')
                        .update(updateData)
                        .eq('id', classroomId)
                }
            }

            // Fetch students
            const { data: studentList, error: studentError } = await supabase
                .from('students')
                .select('id, name, username, password, school, profile_color, classroom_id, year_level, classroom:classroom_id(name)')
                .eq('teacher_id', uid)
                .eq('classroom_id', classroomId)

            if (studentError) {
                console.error('Error fetching students:', studentError)
            }

            setStudents(studentList || [])
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

        // Improved validation with specific error messages
        const validationErrors = []

        if (!first) validationErrors.push('نام')
        if (!last) validationErrors.push('نام خانوادگی')
        if (!yearLevel && !manualYearLevel) validationErrors.push('پایه تحصیلی')
        if (!schoolName && !manualSchoolName) validationErrors.push('نام مدرسه')
        if (!teacherId) validationErrors.push('شناسه معلم')
        if (!classroomName) validationErrors.push('نام کلاس')

        if (validationErrors.length > 0) {
            alert(`اطلاعات ناقص: ${validationErrors.join('، ')} یافت نشد`)
            console.error('Validation errors:', {
                first, last, yearLevel, schoolName, teacherId, classroomName,
                manualYearLevel, manualSchoolName
            })
            return
        }

        // Use manual values if provided, otherwise use the fetched values
        const finalSchoolName = manualSchoolName || schoolName
        const finalYearLevel = manualYearLevel || yearLevel

        const payload = {
            teacher_id: teacherId,
            classroom: classroomName,
            school: finalSchoolName,
            year_level: finalYearLevel,
            first_name: first,
            last_name: last
        }

        console.log('add_student_to_class payload:', payload)

        try {
            const { data, error } = await supabase.functions.invoke('add_student_to_class', {
                body: payload
            })

            console.log('add_student_to_class response:', { data, error })

            if (error) {
                console.error('Function error:', error)
                alert(`❌ خطا در ثبت‌نام دانش‌آموز: ${error.message || 'خطای نامشخص'}`)
                return
            }

            if (!data || !data.username) {
                console.error('Invalid response data:', data)
                alert('❌ پاسخ نامعتبر از سرور')
                return
            }

            // Success - close dialog and update state
            setDialogOpen(false)
            setFirstName('')
            setLastName('')
            setManualSchoolName('')
            setManualYearLevel('')

            // Add new student to the list
            setStudents(prev => [...prev, {
                id: data.id || Math.random().toString(36).slice(2),
                name: data.name,
                username: data.username,
                password: data.password,
                school: schoolName,
                year_level: yearLevel
            }])

            alert(`✅ "${data.name}" با نام کاربری "${data.username}" اضافه شد`)

        } catch (err) {
            console.error('Unexpected error:', err)
            alert(`❌ خطای غیرمنتظره: ${err.message}`)
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

            {/* Debug information - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Debug Info: TeacherID: {teacherId ? 'Set' : 'Not Set'} |
                        School: {schoolName || 'Not Set'} |
                        Year: {yearLevel || 'Not Set'} |
                        Classroom: {classroomName || 'Not Set'} |
                        Manual School: {manualSchoolName || 'None'} |
                        Manual Year: {manualYearLevel || 'None'}
                    </Typography>
                </Box>
            )}

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

            <Dialog open={dialogOpen} onClose={() => {
                setDialogOpen(false)
                setFirstName('')
                setLastName('')
                setManualSchoolName('')
                setManualYearLevel('')
            }} fullWidth maxWidth="sm" dir="rtl">
                <DialogTitle>➕ افزودن دانش‌آموز جدید</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth label="نام"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />
                    <TextField
                        fullWidth label="نام خانوادگی"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        sx={{ mb: 2 }}
                        required
                    />

                    {/* Show school and year level if not set, or allow editing */}
                    {(!schoolName || !yearLevel) && (
                        <>
                            <TextField
                                fullWidth label="نام مدرسه"
                                value={manualSchoolName || schoolName}
                                onChange={(e) => setManualSchoolName(e.target.value)}
                                sx={{ mb: 2 }}
                                required={!schoolName}
                                helperText={!schoolName ? "نام مدرسه الزامی است" : ""}
                            />
                            <TextField
                                fullWidth label="پایه تحصیلی"
                                value={manualYearLevel || yearLevel}
                                onChange={(e) => setManualYearLevel(e.target.value)}
                                sx={{ mb: 2 }}
                                required={!yearLevel}
                                helperText={!yearLevel ? "پایه تحصیلی الزامی است" : ""}
                            />
                        </>
                    )}

                    {/* Show current values if they are set */}
                    {(schoolName && yearLevel) && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                مدرسه: {schoolName} | پایه: {yearLevel}
                            </Typography>
                            <Button
                                size="small"
                                onClick={() => {
                                    setManualSchoolName(schoolName)
                                    setManualYearLevel(yearLevel)
                                }}
                                sx={{ mt: 1 }}
                            >
                                تغییر اطلاعات مدرسه و پایه
                            </Button>
                        </Box>
                    )}

                    <Button variant="contained" fullWidth onClick={handleCreateStudent}>
                        ثبت دانش‌آموز
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    )
}
