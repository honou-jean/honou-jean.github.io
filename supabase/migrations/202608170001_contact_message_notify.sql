begin;

-- Fires the notify-contact-message Edge Function (via pg_net, async HTTP)
-- whenever a new contact_messages row lands, so the owner gets an email
-- instead of having to poll Supabase Studio. The row has already passed the
-- honeypot + timing-trap checks in contact_messages_insert_public by the
-- time this trigger runs.
--
-- The webhook secret is read from Supabase Vault (vault.decrypted_secrets)
-- rather than embedded here, so it is never committed to this file. Store it
-- once via:
--   select vault.create_secret('<value>', 'contact_webhook_secret', '...');

create extension if not exists pg_net;

create or replace function public.notify_contact_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'contact_webhook_secret'
  limit 1;

  perform net.http_post(
    url := 'https://tdtrdjndyixmvkquttpr.supabase.co/functions/v1/notify-contact-message',
    body := jsonb_build_object('type', 'INSERT', 'table', 'contact_messages', 'record', to_jsonb(new)),
    params := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    timeout_milliseconds := 8000
  );
  return new;
end;
$$;

revoke all on function public.notify_contact_message() from public, anon, authenticated;

create trigger contact_messages_notify_after_insert
after insert on public.contact_messages
for each row execute function public.notify_contact_message();

commit;
