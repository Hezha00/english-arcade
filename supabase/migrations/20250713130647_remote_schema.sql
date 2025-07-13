create table "public"."assignments" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "classroom" text,
    "teacher_id" uuid,
    "created_at" timestamp without time zone default now(),
    "type" text,
    "max_attempts" integer default 1,
    "questions" jsonb,
    "is_active" boolean default true,
    "due_at" timestamp without time zone
);


alter table "public"."assignments" enable row level security;

create table "public"."classrooms" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "school" text,
    "teacher_id" uuid,
    "created_at" timestamp with time zone default now(),
    "year_level" text
);


alter table "public"."classrooms" enable row level security;

create table "public"."downloaded_games" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid not null,
    "template_name" text not null,
    "file_url" text not null,
    "downloaded_at" timestamp with time zone default now()
);


alter table "public"."downloaded_games" enable row level security;

create table "public"."essay_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "assignment_id" uuid,
    "student_id" uuid,
    "username" text,
    "assignment_title" text,
    "answer_text" text,
    "submitted_at" timestamp without time zone default now(),
    "teacher_score" integer,
    "teacher_comment" text
);


alter table "public"."essay_submissions" enable row level security;

create table "public"."feedback" (
    "id" uuid not null default gen_random_uuid(),
    "assignment_id" uuid,
    "student_id" uuid,
    "username" text,
    "rating" integer,
    "comment" text,
    "submitted_at" timestamp without time zone default now()
);


alter table "public"."feedback" enable row level security;

create table "public"."game_assignments" (
    "id" uuid not null default uuid_generate_v4(),
    "game_id" uuid,
    "classroom" text not null,
    "teacher_id" uuid,
    "assigned_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "expires_at" timestamp without time zone,
    "is_active" boolean default true
);


alter table "public"."game_assignments" enable row level security;

create table "public"."games" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "file_url" text,
    "is_global" boolean default false,
    "teacher_id" uuid,
    "created_at" timestamp without time zone default now(),
    "duration_min" integer,
    "max_retries" integer,
    "expires_at" timestamp without time zone,
    "game_content" jsonb,
    "is_active" boolean default true
);


alter table "public"."games" enable row level security;

create table "public"."licenses" (
    "id" uuid not null default uuid_generate_v4(),
    "code" text,
    "duration" text,
    "teacher_id" uuid,
    "redeemed_at" timestamp without time zone,
    "is_used" boolean default false
);


alter table "public"."licenses" enable row level security;

create table "public"."questions" (
    "id" uuid not null default gen_random_uuid(),
    "assignment_id" uuid,
    "question_text" text not null,
    "options" jsonb,
    "correct_index" integer,
    "audio_url" text
);


alter table "public"."questions" enable row level security;

create table "public"."results" (
    "id" uuid not null default gen_random_uuid(),
    "assignment_id" uuid,
    "student_id" uuid,
    "username" text,
    "classroom" text,
    "score" integer,
    "total" integer,
    "submitted_at" timestamp without time zone default now(),
    "type" text,
    "finished" boolean default false,
    "game_id" uuid,
    "teacher_id" uuid
);


alter table "public"."results" enable row level security;

create table "public"."self_learner_licenses" (
    "id" uuid not null default gen_random_uuid(),
    "license_key" text not null,
    "plan_id" uuid,
    "is_used" boolean default false,
    "used_by" uuid,
    "used_at" timestamp with time zone,
    "self_learner_id" uuid
);


alter table "public"."self_learner_licenses" enable row level security;

create table "public"."self_learner_payments" (
    "id" uuid not null default gen_random_uuid(),
    "self_learner_id" uuid,
    "plan_id" uuid,
    "paid_at" timestamp with time zone default timezone('utc'::text, now()),
    "amount" integer not null,
    "status" text default 'pending'::text,
    "payment_method" text,
    "contact_info" text
);


alter table "public"."self_learner_payments" enable row level security;

create table "public"."self_learner_plans" (
    "id" uuid not null default gen_random_uuid(),
    "plan_title" text not null,
    "duration_months" integer not null,
    "original_price" integer not null,
    "discounted_price" integer not null,
    "description" text,
    "slug" text not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
);


alter table "public"."self_learner_plans" enable row level security;

create table "public"."self_learner_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "self_learner_id" uuid,
    "plan_id" uuid,
    "start_date" timestamp with time zone default timezone('utc'::text, now()),
    "end_date" timestamp with time zone,
    "license_id" uuid
);


alter table "public"."self_learner_subscriptions" enable row level security;

create table "public"."self_learners" (
    "id" uuid not null,
    "username" text not null,
    "password" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "city" text not null,
    "phone" text not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now())
);


alter table "public"."self_learners" enable row level security;

create table "public"."student_assignment_status" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "assignment_id" uuid not null,
    "completed_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."student_assignment_status" enable row level security;

create table "public"."student_game_status" (
    "id" uuid not null default gen_random_uuid(),
    "student_id" uuid not null,
    "game_id" uuid not null,
    "completed_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "score" integer,
    "game_name" text,
    "attempts" integer,
    "time_spent" integer
);


alter table "public"."student_game_status" enable row level security;

create table "public"."students" (
    "id" uuid not null default gen_random_uuid(),
    "username" text not null,
    "password" text not null,
    "name" text,
    "profile_color" text,
    "teacher_id" uuid,
    "classroom" text,
    "school" text,
    "created_at" timestamp without time zone default now(),
    "total_score" integer default 0,
    "last_login" timestamp without time zone,
    "login_streak" integer default 0,
    "auth_id" uuid,
    "year_level" text
);


alter table "public"."students" enable row level security;

create table "public"."subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "teacher_id" uuid,
    "plan" text not null,
    "start_date" date not null,
    "end_date" date not null,
    "is_active" boolean default true
);


alter table "public"."subscriptions" enable row level security;

create table "public"."teachers" (
    "auth_id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "password" text not null,
    "username" text,
    "created_at" timestamp without time zone default now(),
    "subscription_expires" timestamp without time zone,
    "license_code" text,
    "role" text not null default 'teacher'::text
);


alter table "public"."teachers" enable row level security;

CREATE UNIQUE INDEX assignments_pkey ON public.assignments USING btree (id);

CREATE UNIQUE INDEX classrooms_name_unique ON public.classrooms USING btree (name);

CREATE UNIQUE INDEX classrooms_pkey ON public.classrooms USING btree (id);

CREATE UNIQUE INDEX downloaded_games_pkey ON public.downloaded_games USING btree (id);

CREATE UNIQUE INDEX essay_submissions_pkey ON public.essay_submissions USING btree (id);

CREATE UNIQUE INDEX feedback_pkey ON public.feedback USING btree (id);

CREATE UNIQUE INDEX game_assignments_pkey ON public.game_assignments USING btree (id);

CREATE UNIQUE INDEX games_pkey ON public.games USING btree (id);

CREATE INDEX idx_game_assignments_classroom ON public.game_assignments USING btree (classroom);

CREATE INDEX idx_game_assignments_game_id ON public.game_assignments USING btree (game_id);

CREATE INDEX idx_game_assignments_teacher_id ON public.game_assignments USING btree (teacher_id);

CREATE INDEX idx_games_is_global ON public.games USING btree (is_global);

CREATE INDEX idx_games_teacher_id ON public.games USING btree (teacher_id);

CREATE INDEX idx_results_game_id ON public.results USING btree (game_id);

CREATE INDEX idx_results_student_id ON public.results USING btree (student_id);

CREATE UNIQUE INDEX idx_self_learner_licenses_license_key ON public.self_learner_licenses USING btree (license_key);

CREATE UNIQUE INDEX idx_self_learner_plans_slug ON public.self_learner_plans USING btree (slug);

CREATE UNIQUE INDEX idx_self_learners_username ON public.self_learners USING btree (username);

CREATE INDEX idx_student_game_status_game_id ON public.student_game_status USING btree (game_id);

CREATE INDEX idx_student_game_status_student_id ON public.student_game_status USING btree (student_id);

CREATE UNIQUE INDEX licenses_code_key ON public.licenses USING btree (code);

CREATE UNIQUE INDEX licenses_pkey ON public.licenses USING btree (id);

CREATE UNIQUE INDEX one_license_per_teacher ON public.licenses USING btree (teacher_id) WHERE (is_used = true);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);

CREATE UNIQUE INDEX results_pkey ON public.results USING btree (id);

