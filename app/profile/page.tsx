'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import ProfileImageUpload from '@/components/ProfileImageUpload';

interface UserProfile {
  id: string;
  name: string;
  birthday?: string;
  education_level?: string;
  height?: number;
  weight?: number;
  mbti_type?: string | null;
  profile_picture_url?: string | null;
  created_at: string;
  updated_at?: string;
  average_rating?: number;
  rating_count?: number;
  total_rating?: number;
}

interface RawUserRating {
  id: string;
  name: string;
  profile_picture_url: string | null;
  average_rating: string;
  rating_count: string;
  total_rating: string;
}

export default function ProfilePage() {
  const { user, supabase, signOut, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Skip if still loading auth state
    if (authLoading) return;
    
    // Redirect if no user
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        console.log('Fetching profile for user:', user.id);
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          
          if (error.code === 'PGRST116') {
            // No user data found, redirect to profile setup
            console.log('User profile not found, redirecting to profile setup');
            toast.info('Please complete your profile setup');
            router.push('/profile-setup');
            return;
          }
          
          throw error;
        }

        // Get rating data
        const { data: ratingData, error: ratingError } = await supabase
          .rpc('get_leaderboard_data')
          .eq('id', user.id)
          .single();

        if (!ratingError && ratingData) {
          // Combine profile data with rating data
          const typedRatingData = ratingData as RawUserRating;
          data.average_rating = parseFloat(typedRatingData.average_rating);
          data.rating_count = parseInt(typedRatingData.rating_count);
          data.total_rating = parseInt(typedRatingData.total_rating);
        }

        console.log('Profile data retrieved:', data);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, supabase, router, authLoading]);

  // Handle loading states
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading profile...</div>
      </div>
    );
  }

  // Handle case when profile couldn't be loaded
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-[#666666] text-lg">Could not load profile</div>
        <Button 
          onClick={() => router.push('/home')}
          className="bg-[#6C0002] text-white hover:bg-[#8C0003]"
        >
          Go to Home
        </Button>
      </div>
    );
  }

  // Format date display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    try {
      // Parse the ISO date string directly without timezone adjustments
      const dateParts = dateString.split('T')[0].split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(dateParts[2]);
      
      // Create date using local values to avoid timezone shifts
      const date = new Date(year, month, day);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Format height as feet and inches 
  const formatHeight = (height?: number) => {
    if (!height) return 'Not provided';
    
    // If height is stored as decimal (e.g., 5.5 for 5'5")
    const feet = Math.floor(height);
    const inches = Math.round((height - feet) * 10); // e.g., 0.5 -> 5
    
    return `${feet}ft ${inches} inches`;
  };

  // Format weight in lbs
  const formatWeight = (weight?: number) => {
    if (!weight) return 'Not provided';
    
    // Simply display the weight as lbs since it's already stored that way
    return `${weight} lbs`;
  };

  // Handle image update
  const handleImageUpdated = (newImageUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        profile_picture_url: newImageUrl
      });
    }
  };

  // Render profile
  return (
    <div className="bg-[#F5F5F5] flex flex-col items-center p-4 pb-20">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {/* Profile header */}
          <div className="flex items-center space-x-4">
            <ProfileImageUpload 
              profileImageUrl={profile.profile_picture_url || null} 
              userName={profile.name}
              userId={profile.id}
              onImageUpdated={handleImageUpdated}
            />
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">{profile.name}</h1>
              <p className="text-[#666666]">{user?.email || 'No email available'}</p>
            </div>
          </div>

          {/* Profile details */}
          <div className="mt-6 pt-6 border-t border-[#E0E0E0] space-y-4">
            <div>
              <p className="text-sm text-[#666666]">Birthday</p>
              <p className="text-[#1A1A1A]">{formatDate(profile.birthday)}</p>
            </div>
            
            {profile.education_level && (
              <div>
                <p className="text-sm text-[#666666]">Education</p>
                <p className="text-[#1A1A1A]">{profile.education_level}</p>
              </div>
            )}
            
            {profile.mbti_type && (
              <div>
                <p className="text-sm text-[#666666]">MBTI Type</p>
                <p className="text-[#1A1A1A]">{profile.mbti_type}</p>
              </div>
            )}
            
            <div className="flex space-x-4">
              {profile.height && (
                <div className="flex-1">
                  <p className="text-sm text-[#666666]">Height</p>
                  <p className="text-[#1A1A1A]">{formatHeight(profile.height)}</p>
                </div>
              )}
              
              {profile.weight && (
                <div className="flex-1">
                  <p className="text-sm text-[#666666]">Weight</p>
                  <p className="text-[#1A1A1A]">{formatWeight(profile.weight)}</p>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-[#666666]">Member since</p>
              <p className="text-[#1A1A1A]">{formatDate(profile.created_at)}</p>
            </div>
          </div>

          {/* Rating information */}
          <div className="mt-6 pt-6 border-t border-[#E0E0E0] space-y-4">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Your Rating</h2>
            
            {profile.rating_count && profile.rating_count > 0 ? (
              <div className="flex space-x-4">
                <div className="flex-1">
                  <p className="text-sm text-[#666666]">Average Rating</p>
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-[#1A1A1A] mr-1">
                      {profile.average_rating?.toFixed(1)}
                    </span>
                    <span className="text-sm text-[#666666]">/10</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-[#666666]">Total Ratings</p>
                  <p className="text-xl font-bold text-[#1A1A1A]">
                    {profile.rating_count}
                  </p>
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-[#666666]">Total Score</p>
                  <p className="text-xl font-bold text-[#1A1A1A]">
                    {profile.total_rating}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-[#666666]">No ratings yet</p>
                <p className="text-sm text-[#666666]">
                  When others rate you, your score will appear here
                </p>
              </div>
            )}
            
            <div className="mt-2">
              <Button
                onClick={() => router.push('/leaderboard')}
                variant="outline"
                className="w-full border-[#6C0002] text-[#6C0002] hover:bg-[#6C0002] hover:text-white"
              >
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
        
        {/* Actions - Removed Edit Profile button */}
        <div className="flex flex-col space-y-3">
          <Button
            onClick={signOut}
            variant="outline"
            className="border-[#6C0002] text-[#6C0002] hover:bg-[#6C0002] hover:text-white"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}