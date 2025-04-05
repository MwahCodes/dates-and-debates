'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SwipeableCard from '@/components/SwipeableCard';
import { X, Check } from 'lucide-react';

interface User {
  id: string;
  name: string;
  profile_picture_url: string | null;
  education_level?: string;
  height?: number;
  weight?: number;
  mbti_type?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        setIsLoading(true);
        // Get users that haven't been swiped on
        const { data: swipedUsers, error: swipedError } = await supabase
          .from('swipes')
          .select('swiped_id')
          .eq('swiper_id', user.id);

        if (swipedError) throw swipedError;

        const swipedIds = swipedUsers?.map(s => s.swiped_id) || [];
        
        // Get potential matches
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .neq('id', user.id)
          .not('id', 'in', `(${swipedIds.length > 0 ? swipedIds.join(',') : 'null'})`)
          .limit(10);

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [user, supabase, router]);

  const handleSwipe = async (direction: 'left' | 'right', swipedUserId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to swipe');
      return;
    }

    if (!swipedUserId) {
      toast.error('No profile to swipe on');
      return;
    }

    try {
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: swipedUserId,
          direction: direction
        });

      if (swipeError) {
        console.error('Swipe error:', swipeError);
        throw new Error(swipeError.message || 'Failed to record swipe');
      }

      // Check for match only on right swipe
      if (direction === 'right') {
        const { data: matchData, error: matchError } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', swipedUserId)
          .eq('swiped_id', user.id)
          .eq('direction', 'right')
          .maybeSingle();

        if (matchError) {
          console.error('Match check error:', matchError);
          throw new Error(matchError.message || 'Failed to check for match');
        }

        if (matchData) {
          // Create match with ordered user IDs
          const user1_id = user.id < swipedUserId ? user.id : swipedUserId;
          const user2_id = user.id < swipedUserId ? swipedUserId : user.id;

          const { error: matchCreateError } = await supabase
            .from('matches')
            .insert({
              user1_id,
              user2_id
            });

          if (matchCreateError && !matchCreateError.message?.includes('unique constraint')) {
            console.error('Match creation error:', matchCreateError);
            throw new Error(matchCreateError.message || 'Failed to create match');
          }

          toast.success("It's a match! 🎉");
        }
      }

      // Move to next profile
      const nextIndex = currentIndex + 1;
      if (nextIndex >= users.length) {
        // If we're at the last profile, fetch new ones
        await fetchUsers();
      } else {
        // Otherwise just move to next profile
        setCurrentIndex(nextIndex);
      }

    } catch (error) {
      console.error('Error processing swipe:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process swipe');
    }
  };

  // Function to fetch users (moved outside useEffect for reuse)
  const fetchUsers = async () => {
    if (!user) return;

    try {
      setIsLoading(true); // Add loading state while fetching

      const { data: swipedUsers, error: swipedError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      if (swipedError) throw swipedError;

      const swipedIds = swipedUsers?.map(s => s.swiped_id) || [];

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .not('id', 'in', `(${swipedIds.length > 0 ? swipedIds.join(',') : 'null'})`)
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        setUsers(data);
        setCurrentIndex(0); // Reset index when new users are fetched
      } else {
        setUsers([]);
        toast.info('No more profiles available');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="animate-pulse text-[#666666]">Loading profiles...</div>
      </div>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-[20px] leading-relaxed text-[#1A1A1A]">
              No more profiles to show
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-[14px] text-[#666666]">Check back later for new matches!</p>
            <Button 
              onClick={() => router.push('/profile')}
              className="bg-[#6C0002] text-white hover:bg-[#8C0003] w-full"
            >
              View Your Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Cards container with proper spacing */}
      <div className="flex-1 flex flex-col items-center justify-between px-4 py-4">
        <div className="w-full max-w-sm mx-auto flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Cards */}
          <div className="relative flex-1 mb-4">
            {users.slice(currentIndex, currentIndex + 3).map((user, index) => (
              <div
                key={user.id}
                className="absolute w-full transition-all duration-300 ease-out"
                style={{
                  zIndex: users.length - index,
                  transform: `scale(${1 - index * 0.05}) translateY(${index * 10}px)`,
                  opacity: index === 0 ? 1 : 0.8,
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                }}
              >
                <SwipeableCard
                  user={user}
                  onSwipe={(direction) => handleSwipe(direction, user.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Updated positioning and z-index */}
        <div className="fixed bottom-20 left-0 right-0 flex justify-center space-x-8 p-4 bg-transparent" style={{ zIndex: 1000 }}>
          <Button
            type="button"
            onClick={() => {
              if (isLoading) return;
              const currentUser = users[currentIndex];
              if (currentUser) {
                handleSwipe('left', currentUser.id);
              } else {
                toast.error('No more profiles to show');
              }
            }}
            disabled={isLoading || currentIndex >= users.length}
            className="w-16 h-16 rounded-full bg-white border-2 border-red-500 hover:bg-red-50 text-red-500 text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (isLoading) return;
              const currentUser = users[currentIndex];
              if (currentUser) {
                handleSwipe('right', currentUser.id);
              } else {
                toast.error('No more profiles to show');
              }
            }}
            disabled={isLoading || currentIndex >= users.length}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            <Check className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
} 