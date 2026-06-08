-- v6: activity end time + registration deadline
alter table activities add column if not exists date_end timestamptz;
alter table activities add column if not exists registration_deadline timestamptz;