CREATE UNIQUE INDEX self_learner_licenses_license_key_key ON public.self_learner_licenses USING btree (license_key);

CREATE UNIQUE INDEX self_learner_licenses_pkey ON public.self_learner_licenses USING btree (id);

CREATE UNIQUE INDEX self_learner_payments_pkey ON public.self_learner_payments USING btree (id);

CREATE UNIQUE INDEX self_learner_plans_pkey ON public.self_learner_plans USING btree (id);

CREATE UNIQUE INDEX self_learner_plans_slug_key ON public.self_learner_plans USING btree (slug);

CREATE UNIQUE INDEX self_learner_subscriptions_pkey ON public.self_learner_subscriptions USING btree (id);

CREATE UNIQUE INDEX self_learners_pkey ON public.self_learners USING btree (id);

CREATE UNIQUE INDEX self_learners_username_key ON public.self_learners USING btree (username);

CREATE UNIQUE INDEX student_assignment_status_pkey ON public.student_assignment_status USING btree (id);

CREATE UNIQUE INDEX student_game_status_pkey ON public.student_game_status USING btree (id);

CREATE UNIQUE INDEX students_pkey ON public.students USING btree (id);

CREATE UNIQUE INDEX students_username_key ON public.students USING btree (username);

CREATE UNIQUE INDEX subscriptions_pkey ON public.subscriptions USING btree (id);

CREATE UNIQUE INDEX teachers_email_key ON public.teachers USING btree (email);

CREATE UNIQUE INDEX teachers_pkey ON public.teachers USING btree (auth_id);

CREATE UNIQUE INDEX unique_class_name_per_teacher ON public.classrooms USING btree (name, teacher_id);

CREATE UNIQUE INDEX unique_code ON public.licenses USING btree (code);

CREATE UNIQUE INDEX unique_teacher_template ON public.downloaded_games USING btree (teacher_id, template_name);

alter table "public"."assignments" add constraint "assignments_pkey" PRIMARY KEY using index "assignments_pkey";

alter table "public"."classrooms" add constraint "classrooms_pkey" PRIMARY KEY using index "classrooms_pkey";

alter table "public"."downloaded_games" add constraint "downloaded_games_pkey" PRIMARY KEY using index "downloaded_games_pkey";

alter table "public"."essay_submissions" add constraint "essay_submissions_pkey" PRIMARY KEY using index "essay_submissions_pkey";

alter table "public"."feedback" add constraint "feedback_pkey" PRIMARY KEY using index "feedback_pkey";

alter table "public"."game_assignments" add constraint "game_assignments_pkey" PRIMARY KEY using index "game_assignments_pkey";

alter table "public"."games" add constraint "games_pkey" PRIMARY KEY using index "games_pkey";

alter table "public"."licenses" add constraint "licenses_pkey" PRIMARY KEY using index "licenses_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."results" add constraint "results_pkey" PRIMARY KEY using index "results_pkey";

alter table "public"."self_learner_licenses" add constraint "self_learner_licenses_pkey" PRIMARY KEY using index "self_learner_licenses_pkey";

alter table "public"."self_learner_payments" add constraint "self_learner_payments_pkey" PRIMARY KEY using index "self_learner_payments_pkey";

alter table "public"."self_learner_plans" add constraint "self_learner_plans_pkey" PRIMARY KEY using index "self_learner_plans_pkey";

alter table "public"."self_learner_subscriptions" add constraint "self_learner_subscriptions_pkey" PRIMARY KEY using index "self_learner_subscriptions_pkey";

alter table "public"."self_learners" add constraint "self_learners_pkey" PRIMARY KEY using index "self_learners_pkey";

alter table "public"."student_assignment_status" add constraint "student_assignment_status_pkey" PRIMARY KEY using index "student_assignment_status_pkey";

alter table "public"."student_game_status" add constraint "student_game_status_pkey" PRIMARY KEY using index "student_game_status_pkey";

alter table "public"."students" add constraint "students_pkey" PRIMARY KEY using index "students_pkey";

alter table "public"."subscriptions" add constraint "subscriptions_pkey" PRIMARY KEY using index "subscriptions_pkey";

alter table "public"."teachers" add constraint "teachers_pkey" PRIMARY KEY using index "teachers_pkey";

alter table "public"."assignments" add constraint "assignments_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES teachers(auth_id) not valid;

alter table "public"."assignments" validate constraint "assignments_teacher_id_fkey";

alter table "public"."assignments" add constraint "fk_assignments_classroom" FOREIGN KEY (classroom) REFERENCES classrooms(name) ON DELETE CASCADE not valid;

alter table "public"."assignments" validate constraint "fk_assignments_classroom";

alter table "public"."classrooms" add constraint "classrooms_name_unique" UNIQUE using index "classrooms_name_unique";

alter table "public"."classrooms" add constraint "classrooms_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES teachers(auth_id) ON DELETE CASCADE not valid;

alter table "public"."classrooms" validate constraint "classrooms_teacher_id_fkey";

alter table "public"."classrooms" add constraint "unique_class_name_per_teacher" UNIQUE using index "unique_class_name_per_teacher";

alter table "public"."downloaded_games" add constraint "fk_teacher" FOREIGN KEY (teacher_id) REFERENCES teachers(auth_id) ON DELETE CASCADE not valid;

alter table "public"."downloaded_games" validate constraint "fk_teacher";

alter table "public"."downloaded_games" add constraint "unique_teacher_template" UNIQUE using index "unique_teacher_template";

alter table "public"."essay_submissions" add constraint "essay_submissions_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."essay_submissions" validate constraint "essay_submissions_assignment_id_fkey";

alter table "public"."essay_submissions" add constraint "essay_submissions_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE not valid;

alter table "public"."essay_submissions" validate constraint "essay_submissions_student_id_fkey";

alter table "public"."feedback" add constraint "feedback_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."feedback" validate constraint "feedback_assignment_id_fkey";

alter table "public"."game_assignments" add constraint "fk_game_assignments_game_id" FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE not valid;

alter table "public"."game_assignments" validate constraint "fk_game_assignments_game_id";

alter table "public"."game_assignments" add constraint "fk_game_assignments_teacher_id" FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."game_assignments" validate constraint "fk_game_assignments_teacher_id";

alter table "public"."game_assignments" add constraint "game_assignments_game_id_fkey" FOREIGN KEY (game_id) REFERENCES games(id) not valid;

alter table "public"."game_assignments" validate constraint "game_assignments_game_id_fkey";

alter table "public"."game_assignments" add constraint "game_assignments_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES teachers(auth_id) not valid;

alter table "public"."game_assignments" validate constraint "game_assignments_teacher_id_fkey";

alter table "public"."games" add constraint "games_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES teachers(auth_id) ON DELETE CASCADE not valid;

alter table "public"."games" validate constraint "games_teacher_id_fkey";

alter table "public"."licenses" add constraint "fk_teacher" FOREIGN KEY (teacher_id) REFERENCES teachers(auth_id) ON DELETE SET NULL not valid;

alter table "public"."licenses" validate constraint "fk_teacher";

alter table "public"."licenses" add constraint "licenses_code_key" UNIQUE using index "licenses_code_key";

alter table "public"."licenses" add constraint "unique_code" UNIQUE using index "unique_code";

alter table "public"."questions" add constraint "questions_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."questions" validate constraint "questions_assignment_id_fkey";

alter table "public"."results" add constraint "fk_assignment" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."results" validate constraint "fk_assignment";

alter table "public"."results" add constraint "fk_assignment_result" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."results" validate constraint "fk_assignment_result";

alter table "public"."results" add constraint "fk_results_assignment" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."results" validate constraint "fk_results_assignment";

alter table "public"."results" add constraint "fk_results_student" FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE not valid;

alter table "public"."results" validate constraint "fk_results_student";

alter table "public"."results" add constraint "results_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."results" validate constraint "results_assignment_id_fkey";

alter table "public"."self_learner_licenses" add constraint "fk_licenses_plan" FOREIGN KEY (plan_id) REFERENCES self_learner_plans(id) ON DELETE SET NULL not valid;

alter table "public"."self_learner_licenses" validate constraint "fk_licenses_plan";

alter table "public"."self_learner_licenses" add constraint "fk_self_learner" FOREIGN KEY (self_learner_id) REFERENCES self_learners(id) ON DELETE SET NULL not valid;

