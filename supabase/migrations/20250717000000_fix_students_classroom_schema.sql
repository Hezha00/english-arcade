-- Fix database schema issues for students table
-- This migration adds classroom_id field and updates existing data

-- 1. Add classroom_id column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS classroom_id uuid;

-- 2. Create classrooms for existing students based on their classroom name
-- First, insert unique classroom combinations into classrooms table
INSERT INTO public.classrooms (name, school, teacher_id, year_level)
SELECT DISTINCT 
    s.classroom,
    s.school,
    s.teacher_id,
    s.year_level
FROM public.students s
WHERE s.classroom IS NOT NULL 
    AND s.classroom != ''
    AND s.teacher_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.classrooms c 
        WHERE c.name = s.classroom 
        AND c.teacher_id = s.teacher_id
    );

-- 3. Update students table to set classroom_id based on classroom name
UPDATE public.students 
SET classroom_id = c.id
FROM public.classrooms c
WHERE public.students.classroom = c.name 
    AND public.students.teacher_id = c.teacher_id
    AND public.students.classroom_id IS NULL;

-- 4. Create index on classroom_id for better performance
CREATE INDEX IF NOT EXISTS idx_students_classroom_id ON public.students(classroom_id);

-- Note: The classroom field is kept for backward compatibility
-- You can remove it later if all code is updated to use classroom_id 