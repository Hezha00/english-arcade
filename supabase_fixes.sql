-- =====================================================
-- SUPABASE FIXES FOR GAME CREATION AND ASSIGNMENT SYSTEM
-- =====================================================

-- 1. Fix game_assignments table structure (if needed)
-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'game_assignments' AND column_name = 'expires_at') THEN
        ALTER TABLE game_assignments ADD COLUMN expires_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'game_assignments' AND column_name = 'is_active') THEN
        ALTER TABLE game_assignments ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. Fix games table structure (if needed)
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'games' AND column_name = 'is_active') THEN
        ALTER TABLE games ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Ensure game_content is properly typed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'games' AND column_name = 'game_content') THEN
        ALTER TABLE games ADD COLUMN game_content JSONB;
    END IF;
END $$;

-- 3. Drop conflicting RLS policies (clean up duplicates)
DROP POLICY IF EXISTS "Students can read assigned games" ON games;
DROP POLICY IF EXISTS "Students can view game assignments" ON game_assignments;
DROP POLICY IF EXISTS "Teachers can view game assignments" ON game_assignments;

-- 4. Create proper RLS policies for game_assignments table
-- Students can view game assignments for their classroom
CREATE POLICY "Students can view game assignments for their classroom" ON game_assignments
    FOR SELECT USING (
        classroom IN (
            SELECT classroom 
            FROM students 
            WHERE auth_id = auth.uid()
        )
    );

-- Teachers can view their own game assignments
CREATE POLICY "Teachers can view their own game assignments" ON game_assignments
    FOR SELECT USING (
        teacher_id = auth.uid()
    );

-- Teachers can create game assignments for their classrooms
CREATE POLICY "Teachers can create game assignments" ON game_assignments
    FOR INSERT WITH CHECK (
        teacher_id = auth.uid() AND
        classroom IN (
            SELECT name 
            FROM classrooms 
            WHERE teacher_id = auth.uid()
        )
    );

-- Teachers can update their own game assignments
CREATE POLICY "Teachers can update their own game assignments" ON game_assignments
    FOR UPDATE USING (
        teacher_id = auth.uid()
    );

-- Teachers can delete their own game assignments
CREATE POLICY "Teachers can delete their own game assignments" ON game_assignments
    FOR DELETE USING (
        teacher_id = auth.uid()
    );

-- 5. Create proper RLS policies for games table
-- Students can read games assigned to their classroom
CREATE POLICY "Students can read assigned games" ON games
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM game_assignments ga
            JOIN students s ON s.classroom = ga.classroom
            WHERE ga.game_id = games.id 
            AND s.auth_id = auth.uid()
            AND ga.is_active = true
        )
        OR is_global = true
    );

-- Teachers can read their own games and global games
CREATE POLICY "Teachers can read own and global games" ON games
    FOR SELECT USING (
        teacher_id = auth.uid() OR is_global = true
    );

-- Teachers can create games
CREATE POLICY "Teachers can create games" ON games
    FOR INSERT WITH CHECK (
        teacher_id = auth.uid()
    );

-- Teachers can update their own games
CREATE POLICY "Teachers can update their own games" ON games
    FOR UPDATE USING (
        teacher_id = auth.uid()
    );

-- Teachers can delete their own games
CREATE POLICY "Teachers can delete their own games" ON games
    FOR DELETE USING (
        teacher_id = auth.uid()
    );

-- 6. Create proper RLS policies for student_game_status table
-- Students can read their own game status
CREATE POLICY "Students can read their own game status" ON student_game_status
    FOR SELECT USING (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE auth_id = auth.uid()
        )
    );

-- Students can create their own game status
CREATE POLICY "Students can create their own game status" ON student_game_status
    FOR INSERT WITH CHECK (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE auth_id = auth.uid()
        )
    );

-- Teachers can read game status for their games
CREATE POLICY "Teachers can read game status for their games" ON student_game_status
    FOR SELECT USING (
        game_id IN (
            SELECT id 
            FROM games 
            WHERE teacher_id = auth.uid()
        )
    );

-- 7. Create proper RLS policies for results table (for game results)
-- Students can read their own results
CREATE POLICY "Students can read their own results" ON results
    FOR SELECT USING (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE auth_id = auth.uid()
        )
    );

-- Students can create their own results
CREATE POLICY "Students can create their own results" ON results
    FOR INSERT WITH CHECK (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE auth_id = auth.uid()
        )
    );

-- Teachers can read results for their games/assignments
CREATE POLICY "Teachers can read results for their content" ON results
    FOR SELECT USING (
        assignment_id IN (
            SELECT id 
            FROM assignments 
            WHERE teacher_id = auth.uid()
        )
        OR game_id IN (
            SELECT id 
            FROM games 
            WHERE teacher_id = auth.uid()
        )
    );

