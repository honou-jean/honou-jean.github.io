begin;

-- Public contact-form inbox: any visitor may insert a message, but no role may
-- select, update or delete it through the API; the owner reads messages only
-- in Supabase Studio, which uses service-role/dashboard access and bypasses RLS.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  locale text,
  honeypot text,
  rendered_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint contact_messages_name_length check (char_length(btrim(name)) between 1 and 200),
  constraint contact_messages_email_format check (
    char_length(email) <= 254
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  constraint contact_messages_subject_length check (subject is null or char_length(subject) <= 200),
  constraint contact_messages_message_length check (char_length(btrim(message)) between 1 and 4000),
  constraint contact_messages_locale_value check (locale is null or locale in ('fr', 'en'))
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

create policy contact_messages_insert_public
on public.contact_messages for insert to anon, authenticated
with check (
  (honeypot is null or btrim(honeypot) = '')
  and rendered_at <= now() + interval '2 minutes'
  and now() - rendered_at >= interval '3 seconds'
);

revoke all on table public.contact_messages from anon, authenticated;
grant insert (name, email, subject, message, locale, honeypot, rendered_at)
  on table public.contact_messages to anon, authenticated;

commit;
