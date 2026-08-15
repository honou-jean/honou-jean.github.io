begin;

create schema if not exists portal_private;
revoke all on schema portal_private from public, anon, authenticated;
grant usage on schema portal_private to authenticated;

create type public.portal_role as enum ('teacher', 'student');
create type public.assignment_status as enum ('draft', 'published', 'closed');
create type public.submission_status as enum ('submitted', 'late', 'reviewed');
create type public.question_status as enum ('open', 'answered', 'closed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.portal_role not null default 'student',
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (
    full_name is null or char_length(btrim(full_name)) between 1 and 120
  )
);

create table public.students (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  cohort text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_distinct_people check (user_id <> teacher_id),
  constraint students_cohort_length check (
    cohort is null or char_length(btrim(cohort)) between 1 and 120
  )
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  student_id uuid not null references public.students (user_id) on delete cascade,
  title text not null,
  description text,
  instructions text,
  due_at timestamptz,
  status public.assignment_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assignments_title_length check (char_length(btrim(title)) between 1 and 180),
  constraint assignments_description_length check (description is null or char_length(description) <= 4000),
  constraint assignments_instructions_length check (instructions is null or char_length(instructions) <= 12000),
  constraint assignments_publication_time check (status = 'draft' or published_at is not null)
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  title text not null,
  description text,
  storage_path text unique,
  external_url text,
  mime_type text,
  file_size_bytes bigint,
  visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_title_length check (char_length(btrim(title)) between 1 and 180),
  constraint resources_description_length check (description is null or char_length(description) <= 2000),
  constraint resources_exactly_one_source check (
    (storage_path is not null and external_url is null)
    or (storage_path is null and external_url is not null)
  ),
  constraint resources_path_format check (
    storage_path is null
    or (
      storage_path = btrim(storage_path)
      and storage_path not like '/%'
      and storage_path not like '%/'
      and storage_path not like '%//%'
      and position('..' in storage_path) = 0
    )
  ),
  constraint resources_external_url_format check (
    external_url is null
    or (
      external_url = btrim(external_url)
      and char_length(external_url) between 9 and 2048
      and external_url ~ '^https://[^/[:space:]@?#]+[^[:space:]]*$'
      and external_url !~ '^https://[^/?#[:space:]]*@'
    )
  ),
  constraint resources_file_size check (file_size_bytes is null or file_size_bytes between 1 and 6291456),
  constraint resources_link_has_no_file_metadata check (
    external_url is null or (mime_type is null and file_size_bytes is null)
  )
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.students (user_id) on delete cascade,
  file_paths text[] not null default '{}',
  message text,
  status public.submission_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  feedback text,
  grade numeric(5, 2),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_one_per_assignment unique (assignment_id, student_id),
  constraint submissions_file_count check (cardinality(file_paths) between 0 and 5),
  constraint submissions_file_paths_no_nulls check (array_position(file_paths, null) is null),
  constraint submissions_content_present check (
    cardinality(file_paths) >= 1
    or nullif(btrim(message), '') is not null
  ),
  constraint submissions_message_length check (message is null or char_length(message) <= 4000),
  constraint submissions_feedback_length check (feedback is null or char_length(feedback) <= 8000),
  constraint submissions_grade_range check (grade is null or grade between 0 and 20),
  constraint submissions_review_consistency check (
    status <> 'reviewed' or reviewed_at is not null
  )
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.students (user_id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  message text not null,
  answer text,
  status public.question_status not null default 'open',
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_message_length check (char_length(btrim(message)) between 1 and 4000),
  constraint questions_answer_length check (answer is null or char_length(answer) <= 8000),
  constraint questions_answer_consistency check (
    status <> 'answered' or (nullif(btrim(answer), '') is not null and answered_at is not null)
  )
);

create index profiles_role_idx on public.profiles (role);
create index students_teacher_idx on public.students (teacher_id) where active;
create index assignments_teacher_status_idx on public.assignments (teacher_id, status);
create index assignments_student_status_idx on public.assignments (student_id, status);
create index assignments_due_at_idx on public.assignments (due_at) where due_at is not null;
create index resources_assignment_visible_idx on public.resources (assignment_id, visible);
create index submissions_student_submitted_idx on public.submissions (student_id, submitted_at desc);
create index submissions_assignment_submitted_idx on public.submissions (assignment_id, submitted_at desc);
create index questions_student_created_idx on public.questions (student_id, created_at desc);
create index questions_teacher_status_idx on public.questions (teacher_id, status, created_at desc);
create index questions_assignment_idx on public.questions (assignment_id);

create or replace function portal_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function portal_private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_name text;
begin
  candidate_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');

  insert into public.profiles (id, role, full_name)
  values (new.id, 'student', left(candidate_name, 120))
  on conflict (id) do nothing;

  return new;
end;
$$;

insert into public.profiles (id, role, full_name)
select
  users.id,
  'student',
  left(nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''), 120)
