import { createClient } from '@supabase/supabase-js';

// Validate environment variables at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create Supabase client with enhanced session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null;
        
        // First try to get from cookie
        const cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${key}=`))
          ?.split('=')[1];
        
        if (cookieValue) {
          console.log(`Retrieved auth token from cookies for key: ${key}`);
          return cookieValue;
        }
        
        // Fallback to localStorage if cookie not found
        try {
          const value = localStorage.getItem(key);
          if (value) {
            console.log(`Retrieved auth token from localStorage for key: ${key}`);
            // Also set the cookie for future retrievals
            const date = new Date();
            date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
            const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax${secureAttribute}`;
          }
          return value;
        } catch (error) {
          console.error('LocalStorage access error:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return;
        
        console.log(`Setting auth token for key: ${key}`);
        
        // Set in cookie
        const date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${key}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax${secureAttribute}`;
        
        // Also set in localStorage for redundancy
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('LocalStorage access error:', error);
        }
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return;
        
        console.log(`Removing auth token for key: ${key}`);
        
        // Remove from cookie
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        
        // Also remove from localStorage
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('LocalStorage access error:', error);
        }
      },
    },
  },
}); 