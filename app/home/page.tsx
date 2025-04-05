'use client';

import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import SwipeableCard from '@/components/SwipeableCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';

type UserData = {
  id: string;
  name: string;
  profile_picture_url: string | null;
};

type DebugInfo = {
  type: string;
  data?: any;
  error?: any;
};

export default function HomePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        console.log('Starting data fetch...');
        
        // Get users that haven't been swiped on yet
        const { data: swipedUsers, error: swipedError } = await supabase
          .from('swipes')
          .select('swiped_id')
          .eq('swiper_id', user.id);

        if (swipedError) throw swipedError;

        const swipedIds = swipedUsers?.map(swipe => swipe.swiped_id) || [];

        // Get users to show (excluding current user and already swiped users)
        let query = supabase
          .from('users')
          .select('id, name, profile_picture_url')
          .not('id', 'eq', user.id);  // First exclude the current user

        // Only apply the not-in filter if there are swiped IDs
        if (swipedIds.length > 0) {
          query = query.not('id', 'in', swipedIds);
        }

        const { data, error: supabaseError } = await query.limit(10);

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
          setError('No more profiles to show');
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
  }, [user]);

  const handleSwipe = async (direction: 'left' | 'right', swipedUserId: string) => {
    if (!user) return;

    try {
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: swipedUserId,
          direction
        });

      if (swipeError) throw swipeError;

      // If it's a right swipe, check for a match
      if (direction === 'right') {
        const { data: existingSwipe, error: matchError } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', swipedUserId)
          .eq('swiped_id', user.id)
          .eq('direction', 'right')
          .single();

        if (matchError && matchError.code !== 'PGRST116') throw matchError;

        // If there's a match, create a match record
        if (existingSwipe) {
          const { error: createMatchError } = await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: swipedUserId
            });

          if (createMatchError) throw createMatchError;
        }
      }

      // Remove the swiped user from the list
      setUsers(prevUsers => prevUsers.filter(u => u.id !== swipedUserId));
    } catch (err) {
      console.error('Error handling swipe:', err);
      setError('Failed to process swipe');
    }
  };

  const handleSwipeLeft = () => {
    if (users.length > 0) {
      handleSwipe('left', users[0].id);
    }
  };

  const handleSwipeRight = () => {
    if (users.length > 0) {
      handleSwipe('right', users[0].id);
    }
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
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
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

        <div className="w-full flex justify-center">
          <div className="w-full max-w-md">
            <BottomNavigation />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 