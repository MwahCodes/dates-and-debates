'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile_data: {
    name?: string;
    bio?: string;
    interests?: string[];
    education_level?: string;
    height?: number;
    weight?: number;
    mbti_type?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
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
        
        // Ensure profile_data exists and has default values
        const profileData = data?.profile_data || {};
        setUserProfile({
          ...data,
          profile_data: {
            name: profileData.name || 'Anonymous User',
            bio: profileData.bio || 'No bio available',
            interests: profileData.interests || [],
            education_level: profileData.education_level || 'Not specified',
            height: profileData.height || 0,
            weight: profileData.weight || 0,
            mbti_type: profileData.mbti_type || 'Not specified',
          }
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        toast.error('Failed to load your profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, supabase, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-[#1A1A1A]">Loading...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-[#1A1A1A]">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-[#666666]">Your profile could not be loaded.</p>
            <Button 
              onClick={() => router.push('/login')}
              className="bg-[#6C0002] text-white hover:bg-[#8C0003]"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-md mx-auto p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A] text-2xl font-hannari">
              {userProfile.profile_data.name}'s Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[20px] font-medium text-[#1A1A1A]">About Me</h3>
                <p className="text-[16px] text-[#666666] mt-1">
                  {userProfile.profile_data.bio}
                </p>
              </div>

              <div>
                <h3 className="text-[20px] font-medium text-[#1A1A1A]">Interests</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userProfile.profile_data.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#FF9E80] text-white rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[20px] font-medium text-[#1A1A1A]">Education</h3>
                <p className="text-[16px] text-[#666666] mt-1">
                  {userProfile.profile_data.education_level}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[20px] font-medium text-[#1A1A1A]">Height</h3>
                  <p className="text-[16px] text-[#666666] mt-1">
                    {userProfile.profile_data.height} inches
                  </p>
                </div>
                <div>
                  <h3 className="text-[20px] font-medium text-[#1A1A1A]">Weight</h3>
                  <p className="text-[16px] text-[#666666] mt-1">
                    {userProfile.profile_data.weight} lbs
                  </p>
                </div>
              </div>

              {userProfile.profile_data.mbti_type && (
                <div>
                  <h3 className="text-[20px] font-medium text-[#1A1A1A]">MBTI Type</h3>
                  <p className="text-[16px] text-[#666666] mt-1">
                    {userProfile.profile_data.mbti_type}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-[#666666]">
                  <span>Member Since</span>
                  <span>{new Date(userProfile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm text-[#666666] mt-2">
                  <span>Last Updated</span>
                  <span>{new Date(userProfile.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <Button
                onClick={() => router.push('/profile/edit')}
                className="bg-[#6C0002] text-white hover:bg-[#8C0003]"
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/home')}
                className="border-[#6C0002] text-[#6C0002] hover:bg-[#6C0002] hover:text-white"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}