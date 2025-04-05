'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  birthday: string;
  education_level: string | null;
  height: number | null;
  weight: number | null;
  mbti_type: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

// Helper function to format height from decimal to feet and inches
const formatHeight = (height: number | null): string => {
  if (!height) return 'Not specified';
  const feet = Math.floor(height);
  const inches = Math.round((height - feet) * 12);
  return `${feet}'${inches}"`;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[#666666]">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-6">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Profile Picture and Name */}
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={profile.profile_picture_url || '/placeholder-profile.jpg'}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-hannari text-[#1A1A1A]">{profile.name}</h1>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">About Me</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#666666]">Birthday</p>
                <p className="text-[#1A1A1A]">
                  {profile.birthday ? format(new Date(profile.birthday), 'MMMM d, yyyy') : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666666]">Education</p>
                <p className="text-[#1A1A1A]">{profile.education_level || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Physical Attributes */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Physical Attributes</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#666666]">Height</p>
                <p className="text-[#1A1A1A]">{formatHeight(profile.height)}</p>
              </div>
              <div>
                <p className="text-sm text-[#666666]">Weight</p>
                <p className="text-[#1A1A1A]">{profile.weight ? `${profile.weight} lbs` : 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Personality */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Personality</h2>
            <div>
              <p className="text-sm text-[#666666]">MBTI Type</p>
              <p className="text-[#1A1A1A]">{profile.mbti_type || 'Not specified'}</p>
            </div>
          </div>

          {/* Member Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm text-[#666666]">Member Since</p>
                <p className="text-sm text-[#1A1A1A]">
                  {format(new Date(profile.created_at), 'MM/dd/yyyy')}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-[#666666]">Last Updated</p>
                <p className="text-sm text-[#1A1A1A]">
                  {format(new Date(profile.updated_at), 'MM/dd/yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}