from auth.users as users
on conflict (id) do nothing;

drop trigger if exists on_auth_user_created_portal on auth.users;
create trigger on_auth_user_created_portal
after insert on auth.users
for each row execute function portal_private.handle_new_auth_user();

create or replace function portal_private.validate_student_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  student_role public.portal_role;
  teacher_role public.portal_role;
begin
  select role into student_role from public.profiles where id = new.user_id;
  select role into teacher_role from public.profiles where id = new.teacher_id;

  if student_role is distinct from 'student' then
    raise exception 'student profile must have the student role';
  end if;
  if teacher_role is distinct from 'teacher' then
    raise exception 'teacher profile must have the teacher role';
  end if;

  return new;
end;
$$;

create trigger students_validate_roles
before insert or update of user_id, teacher_id on public.students
for each row execute function portal_private.validate_student_roles();

create or replace function portal_private.prepare_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  teacher_role public.portal_role;
  assigned_teacher uuid;
  student_is_active boolean;
begin
  select role into teacher_role from public.profiles where id = new.teacher_id;
  if teacher_role is distinct from 'teacher' then
    raise exception 'assignment owner must have the teacher role';
  end if;

  select teacher_id, active
  into assigned_teacher, student_is_active
  from public.students
  where user_id = new.student_id;

  if assigned_teacher is distinct from new.teacher_id
    or student_is_active is distinct from true then
    raise exception 'assignment student must be active and assigned to the owner teacher';
  end if;

  if tg_op = 'UPDATE' then
    if (
        new.teacher_id is distinct from old.teacher_id
        or new.student_id is distinct from old.student_id
      )
      and (
        old.status <> 'draft'
        or new.status <> 'draft'
        or exists (select 1 from public.resources where assignment_id = old.id)
        or exists (select 1 from public.submissions where assignment_id = old.id)
        or exists (select 1 from public.questions where assignment_id = old.id)
      ) then
      raise exception 'an assignment with activity or published history cannot be reassigned';
    end if;
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  elsif new.status = 'draft' then
    new.published_at := null;
  end if;

  return new;
end;
$$;

create trigger assignments_prepare
before insert or update of teacher_id, student_id, status, published_at on public.assignments
for each row execute function portal_private.prepare_assignment();

create or replace function portal_private.prepare_resource()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  expected_student uuid;
  expected_prefix text;
begin
  if new.storage_path is null then
    return new;
  end if;

  select student_id into expected_student
  from public.assignments
  where id = new.assignment_id;

  if expected_student is null then
    raise exception 'resource assignment does not exist';
  end if;

  expected_prefix := expected_student::text || '/' || new.assignment_id::text || '/';
  if new.storage_path not like (expected_prefix || '%')
    or position('/' in substring(new.storage_path from char_length(expected_prefix) + 1)) > 0 then
    raise exception 'resource storage path must match student/assignment/file';
  end if;

  return new;
end;
$$;

create trigger resources_prepare
before insert or update of assignment_id, storage_path on public.resources
for each row execute function portal_private.prepare_resource();

create or replace function portal_private.prepare_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  assignment_teacher uuid;
  assignment_student uuid;
  assignment_state public.assignment_status;
  assignment_due timestamptz;
  path text;
  seen_paths text[] := '{}';
  expected_prefix text;
