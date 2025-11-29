-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (synced from auth.users)
create table public.users (
  id uuid not null,
  email text null,
  created_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign key (id) references auth.users (id) on delete cascade
) tablespace pg_default;

-- Trigger to sync auth.users to public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, created_at)
  values (new.id, new.email, new.created_at);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Installations table
create table public.installations (
  installation_id bigint not null,
  account_login text null,
  account_type text null,
  owner_user_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint installations_pkey primary key (installation_id),
  constraint installations_owner_user_id_fkey foreign key (owner_user_id) references public.users (id) on delete set null
) tablespace pg_default;

-- Bot configurations table
create table public.bot_configs (
  id uuid not null default gen_random_uuid(),
  installation_id bigint null,
  model_name jsonb not null,
  user_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint bot_configs_pkey primary key (id),
  constraint bot_configs_installation_id_fkey foreign key (installation_id) references installations (installation_id) on delete cascade,
  constraint bot_configs_user_id_fkey foreign key (user_id) references users (id) on delete set null
) tablespace pg_default;

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for installations table
create trigger installations_set_updated_at
  before update on installations
  for each row
  execute function update_updated_at();

-- Trigger for bot_configs table
create trigger bot_configs_set_updated_at
  before update on bot_configs
  for each row
  execute function update_updated_at();

-- Indexes for better performance
create index idx_installations_owner_user_id on installations(owner_user_id);
create index idx_bot_configs_installation_id on bot_configs(installation_id);
create index idx_bot_configs_user_id on bot_configs(user_id);

-- Enable Row Level Security (optional - uncomment if needed)
-- alter table public.users enable row level security;
-- alter table public.installations enable row level security;
-- alter table public.bot_configs enable row level security;

