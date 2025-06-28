import React, { useState, useEffect } from 'react'
import {
    Typography, TextField, Button, Box, List, ListItem, ListItemText, Divider
} from '@mui/material'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function Classrooms() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [classrooms, setClassrooms] = useState([])

    useEffect(() => {
        fetchClassrooms()
    }, [])

    const fetchClassrooms = async () => {
        const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error) setClassrooms(data)
    }

    const handleAdd = async () => {
        const {
            data: { user }
        } = await supabase.auth.getUser()

        const { error } = await supabase.from('classrooms').insert([
            {
                name,
                description,
                teacher_id: user.id
            }
        ])

        if (!error) {
            setName('')
            setDescription('')
            fetchClassrooms()
        }
    }

    return (
        <TeacherLayout>
            <Typography variant="h6" gutterBottom>
                کلاس‌های من
            </Typography>

            <Box component="form" sx={{ mb: 4 }} noValidate autoComplete="off">
                <TextField
                    label="نام کلاس"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <TextField
                    label="توضیحات"
                    fullWidth
                    margin="normal"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <Button variant="contained" onClick={handleAdd}>
                    افزودن کلاس
                </Button>
            </Box>

            <List>
                {classrooms.map(classroom => (
                    <React.Fragment key={classroom.id}>
                        <ListItem>
                            <ListItemText
                                primary={classroom.name}
                                secondary={classroom.description || 'بدون توضیحات'}
                                sx={{ textAlign: 'right' }}
                            />
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        </TeacherLayout>
    )
}
