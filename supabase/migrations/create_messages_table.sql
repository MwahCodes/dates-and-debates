-- Create messages table
create table public.messages (
  id uuid not null default extensions.uuid_generate_v4(),
  sender_id uuid not null references auth.users(id),
  receiver_id uuid not null references auth.users(id),
  content text not null,
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone,
  constraint messages_pkey primary key (id)
);

-- Enable RLS
alter table public.messages enable row level security;

-- Create policies
create policy "Users can view messages they're involved in"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Create index for better query performance
create index messages_participants_idx on public.messages(sender_id, receiver_id);
create index messages_created_at_idx on public.messages(created_at);

-- Function to check if users have matched (both swiped right)
create or replace function public.have_users_matched(user1_id uuid, user2_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.swipes s1
    join public.swipes s2 on s1.swiper_id = s2.swiped_id and s1.swiped_id = s2.swiper_id
    where 
      s1.is_like = true and 
      s2.is_like = true and
      ((s1.swiper_id = user1_id and s1.swiped_id = user2_id) or
       (s1.swiper_id = user2_id and s1.swiped_id = user1_id))
  );
end;
$$ language plpgsql security definer; 