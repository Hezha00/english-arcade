// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function ProtectedRoute({ children }) {
    const [sessionChecked, setSessionChecked] = useState(false)
    const [authed, setAuthed] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setAuthed(!!user)
            setSessionChecked(true)
        }

        checkUser()
    }, [])

    if (!sessionChecked) {
        return (
            <Box sx={{ mt: 10, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        )
    }

    return authed ? children : <Navigate to="/teacher-auth" replace />
}
