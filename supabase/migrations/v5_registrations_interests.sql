-- v5: guest registration cancel tokens + device-based interests

alter table registrations
  add column if not exists cancel_token text unique,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by text;

alter table interests add column if not exists device_id text;

alter table interests drop constraint if exists interests_activity_id_user_id_key;

create unique index if not exists interests_user_unique
  on interests(activity_id, user_id)
  where user_id is not null;

create unique index if not exists interests_device_unique
  on interests(activity_id, device_id)
  where user_id is null and device_id is not null;

create index if not exists registrations_cancel_token_idx on registrations(cancel_token);
create index if not exists interests_device_id_idx on interests(device_id);
