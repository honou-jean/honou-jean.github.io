-- EXAMPLE ONLY. Replace every placeholder before running any statement.
-- Run as a trusted database administrator, never from browser code.

-- 1. Create teacher and student Auth users in Authentication > Users.
-- 2. Copy their UUIDs, then promote only the verified teacher account.

-- update public.profiles
-- set role = 'teacher', full_name = 'Verified teacher name'
-- where id = '<TEACHER_AUTH_USER_UUID>'::uuid;

-- 3. Assign a verified student Auth account to that teacher.

-- insert into public.students (user_id, teacher_id, cohort)
-- values (
--   '<STUDENT_AUTH_USER_UUID>'::uuid,
--   '<TEACHER_AUTH_USER_UUID>'::uuid,
--   'Optional cohort label'
-- );

-- 4. Each assignment targets exactly one active student assigned to its teacher.

-- insert into public.assignments (teacher_id, student_id, title, description, status)
-- values (
--   '<TEACHER_AUTH_USER_UUID>'::uuid,
--   '<STUDENT_AUTH_USER_UUID>'::uuid,
--   'Example assignment title',
--   'Example instructions without personal data',
--   'draft'
-- );

-- The teacher can also create assignments through an authenticated client.
-- Do not seed real names, email addresses, grades, or documents in source control.
