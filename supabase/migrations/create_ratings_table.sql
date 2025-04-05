-- Create ratings table
create table public.ratings (
  id uuid not null default extensions.uuid_generate_v4(),
  rater_id uuid not null references auth.users(id),
  rated_id uuid not null references auth.users(id),
  score integer not null check (score >= 1 and score <= 10),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint ratings_pkey primary key (id),
  constraint unique_rating unique (rater_id, rated_id),
  constraint valid_rating check (rater_id != rated_id)
);

-- Enable RLS
alter table public.ratings enable row level security;

-- Create policies
create policy "Users can view ratings they're involved in"
  on public.ratings for select
  using (auth.uid() = rater_id or auth.uid() = rated_id);

create policy "Users can rate others"
  on public.ratings for insert
  with check (auth.uid() = rater_id);

create policy "Users can update their own ratings"
  on public.ratings for update
  using (auth.uid() = rater_id);

-- Create indexes for better query performance
create index ratings_rater_idx on public.ratings(rater_id);
create index ratings_rated_idx on public.ratings(rated_id);

-- Function to get user's average rating
create or replace function public.get_user_average_rating(user_id uuid)
returns numeric as $$
declare
  avg_rating numeric;
begin
  select coalesce(avg(score), 0) into avg_rating
  from public.ratings
  where rated_id = user_id;
  
  return avg_rating;
end;
$$ language plpgsql security definer;

-- Function to check if users can rate each other (they must have matched)
create or replace function public.can_users_rate(user1_id uuid, user2_id uuid)
returns boolean as $$
begin
  return exists (
    -- Check if users have matched through the existing have_users_matched function
    select 1 where public.have_users_matched(user1_id, user2_id) = true
  );
end;
$$ language plpgsql security definer; 