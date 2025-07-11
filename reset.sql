-- Drop if exist
drop table if exists public.users cascade;
drop function if exists handle_new_user;

-- Create table
create table public.users (
    id uuid primary key,
    email text unique not null,
    phone text unique,
    fullname text,
    username text unique,
    facebook text,
    role text default 'general',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Function for syncing auth users
create function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger from auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- Enable RLS and allow access
alter table public.users enable row level security;
create policy "Allow read for all" on public.users for select using (true);
create policy "Allow insert for authenticated" on public.users for insert with check (true);