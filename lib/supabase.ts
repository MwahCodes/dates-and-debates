import { createClient } from '@supabase/supabase-js';

// Validate environment variables at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client with cookie persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          const value = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${key}=`))
            ?.split('=')[1];
          return value || null;
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          const date = new Date();
          date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // 24 hours
          document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      },
    },
  },
}); 