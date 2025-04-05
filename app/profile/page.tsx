'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Image from 'next/image';
import { toast } from 'sonner';

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      setUploading(true);

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Create a unique file name using the user's name and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(uploadError.message || 'Error uploading file');
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update the user's profile with the new image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        console.error('Update error details:', updateError);
        throw new Error(updateError.message || 'Error updating profile');
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, profile_picture_url: publicUrl } : null);
      toast.success('Profile picture updated successfully');

    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
          <div 
            className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer group"
            onClick={handleImageClick}
          >
            <Image
              src={profile.profile_picture_url || '/placeholder-profile.jpg'}
              alt={profile.name}
              fill
              className="object-cover"
            />
            {/* Overlay with upload text */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm">
                {uploading ? 'Uploading...' : 'Update Photo'}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
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