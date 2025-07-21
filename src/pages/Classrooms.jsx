import React, { useEffect, useState } from 'react'
import {
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    IconButton,
    Tooltip,
    Alert,
    Paper,
    Container,
    ListItemButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Classrooms() {
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const [school, setSchool] = useState('')
    const [classroom, setClassroom] = useState('')
    const [yearLevel, setYearLevel] = useState('')
    const [studentCount, setStudentCount] = useState(1)
    const [studentFields, setStudentFields] = useState([{ first: '', last: '' }])
    const [submitting, setSubmitting] = useState(false)

    const [teacherId, setTeacherId] = useState(null)
    const [createdList, setCreatedList] = useState([])

    const navigate = useNavigate()

    const fetchClasses = async (uid) => {
        setLoading(true)
        // Query students with classroom_id and join classroom name
        const { data: students, error } = await supabase
            .from('students')
            .select('classroom_id, school, classroom:classroom_id(name)')
            .eq('teacher_id', uid)

        if (error) {
            console.error('❌ Error fetching students:', error.message)
            setLoading(false)
            return
        }

        if (students.length === 0) {
            try {
                const { data: fallbackClasses, error: fallbackError } = await supabase
                    .from('classrooms')
                    .select('id, name, school')
                    .eq('teacher_id', uid)
                if (fallbackError) throw fallbackError
                setClasses((fallbackClasses || []).map(c => ({ classroom_id: c.id, classroom: c.name, school: c.school, count: 0 })))
            } catch (err) {
                setClasses([])
                console.error('❌ Error fetching fallback classes:', err)
            }
            setLoading(false)
            return
        }

        const grouped = {}
        students.forEach(({ classroom_id, classroom, school }) => {
            if (!classroom_id) return
            const key = `${classroom_id}||${classroom?.name || 'نامشخص'}||${school || 'نامشخص'}`
            grouped[key] = (grouped[key] || 0) + 1
        })

        const result = Object.entries(grouped).map(([key, count]) => {
            const [classroom_id, classroom, school] = key.split('||')
            return { classroom_id, classroom, school, count }
        })

        setClasses(result)
        setLoading(false)
    }

    useEffect(() => {
        const init = async () => {
            const { data: auth } = await supabase.auth.getUser()
            const uid = auth?.user?.id
            if (!uid) return
            setTeacherId(uid)
            await fetchClasses(uid)
        }

        init()
    }, [])

    const handleStudentCountChange = (count) => {
        setStudentCount(count)
        const arr = Array.from({ length: count }, (_, i) => studentFields[i] || { first: '', last: '' })
        setStudentFields(arr)
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setCreatedList([])

        const studentData = studentFields.map(({ first, last }) => ({
            first_name: first.trim(),
            last_name: last.trim()
        }))

        const payload = {
            teacher_id: teacherId,
            school: school.trim(),
            year_level: yearLevel.trim(),
            students: studentData,
        }

        const { data, error } = await supabase.functions.invoke('create_students', {
            body: {
                ...payload,
                classroom_name: classroom.trim() // if needed by backend, otherwise remove
            }
        })

        let upsertError = null
        if (!error) {
            const { error: upErr } = await supabase.from('classrooms').upsert({
                name: classroom.trim(),
                school: school.trim(),
                teacher_id: teacherId,
                year_level: yearLevel.trim(),
                created_at: new Date().toISOString()
            }, { onConflict: ['name', 'teacher_id'] })
            upsertError = upErr
        }

        if (error || upsertError) {
            alert('❌ عملیات ناموفق بود. خطا در ایجاد کلاس یا دانش‌آموزان.\n' + (error?.message || '') + (upsertError?.message || ''))
            setSubmitting(false)
            return
        }

        setCreatedList(data?.created || [])
        setOpen(false)
        setSchool('')
        setClassroom('')
        setYearLevel('')
        setStudentCount(1)
        setStudentFields([{ first: '', last: '' }])
        if (teacherId) await fetchClasses(teacherId)
        setSubmitting(false)
        if (studentData.length === 0) {
            alert('کلاس با موفقیت ایجاد شد (بدون دانش‌آموز).')
        }
    }

    return (
        <Container dir="rtl" sx={{ mt: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                        🏫 کلاس‌های من
                    </Typography>
                    <Tooltip title="ایجاد کلاس جدید">
                        <IconButton color="primary" onClick={() => setOpen(true)}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff'
                    }}
                >
                    {loading ? (
                        <Box sx={{ textAlign: 'center', mt: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : classes.length === 0 ? (
                        <Typography sx={{ mt: 2 }} color="text.secondary">
                            هیچ کلاسی پیدا نشد.
                        </Typography>
                    ) : (
                        <List sx={{ maxWidth: 800, width: '100%' }}>
                            {classes.map(({ classroom_id, classroom, school, count }) => (
                                <React.Fragment key={classroom_id + school}>
                                    <ListItemButton onClick={() =>
                                        navigate(`/classrooms/${encodeURIComponent(classroom_id)}`)
                                    }>
                                        <ListItemText
                                            primary={`کلاس: ${classroom}`}
                                            secondary={`مدرسه: ${school} — تعداد دانش‌آموز: ${count}`}
                                            sx={{ textAlign: 'right' }}
                                        />
                                    </ListItemButton>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    )}

                    {createdList.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                ✅ {createdList.length} دانش‌آموز ساخته شد:
                            </Alert>
                            {createdList.map(({ username, password }, i) => (
                                <Typography key={i} sx={{ fontFamily: 'monospace' }}>
                                    👤 {username} — 🔐 {password}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Paper>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" dir="rtl">
                <DialogTitle>🆕 ایجاد کلاس جدید</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="نام مدرسه"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="نام کلاس"
                        value={classroom}
                        onChange={(e) => setClassroom(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="پایه (مثلاً اول، دوم)"
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="تعداد دانش‌آموز"
                        type="number"
                        inputProps={{ min: 1 }}
                        value={studentCount}
                        onChange={(e) => handleStudentCountChange(Number(e.target.value))}
                        sx={{ mb: 3 }}
                    />

                    {studentFields.map((s, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label={`نام (${i + 1})`}
                                value={s.first}
                                onChange={(e) => {
                                    const copy = [...studentFields]
                                    copy[i].first = e.target.value
                                    setStudentFields(copy)
                                }}
                            />
                            <TextField
                                fullWidth
                                label={`نام خانوادگی (${i + 1})`}
                                value={s.last}
                                onChange={(e) => {
                                    const copy = [...studentFields]
                                    copy[i].last = e.target.value
                                    setStudentFields(copy)
                                }}
                            />
                        </Box>
                    ))}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{ mt: 2 }}
                    >
                        {submitting ? <CircularProgress size={22} color="inherit" /> : 'ثبت کلاس و دانش‌آموزان'}
                    </Button>
                </DialogContent>
            </Dialog>
        </Container>
    )
}
