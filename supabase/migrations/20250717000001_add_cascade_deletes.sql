-- Add cascade deletes and fix database inconsistencies

-- 1. Add foreign key constraints with cascade deletes
ALTER TABLE public.students 
ADD CONSTRAINT fk_students_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(auth_id) ON DELETE CASCADE;

ALTER TABLE public.students 
ADD CONSTRAINT fk_students_classroom_id 
FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE SET NULL;

ALTER TABLE public.classrooms 
ADD CONSTRAINT fk_classrooms_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(auth_id) ON DELETE CASCADE;

ALTER TABLE public.assignments 
ADD CONSTRAINT fk_assignments_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(auth_id) ON DELETE CASCADE;

ALTER TABLE public.assignments 
ADD CONSTRAINT fk_assignments_classroom_id 
FOREIGN KEY (classroom_id) REFERENCES public.classrooms(id) ON DELETE CASCADE;

ALTER TABLE public.games 
ADD CONSTRAINT fk_games_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(auth_id) ON DELETE CASCADE;

ALTER TABLE public.game_assignments 
ADD CONSTRAINT fk_game_assignments_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(auth_id) ON DELETE CASCADE;

ALTER TABLE public.game_assignments 
ADD CONSTRAINT fk_game_assignments_game_id 
FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;

ALTER TABLE public.questions 
ADD CONSTRAINT fk_questions_assignment_id 
FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

ALTER TABLE public.results 
ADD CONSTRAINT fk_results_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.results 
ADD CONSTRAINT fk_results_assignment_id 
FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

ALTER TABLE public.results 
ADD CONSTRAINT fk_results_game_id 
FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;

ALTER TABLE public.essay_submissions 
ADD CONSTRAINT fk_essay_submissions_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.essay_submissions 
ADD CONSTRAINT fk_essay_submissions_assignment_id 
FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

ALTER TABLE public.feedback 
ADD CONSTRAINT fk_feedback_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.feedback 
ADD CONSTRAINT fk_feedback_assignment_id 
FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;

ALTER TABLE public.student_game_status 
ADD CONSTRAINT fk_student_game_status_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.student_game_status 
ADD CONSTRAINT fk_student_game_status_game_id 
FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;

ALTER TABLE public.downloaded_games 
ADD CONSTRAINT fk_downloaded_games_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(auth_id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT fk_subscriptions_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES public.teachers(auth_id) ON DELETE CASCADE;

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON public.classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_classroom_id ON public.assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_games_teacher_id ON public.games(teacher_id);
CREATE INDEX IF NOT EXISTS idx_game_assignments_teacher_id ON public.game_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_game_assignments_game_id ON public.game_assignments(game_id);
CREATE INDEX IF NOT EXISTS idx_questions_assignment_id ON public.questions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON public.results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_assignment_id ON public.results(assignment_id);
CREATE INDEX IF NOT EXISTS idx_results_game_id ON public.results(game_id);
CREATE INDEX IF NOT EXISTS idx_essay_submissions_student_id ON public.essay_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_essay_submissions_assignment_id ON public.essay_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_feedback_student_id ON public.feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_assignment_id ON public.feedback(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_game_status_student_id ON public.student_game_status(student_id);
CREATE INDEX IF NOT EXISTS idx_student_game_status_game_id ON public.student_game_status(game_id);
CREATE INDEX IF NOT EXISTS idx_downloaded_games_teacher_id ON public.downloaded_games(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_teacher_id ON public.subscriptions(teacher_id);

-- 3. Add data validation triggers
CREATE OR REPLACE FUNCTION validate_student_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate name length
  IF LENGTH(NEW.name) < 2 OR LENGTH(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Student name must be between 2 and 100 characters';
  END IF;
  
  -- Validate username format
  IF NEW.username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
    RAISE EXCEPTION 'Username must be 3-20 characters, alphanumeric and underscore only';
  END IF;
  
  -- Validate password length
  IF LENGTH(NEW.password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_student_data_trigger
  BEFORE INSERT OR UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION validate_student_data();

-- 4. Add audit logging function
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    record_id,
    old_data,
    new_data,
    user_id,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    NOW()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  user_id uuid,
  timestamp timestamptz DEFAULT NOW()
);

-- 6. Add audit triggers to important tables
CREATE TRIGGER audit_students_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_classrooms_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.classrooms
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_games_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_assignments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_event();

-- 7. Add session timeout function
CREATE OR REPLACE FUNCTION check_session_timeout()
RETURNS void AS $$
BEGIN
  -- Delete expired sessions (older than 24 hours)
  DELETE FROM auth.sessions 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 8. Create a scheduled job to clean up expired sessions
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 */6 * * *', -- Every 6 hours
  'SELECT check_session_timeout();'
); 