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
