import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export type User = {
  id: string;
  name: string;
  birthday: string;
  education_level: string | null;
  height: number | null;
  weight: number | null;
  mbti_type: string | null;
  profile_picture_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}; 