begin
  if actor is not null then
    new.student_id := actor;
  end if;

  select teacher_id, student_id, status, due_at
  into assignment_teacher, assignment_student, assignment_state, assignment_due
  from public.assignments
  where id = new.assignment_id;

  if assignment_teacher is null or assignment_state <> 'published' then
    raise exception 'assignment is not accepting submissions';
  end if;

  if assignment_student is distinct from new.student_id then
    raise exception 'assignment is not assigned to this student';
  end if;

  if not exists (
    select 1
    from public.students
    where user_id = new.student_id
      and teacher_id = assignment_teacher
      and active
  ) then
    raise exception 'student is not assigned to this teacher';
  end if;

  expected_prefix := new.student_id::text || '/' || new.assignment_id::text || '/';
  foreach path in array new.file_paths loop
    if path is null
      or nullif(btrim(path), '') is null
      or path <> btrim(path)
      or char_length(path) <= char_length(expected_prefix)
      or path = any(seen_paths)
      or path not like (expected_prefix || '%')
      or position('/' in substring(path from char_length(expected_prefix) + 1)) > 0
      or lower(path) !~ '[.](pdf|docx|odt|txt|png|jpe?g)$'
      or position('..' in path) > 0 then
      raise exception 'submission paths must be unique nonblank student/assignment/file paths';
    end if;
    seen_paths := array_append(seen_paths, path);
  end loop;

  new.submitted_at := now();
  new.status := case
    when assignment_due is not null and now() > assignment_due then 'late'::public.submission_status
    else 'submitted'::public.submission_status
  end;
  new.reviewed_at := null;

  return new;
end;
$$;

create trigger submissions_prepare
before insert on public.submissions
for each row execute function portal_private.prepare_submission();

create or replace function portal_private.prepare_submission_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'reviewed' and old.status <> 'reviewed' then
    new.reviewed_at := now();
  elsif new.status <> 'reviewed' then
    new.reviewed_at := null;
  end if;
  return new;
end;
$$;

create trigger submissions_prepare_review
before update of status on public.submissions
for each row execute function portal_private.prepare_submission_review();

create or replace function portal_private.prepare_question()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  assignment_teacher uuid;
  assignment_student uuid;
  assignment_state public.assignment_status;
begin
  if actor is not null then
    new.student_id := actor;
  end if;

  select teacher_id, student_id, status
  into assignment_teacher, assignment_student, assignment_state
  from public.assignments
  where id = new.assignment_id;

  if assignment_teacher is null or assignment_state not in ('published', 'closed') then
    raise exception 'assignment is not available for questions';
  end if;

  if assignment_student is distinct from new.student_id then
    raise exception 'assignment is not assigned to this student';
  end if;

  if not exists (
    select 1
    from public.students
    where user_id = new.student_id
      and teacher_id = assignment_teacher
      and active
  ) then
    raise exception 'student is not assigned to this teacher';
  end if;

  new.teacher_id := assignment_teacher;
  new.status := 'open';
  new.answer := null;
  new.answered_at := null;
  return new;
end;
$$;

create trigger questions_prepare
before insert on public.questions
for each row execute function portal_private.prepare_question();

create or replace function portal_private.prepare_question_answer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'closed' then
    new.answered_at := case
      when nullif(btrim(new.answer), '') is not null then coalesce(new.answered_at, now())
      else null
    end;
  elsif nullif(btrim(new.answer), '') is not null then
    new.status := 'answered';
    new.answered_at := coalesce(new.answered_at, now());
  elsif new.status = 'answered' then
    raise exception 'an answered question requires answer text';
  else
    new.answered_at := null;
  end if;
  return new;
end;
$$;

create trigger questions_prepare_answer
before update of answer, status, answered_at on public.questions
for each row execute function portal_private.prepare_question_answer();

create or replace function portal_private.validate_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = old.role then
    return new;
  end if;

  if new.role = 'teacher' and exists (
    select 1 from public.students where user_id = new.id
  ) then
    raise exception 'a linked student profile cannot be promoted to teacher';
  end if;

  if new.role = 'student' and (
    exists (select 1 from public.students where teacher_id = new.id)
    or exists (select 1 from public.assignments where teacher_id = new.id)
  ) then
    raise exception 'a teacher with linked records cannot be demoted';
  end if;

  return new;
