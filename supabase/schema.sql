-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for links
create table links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  thumbnail_url text,
  cta_text text not null default 'Visitar',
  position integer not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for analytics
create table analytics (
  id uuid default uuid_generate_v4() primary key,
  link_id uuid references links(id) on delete cascade not null,
  clicks integer not null default 0,
  last_clicked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table links enable row level security;
alter table analytics enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

create policy "Links are viewable by everyone." on links
  for select using (true);

create policy "Users can insert their own links." on links
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own links." on links
  for update using (auth.uid() = user_id);

create policy "Users can delete their own links." on links
  for delete using (auth.uid() = user_id);

create policy "Analytics are viewable by link owners." on analytics
  for select using (
    auth.uid() in (
      select user_id from links where id = analytics.link_id
    )
  );

create policy "Anyone can insert analytics." on analytics
  for insert with check (true);

-- Create functions
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 