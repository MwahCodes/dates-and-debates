'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNavigation from '@/components/BottomNavigation';

type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_user: {
    id: string;
    name: string;
    profile_picture_url: string | null;
  };
};

export default function ChatPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;

      try {
        const { data, error: matchesError } = await supabase
          .from('matches')
          .select(`
            id,
            user1_id,
            user2_id,
            created_at,
            other_user:users!matches_user2_id_fkey (
              id,
              name,
              profile_picture_url
            )
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (matchesError) throw matchesError;

        // Transform the data to make it easier to work with
        const transformedMatches = data?.map(match => ({
          ...match,
          other_user: match.user1_id === user.id ? match.other_user : {
            id: match.user1_id,
            name: 'Unknown User', // We'll need to fetch this separately
            profile_picture_url: null
          }
        })) || [];

        setMatches(transformedMatches);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Failed to load matches');
      }
    };

    fetchMatches();
  }, [user]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-semibold mb-4">Your Matches</h1>
          
          {matches.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No matches yet. Start swiping to find your match!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map(match => (
                <div
                  key={match.id}
                  className="flex items-center p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                    {match.other_user.profile_picture_url && (
                      <img
                        src={match.other_user.profile_picture_url}
                        alt={match.other_user.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{match.other_user.name}</h3>
                    <p className="text-sm text-gray-500">
                      Matched {new Date(match.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-md">
            <BottomNavigation />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 