'use client';

import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import SwipeableCard from '@/components/SwipeableCard';
import { supabase } from '@/lib/supabase';

type UserData = {
  name: string;
  profile_picture_url: string | null;
};

interface DebugInfo {
  type: 'query_result' | 'connection_error' | 'unexpected_error';
  data?: UserData[];
  error?: {
    message: string;
    details?: string;
    hint?: string;
  };
}

export default function HomePage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Starting data fetch...');
        
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('name, profile_picture_url')
          .limit(10);

        console.log('Query result:', { data, error: supabaseError });
        setDebugInfo({ 
          type: 'query_result', 
          data: data || undefined,
          error: supabaseError || undefined
        });

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setError(`Failed to load user data: ${supabaseError.message}`);
          return;
        }

        if (!data || data.length === 0) {
          console.error('No data returned from Supabase');
          setError('No user data available');
          return;
        }

        setUsers(data);
        console.log('Successfully fetched users:', data);
      } catch (err) {
        const error = err as Error;
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred');
        setDebugInfo({ 
          type: 'unexpected_error',
          error: {
            message: error.message
          }
        });
      }
    };

    fetchUsers();
  }, []);

  const handleSwipeLeft = () => {
    setUsers((prevUsers) => prevUsers.slice(1));
  };

  const handleSwipeRight = () => {
    // Here you could implement matching logic
    setUsers((prevUsers) => prevUsers.slice(1));
  };

  // Show error with helpful debug info
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-red-600 text-center">{error}</div>
        <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded max-w-md">
          <p className="font-semibold">Troubleshooting:</p>
          <ul className="list-disc pl-4 mt-2">
            <li>Check if Supabase RLS policies are enabled for the users table</li>
            <li>Verify that the users table has data</li>
            <li>Confirm the environment variables are set correctly</li>
          </ul>
          {debugInfo && (
            <div className="mt-4">
              <p className="font-semibold">Debug Information:</p>
              <pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">No more profiles to show</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content with max-width container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <SwipeableCard
            name={users[0].name}
            imageUrl={users[0].profile_picture_url || '/placeholder-profile.jpg'}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        </div>
      </div>

      {/* Bottom navigation with max-width container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md">
          <BottomNavigation />
        </div>
      </div>
    </div>
  );
} 