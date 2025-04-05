-- Function to get leaderboard data with rating summaries
create or replace function public.get_leaderboard_data()
returns table (
  id uuid,
  name text,
  profile_picture_url text,
  average_rating numeric,
  rating_count bigint,
  total_rating bigint
) as $$
begin
  return query
  select 
    u.id,
    u.name,
    u.profile_picture_url,
    coalesce(round(avg(r.score)::numeric, 1), 0) as average_rating,
    count(r.id) as rating_count,
    coalesce(sum(r.score), 0) as total_rating
  from 
    public.users u
  left join 
    public.ratings r on u.id = r.rated_id
  group by 
    u.id, u.name, u.profile_picture_url
  order by 
    total_rating desc, rating_count desc;
end;
$$ language plpgsql security definer; 