'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface ChatPartner {
  id: string;
  name: string;
  profile_picture_url: string | null;
  last_message?: {
    content: string;
    created_at: string;
    is_sender: boolean;
  };
}

export default function ChatPage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchChatPartners = async () => {
      try {
        setIsLoading(true);
        
        // Get all mutual likes (matches) from swipes
        const { data: matches, error: matchError } = await supabase
          .from('swipes')
          .select('swiper_id, swiped_id')
          .eq('is_like', true)
          .or(`swiper_id.eq.${user.id},swiped_id.eq.${user.id}`);

        if (matchError) throw matchError;

        // Get unique user IDs who have mutually liked each other
        const matchedUserIds = new Set<string>();
        matches?.forEach(match => {
          const otherId = match.swiper_id === user.id ? match.swiped_id : match.swiper_id;
          // Check if there's a mutual like
          const hasMutualLike = matches.some(m => 
            (m.swiper_id === otherId && m.swiped_id === user.id) ||
            (m.swiped_id === otherId && m.swiper_id === user.id)
          );
          if (hasMutualLike) {
            matchedUserIds.add(otherId);
          }
        });

        if (matchedUserIds.size === 0) {
          setChatPartners([]);
          return;
        }

        // Get user details and last message for each match
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id, name, profile_picture_url')
          .in('id', Array.from(matchedUserIds));

        if (userError) throw userError;

        // Get last message for each chat partner
        const chatPartnersWithMessages = await Promise.all(
          users.map(async (partner) => {
            const { data: messages } = await supabase
              .from('messages')
              .select('*')
              .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
              .or(`sender_id.eq.${partner.id},receiver_id.eq.${partner.id}`)
              .order('created_at', { ascending: false })
              .limit(1);

            const lastMessage = messages?.[0];
            
            return {
              ...partner,
              last_message: lastMessage ? {
                content: lastMessage.content,
                created_at: lastMessage.created_at,
                is_sender: lastMessage.sender_id === user.id
              } : undefined
            };
          })
        );

        setChatPartners(chatPartnersWithMessages);
      } catch (error) {
        console.error('Error fetching chat partners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatPartners();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
      }, () => {
        fetchChatPartners(); // Refresh the chat list when new messages arrive
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user, supabase, router]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading chats...</div>
      </div>
    );
  }

  if (chatPartners.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F5] flex items-center justify-center p-4">
        <Card className="p-6 text-center max-w-sm w-full">
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-[#666666]">
            When you&apos;ll be able to chat with them here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F5F5F5] overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">Messages</h1>
        <div className="space-y-4">
          {chatPartners.map((partner) => (
            <Card
              key={partner.id}
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => router.push(`/chat/${partner.id}`)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {partner.profile_picture_url ? (
                    <Image
                      src={partner.profile_picture_url}
                      alt={partner.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#6C0002] text-white text-xl">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold truncate">{partner.name}</h3>
                    {partner.last_message && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(partner.last_message.created_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {partner.last_message && (
                    <p className="text-gray-600 truncate">
                      {partner.last_message.is_sender ? "You: " : ""}{partner.last_message.content}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 