end;
$$;

create trigger profiles_validate_role_change
before update of role on public.profiles
for each row execute function portal_private.validate_profile_role_change();

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function portal_private.touch_updated_at();
create trigger students_touch_updated_at before update on public.students
for each row execute function portal_private.touch_updated_at();
create trigger assignments_touch_updated_at before update on public.assignments
for each row execute function portal_private.touch_updated_at();
create trigger resources_touch_updated_at before update on public.resources
for each row execute function portal_private.touch_updated_at();
create trigger submissions_touch_updated_at before update on public.submissions
for each row execute function portal_private.touch_updated_at();
create trigger questions_touch_updated_at before update on public.questions
for each row execute function portal_private.touch_updated_at();

create or replace function portal_private.teacher_is_assigned_to_student(student_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.students
    where user_id = student_user_id
      and teacher_id = (select auth.uid())
      and active
  );
$$;

create or replace function portal_private.student_is_assigned_to_teacher(teacher_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.students
    where user_id = (select auth.uid())
      and teacher_id = teacher_user_id
      and active
  );
$$;

create or replace function portal_private.teacher_owns_assignment(assignment_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.assignments
    where id = assignment_uuid
      and teacher_id = (select auth.uid())
  );
$$;

create or replace function portal_private.student_can_view_assignment(assignment_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.assignments as assignment
    join public.students as student
      on student.user_id = assignment.student_id
      and student.teacher_id = assignment.teacher_id
    where assignment.id = assignment_uuid
      and assignment.status in ('published', 'closed')
      and assignment.student_id = (select auth.uid())
      and student.active
  );
$$;

create or replace function portal_private.student_can_submit_assignment(assignment_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.assignments as assignment
    join public.students as student
      on student.user_id = assignment.student_id
      and student.teacher_id = assignment.teacher_id
    where assignment.id = assignment_uuid
      and assignment.status = 'published'
      and assignment.student_id = (select auth.uid())
      and student.active
  );
$$;

create or replace function portal_private.can_manage_teaching_resource_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[] := storage.foldername(object_name);
  actor uuid := auth.uid();
begin
  if actor is null or coalesce(array_length(folders, 1), 0) <> 2 then
    return false;
  end if;

  return exists (
    select 1 from public.assignments
    where id::text = folders[2]
      and student_id::text = folders[1]
      and teacher_id = actor
  );
end;
$$;

create or replace function portal_private.can_read_teaching_resource_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[] := storage.foldername(object_name);
  actor uuid := auth.uid();
begin
  if actor is null or coalesce(array_length(folders, 1), 0) <> 2 then
    return false;
  end if;

  return exists (
    select 1
    from public.assignments as assignment
    where assignment.id::text = folders[2]
      and assignment.student_id::text = folders[1]
      and (
        assignment.teacher_id = actor
        or (
          assignment.student_id = actor
          and assignment.status in ('published', 'closed')
          and exists (
            select 1 from public.students
            where user_id = actor
              and teacher_id = assignment.teacher_id
              and active
          )
          and exists (
            select 1 from public.resources
            where storage_path is not null
              and storage_path = object_name
              and assignment_id = assignment.id
              and visible
          )
        )
      )
  );
end;
$$;

create or replace function portal_private.can_upload_submission_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[] := storage.foldername(object_name);
  actor uuid := auth.uid();
begin
  if actor is null or coalesce(array_length(folders, 1), 0) <> 2 then
    return false;
  end if;

  if lower(object_name) !~ '[.](pdf|docx|odt|txt|png|jpe?g)$' then
    return false;
  end if;

  return folders[1] = actor::text and exists (
    select 1
    from public.assignments as assignment
    join public.students as student
      on student.user_id = assignment.student_id
      and student.teacher_id = assignment.teacher_id
    where assignment.id::text = folders[2]
      and assignment.status = 'published'
      and assignment.student_id = actor
      and folders[1] = actor::text
      and student.active
  );
end;
$$;

