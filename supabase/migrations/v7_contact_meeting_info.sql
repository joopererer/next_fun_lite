-- v7: contact redesign, meeting location, info post type

alter table activities
  add column if not exists organizer_contact_type text default 'wechat',
  add column if not exists organizer_contact text,
  add column if not exists organizer_contact_label text,
  add column if not exists meeting_location text,
  add column if not exists meeting_time text,
  add column if not exists post_type text default 'activity',
  add column if not exists info_deadline timestamptz,
  add column if not exists info_price text,
  add column if not exists info_action_label text,
  add column if not exists info_action_url text;

alter table registrations
  add column if not exists contact_type text default 'wechat',
  add column if not exists contact_value text not null default '',
  add column if not exists contact_label text;

create index if not exists activities_post_type_idx on activities(post_type);
create index if not exists activities_info_deadline_idx on activities(info_deadline);
