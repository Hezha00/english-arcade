
import StudentAppWrapper from '../layouts/StudentAppWrapper'

import React, { useEffect, useState } from 'react'
import {
    Typography, Container, List, ListItem, ListItemText, Divider, Button
} from '@mui/material'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function StudentGames() {
    const [games, setGames] = useState([])
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem('student')
        if (!saved) navigate('/student-login')
        else setStudent(JSON.parse(saved))
    }, [])

    useEffect(() => {
        if (student) fetchGames()
    }, [student])

    const fetchGames = async () => {
        const { data } = await supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false })

        const filtered = data.filter(g =>
            g.is_global || g.name.includes(student.classroom)
        )

        setGames(filtered)
    }

    return (
        <StudentAppWrapper profileColor={student?.profile_color}>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    بازی‌های شما
                </Typography>
                <List>
                    {games.map(game => (
                        <React.Fragment key={game.id}>
                            <ListItem
                                secondaryAction={
                                    <Button
                                        variant="outlined"
                                        href={game.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        اجرا
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={game.name}
                                    secondary={game.description || 'بدون توضیح'}
                                    sx={{ textAlign: 'right' }}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Container>
        </StudentAppWrapper>
    )
}
