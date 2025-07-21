import React, { useEffect, useState } from 'react'
import {
    Container, Typography, FormControl, InputLabel, Select,
    MenuItem, Button
} from '@mui/material'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { supabase } from '../supabaseClient'
import TeacherLayout from '../components/TeacherLayout'

export default function ExportResults() {
    const [classrooms, setClassrooms] = useState([])
    const [selectedClass, setSelectedClass] = useState('')

    useEffect(() => {
        fetchClassrooms()
    }, [])

    const fetchClassrooms = async () => {
        const { data: auth } = await supabase.auth.getUser()
        const teacherAuthId = auth?.user?.id

        const { data } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('teacher_id', teacherAuthId)

        setClassrooms(data || [])
    }

    const exportResults = async () => {
        const { data } = await supabase
            .from('results')
            .select('*')
            .eq('classroom_id', selectedClass)

        const formatted = data.map(r => ({
            دانش‌آموز: r.username,
            نمره: `${r.score} / ${r.total}`,
            تاریخ: new Date(r.submitted_at).toLocaleDateString('fa-IR')
        }))

        const ws = XLSX.utils.json_to_sheet(formatted)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'نتایج')

        const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
        saveAs(new Blob([buf]), `نتایج-${selectedClass}.xlsx`)
    }

    return (
        <TeacherLayout>
            <Container dir="rtl" sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>خروجی اکسل نتایج</Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>کلاس</InputLabel>
                    <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {classrooms.map(cls => (
                            <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" onClick={exportResults} disabled={!selectedClass}>
                    دانلود فایل Excel
                </Button>
            </Container>
        </TeacherLayout>
    )
}