alter table "public"."self_learner_licenses" validate constraint "fk_self_learner";

alter table "public"."self_learner_licenses" add constraint "self_learner_licenses_license_key_key" UNIQUE using index "self_learner_licenses_license_key_key";

alter table "public"."self_learner_plans" add constraint "self_learner_plans_slug_key" UNIQUE using index "self_learner_plans_slug_key";

alter table "public"."self_learner_subscriptions" add constraint "fk_subscriptions_license" FOREIGN KEY (license_id) REFERENCES self_learner_licenses(id) ON DELETE SET NULL not valid;

alter table "public"."self_learner_subscriptions" validate constraint "fk_subscriptions_license";

alter table "public"."self_learner_subscriptions" add constraint "fk_subscriptions_plan" FOREIGN KEY (plan_id) REFERENCES self_learner_plans(id) ON DELETE SET NULL not valid;

alter table "public"."self_learner_subscriptions" validate constraint "fk_subscriptions_plan";

alter table "public"."self_learner_subscriptions" add constraint "self_learner_subscriptions_license_id_fkey" FOREIGN KEY (license_id) REFERENCES self_learner_licenses(id) not valid;

alter table "public"."self_learner_subscriptions" validate constraint "self_learner_subscriptions_license_id_fkey";

alter table "public"."self_learners" add constraint "fk_self_learners_auth" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."self_learners" validate constraint "fk_self_learners_auth";

alter table "public"."self_learners" add constraint "self_learners_phone_check" CHECK (((char_length(phone) = 11) AND ("left"(phone, 2) = '09'::text))) not valid;

alter table "public"."self_learners" validate constraint "self_learners_phone_check";

alter table "public"."self_learners" add constraint "self_learners_username_key" UNIQUE using index "self_learners_username_key";

alter table "public"."student_assignment_status" add constraint "student_assignment_status_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE not valid;

alter table "public"."student_assignment_status" validate constraint "student_assignment_status_assignment_id_fkey";

alter table "public"."student_assignment_status" add constraint "student_assignment_status_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE not valid;

alter table "public"."student_assignment_status" validate constraint "student_assignment_status_student_id_fkey";

alter table "public"."student_game_status" add constraint "fk_game" FOREIGN KEY (game_id) REFERENCES games(id) not valid;

alter table "public"."student_game_status" validate constraint "fk_game";

alter table "public"."student_game_status" add constraint "fk_student" FOREIGN KEY (student_id) REFERENCES students(id) not valid;

alter table "public"."student_game_status" validate constraint "fk_student";

alter table "public"."student_game_status" add constraint "fk_student_game_status_game_id" FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE not valid;

alter table "public"."student_game_status" validate constraint "fk_student_game_status_game_id";

alter table "public"."student_game_status" add constraint "fk_student_game_status_student_id" FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE not valid;

alter table "public"."student_game_status" validate constraint "fk_student_game_status_student_id";

alter table "public"."student_game_status" add constraint "student_game_status_game_id_fkey" FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE not valid;

alter table "public"."student_game_status" validate constraint "student_game_status_game_id_fkey";

alter table "public"."student_game_status" add constraint "student_game_status_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE not valid;

alter table "public"."student_game_status" validate constraint "student_game_status_student_id_fkey";

alter table "public"."students" add constraint "students_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES teachers(auth_id) ON DELETE CASCADE not valid;

alter table "public"."students" validate constraint "students_teacher_id_fkey";

alter table "public"."students" add constraint "students_username_key" UNIQUE using index "students_username_key";

alter table "public"."subscriptions" add constraint "subscriptions_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_teacher_id_fkey";

alter table "public"."teachers" add constraint "check_valid_role" CHECK ((role = ANY (ARRAY['teacher'::text, 'admin'::text]))) not valid;

alter table "public"."teachers" validate constraint "check_valid_role";

