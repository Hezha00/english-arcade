import { createClient } from '@supabase/supabase-js'

// 1. 🔑 Supabase config
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseServiceKey = 'your-service-role-key' // Must be the secret service key!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 2. 📋 List of students to create
const students = [
    { username: 'student1', password: '1234' },
    { username: 'student2', password: 'abcd' },
    { username: 'student3', password: 'pass2024' }
    // 👉 Add more here
]

// 3. 🚀 Create users and insert into students table
async function createStudents() {
    for (const student of students) {
        const email = `${student.username}@arcade.dev`

        // 3.1 Create Supabase Auth user
        const { data: authUser, error: signupError } = await supabase.auth.admin.createUser({
            email,
            password: student.password,
            email_confirm: true
        })

        if (signupError) {
            console.error(`❌ Failed to create ${student.username}:`, signupError.message)
            continue
        }

        const authId = authUser.user.id

        // 3.2 Insert into 'students' table
        const { error: dbError } = await supabase
            .from('students')
            .insert([
                {
                    username: student.username,
                    auth_id: authId,
                    login_streak: 0,
                    last_login: null
                }
            ])

        if (dbError) {
            console.error(`⚠️ Created Auth user but failed DB insert for ${student.username}:`, dbError.message)
        } else {
            console.log(`✅ Created student: ${student.username}`)
        }
    }
}

createStudents()