create or replace function portal_private.can_read_submission_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[] := storage.foldername(object_name);
  actor uuid := auth.uid();
begin
  if actor is null or coalesce(array_length(folders, 1), 0) <> 2 then
    return false;
  end if;

  if folders[1] = actor::text then
    return exists (
      select 1
      from public.assignments
      where id::text = folders[2]
        and student_id = actor
    );
  end if;

  return exists (
    select 1
    from public.submissions as submission
    join public.assignments as assignment on assignment.id = submission.assignment_id
    join public.students as student on student.user_id = submission.student_id
    where submission.student_id::text = folders[1]
      and submission.assignment_id::text = folders[2]
      and object_name = any(submission.file_paths)
      and assignment.teacher_id = actor
      and assignment.student_id = submission.student_id
      and student.teacher_id = actor
  );
end;
$$;

create or replace function portal_private.can_delete_submission_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[] := storage.foldername(object_name);
  actor uuid := auth.uid();
begin
  if actor is null or coalesce(array_length(folders, 1), 0) <> 2 then
    return false;
  end if;

  if folders[1] = actor::text then
    return exists (
      select 1
      from public.assignments
      where id::text = folders[2]
        and student_id = actor
    ) and not exists (
      select 1
      from public.submissions
      where student_id = actor
        and assignment_id::text = folders[2]
        and object_name = any(file_paths)
    );
  end if;

  return portal_private.can_read_submission_object(object_name);
end;
$$;

revoke all on all functions in schema portal_private from public, anon, authenticated;
grant execute on function portal_private.teacher_is_assigned_to_student(uuid) to authenticated;
grant execute on function portal_private.student_is_assigned_to_teacher(uuid) to authenticated;
grant execute on function portal_private.teacher_owns_assignment(uuid) to authenticated;
grant execute on function portal_private.student_can_view_assignment(uuid) to authenticated;
grant execute on function portal_private.student_can_submit_assignment(uuid) to authenticated;
grant execute on function portal_private.can_manage_teaching_resource_object(text) to authenticated;
grant execute on function portal_private.can_read_teaching_resource_object(text) to authenticated;
grant execute on function portal_private.can_upload_submission_object(text) to authenticated;
grant execute on function portal_private.can_read_submission_object(text) to authenticated;
grant execute on function portal_private.can_delete_submission_object(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.resources enable row level security;
alter table public.submissions enable row level security;
alter table public.questions enable row level security;

create policy profiles_select_portal_parties
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (select portal_private.teacher_is_assigned_to_student(id))
  or (select portal_private.student_is_assigned_to_teacher(id))
);

create policy profiles_update_own
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy students_select_own_or_assigned
on public.students for select to authenticated
using (user_id = (select auth.uid()) or teacher_id = (select auth.uid()));

create policy students_insert_by_assigned_teacher
on public.students for insert to authenticated
with check (teacher_id = (select auth.uid()));

create policy students_update_by_assigned_teacher
on public.students for update to authenticated
using (teacher_id = (select auth.uid()))
with check (teacher_id = (select auth.uid()));

create policy students_delete_by_assigned_teacher
on public.students for delete to authenticated
using (teacher_id = (select auth.uid()));

create policy assignments_select_portal_parties
on public.assignments for select to authenticated
using (
  teacher_id = (select auth.uid())
  or (select portal_private.student_can_view_assignment(id))
);

create policy assignments_insert_teacher
on public.assignments for insert to authenticated
with check (teacher_id = (select auth.uid()));

create policy assignments_update_teacher
on public.assignments for update to authenticated
using (teacher_id = (select auth.uid()))
with check (teacher_id = (select auth.uid()));

create policy assignments_delete_teacher
on public.assignments for delete to authenticated
using (teacher_id = (select auth.uid()));

create policy resources_select_portal_parties
on public.resources for select to authenticated
using (
  (select portal_private.teacher_owns_assignment(assignment_id))
  or (visible and (select portal_private.student_can_view_assignment(assignment_id)))
);

create policy resources_insert_teacher
on public.resources for insert to authenticated
with check ((select portal_private.teacher_owns_assignment(assignment_id)));

