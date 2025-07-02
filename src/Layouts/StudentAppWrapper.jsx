import React from 'react'
import { Box, Toolbar, LinearProgress } from '@mui/material'
import StudentNavbar from '../components/StudentNavbar'

export default function StudentAppWrapper({ children, student }) {
    if (!student) return <LinearProgress sx={{ mt: 10 }} />

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <StudentNavbar student={student} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
}
