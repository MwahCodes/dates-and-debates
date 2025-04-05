'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { Crown, Star } from 'lucide-react';

interface UserRating {
  id: string;
  name: string;
  profile_picture_url: string | null;
  average_rating: number;
  rating_count: number;
  total_rating: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, supabase, isLoading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        
        // Use the new function to get leaderboard data
        const { data, error } = await supabase
          .rpc('get_leaderboard_data');

        if (error) throw error;
        
        // Filter out users with no ratings and convert numeric types
        const usersWithRatings = data
          .filter(user => user.rating_count > 0)
          .map(user => ({
            ...user,
            average_rating: parseFloat(user.average_rating),
            rating_count: parseInt(user.rating_count),
            total_rating: parseInt(user.total_rating)
          }));
        
        setLeaderboard(usersWithRatings);
        
        // Find current user's rank
        const currentUserIndex = usersWithRatings.findIndex(u => u.id === user.id);
        setUserRank(currentUserIndex !== -1 ? currentUserIndex + 1 : null);
        
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, supabase, router, authLoading]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading || authLoading) {
    return (
      <div className="h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="max-w-md mx-auto px-4 w-full flex-1 flex flex-col">
        <h1 className="text-4xl font-bold text-center my-6">Rating Leaderboard</h1>
        
        {/* Top 3 Leaders Card */}
        {leaderboard.length > 0 && (
          <div className="bg-amber-50 rounded-xl shadow-sm overflow-hidden border border-amber-100 mb-6 pt-10 px-4 pb-4 relative">
            {/* Crown icon over first place */}
            <div className="absolute" style={{ top: '-5px', left: '50%', transform: 'translateX(-50%)' }}>
              <Crown className="w-14 h-14 text-amber-400" />
            </div>
            
            <div className="flex justify-between items-end mt-2">
              {/* Second place */}
              {leaderboard.length > 1 ? (
                <div className="w-1/3 flex flex-col items-center">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blue-400">
                    {leaderboard[1].profile_picture_url ? (
                      <Image
                        src={leaderboard[1].profile_picture_url}
                        alt={leaderboard[1].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xl">
                        {getInitials(leaderboard[1].name)}
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold mt-1">2</div>
                  <div className="text-base font-medium truncate text-center w-full px-1">
                    {leaderboard[1].name}
                  </div>
                  <div className="text-blue-500 font-bold text-xl">
                    {leaderboard[1].total_rating}
                  </div>
                </div>
              ) : <div className="w-1/3" />}
              
              {/* First place */}
              <div className="w-1/3 flex flex-col items-center z-10">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400">
                  {leaderboard[0].profile_picture_url ? (
                    <Image
                      src={leaderboard[0].profile_picture_url}
                      alt={leaderboard[0].name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#6C0002] text-white text-3xl">
                      {getInitials(leaderboard[0].name)}
                    </div>
                  )}
                </div>
                <div className="text-4xl font-bold mt-1">1</div>
                <div className="text-lg font-medium truncate text-center w-full px-1">
                  {leaderboard[0].name}
                </div>
                <div className="text-amber-500 font-bold text-2xl">
                  {leaderboard[0].total_rating}
                </div>
              </div>
              
              {/* Third place */}
              {leaderboard.length > 2 ? (
                <div className="w-1/3 flex flex-col items-center">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-green-400">
                    {leaderboard[2].profile_picture_url ? (
                      <Image
                        src={leaderboard[2].profile_picture_url}
                        alt={leaderboard[2].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-500 text-white text-xl">
                        {getInitials(leaderboard[2].name)}
                      </div>
                    )}
                  </div>
                  <div className="text-3xl font-bold mt-1">3</div>
                  <div className="text-base font-medium truncate text-center w-full px-1">
                    {leaderboard[2].name}
                  </div>
                  <div className="text-green-500 font-bold text-xl">
                    {leaderboard[2].total_rating}
                  </div>
                </div>
              ) : <div className="w-1/3" />}
            </div>
          </div>
        )}
        
        {/* Rest of the leaderboard */}
        {leaderboard.length > 3 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#E0E0E0] divide-y divide-[#E0E0E0] flex-1">
            {/* Skip the top 3 since they're already shown */}
            {leaderboard.slice(3, 10).map((userData, index) => (
              <div 
                key={userData.id} 
                className={`flex items-center py-3 px-4 ${userData.id === user?.id ? 'bg-red-50' : ''}`}
              >
                <div className="w-8 text-2xl font-bold mr-2 text-center text-gray-500">
                  {index + 4}
                </div>
                <div className="relative w-12 h-12 rounded-full overflow-hidden mx-2">
                  {userData.profile_picture_url ? (
                    <Image
                      src={userData.profile_picture_url}
                      alt={userData.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#6C0002] text-white">
                      {getInitials(userData.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 ml-1 overflow-hidden">
                  <div className="font-semibold truncate">{userData.name}</div>
                </div>
                <div className="text-xl font-bold ml-2">{userData.total_rating}</div>
              </div>
            ))}
            
            {/* More ellipsis indicator if there are more than 10 entries */}
            {leaderboard.length > 10 && (
              <div className="py-3 text-center text-gray-500">
                <div className="flex justify-center space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            )}
            
            {/* Current user if not in top 10 */}
            {userRank && userRank > 10 && (
              <div className="flex items-center py-3 px-4 bg-red-50">
                <div className="w-8 text-2xl font-bold mr-2 text-center text-gray-500">{userRank}</div>
                <div className="relative w-12 h-12 rounded-full overflow-hidden mx-2">
                  {user?.profile_picture_url ? (
                    <Image
                      src={user.profile_picture_url}
                      alt={user.name || 'You'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#6C0002] text-white">
                      {user?.name ? getInitials(user.name) : 'Y'}
                    </div>
                  )}
                </div>
                <div className="flex-1 ml-1">
                  <div className="font-semibold">You</div>
                </div>
                <div className="text-xl font-bold ml-2">{leaderboard.find(u => u.id === user?.id)?.total_rating || 0}</div>
              </div>
            )}
          </div>
        )}
        
        {/* Empty state */}
        {leaderboard.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#E0E0E0] p-8 text-center text-gray-500 flex-1 flex flex-col justify-center">
            <Star className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No ratings yet</p>
            <p className="text-sm mt-1">Be the first to get rated!</p>
          </div>
        )}
      </div>
    </div>
  );
} 