'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_user: {
    id: string;
    name: string;
    profile_picture_url: string | null;
  };
}

interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchMatches();
  }, [user, supabase, router]);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch.id);
      subscribeToMessages(selectedMatch.id);
    }
  }, [selectedMatch]);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
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
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const subscribeToMessages = (matchId: string) => {
    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!selectedMatch || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            match_id: selectedMatch.id,
            sender_id: user?.id,
            content: newMessage.trim()
          }
        ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="animate-pulse text-[#666666]">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Matches List */}
      <div className="w-1/3 border-r border-[#E0E0E0] bg-white">
        <div className="p-4 border-b border-[#E0E0E0]">
          <h1 className="text-xl font-semibold text-[#1A1A1A]">Matches</h1>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`p-4 border-b border-[#E0E0E0] cursor-pointer hover:bg-[#F5F5F5] ${
                selectedMatch?.id === match.id ? 'bg-[#F5F5F5]' : ''
              }`}
              onClick={() => setSelectedMatch(match)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={match.other_user.profile_picture_url || '/placeholder-profile.jpg'}
                    alt={match.other_user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-medium text-[#1A1A1A]">{match.other_user.name}</h2>
                  <p className="text-sm text-[#666666]">
                    Matched {new Date(match.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMatch ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[#E0E0E0] bg-white">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={selectedMatch.other_user.profile_picture_url || '/placeholder-profile.jpg'}
                    alt={selectedMatch.other_user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h2 className="font-medium text-[#1A1A1A]">{selectedMatch.other_user.name}</h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === user?.id
                        ? 'bg-[#6C0002] text-white'
                        : 'bg-white text-[#1A1A1A]'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[#E0E0E0] bg-white">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  className="bg-[#6C0002] text-white hover:bg-[#8C0003]"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="text-center text-[20px] leading-relaxed text-[#1A1A1A]">
                  Select a match to start chatting
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-[14px] text-[#666666]">
                  Choose a match from the list to begin your conversation
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 