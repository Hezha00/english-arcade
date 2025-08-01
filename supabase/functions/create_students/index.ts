// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('OK', { headers: corsHeaders })
    }

    try {
        const { teacher_id, classroom, school, year_level, students } = await req.json()

        console.log('📨 Received payload:', {
            teacher_id, classroom, school, year_level, student_count: students?.length
        })

        if (!teacher_id || !classroom || !school || !year_level || !Array.isArray(students) || students.length === 0) {
            console.error('❌ Missing fields:', {
                teacher_id, classroom, school, year_level, students
            })

            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const errors: any[] = []
        const created: { username: string; password: string }[] = []

        // Step 1: Create or get classroom
        let classroomId: string | null = null

        // First, try to find existing classroom
        const { data: existingClassroom } = await supabase
            .from('classrooms')
            .select('id')
            .eq('name', classroom)
            .eq('teacher_id', teacher_id)
            .maybeSingle()

        if (existingClassroom) {
            classroomId = existingClassroom.id
        } else {
            // Create new classroom
            const { data: newClassroom, error: classErr } = await supabase
                .from('classrooms')
                .insert({
                    name: classroom,
                    school,
                    teacher_id,
                    year_level
                })
                .select('id')
                .single()

            if (classErr) {
                console.error('❌ Classroom insert error:', classErr.message)
                errors.push({ step: 'classroom', message: classErr.message })
                return new Response(JSON.stringify({ error: 'Failed to create classroom', details: classErr.message }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400
                })
            }

            classroomId = newClassroom.id
        }

        // Step 2: Create students
        for (const s of students) {
            const first = s.first_name?.trim()
            const last = s.last_name?.trim()

            if (!first || !last) continue

            // Generate a unique username
            let username
            let usernameTries = 0
            do {
                username = `${first.toLowerCase()}${Math.floor(Math.random() * 900 + 100)}`
                const { data: existingStudent } = await supabase
                    .from('students')
                    .select('id')
                    .eq('username', username)
                    .maybeSingle()
                if (!existingStudent) break
                usernameTries++
            } while (usernameTries < 10)
            if (usernameTries === 10) {
                errors.push({ step: 'username', message: 'Could not generate unique username', first, last })
                continue
            }

            const password = generatePassword()
            const email = `${username}@arcade.dev`
            const fullName = `${first} ${last}`

            // Step 3: Create Auth user with role: student
            const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: 'student' }
            })

            if (authErr) {
                console.error('❌ Auth user error:', authErr.message)
                errors.push({ step: 'auth', email, message: authErr.message })
                continue
            }

            // Step 4: Insert into students table with both classroom and classroom_id
            const { error: dbErr } = await supabase.from('students').insert({
                id: authUser.user?.id,
                name: fullName,
                username,
                password,
                auth_id: authUser.user?.id,
                teacher_id,
                classroom, // Keep for backward compatibility
                classroom_id: classroomId, // New field
                school,
                year_level
            })

            if (dbErr) {
                // Clean up orphaned Auth user
                await supabase.auth.admin.deleteUser(authUser.user?.id)
                console.error('❌ DB insert error:', dbErr.message)
                errors.push({ step: 'students', username, message: dbErr.message })
                continue
            }

            created.push({ username, password })
        }

        return new Response(JSON.stringify({ created, errors }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })
    } catch (err) {
        console.error('❌ Unexpected server error:', err)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        })
    }
})

function generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    return Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
}
