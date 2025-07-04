// src/utils/downloadTemplate.js
import { supabase } from '../supabaseClient'

export async function downloadTemplate(template, teacherId) {
    if (!teacherId) throw new Error('teacherId is required')

    // Check if already downloaded
    const { data: existing, error: checkError } = await supabase
        .from('downloaded_games')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('template_name', template.name)
        .single()

    if (existing) {
        throw new Error(`⚠️ بازی "${template.name}" قبلاً دانلود شده است`)
    }

    const { error } = await supabase.from('downloaded_games').insert({
        teacher_id: teacherId,
        template_name: template.name,
        file_url: template.file_url,
        downloaded_at: new Date().toISOString()
    })

    if (error) {
        console.error('❌ Error downloading template:', error)
        throw error
    }

    return `✅ بازی "${template.name}" به مخزن شما اضافه شد`
}