alter table "public"."teachers" add constraint "teachers_email_key" UNIQUE using index "teachers_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_teacher_duplicates(input_email text, input_username text)
 RETURNS TABLE(email_taken boolean, username_taken boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  return query
  select
    exists(select 1 from teachers where email = input_email),
    exists(select 1 from teachers where username = input_username);
end;
$function$
;

create or replace view "public"."game_assignments_view" as  SELECT ga.id,
    ga.game_id,
    g.name AS game_name,
    g.description AS game_description,
    ga.classroom,
    ga.teacher_id,
    t.email AS teacher_email,
    ga.assigned_at,
    ga.expires_at,
    ga.is_active,
    count(s.id) AS student_count
   FROM (((game_assignments ga
     JOIN games g ON ((g.id = ga.game_id)))
     JOIN teachers t ON ((t.auth_id = ga.teacher_id)))
     LEFT JOIN students s ON ((s.classroom = ga.classroom)))
  GROUP BY ga.id, ga.game_id, g.name, g.description, ga.classroom, ga.teacher_id, t.email, ga.assigned_at, ga.expires_at, ga.is_active;


CREATE OR REPLACE FUNCTION public.get_student_games(student_auth_id uuid)
 RETURNS TABLE(game_id uuid, game_name text, game_description text, file_url text, game_content jsonb, classroom text, assigned_at timestamp without time zone, expires_at timestamp without time zone, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_teacher_game_assignments(teacher_auth_id uuid)
 RETURNS TABLE(assignment_id uuid, game_id uuid, game_name text, classroom text, assigned_at timestamp without time zone, expires_at timestamp without time zone, is_active boolean, student_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1 from auth.users where id = auth.uid() and email = 'superadminkhaledi@arcade.dev'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_email_taken(email_input text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(email_input))
  )
$function$
;

CREATE OR REPLACE FUNCTION public.mark_game_completed(game_uuid uuid, student_auth_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.normalize_teacher_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_teacher_id_from_auth()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.teacher_id IS NULL THEN
        NEW.teacher_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_teacher_subscription(input_teacher_id uuid, duration_months integer, license_code_input text DEFAULT NULL::text, license_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- ✅ If a license ID is given, validate & assign
  IF license_id IS NOT NULL THEN
    -- Block duplicate redemption
    IF EXISTS (
      SELECT 1 FROM licenses
      WHERE teacher_id = input_teacher_id AND is_used = true
    ) THEN
      RAISE EXCEPTION 'معلم قبلاً یک اشتراک فعال دارد';
    END IF;

    UPDATE licenses
    SET
      teacher_id = input_teacher_id,
      redeemed_at = NOW(),
      is_used = true
    WHERE id = license_id AND code = license_code_input;
  END IF;

  -- ✅ Update teacher’s subscription either way
  UPDATE teachers
  SET
    subscription_expires = NOW() + (duration_months * INTERVAL '1 month'),
    license_code = license_code_input
  WHERE auth_id = input_teacher_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.teacher_game_overview(teacher_id_input uuid)
 RETURNS TABLE(game_id uuid, game_name text, classroom text, student_count integer, avg_score numeric)
 LANGUAGE sql
AS $function$
  select
    ga.game_id,
    g.name as game_name,
    c.name as classroom,
    count(s.id) as student_count,
    avg(best_scores.best_score)::numeric as avg_score
  from game_assignments ga
  join classrooms c on c.id = ga.classroom::uuid
  join games g on g.id = ga.game_id
  left join students s on s.classroom::uuid = c.id
  left join lateral (
    select max(r.score) as best_score
    from results r
    where r.username = s.username
      and r.game_id = ga.game_id
  ) best_scores on true
  where c.teacher_id = teacher_id_input
  group by ga.game_id, g.name, c.name
  order by g.name, c.name
$function$
;

grant delete on table "public"."assignments" to "anon";

grant insert on table "public"."assignments" to "anon";

grant references on table "public"."assignments" to "anon";

grant select on table "public"."assignments" to "anon";

grant trigger on table "public"."assignments" to "anon";

grant truncate on table "public"."assignments" to "anon";

grant update on table "public"."assignments" to "anon";

grant delete on table "public"."assignments" to "authenticated";

grant insert on table "public"."assignments" to "authenticated";

grant references on table "public"."assignments" to "authenticated";

grant select on table "public"."assignments" to "authenticated";

grant trigger on table "public"."assignments" to "authenticated";

grant truncate on table "public"."assignments" to "authenticated";

grant update on table "public"."assignments" to "authenticated";

grant delete on table "public"."assignments" to "service_role";

grant insert on table "public"."assignments" to "service_role";

grant references on table "public"."assignments" to "service_role";

grant select on table "public"."assignments" to "service_role";

grant trigger on table "public"."assignments" to "service_role";

grant truncate on table "public"."assignments" to "service_role";

grant update on table "public"."assignments" to "service_role";

grant delete on table "public"."classrooms" to "anon";

grant insert on table "public"."classrooms" to "anon";

grant references on table "public"."classrooms" to "anon";

grant select on table "public"."classrooms" to "anon";

grant trigger on table "public"."classrooms" to "anon";

grant truncate on table "public"."classrooms" to "anon";

grant update on table "public"."classrooms" to "anon";

grant delete on table "public"."classrooms" to "authenticated";

grant insert on table "public"."classrooms" to "authenticated";

grant references on table "public"."classrooms" to "authenticated";

grant select on table "public"."classrooms" to "authenticated";

grant trigger on table "public"."classrooms" to "authenticated";

grant truncate on table "public"."classrooms" to "authenticated";

grant update on table "public"."classrooms" to "authenticated";

grant delete on table "public"."classrooms" to "service_role";

grant insert on table "public"."classrooms" to "service_role";

grant references on table "public"."classrooms" to "service_role";

grant select on table "public"."classrooms" to "service_role";

grant trigger on table "public"."classrooms" to "service_role";

grant truncate on table "public"."classrooms" to "service_role";

grant update on table "public"."classrooms" to "service_role";

grant delete on table "public"."downloaded_games" to "anon";

grant insert on table "public"."downloaded_games" to "anon";

grant references on table "public"."downloaded_games" to "anon";

grant select on table "public"."downloaded_games" to "anon";

grant trigger on table "public"."downloaded_games" to "anon";

grant truncate on table "public"."downloaded_games" to "anon";

grant update on table "public"."downloaded_games" to "anon";

grant delete on table "public"."downloaded_games" to "authenticated";

grant insert on table "public"."downloaded_games" to "authenticated";

grant references on table "public"."downloaded_games" to "authenticated";

grant select on table "public"."downloaded_games" to "authenticated";

grant trigger on table "public"."downloaded_games" to "authenticated";

grant truncate on table "public"."downloaded_games" to "authenticated";

grant update on table "public"."downloaded_games" to "authenticated";

grant delete on table "public"."downloaded_games" to "service_role";

grant insert on table "public"."downloaded_games" to "service_role";

grant references on table "public"."downloaded_games" to "service_role";

grant select on table "public"."downloaded_games" to "service_role";

grant trigger on table "public"."downloaded_games" to "service_role";

grant truncate on table "public"."downloaded_games" to "service_role";

grant update on table "public"."downloaded_games" to "service_role";

grant delete on table "public"."essay_submissions" to "anon";

grant insert on table "public"."essay_submissions" to "anon";

grant references on table "public"."essay_submissions" to "anon";

grant select on table "public"."essay_submissions" to "anon";

grant trigger on table "public"."essay_submissions" to "anon";

grant truncate on table "public"."essay_submissions" to "anon";

grant update on table "public"."essay_submissions" to "anon";

grant delete on table "public"."essay_submissions" to "authenticated";

grant insert on table "public"."essay_submissions" to "authenticated";

grant references on table "public"."essay_submissions" to "authenticated";

grant select on table "public"."essay_submissions" to "authenticated";

grant trigger on table "public"."essay_submissions" to "authenticated";

grant truncate on table "public"."essay_submissions" to "authenticated";

grant update on table "public"."essay_submissions" to "authenticated";

grant delete on table "public"."essay_submissions" to "service_role";

grant insert on table "public"."essay_submissions" to "service_role";

grant references on table "public"."essay_submissions" to "service_role";

grant select on table "public"."essay_submissions" to "service_role";

grant trigger on table "public"."essay_submissions" to "service_role";

grant truncate on table "public"."essay_submissions" to "service_role";

grant update on table "public"."essay_submissions" to "service_role";

grant delete on table "public"."feedback" to "anon";

grant insert on table "public"."feedback" to "anon";

grant references on table "public"."feedback" to "anon";

grant select on table "public"."feedback" to "anon";

grant trigger on table "public"."feedback" to "anon";

grant truncate on table "public"."feedback" to "anon";

grant update on table "public"."feedback" to "anon";

grant delete on table "public"."feedback" to "authenticated";

grant insert on table "public"."feedback" to "authenticated";

grant references on table "public"."feedback" to "authenticated";

grant select on table "public"."feedback" to "authenticated";

grant trigger on table "public"."feedback" to "authenticated";

grant truncate on table "public"."feedback" to "authenticated";

grant update on table "public"."feedback" to "authenticated";

grant delete on table "public"."feedback" to "service_role";

grant insert on table "public"."feedback" to "service_role";

grant references on table "public"."feedback" to "service_role";

grant select on table "public"."feedback" to "service_role";

grant trigger on table "public"."feedback" to "service_role";

grant truncate on table "public"."feedback" to "service_role";

grant update on table "public"."feedback" to "service_role";

grant delete on table "public"."game_assignments" to "anon";

grant insert on table "public"."game_assignments" to "anon";

grant references on table "public"."game_assignments" to "anon";

grant select on table "public"."game_assignments" to "anon";

grant trigger on table "public"."game_assignments" to "anon";

grant truncate on table "public"."game_assignments" to "anon";

grant update on table "public"."game_assignments" to "anon";

grant delete on table "public"."game_assignments" to "authenticated";

grant insert on table "public"."game_assignments" to "authenticated";

grant references on table "public"."game_assignments" to "authenticated";

grant select on table "public"."game_assignments" to "authenticated";

grant trigger on table "public"."game_assignments" to "authenticated";

grant truncate on table "public"."game_assignments" to "authenticated";

grant update on table "public"."game_assignments" to "authenticated";

grant delete on table "public"."game_assignments" to "service_role";

grant insert on table "public"."game_assignments" to "service_role";

grant references on table "public"."game_assignments" to "service_role";

grant select on table "public"."game_assignments" to "service_role";

grant trigger on table "public"."game_assignments" to "service_role";

grant truncate on table "public"."game_assignments" to "service_role";

grant update on table "public"."game_assignments" to "service_role";

grant delete on table "public"."games" to "anon";

grant insert on table "public"."games" to "anon";

grant references on table "public"."games" to "anon";

grant select on table "public"."games" to "anon";

grant trigger on table "public"."games" to "anon";

grant truncate on table "public"."games" to "anon";

grant update on table "public"."games" to "anon";

grant delete on table "public"."games" to "authenticated";

grant insert on table "public"."games" to "authenticated";

grant references on table "public"."games" to "authenticated";

grant select on table "public"."games" to "authenticated";

grant trigger on table "public"."games" to "authenticated";

grant truncate on table "public"."games" to "authenticated";

grant update on table "public"."games" to "authenticated";

grant delete on table "public"."games" to "service_role";

grant insert on table "public"."games" to "service_role";

grant references on table "public"."games" to "service_role";

grant select on table "public"."games" to "service_role";

grant trigger on table "public"."games" to "service_role";

grant truncate on table "public"."games" to "service_role";

grant update on table "public"."games" to "service_role";

grant delete on table "public"."licenses" to "anon";

grant insert on table "public"."licenses" to "anon";

grant references on table "public"."licenses" to "anon";

grant select on table "public"."licenses" to "anon";

grant trigger on table "public"."licenses" to "anon";

grant truncate on table "public"."licenses" to "anon";

grant update on table "public"."licenses" to "anon";

grant delete on table "public"."licenses" to "authenticated";

grant insert on table "public"."licenses" to "authenticated";

grant references on table "public"."licenses" to "authenticated";

grant select on table "public"."licenses" to "authenticated";

grant trigger on table "public"."licenses" to "authenticated";

grant truncate on table "public"."licenses" to "authenticated";

grant update on table "public"."licenses" to "authenticated";

grant delete on table "public"."licenses" to "service_role";

grant insert on table "public"."licenses" to "service_role";

grant references on table "public"."licenses" to "service_role";

grant select on table "public"."licenses" to "service_role";

grant trigger on table "public"."licenses" to "service_role";

grant truncate on table "public"."licenses" to "service_role";

grant update on table "public"."licenses" to "service_role";

grant delete on table "public"."questions" to "anon";

grant insert on table "public"."questions" to "anon";

grant references on table "public"."questions" to "anon";

grant select on table "public"."questions" to "anon";

grant trigger on table "public"."questions" to "anon";

grant truncate on table "public"."questions" to "anon";

grant update on table "public"."questions" to "anon";

grant delete on table "public"."questions" to "authenticated";

grant insert on table "public"."questions" to "authenticated";

grant references on table "public"."questions" to "authenticated";

grant select on table "public"."questions" to "authenticated";

grant trigger on table "public"."questions" to "authenticated";

grant truncate on table "public"."questions" to "authenticated";

grant update on table "public"."questions" to "authenticated";

grant delete on table "public"."questions" to "service_role";

grant insert on table "public"."questions" to "service_role";

grant references on table "public"."questions" to "service_role";

grant select on table "public"."questions" to "service_role";

grant trigger on table "public"."questions" to "service_role";

grant truncate on table "public"."questions" to "service_role";

grant update on table "public"."questions" to "service_role";

grant delete on table "public"."results" to "anon";

grant insert on table "public"."results" to "anon";

grant references on table "public"."results" to "anon";

grant select on table "public"."results" to "anon";

grant trigger on table "public"."results" to "anon";

grant truncate on table "public"."results" to "anon";

grant update on table "public"."results" to "anon";

grant delete on table "public"."results" to "authenticated";

grant insert on table "public"."results" to "authenticated";

grant references on table "public"."results" to "authenticated";

grant select on table "public"."results" to "authenticated";

grant trigger on table "public"."results" to "authenticated";

grant truncate on table "public"."results" to "authenticated";

grant update on table "public"."results" to "authenticated";

grant delete on table "public"."results" to "service_role";

grant insert on table "public"."results" to "service_role";

grant references on table "public"."results" to "service_role";

grant select on table "public"."results" to "service_role";

grant trigger on table "public"."results" to "service_role";

grant truncate on table "public"."results" to "service_role";

grant update on table "public"."results" to "service_role";

grant delete on table "public"."self_learner_licenses" to "anon";

grant insert on table "public"."self_learner_licenses" to "anon";

grant references on table "public"."self_learner_licenses" to "anon";

grant select on table "public"."self_learner_licenses" to "anon";

grant trigger on table "public"."self_learner_licenses" to "anon";

grant truncate on table "public"."self_learner_licenses" to "anon";

grant update on table "public"."self_learner_licenses" to "anon";

grant delete on table "public"."self_learner_licenses" to "authenticated";

grant insert on table "public"."self_learner_licenses" to "authenticated";

grant references on table "public"."self_learner_licenses" to "authenticated";

grant select on table "public"."self_learner_licenses" to "authenticated";

grant trigger on table "public"."self_learner_licenses" to "authenticated";

grant truncate on table "public"."self_learner_licenses" to "authenticated";

grant update on table "public"."self_learner_licenses" to "authenticated";

grant delete on table "public"."self_learner_licenses" to "service_role";

grant insert on table "public"."self_learner_licenses" to "service_role";

grant references on table "public"."self_learner_licenses" to "service_role";

grant select on table "public"."self_learner_licenses" to "service_role";

grant trigger on table "public"."self_learner_licenses" to "service_role";

grant truncate on table "public"."self_learner_licenses" to "service_role";

grant update on table "public"."self_learner_licenses" to "service_role";

grant delete on table "public"."self_learner_payments" to "anon";

grant insert on table "public"."self_learner_payments" to "anon";

grant references on table "public"."self_learner_payments" to "anon";

grant select on table "public"."self_learner_payments" to "anon";

grant trigger on table "public"."self_learner_payments" to "anon";

grant truncate on table "public"."self_learner_payments" to "anon";

grant update on table "public"."self_learner_payments" to "anon";

grant delete on table "public"."self_learner_payments" to "authenticated";

grant insert on table "public"."self_learner_payments" to "authenticated";

grant references on table "public"."self_learner_payments" to "authenticated";

grant select on table "public"."self_learner_payments" to "authenticated";

grant trigger on table "public"."self_learner_payments" to "authenticated";

grant truncate on table "public"."self_learner_payments" to "authenticated";

grant update on table "public"."self_learner_payments" to "authenticated";

grant delete on table "public"."self_learner_payments" to "service_role";

grant insert on table "public"."self_learner_payments" to "service_role";

grant references on table "public"."self_learner_payments" to "service_role";

grant select on table "public"."self_learner_payments" to "service_role";

grant trigger on table "public"."self_learner_payments" to "service_role";

grant truncate on table "public"."self_learner_payments" to "service_role";

grant update on table "public"."self_learner_payments" to "service_role";

grant delete on table "public"."self_learner_plans" to "anon";

grant insert on table "public"."self_learner_plans" to "anon";

grant references on table "public"."self_learner_plans" to "anon";

grant select on table "public"."self_learner_plans" to "anon";

grant trigger on table "public"."self_learner_plans" to "anon";

grant truncate on table "public"."self_learner_plans" to "anon";

grant update on table "public"."self_learner_plans" to "anon";

grant delete on table "public"."self_learner_plans" to "authenticated";

grant insert on table "public"."self_learner_plans" to "authenticated";

grant references on table "public"."self_learner_plans" to "authenticated";

grant select on table "public"."self_learner_plans" to "authenticated";

grant trigger on table "public"."self_learner_plans" to "authenticated";

grant truncate on table "public"."self_learner_plans" to "authenticated";

grant update on table "public"."self_learner_plans" to "authenticated";

grant delete on table "public"."self_learner_plans" to "service_role";

grant insert on table "public"."self_learner_plans" to "service_role";

grant references on table "public"."self_learner_plans" to "service_role";

grant select on table "public"."self_learner_plans" to "service_role";

grant trigger on table "public"."self_learner_plans" to "service_role";

grant truncate on table "public"."self_learner_plans" to "service_role";

grant update on table "public"."self_learner_plans" to "service_role";

grant delete on table "public"."self_learner_subscriptions" to "anon";

grant insert on table "public"."self_learner_subscriptions" to "anon";

grant references on table "public"."self_learner_subscriptions" to "anon";

grant select on table "public"."self_learner_subscriptions" to "anon";

grant trigger on table "public"."self_learner_subscriptions" to "anon";

grant truncate on table "public"."self_learner_subscriptions" to "anon";

grant update on table "public"."self_learner_subscriptions" to "anon";

grant delete on table "public"."self_learner_subscriptions" to "authenticated";

grant insert on table "public"."self_learner_subscriptions" to "authenticated";

grant references on table "public"."self_learner_subscriptions" to "authenticated";

grant select on table "public"."self_learner_subscriptions" to "authenticated";

grant trigger on table "public"."self_learner_subscriptions" to "authenticated";

grant truncate on table "public"."self_learner_subscriptions" to "authenticated";

grant update on table "public"."self_learner_subscriptions" to "authenticated";

grant delete on table "public"."self_learner_subscriptions" to "service_role";

grant insert on table "public"."self_learner_subscriptions" to "service_role";

grant references on table "public"."self_learner_subscriptions" to "service_role";

grant select on table "public"."self_learner_subscriptions" to "service_role";

grant trigger on table "public"."self_learner_subscriptions" to "service_role";

grant truncate on table "public"."self_learner_subscriptions" to "service_role";

grant update on table "public"."self_learner_subscriptions" to "service_role";

grant delete on table "public"."self_learners" to "anon";

grant insert on table "public"."self_learners" to "anon";

grant references on table "public"."self_learners" to "anon";

grant select on table "public"."self_learners" to "anon";

grant trigger on table "public"."self_learners" to "anon";

grant truncate on table "public"."self_learners" to "anon";

grant update on table "public"."self_learners" to "anon";

grant delete on table "public"."self_learners" to "authenticated";

grant insert on table "public"."self_learners" to "authenticated";

grant references on table "public"."self_learners" to "authenticated";

grant select on table "public"."self_learners" to "authenticated";

grant trigger on table "public"."self_learners" to "authenticated";

grant truncate on table "public"."self_learners" to "authenticated";

grant update on table "public"."self_learners" to "authenticated";

grant delete on table "public"."self_learners" to "service_role";

grant insert on table "public"."self_learners" to "service_role";

grant references on table "public"."self_learners" to "service_role";

grant select on table "public"."self_learners" to "service_role";

grant trigger on table "public"."self_learners" to "service_role";

grant truncate on table "public"."self_learners" to "service_role";

grant update on table "public"."self_learners" to "service_role";

grant delete on table "public"."student_assignment_status" to "anon";

grant insert on table "public"."student_assignment_status" to "anon";

grant references on table "public"."student_assignment_status" to "anon";

grant select on table "public"."student_assignment_status" to "anon";

grant trigger on table "public"."student_assignment_status" to "anon";

grant truncate on table "public"."student_assignment_status" to "anon";

grant update on table "public"."student_assignment_status" to "anon";

grant delete on table "public"."student_assignment_status" to "authenticated";

grant insert on table "public"."student_assignment_status" to "authenticated";

grant references on table "public"."student_assignment_status" to "authenticated";

grant select on table "public"."student_assignment_status" to "authenticated";

grant trigger on table "public"."student_assignment_status" to "authenticated";

grant truncate on table "public"."student_assignment_status" to "authenticated";

grant update on table "public"."student_assignment_status" to "authenticated";

grant delete on table "public"."student_assignment_status" to "service_role";

grant insert on table "public"."student_assignment_status" to "service_role";

grant references on table "public"."student_assignment_status" to "service_role";

grant select on table "public"."student_assignment_status" to "service_role";

grant trigger on table "public"."student_assignment_status" to "service_role";

grant truncate on table "public"."student_assignment_status" to "service_role";

grant update on table "public"."student_assignment_status" to "service_role";

grant delete on table "public"."student_game_status" to "anon";

grant insert on table "public"."student_game_status" to "anon";

grant references on table "public"."student_game_status" to "anon";

grant select on table "public"."student_game_status" to "anon";

grant trigger on table "public"."student_game_status" to "anon";

grant truncate on table "public"."student_game_status" to "anon";

grant update on table "public"."student_game_status" to "anon";

grant delete on table "public"."student_game_status" to "authenticated";

grant insert on table "public"."student_game_status" to "authenticated";

grant references on table "public"."student_game_status" to "authenticated";

grant select on table "public"."student_game_status" to "authenticated";

grant trigger on table "public"."student_game_status" to "authenticated";

grant truncate on table "public"."student_game_status" to "authenticated";

grant update on table "public"."student_game_status" to "authenticated";

grant delete on table "public"."student_game_status" to "service_role";

grant insert on table "public"."student_game_status" to "service_role";

grant references on table "public"."student_game_status" to "service_role";

grant select on table "public"."student_game_status" to "service_role";

grant trigger on table "public"."student_game_status" to "service_role";

grant truncate on table "public"."student_game_status" to "service_role";

grant update on table "public"."student_game_status" to "service_role";

grant delete on table "public"."students" to "anon";

grant insert on table "public"."students" to "anon";

grant references on table "public"."students" to "anon";

grant select on table "public"."students" to "anon";

grant trigger on table "public"."students" to "anon";

grant truncate on table "public"."students" to "anon";

grant update on table "public"."students" to "anon";

grant delete on table "public"."students" to "authenticated";

grant insert on table "public"."students" to "authenticated";

grant references on table "public"."students" to "authenticated";

grant select on table "public"."students" to "authenticated";

grant trigger on table "public"."students" to "authenticated";

grant truncate on table "public"."students" to "authenticated";

grant update on table "public"."students" to "authenticated";

grant delete on table "public"."students" to "service_role";

grant insert on table "public"."students" to "service_role";

grant references on table "public"."students" to "service_role";

grant select on table "public"."students" to "service_role";

grant trigger on table "public"."students" to "service_role";

grant truncate on table "public"."students" to "service_role";

grant update on table "public"."students" to "service_role";

grant delete on table "public"."subscriptions" to "anon";

grant insert on table "public"."subscriptions" to "anon";

grant references on table "public"."subscriptions" to "anon";

grant select on table "public"."subscriptions" to "anon";

grant trigger on table "public"."subscriptions" to "anon";

grant truncate on table "public"."subscriptions" to "anon";

grant update on table "public"."subscriptions" to "anon";

grant delete on table "public"."subscriptions" to "authenticated";

grant insert on table "public"."subscriptions" to "authenticated";

grant references on table "public"."subscriptions" to "authenticated";

grant select on table "public"."subscriptions" to "authenticated";

grant trigger on table "public"."subscriptions" to "authenticated";

grant truncate on table "public"."subscriptions" to "authenticated";

grant update on table "public"."subscriptions" to "authenticated";

grant delete on table "public"."subscriptions" to "service_role";

grant insert on table "public"."subscriptions" to "service_role";

grant references on table "public"."subscriptions" to "service_role";

grant select on table "public"."subscriptions" to "service_role";

grant trigger on table "public"."subscriptions" to "service_role";

grant truncate on table "public"."subscriptions" to "service_role";

grant update on table "public"."subscriptions" to "service_role";

grant delete on table "public"."teachers" to "anon";

grant insert on table "public"."teachers" to "anon";

grant references on table "public"."teachers" to "anon";

grant select on table "public"."teachers" to "anon";

grant trigger on table "public"."teachers" to "anon";

grant truncate on table "public"."teachers" to "anon";

grant update on table "public"."teachers" to "anon";

grant delete on table "public"."teachers" to "authenticated";

grant insert on table "public"."teachers" to "authenticated";

grant references on table "public"."teachers" to "authenticated";

grant select on table "public"."teachers" to "authenticated";

grant trigger on table "public"."teachers" to "authenticated";

grant truncate on table "public"."teachers" to "authenticated";

grant update on table "public"."teachers" to "authenticated";

grant delete on table "public"."teachers" to "service_role";

grant insert on table "public"."teachers" to "service_role";

grant references on table "public"."teachers" to "service_role";

grant select on table "public"."teachers" to "service_role";

grant trigger on table "public"."teachers" to "service_role";

grant truncate on table "public"."teachers" to "service_role";

grant update on table "public"."teachers" to "service_role";

create policy "Allow teacher to delete assignment"
on "public"."assignments"
as permissive
for delete
to public
using ((teacher_id = auth.uid()));


create policy "Allow teacher to insert assignment"
on "public"."assignments"
as permissive
for insert
to public
with check ((teacher_id = auth.uid()));


create policy "Allow teacher to update assignment"
on "public"."assignments"
as permissive
for update
to public
using ((teacher_id = auth.uid()));


create policy "Student can read assignments for their classroom"
on "public"."assignments"
as permissive
for select
to public
using ((classroom IN ( SELECT students.classroom
   FROM students
  WHERE (students.id = (current_setting('request.headers.student-id'::text, true))::uuid))));


create policy "Students can read assignments for their classroom"
on "public"."assignments"
as permissive
for select
to public
using ((classroom IN ( SELECT students.classroom
   FROM students
  WHERE (students.id = (current_setting('request.headers.student-id'::text, true))::uuid))));


create policy "Students can view active classroom assignments"
on "public"."assignments"
as permissive
for select
to public
using (((is_active = true) AND (classroom IN ( SELECT students.classroom
   FROM students
  WHERE (students.auth_id = auth.uid())))));


create policy "Students can view their classroom assignments"
on "public"."assignments"
as permissive
for select
to public
using ((classroom IN ( SELECT students.classroom
   FROM students
  WHERE (students.auth_id = auth.uid()))));


create policy "Teacher can delete own assignment"
on "public"."assignments"
as permissive
for delete
to public
using ((teacher_id = auth.uid()));


create policy "Teacher can insert assignment"
on "public"."assignments"
as permissive
for insert
to public
with check ((teacher_id = auth.uid()));


create policy "Teacher can read own assignments"
on "public"."assignments"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Teacher can update assignment"
on "public"."assignments"
as permissive
for update
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can insert assignments"
on "public"."assignments"
as permissive
for insert
to authenticated
with check ((teacher_id = auth.uid()));


create policy "Teachers can update their assignments"
on "public"."assignments"
as permissive
for update
to authenticated
using ((teacher_id = auth.uid()));


create policy "Teachers: Create assignments"
on "public"."assignments"
as permissive
for insert
to public
with check ((teacher_id = auth.uid()));


create policy "Teachers: Delete their assignments"
on "public"."assignments"
as permissive
for delete
to public
using ((teacher_id = auth.uid()));


create policy "Teachers: Modify their assignments"
on "public"."assignments"
as permissive
for update
to public
using ((teacher_id = auth.uid()));


create policy "students can see active assignments"
on "public"."assignments"
as permissive
for select
to public
using (((is_active = true) AND (classroom IN ( SELECT students.classroom
   FROM students
  WHERE (students.auth_id = auth.uid())))));


create policy "Teachers can access their own classes"
on "public"."classrooms"
as permissive
for all
to authenticated
using ((auth.uid() = teacher_id))
with check ((auth.uid() = teacher_id));


create policy "Teachers can insert their classes"
on "public"."classrooms"
as permissive
for insert
to authenticated
with check ((auth.uid() = teacher_id));


create policy "Teachers can read their classrooms"
on "public"."classrooms"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can read their own classrooms"
on "public"."classrooms"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can view their own classrooms"
on "public"."classrooms"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can delete their own downloads"
on "public"."downloaded_games"
as permissive
for delete
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can insert their own downloads"
on "public"."downloaded_games"
as permissive
for insert
to public
with check ((teacher_id = auth.uid()));


create policy "Teachers can view their own downloads"
on "public"."downloaded_games"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Students: Submit essay"
on "public"."essay_submissions"
as permissive
for insert
to public
with check ((student_id = auth.uid()));


create policy "Teachers: Grade essays"
on "public"."essay_submissions"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM assignments
  WHERE ((assignments.id = essay_submissions.assignment_id) AND (assignments.teacher_id = auth.uid())))));


create policy "Teachers: Update graded essay"
on "public"."essay_submissions"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM assignments
  WHERE ((assignments.id = essay_submissions.assignment_id) AND (assignments.teacher_id = auth.uid())))));


