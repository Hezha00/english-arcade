// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400'
};

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Input validation
const validateInput = (data: any) => {
    const errors: string[] = [];

    if (!data.teacher_id || typeof data.teacher_id !== 'string') {
        errors.push('teacher_id is required and must be a string');
    }
    if (!data.classroom || typeof data.classroom !== 'string' || data.classroom.trim().length === 0) {
        errors.push('classroom is required and must be a non-empty string');
    }
    if (!data.school || typeof data.school !== 'string' || data.school.trim().length === 0) {
        errors.push('school is required and must be a non-empty string');
    }
    if (!data.year_level || typeof data.year_level !== 'string' || data.year_level.trim().length === 0) {
        errors.push('year_level is required and must be a non-empty string');
    }
    if (!data.students || !Array.isArray(data.students) || data.students.length === 0) {
        errors.push('students is required and must be a non-empty array');
    } else {
        data.students.forEach((student: any, index: number) => {
            if (!student.first_name || typeof student.first_name !== 'string' || student.first_name.trim().length === 0) {
                errors.push(`students[${index}].first_name is required and must be a non-empty string`);
            }
            if (!student.last_name || typeof student.last_name !== 'string' || student.last_name.trim().length === 0) {
                errors.push(`students[${index}].last_name is required and must be a non-empty string`);
            }
        });
    }

    return errors;
};

// Rate limiting check
const checkRateLimit = (teacherId: string) => {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 5; // Max 5 requests per minute (bulk operation)

    const record = rateLimitMap.get(teacherId);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(teacherId, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false;
    }

    record.count++;
    return true;
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    try {
        const requestData = await req.json();

        // Input validation
        const validationErrors = validateInput(requestData);
        if (validationErrors.length > 0) {
            return new Response(JSON.stringify({
                error: 'Validation failed',
                details: validationErrors
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        const { teacher_id, classroom, school, year_level, students } = requestData;

        // Rate limiting
        if (!checkRateLimit(teacher_id)) {
            return new Response(JSON.stringify({
                error: 'Rate limit exceeded. Please try again later.'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429
            });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const errors: any[] = [];
        const successes: any[] = [];

        // Step 1: Create or get classroom
        let classroomId: string | null = null;

        console.log('🔍 Looking for classroom:', { classroom, teacher_id });

        // First, try to find existing classroom (case-insensitive and trimmed)
        const { data: existingClassrooms, error: searchError } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('teacher_id', teacher_id)
            .ilike('name', classroom.trim());

        if (searchError) {
            console.error('❌ Error searching for classroom:', searchError);
            return new Response(JSON.stringify({
                error: 'Failed to search for classroom',
                details: searchError.message
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        console.log('🔍 Found classrooms:', existingClassrooms);

        if (existingClassrooms && existingClassrooms.length > 0) {
            // Use the first matching classroom
            classroomId = existingClassrooms[0].id;
            console.log('✅ Using existing classroom:', existingClassrooms[0].name);
        } else {
            // Create new classroom
            console.log('🆕 Creating new classroom:', classroom);
            const { data: newClassroom, error: classErr } = await supabase
                .from('classrooms')
                .insert({
                    name: classroom.trim(),
                    school,
                    teacher_id,
                    year_level
                })
                .select('id')
                .single();

            if (classErr) {
                console.error('❌ Error creating classroom:', classErr);
                return new Response(JSON.stringify({
                    error: 'Failed to create classroom',
                    details: classErr.message
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400
                });
            }

            classroomId = newClassroom.id;
            console.log('✅ Created new classroom with ID:', classroomId);
        }

        // Step 2: Create students
        for (const s of students) {
            const first = s.first_name?.trim();
            const last = s.last_name?.trim();

            if (!first || !last) {
                errors.push({ step: 'validation', message: 'Missing first_name or last_name', student: s });
                continue;
            }

            // Generate a unique username
            let username: string;
            let usernameTries = 0;
            do {
                username = `${first.toLowerCase()}${Math.floor(Math.random() * 900 + 100)}`;
                const { data: existingStudent } = await supabase
                    .from('students')
                    .select('id')
                    .eq('username', username)
                    .maybeSingle();
                if (!existingStudent) break;
                usernameTries++;
            } while (usernameTries < 10);

            if (usernameTries === 10) {
                errors.push({ step: 'username', message: 'Could not generate unique username', first, last });
                continue;
            }

            const password = generatePassword();
            const email = `${username}@arcade.dev`;
            const fullName = `${first} ${last}`;

            // Step 3: Create Auth user with role: student
            const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: 'student' }
            });

            if (authErr) {
                console.error('❌ Auth user error:', authErr.message);
                errors.push({ step: 'auth', email, message: authErr.message });
                continue;
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
            });

            if (dbErr) {
                // Clean up orphaned Auth user
                await supabase.auth.admin.deleteUser(authUser.user?.id || '');
                console.error('❌ Database error:', dbErr.message);
                errors.push({ step: 'database', email, message: dbErr.message });
                continue;
            }

            successes.push({
                name: fullName,
                username,
                password,
                email
            });

            console.log('✅ Created student:', username);
        }

        return new Response(JSON.stringify({
            success: true,
            created: successes.length,
            failed: errors.length,
            successes,
            errors
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (err) {
        console.error('Unexpected error:', err);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            details: err instanceof Error ? err.message : 'Unknown error'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});

function generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    return Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
}
