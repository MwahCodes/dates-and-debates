'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_picture_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const { user, supabase } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, supabase, router]);

  if (!user || isLoading) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#666666]">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] flex flex-col items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {profile.profile_picture_url ? (
                <Image
                  src={profile.profile_picture_url}
                  alt={profile.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#6C0002] text-white text-2xl">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">{profile.name}</h1>
              <p className="text-[#666666]">{profile.email}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#E0E0E0]">
            <p className="text-sm text-[#666666]">
              Member since {format(new Date(profile.created_at), 'MMMM yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}