create policy "Students can read their feedback"
on "public"."feedback"
as permissive
for select
to public
using ((student_id = (current_setting('request.headers.student-id'::text, true))::uuid));


create policy "Students can submit feedback for their own assignments"
on "public"."feedback"
as permissive
for insert
to public
with check (((student_id = (current_setting('request.headers.student-id'::text, true))::uuid) AND (assignment_id IN ( SELECT assignments.id
   FROM assignments
  WHERE (assignments.classroom IN ( SELECT students.classroom
           FROM students
          WHERE (students.id = (current_setting('request.headers.student-id'::text, true))::uuid)))))));


create policy "Students: Submit feedback"
on "public"."feedback"
as permissive
for insert
to public
with check ((student_id = auth.uid()));


create policy "Teachers: View feedback"
on "public"."feedback"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM assignments
  WHERE ((assignments.id = feedback.assignment_id) AND (assignments.teacher_id = auth.uid())))));


create policy "Students can view game assignments for their classroom"
on "public"."game_assignments"
as permissive
for select
to public
using ((classroom IN ( SELECT students.classroom
   FROM students
  WHERE (students.auth_id = auth.uid()))));


create policy "Teachers can assign games to their classroom"
on "public"."game_assignments"
as permissive
for insert
to public
with check ((auth.uid() = teacher_id));


