import React, { useEffect, useState } from 'react'
import {
    Box, Paper, Typography, List, ListItem, Divider, ListItemText, Chip,
    CircularProgress, MenuItem, Select, FormControl, InputLabel, Alert, Button
} from '@mui/material'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'

export default function AdminLicenseList() {
    const [licenses, setLicenses] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [sortMode, setSortMode] = useState('newest')
    const [selfLicenses, setSelfLicenses] = useState([])
    const [selfLoading, setSelfLoading] = useState(true)

    useEffect(() => {
        const fetchLicenses = async () => {
            const { data: authData } = await supabase.auth.getUser()
            const email = authData?.user?.email

            if (email !== 'superadminkhaledi@arcade.dev') {
                setError('⛔ دسترسی غیرمجاز')
                setLoading(false)
                setSelfLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('licenses')
                .select('*, teacher:teachers(username, email)')

            if (error) {
                console.error('License fetch failed:', error.message)
                setError('⛔ خطا در بارگذاری لایسنس‌ها: ' + error.message)
            } else {
                setLicenses(data)
            }
            setLoading(false)

            // Fetch self-learner licenses
            const { data: selfData, error: selfError } = await supabase
                .from('self_learner_licenses')
                .select('*, plan:self_learner_plans(plan_title, slug), user:self_learners!self_learner_id(username,first_name,last_name)')

            if (selfError) {
                console.error('Self-learner license fetch failed:', selfError.message)
            } else {
                setSelfLicenses(selfData)
            }
            setSelfLoading(false)
        }

        fetchLicenses()
    }, [])

    useEffect(() => {
        const now = dayjs()
        let list = [...licenses]

        if (sortMode === 'newest') {
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        } else if (sortMode === 'oldest') {
            list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        } else if (sortMode === 'expired') {
            list = list.filter(l =>
                l.is_used &&
                dayjs(l.redeemed_at).add(durationToMonths(l.duration), 'month').isBefore(now)
            )
        } else if (sortMode === 'active') {
            list = list.filter(l =>
                l.is_used &&
                dayjs(l.redeemed_at).add(durationToMonths(l.duration), 'month').isAfter(now)
            )
        }

        setFiltered(list)
    }, [licenses, sortMode])

    const durationToMonths = (duration) => {
        if (!duration) return 1
        if (duration.includes('24')) return 24
        if (duration.includes('6')) return 6
        if (duration.includes('3')) return 3
        return 1
    }

    // Add a function to refresh both license lists
    const refreshLicenses = async () => {
        setLoading(true);
        setSelfLoading(true);
        setError('');
        // Teacher licenses
        const { data, error } = await supabase
            .from('licenses')
            .select('*, teacher:teachers(username, email)')
        if (error) {
            setError('⛔ خطا در بارگذاری لایسنس‌ها: ' + error.message)
        } else {
            setLicenses(data)
        }
        setLoading(false);
        // Self-learner licenses
        const { data: selfData, error: selfError } = await supabase
            .from('self_learner_licenses')
            .select('*, plan:self_learner_plans(plan_title, slug), user:self_learners!self_learner_id(username,first_name,last_name)')
        if (selfError) {
            console.error('Self-learner license fetch failed:', selfError.message)
        } else {
            setSelfLicenses(selfData)
        }
        setSelfLoading(false);
    };

    if (loading) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ mt: 6, px: 2 }}>
                <Alert severity="error" dir="rtl">{error}</Alert>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundImage: 'url("/bg.png")',
                backgroundSize: 'cover',
                py: 6,
                px: 2,
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <Paper
                dir="rtl"
                sx={{
                    maxWidth: '95vw',
                    width: '100%',
                    p: 4,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 6
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">🎫 لیست لایسنس‌ها</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>مرتب‌سازی</InputLabel>
                            <Select
                                value={sortMode}
                                label="مرتب‌سازی"
                                onChange={(e) => setSortMode(e.target.value)}
                            >
                                <MenuItem value="newest">جدیدترین</MenuItem>
                                <MenuItem value="oldest">قدیمی‌ترین</MenuItem>
                                <MenuItem value="expired">منقضی‌شده</MenuItem>
                                <MenuItem value="active">فعال</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="outlined" onClick={refreshLicenses}>🔄 بروزرسانی</Button>
                    </Box>
                </Box>
                <List>
                    {filtered.map((l, idx) => (
                        <React.Fragment key={l.id}>
                            <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <ListItemText
                                    primary={
                                        <Typography component="span" fontWeight="bold">
                                            🔑 {l.code}
                                            <Chip label={l.duration} size="small" color="info" sx={{ mx: 1 }} />
                                            {l.is_used
                                                ? <Chip label="استفاده شده" color="success" size="small" />
                                                : <Chip label="در انتظار استفاده" color="warning" size="small" />}
                                        </Typography>
                                    }
                                    secondary={
                                        l.is_used ? (
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                👤 کاربر: {l.teacher?.username || '[بدون نام]'}
                                                <br />
                                                📧 ایمیل: {l.teacher?.email || '[نامشخص]'}
                                                <br />
                                                📅 فعال‌سازی: {l.redeemed_at
                                                    ? new Date(l.redeemed_at).toLocaleDateString('fa-IR')
                                                    : '—'}
                                            </Typography>
                                        ) : '⬅️ هنوز استفاده نشده است'
                                    }
                                />
                            </ListItem>
                            {idx < filtered.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
                {/* Self-learner licenses section */}
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>🧑‍💻 لایسنس‌های دانش‌آموز مستقل</Typography>
                {selfLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {selfLicenses.map((l, idx) => (
                            <React.Fragment key={l.id}>
                                <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <ListItemText
                                        primary={
                                            <Typography component="span" fontWeight="bold">
                                                🔑 {l.license_key}
                                                <Chip label={l.plan?.plan_title || l.plan?.slug} size="small" color="info" sx={{ mx: 1 }} />
                                                {l.is_used
                                                    ? <Chip label="استفاده شده" color="success" size="small" />
                                                    : <Chip label="در انتظار استفاده" color="warning" size="small" />}
                                            </Typography>
                                        }
                                        secondary={
                                            l.is_used ? (
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    👤 کاربر: {l.user ? ((l.user.first_name && l.user.last_name) ? `${l.user.first_name} ${l.user.last_name}` : l.user.username) : '[بدون نام]'}
                                                    <br />
                                                    📅 استفاده: {l.used_at
                                                        ? new Date(l.used_at).toLocaleDateString('fa-IR')
                                                        : '—'}
                                                </Typography>
                                            ) : '⬅️ هنوز استفاده نشده است'
                                        }
                                    />
                                </ListItem>
                                {idx < selfLicenses.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    )
}
