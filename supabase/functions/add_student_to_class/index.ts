// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400'
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    try {
        const { teacher_id, classroom, school, year_level, first_name, last_name } = await req.json();

        if (!teacher_id || !classroom || !school || !year_level || !first_name || !last_name) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Generate a unique username
        let username;
        let usernameTries = 0;
        do {
            username = `${first_name.toLowerCase()}${Math.floor(100 + Math.random() * 900)}`;
            const { data: existingStudent } = await supabase
                .from('students')
                .select('id')
                .eq('username', username)
                .maybeSingle();
            if (!existingStudent) break;
            usernameTries++;
        } while (usernameTries < 10);
        if (usernameTries === 10) {
            return new Response(JSON.stringify({ error: 'Could not generate unique username' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        const password = generatePassword();
        const email = `${username}@arcade.dev`;
        const fullName = `${first_name} ${last_name}`;

        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'student' }
        });

        if (authErr || !authUser?.user?.id) {
            return new Response(JSON.stringify({ error: authErr?.message || 'Failed to create auth user' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        const auth_id = authUser.user.id;

        // Insert into students table with id = auth_id
        const { error: dbErr } = await supabase.from('students').insert([{
            id: auth_id,
            name: fullName,
            username,
            password,
            auth_id,
            teacher_id,
            classroom,
            school,
            year_level
        }]);

        if (dbErr) {
            // Clean up orphaned Auth user
            await supabase.auth.admin.deleteUser(auth_id);
            return new Response(JSON.stringify({ error: dbErr.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        return new Response(JSON.stringify({
            success: true,
            name: fullName,
            username,
            password
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
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
