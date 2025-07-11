-- 🧱 Create users table
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  phone text unique,
  fullname text not null,
  username text unique,
  facebook text,
  role text default 'general',
  status text default 'pending',
  banned boolean default false,
  created_at timestamp default now()
);

-- 🔐 Enable RLS
alter table users enable row level security;

-- 👤 Policies
create policy "Allow insert own user" on users
  for insert with check (auth.uid() = id);

create policy "Allow select own user" on users
  for select using (auth.uid() = id);

create policy "Allow update own user" on users
  for update using (auth.uid() = id);

-- 🔁 Trigger on auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