-- 8. Enable RLS on all tables (if not already enabled)
ALTER TABLE game_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_game_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_assignments_classroom ON game_assignments(classroom);
CREATE INDEX IF NOT EXISTS idx_game_assignments_teacher_id ON game_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_game_assignments_game_id ON game_assignments(game_id);
CREATE INDEX IF NOT EXISTS idx_games_teacher_id ON games(teacher_id);
CREATE INDEX IF NOT EXISTS idx_games_is_global ON games(is_global);
CREATE INDEX IF NOT EXISTS idx_student_game_status_student_id ON student_game_status(student_id);
CREATE INDEX IF NOT EXISTS idx_student_game_status_game_id ON student_game_status(game_id);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_game_id ON results(game_id);

-- 10. Create function to get student's assigned games
CREATE OR REPLACE FUNCTION get_student_games(student_auth_id UUID)
RETURNS TABLE (
    game_id UUID,
    game_name TEXT,
    game_description TEXT,
    file_url TEXT,
    game_content JSONB,
    classroom TEXT,
    assigned_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id as game_id,
        g.name as game_name,
        g.description as game_description,
        g.file_url,
        g.game_content,
        ga.classroom,
        ga.assigned_at,
        ga.expires_at,
        ga.is_active
    FROM games g
    JOIN game_assignments ga ON g.id = ga.game_id
    JOIN students s ON s.classroom = ga.classroom
    WHERE s.auth_id = student_auth_id
    AND ga.is_active = true
    AND (ga.expires_at IS NULL OR ga.expires_at > NOW())
    AND (g.expires_at IS NULL OR g.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to get teacher's game assignments
CREATE OR REPLACE FUNCTION get_teacher_game_assignments(teacher_auth_id UUID)
RETURNS TABLE (
    assignment_id UUID,
    game_id UUID,
    game_name TEXT,
    classroom TEXT,
    assigned_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN,
    student_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ga.id as assignment_id,
        ga.game_id,
        g.name as game_name,
        ga.classroom,
        ga.assigned_at,
        ga.expires_at,
        ga.is_active,
        COUNT(s.id) as student_count
    FROM game_assignments ga
    JOIN games g ON g.id = ga.game_id
    LEFT JOIN students s ON s.classroom = ga.classroom
    WHERE ga.teacher_id = teacher_auth_id
    GROUP BY ga.id, ga.game_id, g.name, ga.classroom, ga.assigned_at, ga.expires_at, ga.is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_student_games(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_teacher_game_assignments(UUID) TO authenticated;

-- 13. Create trigger to automatically set teacher_id in game_assignments
CREATE OR REPLACE FUNCTION set_teacher_id_from_auth()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.teacher_id IS NULL THEN
        NEW.teacher_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_teacher_id_trigger
    BEFORE INSERT ON game_assignments
    FOR EACH ROW
    EXECUTE FUNCTION set_teacher_id_from_auth();

-- 14. Create trigger to automatically set teacher_id in games
CREATE TRIGGER set_game_teacher_id_trigger
    BEFORE INSERT ON games
    FOR EACH ROW
    EXECUTE FUNCTION set_teacher_id_from_auth();

-- 15. Create view for easier game assignment management
CREATE OR REPLACE VIEW game_assignments_view AS
SELECT 
    ga.id,
    ga.game_id,
    g.name as game_name,
    g.description as game_description,
    ga.classroom,
    ga.teacher_id,
    t.email as teacher_email,
    ga.assigned_at,
    ga.expires_at,
    ga.is_active,
    COUNT(s.id) as student_count
FROM game_assignments ga
JOIN games g ON g.id = ga.game_id
JOIN teachers t ON t.auth_id = ga.teacher_id
LEFT JOIN students s ON s.classroom = ga.classroom
GROUP BY ga.id, ga.game_id, g.name, g.description, ga.classroom, ga.teacher_id, t.email, ga.assigned_at, ga.expires_at, ga.is_active;

-- Grant access to the view
GRANT SELECT ON game_assignments_view TO authenticated;

-- 16. Create function to mark game as completed by student
CREATE OR REPLACE FUNCTION mark_game_completed(game_uuid UUID, student_auth_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    student_record_id UUID;
BEGIN
    -- Get student ID from auth_id
    SELECT id INTO student_record_id
    FROM students
    WHERE auth_id = student_auth_uuid;
    
    IF student_record_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update game completion status
    INSERT INTO student_game_status (student_id, game_id, completed_at)
    VALUES (student_record_id, game_uuid, NOW())
    ON CONFLICT (student_id, game_id) 
    DO UPDATE SET completed_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_game_completed(UUID, UUID) TO authenticated;

-- =====================================================
-- END OF SUPABASE FIXES
-- ===================================================== 