create policy resources_update_teacher
on public.resources for update to authenticated
using ((select portal_private.teacher_owns_assignment(assignment_id)))
with check ((select portal_private.teacher_owns_assignment(assignment_id)));

create policy resources_delete_teacher
on public.resources for delete to authenticated
using ((select portal_private.teacher_owns_assignment(assignment_id)));

create policy submissions_select_portal_parties
on public.submissions for select to authenticated
using (
  student_id = (select auth.uid())
  or (select portal_private.teacher_owns_assignment(assignment_id))
);

create policy submissions_insert_student
on public.submissions for insert to authenticated
with check (
  student_id = (select auth.uid())
  and (select portal_private.student_can_submit_assignment(assignment_id))
);

create policy submissions_update_teacher
on public.submissions for update to authenticated
using ((select portal_private.teacher_owns_assignment(assignment_id)))
with check ((select portal_private.teacher_owns_assignment(assignment_id)));

create policy questions_select_portal_parties
on public.questions for select to authenticated
using (student_id = (select auth.uid()) or teacher_id = (select auth.uid()));

create policy questions_insert_student
on public.questions for insert to authenticated
with check (
  student_id = (select auth.uid())
  and (select portal_private.student_can_view_assignment(assignment_id))
);

create policy questions_update_teacher
on public.questions for update to authenticated
using (teacher_id = (select auth.uid()))
with check (teacher_id = (select auth.uid()));

revoke all on table public.profiles, public.students, public.assignments,
  public.resources, public.submissions, public.questions from anon, authenticated;

grant select on table public.profiles, public.students, public.assignments,
  public.resources, public.submissions, public.questions to authenticated;
grant update (full_name) on table public.profiles to authenticated;
grant insert (user_id, teacher_id, cohort, active) on table public.students to authenticated;
grant update (cohort, active) on table public.students to authenticated;
grant delete on table public.students to authenticated;
grant insert (teacher_id, student_id, title, description, instructions, due_at, status) on table public.assignments to authenticated;
grant update (student_id, title, description, instructions, due_at, status) on table public.assignments to authenticated;
grant delete on table public.assignments to authenticated;
grant insert (assignment_id, title, description, storage_path, external_url, mime_type, file_size_bytes, visible) on table public.resources to authenticated;
grant update (title, description, external_url, mime_type, file_size_bytes, visible) on table public.resources to authenticated;
grant delete on table public.resources to authenticated;
grant insert (assignment_id, file_paths, message) on table public.submissions to authenticated;
grant update (status, feedback, grade, reviewed_at) on table public.submissions to authenticated;
grant insert (assignment_id, message) on table public.questions to authenticated;
grant update (answer, status, answered_at) on table public.questions to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'teaching-resources',
    'teaching-resources',
    false,
    6291456,
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'application/zip'
    ]::text[]
  ),
  (
    'student-submissions',
    'student-submissions',
    false,
    6291456,
    array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]::text[]
  )
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy portal_resource_objects_select
on storage.objects for select to authenticated
using (
  bucket_id = 'teaching-resources'
  and (select portal_private.can_read_teaching_resource_object(name))
);

create policy portal_resource_objects_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'teaching-resources'
  and (select portal_private.can_manage_teaching_resource_object(name))
);

create policy portal_resource_objects_update
on storage.objects for update to authenticated
using (
  bucket_id = 'teaching-resources'
  and (select portal_private.can_manage_teaching_resource_object(name))
)
with check (
  bucket_id = 'teaching-resources'
  and (select portal_private.can_manage_teaching_resource_object(name))
);

create policy portal_resource_objects_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'teaching-resources'
  and (select portal_private.can_manage_teaching_resource_object(name))
);

create policy portal_submission_objects_select
on storage.objects for select to authenticated
using (
  bucket_id = 'student-submissions'
  and (select portal_private.can_read_submission_object(name))
);

create policy portal_submission_objects_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'student-submissions'
  and (select portal_private.can_upload_submission_object(name))
);

create policy portal_submission_objects_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'student-submissions'
  and (select portal_private.can_delete_submission_object(name))
);

commit;
