// SessionGuard.jsx
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function SessionGuard({ children }) {
    const [sessionChecked, setSessionChecked] = useState(false)
    const [authed, setAuthed] = useState(false)

    useEffect(() => {
        const verifySession = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setAuthed(!!user)
            setSessionChecked(true)
        }

        verifySession()
    }, [])

    if (!sessionChecked) {
        return (
            <Box sx={{ mt: 10, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!authed) {
        return <Navigate to="/teacher-auth" replace />
    }

    return children
}
