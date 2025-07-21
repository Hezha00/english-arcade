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
        classroom_id: '', profileColor: ''
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
            .select('id, name')
            .eq('teacher_id', teacherAuthId)

        const { data: stu } = await supabase
            .from('students')
            .select('*, classroom:classroom_id(name)')
            .eq('teacher_id', teacherAuthId)
            .order('created_at', { ascending: false })

        setClassrooms(cls || [])
        setStudents(stu || [])
    }

    const handleAdd = async () => {
        const { data: session } = await supabase.auth.getUser()
        const teacherId = session.user.id
        const { username, password, school, year, classroom_id, profileColor } = form

        // Check username uniqueness in students table
        const { data: existingStudent } = await supabase
            .from('students')
            .select('id')
            .eq('username', username)
            .maybeSingle();
        if (existingStudent) {
            alert('این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید.')
            return
        }

        const finalPassword = password || Math.random().toString(36).slice(-8)
        const email = `${username}@arcade.dev`

        // Step 1: Create Auth user with role: student
        const { data: auth, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: finalPassword,
            email_confirm: true,
            user_metadata: { role: 'student' }
        })

        if (authError) {
            alert(`خطا در ایجاد حساب: ${authError.message}`)
            return
        }

        const authId = auth.user.id

        // Step 2: Insert into students table with id = authId
        const { error: dbError } = await supabase.from('students').insert({
            id: authId,
            username,
            password: finalPassword,
            auth_id: authId,
            teacher_id: teacherId,
            school,
            classroom_id,
            year_level: year,
            profile_color: profileColor
        })

        if (dbError) {
            // Clean up orphaned Auth user
            await supabase.auth.admin.deleteUser(authId)
            alert(`خطا در ثبت اطلاعات دانش‌آموز: ${dbError.message}`)
            return
        }

        setForm({ username: '', password: '', school: '', year: '', classroom_id: '', profileColor: '' })
        fetchData()
    }

    const handleDelete = async (id) => {
        await supabase.from('students').delete().eq('id', id)
        fetchData()
    }

    const handleSave = async (id) => {
        // Prevent duplicate usernames on edit
        if (editingFields.username) {
            const { data: existingStudent } = await supabase
                .from('students')
                .select('id')
                .eq('username', editingFields.username)
                .maybeSingle();
            if (existingStudent && existingStudent.id !== id) {
                alert('این نام کاربری قبلاً ثبت شده است. لطفاً نام کاربری دیگری انتخاب کنید.')
                return
            }
        }
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
            کلاس: s.classroom?.name || '',
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
                        value={form.classroom_id}
                        onChange={(e) => setForm({ ...form, classroom_id: e.target.value })}
                        onBlur={(e) => setForm({ ...form, classroom_id: e.target.value })}
                        label="کلاس"
                    >
                        {classrooms.map((cls) => (
                            <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                        ))}
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
                                        `${stu.username} (${stu.classroom?.name || ''})`
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
