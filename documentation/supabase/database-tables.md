```sql
create table public.users (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  birthday date not null,
  education_level text null,
  height numeric(5, 2) null,
  weight numeric(5, 2) null,
  mbti_type character varying(4) null,
  profile_picture_url text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_height_check check ((height > (0)::numeric)),
  constraint users_weight_check check ((weight > (0)::numeric))
) TABLESPACE pg_default;

create table public.swipes (
  id uuid not null default extensions.uuid_generate_v4 (),
  swiper_id uuid null,
  swiped_id uuid null,
  direction text null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint swipes_pkey primary key (id),
  constraint swipes_swiper_id_swiped_id_key unique (swiper_id, swiped_id),
  constraint swipes_swiped_id_fkey foreign KEY (swiped_id) references auth.users (id),
  constraint swipes_swiper_id_fkey foreign KEY (swiper_id) references auth.users (id),
  constraint swipes_direction_check check (
    (
      direction = any (array['left'::text, 'right'::text])
    )
  )
) TABLESPACE pg_default;

create trigger create_match_trigger
after INSERT on swipes for EACH row
execute FUNCTION create_match_from_swipes ();


create table public.matches (
  id uuid not null default extensions.uuid_generate_v4 (),
  user1_id uuid not null,
  user2_id uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint matches_pkey primary key (id),
  constraint matches_unique_pair unique (user1_id, user2_id),
  constraint matches_user1_id_fkey foreign KEY (user1_id) references auth.users (id),
  constraint matches_user2_id_fkey foreign KEY (user2_id) references auth.users (id)
) TABLESPACE pg_default;


create table public.messages (
  id uuid not null default extensions.uuid_generate_v4 (),
  match_id uuid not null,
  sender_id uuid not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_match_id_fkey foreign KEY (match_id) references matches (id),
  constraint messages_sender_id_fkey foreign KEY (sender_id) references auth.users (id)
) TABLESPACE pg_default;