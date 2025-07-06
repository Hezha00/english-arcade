import React, { useEffect, useState } from 'react'
import {
    Container, Typography, InputLabel, MenuItem, Select, FormControl
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function ClassProgress() {
    const [classrooms, setClassrooms] = useState([])
    const [selected, setSelected] = useState('')
    const [data, setData] = useState([])

    useEffect(() => {
        fetchClassrooms()
    }, [])

    const fetchClassrooms = async () => {
        const { data: auth } = await supabase.auth.getUser()
        const teacherAuthId = auth?.user?.id

        const { data } = await supabase
            .from('classrooms')
            .select('name')
            .eq('teacher_id', teacherAuthId)

        setClassrooms(data || [])
    }

    useEffect(() => {
        if (selected) fetchData()
    }, [selected])

    const fetchData = async () => {
        const { data } = await supabase
            .from('results')
            .select('*')
            .eq('classroom', selected)

        const grouped = {}
        data.forEach(r => {
            if (!grouped[r.username]) grouped[r.username] = 0
            grouped[r.username] += r.score
        })

        const chart = Object.entries(grouped).map(([name, score]) => ({ name, score }))
        setData(chart)
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>نمودار پیشرفت کلاس</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>کلاس</InputLabel>
                    <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
                        {classrooms.map(cls => (
                            <MenuItem key={cls.name} value={cls.name}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {data.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="score" fill="#1976d2" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Container>
        </TeacherLayout>
    )
}
