-- v7b: remove info email reminder subsystem (replaced by calendar)
drop table if exists info_interests;

alter table profiles
  drop column if exists notify_activity_reminder,
  drop column if exists notify_info_reminder;
