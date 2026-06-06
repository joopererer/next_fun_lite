-- Next Fun Lite v4 schema
-- Run in Supabase Dashboard → SQL Editor

create extension if not exists "uuid-ossp";

create table profiles (
  id text primary key,
  nickname text not null,
  wechat text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table activities (
  id text primary key,
  title text not null,
  description text,
  date timestamptz,
  location text,
  min_participants int,
  max_participants int,
  fee text,
  fee_level text,
  notes text,
  organizer_name text,
  organizer_wechat text,
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

create table registrations (
  id text primary key,
  activity_id text not null references activities(id) on delete cascade,
  user_id text references profiles(id),
  name text not null,
  wechat text not null,
  participant_count int default 1,
  note text,
  registered_at timestamptz default now()
);

create table interests (
  id text primary key,
  activity_id text not null references activities(id) on delete cascade,
  user_id text references profiles(id),
  wechat text,
  created_at timestamptz default now(),
  unique(activity_id, user_id)
);

create index on activities(status);
create index on activities(category);
create index on activities(created_at desc);
create index on registrations(activity_id);
create index on registrations(user_id);
create index on registrations(wechat);
create index on interests(activity_id);
create index on interests(user_id);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger activities_updated_at
  before update on activities
  for each row execute function update_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
