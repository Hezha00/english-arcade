import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Paper, List, ListItem, ListItemText,
    Divider, IconButton, InputAdornment, TextField, Snackbar
} from '@mui/material'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import SearchIcon from '@mui/icons-material/Search'
import { supabase } from '../supabaseClient'

export default function TeacherStudentsList() {
    const [students, setStudents] = useState([])
    const [teacherId, setTeacherId] = useState(null)
    const [searchSchool, setSearchSchool] = useState('')
    const [searchClass, setSearchClass] = useState('')
    const [copiedUsername, setCopiedUsername] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const { data: userData } = await supabase.auth.getUser()
            const id = userData?.user?.id
            setTeacherId(id)

            if (id) {
                const { data, error } = await supabase
                    .from('students')
                    .select('*, classroom:classroom_id(name)')
                    .eq('teacher_id', id)
                    .order('school', { ascending: true })

                if (!error) setStudents(data)
            }
        }

        fetchData()
    }, [])

    const filtered = students.filter((s) =>
        s.school.toLowerCase().includes(searchSchool.toLowerCase()) &&
        (s.classroom?.name || '').toLowerCase().includes(searchClass.toLowerCase())
    )

    const handleCopy = (username) => {
        navigator.clipboard.writeText(username + '@arcade.dev')
        setCopiedUsername(username)
    }

    return (
        <Box
            sx={{
                width: '100vw',
                minHeight: '100vh',
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                py: 6,
                px: 2,
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <Paper
                dir="rtl"
                sx={{
                    maxWidth: 600,
                    width: '100%',
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(6px)',
                    boxShadow: 6
                }}
            >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    لیست دانش‌آموزان
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <TextField
                        label="جستجوی مدرسه"
                        value={searchSchool}
                        onChange={(e) => setSearchSchool(e.target.value)}
                        size="small"
                        InputProps={{ endAdornment: <SearchIcon /> }}
                    />
                    <TextField
                        label="جستجوی کلاس"
                        value={searchClass}
                        onChange={(e) => setSearchClass(e.target.value)}
                        size="small"
                        InputProps={{ endAdornment: <SearchIcon /> }}
                    />
                </Box>

                <List>
                    {filtered.map((s, idx) => (
                        <React.Fragment key={s.id}>
                            <ListItem
                                secondaryAction={
                                    <IconButton onClick={() => handleCopy(s.username)} title="کپی ایمیل ورود">
                                        <FileCopyIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={`👤 ${s.username}`}
                                    secondary={`🏫 ${s.school} | �� کلاس ${s.classroom?.name || 'نامشخص'}`}
                                />
                            </ListItem>
                            {idx < filtered.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>

                <Snackbar
                    open={!!copiedUsername}
                    autoHideDuration={2000}
                    onClose={() => setCopiedUsername('')}
                    message={`ایمیل ${copiedUsername}@arcade.dev کپی شد ✅`}
                />
            </Paper>
        </Box>
    )
}
