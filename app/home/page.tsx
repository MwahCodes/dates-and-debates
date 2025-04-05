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
        let query = supabase
          .from('users')
          .select('*')
          .neq('id', user.id);
        
        // Only add the 'not in' filter if there are swiped IDs
        if (swipedIds.length > 0) {
          query = query.not('id', 'in', `(${swipedIds.join(',')})`);
        }
        
        const { data, error } = await query.limit(10);

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
      // Check if the user has already swiped on this profile
      const { data: existingSwipe, error: checkError } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', user.id)
        .eq('swiped_id', swipedUserId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing swipe:', checkError);
        throw new Error(checkError.message || 'Failed to check existing swipe');
      }

      // If already swiped, skip inserting and move to next profile
      if (existingSwipe) {
        toast.error('You have already swiped on this profile');
        // Move to the next profile
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= users.length) {
            toast.info('No more profiles to show');
          }
          return nextIndex;
        });
        return;
      }

      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: swipedUserId,
          is_like: direction === 'right'
        });

      if (swipeError) {
        console.error('Swipe error:', swipeError);
        throw new Error(swipeError.message || 'Failed to record swipe');
      }

      // Show a toast based on the swipe direction
      if (direction === 'right') {
        toast.success('You liked this profile!');
      } else {
        toast.info('Profile skipped');
      }

      // Move to next profile
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= users.length) {
          toast.info('No more profiles to show');
        }
        return nextIndex;
      });

    } catch (error) {
      console.error('Error processing swipe:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process swipe');
    }
  };

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading profiles...</div>
      </div>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className="h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
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
    <div className="h-screen pt-16 bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Main content area - using flex to prevent scroll */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        {/* Cards container - positioned from top to eliminate space */}
        <div 
          className="absolute left-1/2 w-full max-w-[384px] px-4 overflow-hidden"
          style={{ 
            top: '16px', // Position from top with minimal space
            transform: 'translateX(-50%)',
            height: '60vh', // Maintain the same height
          }}
        >
          {/* Cards - fixed height */}
          <div className="relative h-full w-full overflow-hidden">
            {users.slice(currentIndex, currentIndex + 3).map((user, index) => (
              <div
                key={user.id}
                className="absolute w-full h-full transition-all duration-300 ease-out touch-none"
                style={{
                  zIndex: 10 - index,
                  transform: `scale(${1 - index * 0.05}) translateY(${index * 10}px)`,
                  opacity: index === 0 ? 1 : 0.8,
                  pointerEvents: index === 0 ? 'auto' : 'none',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0
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

        {/* Bottom Action Buttons - fixed position */}
        <div 
          className="absolute left-0 right-0 flex justify-center items-center space-x-8 p-4" 
          style={{ 
            bottom: '120px',
            zIndex: 50
          }}
        >
          <button
            onClick={() => {
              const currentUser = users[currentIndex];
              if (currentUser) {
                handleSwipe('left', currentUser.id);
              }
            }}
            disabled={currentIndex >= users.length}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-red-500 flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ zIndex: 50 }}
          >
            <X className="w-7 h-7 md:w-8 md:h-8 text-red-500" />
          </button>
          <button
            onClick={() => {
              const currentUser = users[currentIndex];
              if (currentUser) {
                handleSwipe('right', currentUser.id);
              }
            }}
            disabled={currentIndex >= users.length}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ zIndex: 50 }}
          >
            <Check className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
} 