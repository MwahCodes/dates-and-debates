'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploadProps {
  profileImageUrl: string | null;
  userName: string;
  userId: string;
  onImageUpdated: (newImageUrl: string) => void;
}

export default function ProfileImageUpload({ 
  profileImageUrl, 
  userName, 
  userId,
  onImageUpdated 
}: ProfileImageUploadProps) {
  const { supabase, user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Security check - ensure current user can only update their own profile
    if (!user || user.id !== userId) {
      toast.error('You can only update your own profile picture');
      return;
    }

    try {
      setIsUploading(true);

      // Create a safe file name using the user's ID (not name) to ensure uniqueness and security
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      
      // Try with the default bucket name in Supabase
      let uploadResult;
      let bucketName = '';
      
      // Try uploading to different potential bucket names
      const potentialBuckets = ['profile-images', 'avatars', 'profiles', 'images', 'public'];
      
      for (const bucket of potentialBuckets) {
        try {
          console.log(`Attempting upload to bucket: ${bucket}`);
          const filePath = `${fileName}`;
          
          uploadResult = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (!uploadResult.error) {
            bucketName = bucket;
            console.log(`Upload successful to bucket: ${bucket}`);
            break;
          }
        } catch (bucketError) {
          console.log(`Failed upload to bucket ${bucket}:`, bucketError);
          // Continue to try next bucket
        }
      }
      
      if (!bucketName || !uploadResult || uploadResult.error) {
        console.error('Failed to upload to any bucket:', uploadResult?.error);
        throw new Error('Could not upload image to storage. Please try again later.');
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Add a cache-busting parameter to the URL to prevent browser caching of the old image
      const cacheBustUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      // Update the user profile with the new image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture_url: cacheBustUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update the UI with the new image URL
      onImageUpdated(cacheBustUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <div 
        className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 cursor-pointer"
        onClick={handleImageClick}
      >
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={userName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#6C0002] text-white text-2xl">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer" onClick={handleImageClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </div>
    </div>
  );
} 