create policy "Teachers can create game assignments"
on "public"."game_assignments"
as permissive
for insert
to public
with check (((teacher_id = auth.uid()) AND (classroom IN ( SELECT classrooms.name
   FROM classrooms
  WHERE (classrooms.teacher_id = auth.uid())))));


create policy "Teachers can delete their own game assignments"
on "public"."game_assignments"
as permissive
for delete
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can update their own game assignments"
on "public"."game_assignments"
as permissive
for update
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can view their own game assignments"
on "public"."game_assignments"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Allow teacher to insert game"
on "public"."games"
as permissive
for insert
to authenticated
with check ((teacher_id = auth.uid()));


create policy "Students can read assigned games"
on "public"."games"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (game_assignments ga
     JOIN students s ON ((s.classroom = ga.classroom)))
  WHERE ((ga.game_id = games.id) AND (s.auth_id = auth.uid()) AND (ga.is_active = true)))) OR (is_global = true)));


create policy "Teacher can see own and global games"
on "public"."games"
as permissive
for select
to public
using (((is_global = true) OR (teacher_id = auth.uid())));


create policy "Teachers can create games"
on "public"."games"
as permissive
for insert
to public
with check ((teacher_id = auth.uid()));


create policy "Teachers can delete their own games"
on "public"."games"
as permissive
for delete
to public
using ((teacher_id = auth.uid()));


