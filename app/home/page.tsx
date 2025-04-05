'use client';

import { useEffect, useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabase';

type UserData = {
  name: string;
  profile_picture_url: string | null;
};

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, profile_picture_url')
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          setError('Failed to load user data');
          return;
        }

        setUser(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Something went wrong');
      }
    };

    fetchUser();
  }, []);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md aspect-[4/5] relative mb-4">
          <img
            src={user.profile_picture_url || '/placeholder-profile.jpg'}
            alt={`${user.name}'s profile picture`}
            className="rounded-lg object-cover w-full h-full"
          />
        </div>
        
        <h1 className="text-2xl font-semibold text-foreground mt-4">
          {user.name}
        </h1>
      </div>

      <BottomNavigation />
    </main>
  );
} 