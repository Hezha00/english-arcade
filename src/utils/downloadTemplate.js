// src/utils/downloadTemplate.js
import { supabase } from '../supabaseClient'

export async function downloadTemplate(template, teacherId) {
    if (!teacherId) throw new Error('teacherId is required')
    if (!template || !template.template_name) throw new Error('قالب بازی معتبر نیست')

    // Check if already downloaded
    const { data: existing, error: checkError } = await supabase
        .from('downloaded_games')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('template_name', template.template_name)
        .single()

    if (existing) {
        throw new Error(`⚠️ بازی "${template.template_name}" قبلاً دانلود شده است`)
    }

    // Always insert a non-null file_url (use placeholder for local templates)
    const fileUrl = template.file_url || (`/games/${template.type}.json`)
    const { error } = await supabase.from('downloaded_games').insert({
        teacher_id: teacherId,
        template_name: template.template_name,
        file_url: fileUrl,
        downloaded_at: new Date().toISOString()
    })

    if (error) {
        console.error('❌ Error downloading template:', error)
        throw new Error('خطا در ذخیره بازی: ' + (error.message || error))
    }

    return `✅ بازی "${template.template_name}" به مخزن شما اضافه شد`
}