create policy "Teachers can read own and global games"
on "public"."games"
as permissive
for select
to public
using (((teacher_id = auth.uid()) OR (is_global = true)));


create policy "Teachers can update their own games"
on "public"."games"
as permissive
for update
to public
using ((teacher_id = auth.uid()));


create policy "manage_own_games"
on "public"."games"
as permissive
for all
to public
using ((auth.uid() = teacher_id));


create policy "Admin can read all licenses"
on "public"."licenses"
as permissive
for select
to authenticated
using ((auth.email() = 'superadminkhaledi@arcade.dev'::text));


create policy "Allow claim on unused licenses"
on "public"."licenses"
as permissive
for update
to authenticated
using (((is_used = false) OR (auth.uid() = teacher_id)))
with check (((is_used = true) OR (auth.uid() = teacher_id)));


create policy "Allow teacher to redeem license"
on "public"."licenses"
as permissive
for update
to authenticated
using (((auth.uid() = teacher_id) OR (is_used = false)))
with check (((teacher_id IS NULL) OR (auth.uid() = teacher_id)));


create policy "Allow teacher to redeem own license"
on "public"."licenses"
as permissive
for update
to authenticated
using (((auth.uid() = teacher_id) OR (is_used = false)))
with check (((auth.uid() = teacher_id) OR (is_used = false)));


create policy "Superadmin can read all licenses by UID"
on "public"."licenses"
as permissive
for select
to authenticated
using ((auth.uid() = '472a6f8f-c9b1-4d60-8e81-033ad6644974'::uuid));


create policy "Superadmin insert license"
on "public"."licenses"
as permissive
for insert
to authenticated
with check ((auth.role() = 'superadmin'::text));


create policy "admin can insert licenses"
on "public"."licenses"
as permissive
for insert
to authenticated
with check ((auth.uid() = '472a6f8f-c9b1-4d60-8e81-033ad6644974'::uuid));


create policy "Only see/edit your own questions"
on "public"."questions"
as permissive
for all
to public
using ((assignment_id IN ( SELECT assignments.id
   FROM assignments
  WHERE (assignments.teacher_id = auth.uid()))))
with check ((assignment_id IN ( SELECT assignments.id
   FROM assignments
  WHERE (assignments.teacher_id = auth.uid()))));


create policy "Students can read questions for their assignments"
on "public"."questions"
as permissive
for select
to public
using ((assignment_id IN ( SELECT assignments.id
   FROM assignments
  WHERE (assignments.classroom IN ( SELECT students.classroom
           FROM students
          WHERE (students.auth_id = auth.uid()))))));


create policy "Teachers can read their questions"
on "public"."questions"
as permissive
for select
to public
using ((assignment_id IN ( SELECT assignments.id
   FROM assignments
  WHERE (assignments.teacher_id = auth.uid()))));


create policy "Teachers: Manage questions for their assignments"
on "public"."questions"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM assignments
  WHERE ((assignments.id = questions.assignment_id) AND (assignments.teacher_id = auth.uid())))));


create policy "Students can create their own results"
on "public"."results"
as permissive
for insert
to public
with check ((student_id IN ( SELECT students.id
   FROM students
  WHERE (students.auth_id = auth.uid()))));


create policy "Students can read their own results"
on "public"."results"
as permissive
for select
to public
using ((student_id IN ( SELECT students.id
   FROM students
  WHERE (students.auth_id = auth.uid()))));


create policy "Students can view their results"
on "public"."results"
as permissive
for select
to authenticated
using ((student_id IN ( SELECT students.id
   FROM students
  WHERE (students.auth_id = auth.uid()))));


create policy "Students: Submit result"
on "public"."results"
as permissive
for insert
to public
with check ((student_id = auth.uid()));


create policy "Teachers can read results for their content"
on "public"."results"
as permissive
for select
to public
using (((assignment_id IN ( SELECT assignments.id
   FROM assignments
  WHERE (assignments.teacher_id = auth.uid()))) OR (game_id IN ( SELECT games.id
   FROM games
  WHERE (games.teacher_id = auth.uid())))));


create policy "Teachers can view results of their assignments"
on "public"."results"
as permissive
for select
to authenticated
using ((assignment_id IN ( SELECT assignments.id
   FROM assignments
  WHERE (assignments.teacher_id = auth.uid()))));


