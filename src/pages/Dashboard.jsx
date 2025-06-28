import React from 'react'
import { Typography } from '@mui/material'
import TeacherLayout from '../components/TeacherLayout'

export default function Dashboard() {
    return (
        <TeacherLayout>
            <Typography variant="h6">به داشبورد خوش آمدید!</Typography>
            <Typography>در اینجا می‌توانید کلاس‌ها، دانش‌آموزان، بازی‌ها و تکالیف را مدیریت کنید.</Typography>
        </TeacherLayout>
    )
}
