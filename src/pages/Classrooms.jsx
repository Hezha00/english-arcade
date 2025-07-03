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
    Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'
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
        const { data: students, error } = await supabase
            .from('students')
            .select('classroom, school')
            .eq('teacher_id', uid)

        if (error) {
            console.error('❌ Error fetching students:', error.message)
            setLoading(false)
            return
        }

        const grouped = {}
        students.forEach(({ classroom, school }) => {
            if (!classroom) return
            const key = `${classroom}||${school || 'نامشخص'}`
            grouped[key] = (grouped[key] || 0) + 1
        })

        const result = Object.entries(grouped).map(([key, count]) => {
            const [classroom, school] = key.split('||')
            return { classroom, school, count }
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
            classroom: classroom.trim(),
            year_level: yearLevel.trim(),
            students: studentData
        }

        const { data, error } = await supabase.functions.invoke('create_students', {
            body: payload
        })

        if (error) {
            console.error('❌ Edge Function error:', error.message || error)
            alert('❌ عملیات ناموفق بود. خطا در ایجاد کلاس یا دانش‌آموزان.')
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
    }

    return (
        <TeacherLayout>
            <Box dir="rtl">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">🏫 کلاس‌های من</Typography>
                    <Tooltip title="ایجاد کلاس جدید">
                        <IconButton color="primary" onClick={() => setOpen(true)}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {loading ? (
                    <Box sx={{ textAlign: 'center', mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : classes.length === 0 ? (
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                        هیچ کلاسی پیدا نشد.
                    </Typography>
                ) : (
                    <List>
                        {classes.map(({ classroom, school, count }) => (
                            <React.Fragment key={classroom + school}>
                                <ListItem
                                    button
                                    onClick={() =>
                                        navigate(`/classrooms/${encodeURIComponent(classroom)}`) // ✅ Now safe!
                                    }
                                >
                                    <ListItemText
                                        primary={`کلاس: ${classroom}`}
                                        secondary={`مدرسه: ${school} — تعداد دانش‌آموز: ${count}`}
                                        sx={{ textAlign: 'right' }}
                                    />
                                </ListItem>
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
        </TeacherLayout>
    )
}
