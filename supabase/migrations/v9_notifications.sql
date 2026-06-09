-- v9: notification preferences, in-app notifications, info interests

alter table profiles
  add column if not exists notification_email text,
  add column if not exists notify_registration_change boolean default true,
  add column if not exists notify_activity_reminder boolean default true,
  add column if not exists notify_proposal_recruiting boolean default true,
  add column if not exists notify_new_recruit boolean default false,
  add column if not exists notify_info_reminder boolean default true;

create table if not exists notifications (
  id text primary key,
  user_id text not null references profiles(id),
  type text not null,
  title text not null,
  body text not null,
  action_url text,
  activity_id text references activities(id) on delete cascade,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_user_id on notifications(user_id);
create index if not exists notifications_is_read on notifications(user_id, is_read);

create table if not exists info_interests (
  id text primary key,
  activity_id text not null references activities(id) on delete cascade,
  user_id text references profiles(id),
  device_id text,
  email text,
  created_at timestamptz default now()
);

create index if not exists info_interests_activity_id on info_interests(activity_id);
create index if not exists info_interests_user_id on info_interests(user_id);

create unique index if not exists info_interests_user_unique
  on info_interests(activity_id, user_id)
  where user_id is not null;

create unique index if not exists info_interests_email_unique
  on info_interests(activity_id, email)
  where email is not null;