create policy "Admin can insert licenses"
on "public"."self_learner_licenses"
as permissive
for insert
to public
with check (is_admin());


create policy "Admin can select all self_learner_licenses"
on "public"."self_learner_licenses"
as permissive
for select
to public
using (is_admin());


create policy "Admin can update licenses"
on "public"."self_learner_licenses"
as permissive
for update
to public
using (is_admin());


create policy "Allow all inserts for self_learner_licenses"
on "public"."self_learner_licenses"
as permissive
for insert
to public
with check (true);


create policy "Allow all to select licenses"
on "public"."self_learner_licenses"
as permissive
for select
to public
using (true);


create policy "Allow all to update licenses"
on "public"."self_learner_licenses"
as permissive
for update
to public
using (true);


create policy "Self-learners can insert their own payments"
on "public"."self_learner_payments"
as permissive
for insert
to public
with check (((auth.uid())::text = (self_learner_id)::text));


create policy "Self-learners can view their own payments"
on "public"."self_learner_payments"
as permissive
for select
to public
using (((auth.uid())::text = (self_learner_id)::text));


create policy "Admin can select all self_learner_plans"
on "public"."self_learner_plans"
as permissive
for select
to public
using (is_admin());


create policy "Allow all to select plans"
on "public"."self_learner_plans"
as permissive
for select
to public
using (true);


create policy "Admin can select all subscriptions"
on "public"."self_learner_subscriptions"
as permissive
for select
to public
using (is_admin());


create policy "Allow all inserts for self_learner_subscriptions"
on "public"."self_learner_subscriptions"
as permissive
for insert
to public
with check (true);


create policy "Self can select own subscriptions"
on "public"."self_learner_subscriptions"
as permissive
for select
to public
using (((auth.uid())::text = (self_learner_id)::text));


create policy "Self-learner can delete their own subscription"
on "public"."self_learner_subscriptions"
as permissive
for delete
to public
using ((self_learner_id = auth.uid()));


create policy "Self-learner can insert their own subscription"
on "public"."self_learner_subscriptions"
as permissive
for insert
to public
with check ((self_learner_id = auth.uid()));


create policy "Self-learner can select their own subscriptions"
on "public"."self_learner_subscriptions"
as permissive
for select
to public
using ((self_learner_id = auth.uid()));


create policy "Self-learner can update their own subscription"
on "public"."self_learner_subscriptions"
as permissive
for update
to public
using ((self_learner_id = auth.uid()));


create policy "Allow all for login"
on "public"."self_learners"
as permissive
for select
to public
using (true);


create policy "Allow all inserts for self_learners"
on "public"."self_learners"
as permissive
for insert
to public
with check (true);


create policy "Self can select own row"
on "public"."self_learners"
as permissive
for select
to public
using (((auth.uid())::text = (id)::text));


create policy "Self can update own row"
on "public"."self_learners"
as permissive
for update
to public
using (((auth.uid())::text = (id)::text));


create policy "Students can mark assignment as complete"
on "public"."student_assignment_status"
as permissive
for insert
to public
with check ((auth.uid() = student_id));


create policy "Students can read their own assignment status"
on "public"."student_assignment_status"
as permissive
for select
to public
using ((auth.uid() = student_id));


create policy "Service role can do anything"
on "public"."student_game_status"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "Students can insert their own game results"
on "public"."student_game_status"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM students
  WHERE ((students.id = student_game_status.student_id) AND (students.auth_id = auth.uid())))));


create policy "Students can view their own game results"
on "public"."student_game_status"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM students
  WHERE ((students.id = student_game_status.student_id) AND (students.auth_id = auth.uid())))));


create policy "Teachers can view results for their students"
on "public"."student_game_status"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM students
  WHERE ((students.id = student_game_status.student_id) AND (students.teacher_id = auth.uid())))));


create policy "Allow insert for service role"
on "public"."students"
as permissive
for insert
to service_role
with check (true);


create policy "Allow teacher delete"
on "public"."students"
as permissive
for delete
to public
using ((auth.uid() = teacher_id));


create policy "Allow teacher insert"
on "public"."students"
as permissive
for insert
to public
with check ((auth.uid() = teacher_id));


create policy "Allow teacher select"
on "public"."students"
as permissive
for select
to public
using ((auth.uid() = teacher_id));


create policy "Allow teacher update"
on "public"."students"
as permissive
for update
to public
using ((auth.uid() = teacher_id))
with check ((auth.uid() = teacher_id));


create policy "Edge can insert students"
on "public"."students"
as permissive
for insert
to service_role
with check (true);


create policy "Student access self"
on "public"."students"
as permissive
for all
to public
using ((auth.uid() = auth_id))
with check ((auth.uid() = auth_id));


create policy "Students can read their own record"
on "public"."students"
as permissive
for select
to public
using (true);


create policy "Students read/write own row"
on "public"."students"
as permissive
for all
to public
using ((auth.uid() = auth_id))
with check ((auth.uid() = auth_id));


create policy "Students read/write their own row"
on "public"."students"
as permissive
for all
to public
using ((auth.uid() = auth_id))
with check ((auth.uid() = auth_id));


create policy "Students: Read own profile"
on "public"."students"
as permissive
for select
to public
using (((auth.role() = 'anon'::text) OR (id = auth.uid())));


create policy "Students: Register"
on "public"."students"
as permissive
for insert
to public
with check (true);


create policy "Students: Update own profile"
on "public"."students"
as permissive
for update
to public
using ((id = auth.uid()));


create policy "Teacher can view their students"
on "public"."students"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Teacher manages own students"
on "public"."students"
as permissive
for all
to public
using ((auth.uid() = teacher_id))
with check ((auth.uid() = teacher_id));


create policy "Teachers can insert students"
on "public"."students"
as permissive
for insert
to authenticated
with check ((auth.uid() = teacher_id));


create policy "Teachers can manage their own students"
on "public"."students"
as permissive
for all
to authenticated
using ((auth.uid() = teacher_id))
with check ((auth.uid() = teacher_id));


create policy "Teachers: create subscription record"
on "public"."subscriptions"
as permissive
for insert
to public
with check ((teacher_id = auth.uid()));


create policy "Teachers: update own subscription"
on "public"."subscriptions"
as permissive
for update
to public
using ((teacher_id = auth.uid()));


create policy "Teachers: view their own subscription"
on "public"."subscriptions"
as permissive
for select
to public
using ((teacher_id = auth.uid()));


create policy "Admin can select all"
on "public"."teachers"
as permissive
for select
to public
using (((auth.role() = 'authenticated'::text) AND (role = 'admin'::text)));


create policy "Allow insert for teachers"
on "public"."teachers"
as permissive
for insert
to authenticated
with check ((auth.uid() = auth_id));


create policy "Allow public read for signup check"
on "public"."teachers"
as permissive
for select
to public
using (true);


create policy "Allow select for owner"
on "public"."teachers"
as permissive
for select
to public
using ((auth.uid() = auth_id));


create policy "Allow select if user owns the row"
on "public"."teachers"
as permissive
for select
to public
using ((auth.uid() = auth_id));


create policy "Allow teacher to update own subscription"
on "public"."teachers"
as permissive
for update
to authenticated
using ((auth.uid() = auth_id))
with check ((auth.uid() = auth_id));


create policy "Allow teachers to view their own data"
on "public"."teachers"
as permissive
for select
to public
using ((auth.uid() = auth_id));


create policy "Public can read teachers"
on "public"."teachers"
as permissive
for select
to public
using (true);


create policy "Teacher can update self"
on "public"."teachers"
as permissive
for update
to authenticated
using ((auth.uid() = auth_id))
with check ((auth.uid() = auth_id));


create policy "Teachers can update self"
on "public"."teachers"
as permissive
for update
to authenticated
using ((auth.uid() = auth_id))
with check ((auth.uid() = auth_id));


CREATE TRIGGER set_teacher_id_trigger BEFORE INSERT ON public.game_assignments FOR EACH ROW EXECUTE FUNCTION set_teacher_id_from_auth();

CREATE TRIGGER set_game_teacher_id_trigger BEFORE INSERT ON public.games FOR EACH ROW EXECUTE FUNCTION set_teacher_id_from_auth();

CREATE TRIGGER normalize_email_before_insert BEFORE INSERT ON public.teachers FOR EACH ROW EXECUTE FUNCTION normalize_teacher_email();


