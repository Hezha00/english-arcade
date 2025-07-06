import React, { useEffect, useState } from 'react'
import {
    Typography, Box, TextField, Button, MenuItem, Select, InputLabel,
    FormControl, List, ListItem, ListItemText, Divider, IconButton
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import { supabase } from '../supabaseClient'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function Students() {
    const [students, setStudents] = useState([])
    const [form, setForm] = useState({
        username: '', password: '', school: '', year: '',
        classroom: '', profileColor: ''
    })
    const [classrooms, setClassrooms] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [editingFields, setEditingFields] = useState({})

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: auth } = await supabase.auth.getUser()
        const teacherAuthId = auth?.user?.id

        const { data: cls } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherAuthId)

        const { data: stu } = await supabase
            .from('students')
            .select('*')
            .eq('teacher_id', teacherAuthId)
            .order('created_at', { ascending: false })

        setClassrooms(cls || [])
        setStudents(stu || [])
    }

    const handleAdd = async () => {
        const { data: session } = await supabase.auth.getUser()
        const teacherId = session.user.id
        const { username, password, school, year, classroom, profileColor } = form

        const { error } = await supabase.from('students').insert([{
            username,
            password,
            school,
            year_level: year,
            classroom,
            profile_color: profileColor,
            teacher_id: teacherId
        }])

        if (!error) {
            setForm({ username: '', password: '', school: '', year: '', classroom: '', profileColor: '' })
            fetchData()
        }
    }

    const handleDelete = async (id) => {
        await supabase.from('students').delete().eq('id', id)
        fetchData()
    }

    const handleSave = async (id) => {
        await supabase
            .from('students')
            .update(editingFields)
            .eq('id', id)
        setEditingId(null)
        setEditingFields({})
        fetchData()
    }

    const exportToExcel = () => {
        const data = students.map((s) => ({
            نام‌کاربری: s.username,
            رمزعبور: s.password,
            کلاس: s.classroom,
            مدرسه: s.school,
            پایه: s.year_level,
            رنگ_پروفایل: s.profile_color
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'دانش‌آموزان')
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        saveAs(new Blob([buf]), 'students-list.xlsx')
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>دانش‌آموزان من</Typography>

            <Box sx={{ mb: 4 }}>
                <TextField label="نام کاربری" fullWidth margin="normal" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })} />
                <TextField label="رمز عبور" fullWidth margin="normal" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <TextField label="مدرسه" fullWidth margin="normal" value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })} />
                <TextField label="پایه" fullWidth margin="normal" value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })} />
                <FormControl fullWidth margin="normal">
                    <InputLabel>کلاس</InputLabel>
                    <Select
                        value={form.classroom}
                        onChange={(e) => setForm({ ...form, classroom: e.target.value })}
                        onBlur={(e) => setForm({ ...form, classroom: e.target.value })}
                        label="کلاس"
                    >
                        {classrooms.map((cls) => (
                            <MenuItem key={cls.id} value={cls.name}>{cls.name}</MenuItem>
                        ))}
                        {form.classroom && !classrooms.find(c => c.name === form.classroom) && (
                            <MenuItem value={form.classroom}>
                                ➕ ایجاد کلاس جدید: {form.classroom}
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
                <TextField label="رنگ پروفایل (Hex)" fullWidth margin="normal" placeholder="#aabbcc"
                    value={form.profileColor}
                    onChange={(e) => setForm({ ...form, profileColor: e.target.value })} />

                <Button variant="contained" onClick={handleAdd} sx={{ mt: 2 }}>
                    افزودن دانش‌آموز
                </Button>
            </Box>

            <Button variant="outlined" onClick={exportToExcel} sx={{ mb: 2 }}>
                دانلود لیست دانش‌آموزان
            </Button>

            <List>
                {students.map((stu) => (
                    <React.Fragment key={stu.id}>
                        <ListItem
                            secondaryAction={
                                editingId === stu.id ? (
                                    <IconButton edge="end" onClick={() => handleSave(stu.id)}>
                                        <SaveIcon />
                                    </IconButton>
                                ) : (
                                    <>
                                        <IconButton edge="end" onClick={() => setEditingId(stu.id)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" onClick={() => handleDelete(stu.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                )
                            }
                        >
                            <ListItemText
                                primary={
                                    editingId === stu.id ? (
                                        <TextField fullWidth value={editingFields.username || stu.username}
                                            onChange={(e) =>
                                                setEditingFields({ ...editingFields, username: e.target.value })
                                            } />
                                    ) : (
                                        `${stu.username} (${stu.classroom})`
                                    )
                                }
                                secondary={
                                    editingId === stu.id ? (
                                        <>
                                            <TextField fullWidth size="small"
                                                value={editingFields.school || stu.school}
                                                onChange={(e) =>
                                                    setEditingFields({ ...editingFields, school: e.target.value })
                                                } />
                                            <TextField fullWidth size="small"
                                                value={editingFields.year_level || stu.year_level}
                                                onChange={(e) =>
                                                    setEditingFields({ ...editingFields, year_level: e.target.value })
                                                } />
                                        </>
                                    ) : (
                                        `مدرسه: ${stu.school} — پایه: ${stu.year_level}`
                                    )
                                }
                                sx={{ textAlign: 'right' }}
                            />
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        </Box>
    )
}
