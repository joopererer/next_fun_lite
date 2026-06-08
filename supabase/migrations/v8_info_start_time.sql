-- v8: info start time for scheduled action windows

alter table activities
  add column if not exists info_start_time timestamptz;
