-- Next Fun Lite v4 schema
-- Run via: npm run db:setup  (requires SUPABASE_DB_URL or manual SQL Editor)

create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id text primary key,
  nickname text not null,
  wechat text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists activities (
  id text primary key,
  title text not null,
  description text,
  date timestamptz,
  date_end timestamptz,
  registration_deadline timestamptz,
  location text,
  min_participants int,
  max_participants int,
  fee text,
  fee_level text,
  notes text,
  organizer_name text,
  organizer_wechat text,
  organizer_contact_type text default 'wechat',
  organizer_contact text,
  organizer_contact_label text,
  meeting_location text,
  meeting_time text,
  post_type text default 'activity',
  info_deadline timestamptz,
  info_price text,
  info_action_label text,
  info_action_url text,
  organizer_id text references profiles(id),
  source_url text,
  status text default 'proposed',
  category text default 'other',
  interested_count int default 0,
  source_proposal_id text,
  linked_recruit_ids text[],
  ended_at timestamptz,
  recap text,
  recap_images text,
  cancel_reason text,
  cancel_note text,
  ticket_prices text,
  ticket_url text,
  ticket_deadline timestamptz,
  ticket_method text,
  refund_policy text,
  difficulty text,
  distance_duration text,
  itinerary text,
  equipment text,
  transportation text,
  meal_arrangement text,
  restaurant_address text,
  per_person_cost text,
  reservation_method text,
  requires_deposit boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists registrations (
  id text primary key,
  activity_id text not null references activities(id) on delete cascade,
  user_id text references profiles(id),
  name text not null,
  wechat text not null,
  contact_type text default 'wechat',
  contact_value text not null default '',
  contact_label text,
  participant_count int default 1,
  note text,
  registered_at timestamptz default now(),
  cancel_token text unique,
  cancelled_at timestamptz,
  cancelled_by text
);

create table if not exists interests (
  id text primary key,
  activity_id text not null references activities(id) on delete cascade,
  user_id text references profiles(id),
  device_id text,
  wechat text,
  created_at timestamptz default now()
);

create index if not exists activities_post_type_idx on activities(post_type);
create index if not exists activities_info_deadline_idx on activities(info_deadline);
create index if not exists activities_status_idx on activities(status);
create index if not exists activities_category_idx on activities(category);
create index if not exists activities_created_at_idx on activities(created_at desc);
create index if not exists registrations_activity_id_idx on registrations(activity_id);
create index if not exists registrations_user_id_idx on registrations(user_id);
create index if not exists registrations_wechat_idx on registrations(wechat);
create index if not exists interests_activity_id_idx on interests(activity_id);
create index if not exists interests_user_id_idx on interests(user_id);
create index if not exists interests_device_id_idx on interests(device_id);
create index if not exists registrations_cancel_token_idx on registrations(cancel_token);

create unique index if not exists interests_user_unique
  on interests(activity_id, user_id)
  where user_id is not null;

create unique index if not exists interests_device_unique
  on interests(activity_id, device_id)
  where user_id is null and device_id is not null;

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists activities_updated_at on activities;
create trigger activities_updated_at
  before update on activities
  for each row execute function update_updated_at();

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
