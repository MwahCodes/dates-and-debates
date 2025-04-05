'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '@/components/BottomNavigation';
import SwipeableCard from '@/components/SwipeableCard';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  profile_picture_url: string | null;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, supabase } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      // Get the current user's profile
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (!currentUser) {
        router.push('/profile-setup');
        return;
      }

      // Get all users except the current user
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user?.id);

      if (error) throw error;

      setUsers(allUsers || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', swipedUserId: string) => {
    try {
      if (direction === 'right') {
        // Create a match
        const { error } = await supabase
          .from('matches')
          .insert([
            {
              user1_id: user?.id,
              user2_id: swipedUserId,
              status: 'pending'
            }
          ]);

        if (error) throw error;
        toast.success('Match created!');
      }
    } catch (error) {
      toast.error('Failed to process swipe');
      console.error('Error processing swipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">No more profiles to show</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Check back later for new matches!</p>
            <Button onClick={() => router.push('/profile')}>
              View Your Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {users.map((user) => (
            <SwipeableCard
              key={user.id}
              user={user}
              onSwipe={(direction) => handleSwipe(direction, user.id)}
            />
          ))}
        </div>
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
} 