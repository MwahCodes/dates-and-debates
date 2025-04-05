'use client';

import { useState, useEffect, useRef, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Star } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import RatingDialog from '@/components/RatingDialog';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatPartner {
  id: string;
  name: string;
  profile_picture_url: string | null;
}

interface ChatClientProps {
  chatPartnerId: string;
}

export default function ChatClient({ chatPartnerId }: ChatClientProps): ReactElement {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [partnerMessageCount, setPartnerMessageCount] = useState(0);
  const [showRatingButton, setShowRatingButton] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  // Prompts array
  const prompts = [
    "Do you like Pineapple on pizza?",
    "Do you think the moon landing was faked?",
    "Do you think vaccines are safe?",
    "Who is your favorite sports team?",
    "Cats or dogs?",
  ];

  // Function to fetch messages
  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${chatPartnerId}),and(sender_id.eq.${chatPartnerId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Only update if there are new messages to avoid unnecessary re-renders
      if (
        messagesData &&
        (messages.length !== messagesData.length ||
          (messagesData.length > 0 &&
            messages.length > 0 &&
            messagesData[messagesData.length - 1].id !== messages[messages.length - 1].id))
      ) {
        setMessages(messagesData);
        
        // Count messages from each user
        const userMessages = messagesData.filter(m => m.sender_id === user.id && m.sender_id !== 'system').length;
        const partnerMessages = messagesData.filter(m => m.sender_id === chatPartnerId).length;
        
        setUserMessageCount(userMessages);
        setPartnerMessageCount(partnerMessages);
        
        // Show rating button if 5 or more total messages have been exchanged
        setShowRatingButton(userMessages + partnerMessages >= 5);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Function to check if the sender has sent a message before
  const checkAndShowPrompt = async () => {
    try {
      const { data: existingMessages, error } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', user?.id || '')
        .eq('receiver_id', chatPartnerId)
        .limit(1);

      console.log('Existing messages:', existingMessages);

      if (error) {
        console.error('Error checking messages:', error);
        return;
      }

      // If no messages exist, show a random prompt
      if (!existingMessages || existingMessages.length === 0) {
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        
        // Add the prompt as a shared message bubble
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `prompt-${Date.now()}`, // Unique ID for the prompt
            sender_id: 'system', // Use 'system' or a special ID for shared messages
            receiver_id: user?.id || '',
            content: randomPrompt,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error checking and showing prompt:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      router.push('/login');
      return;
    }


    const fetchChatPartner = async () => {
      try {
        // Check if there's a mutual like
        const { data: swipes, error: swipeError } = await supabase
          .from('swipes')
          .select('*')
          .eq('is_like', true)
          .or(`swiper_id.eq.${user.id},swiped_id.eq.${chatPartnerId}`);

        if (swipeError) throw swipeError;

        const hasMutualLike = swipes?.some(
          (s1) =>
            swipes.some(
              (s2) =>
                ((s1.swiper_id === user.id && s1.swiped_id === chatPartnerId) ||
                  (s1.swiper_id === chatPartnerId && s1.swiped_id === user.id)) &&
                ((s2.swiper_id === user.id && s2.swiped_id === chatPartnerId) ||
                  (s2.swiper_id === chatPartnerId && s2.swiped_id === user.id))
            )
        );

        if (!hasMutualLike) {
          toast.error('You cannot chat with this user');
          router.push('/chat');
          return;
        }

        // Get chat partner details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, profile_picture_url')
          .eq('id', chatPartnerId)
          .single();

        if (userError) throw userError;
        setChatPartner(userData);

        // Initial fetch of messages
        await fetchMessages();

        // Check if the sender has sent a message before and show a prompt if not
        await checkAndShowPrompt();

        // Ensure we scroll to the bottom on initial load
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setError('Failed to load chat');
        toast.error('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatPartner();

    // Set up polling interval when component mounts
    pollingIntervalRef.current = setInterval(fetchMessages, 1000);

    // Mark messages as read when entering the chat
    const markMessagesAsRead = async () => {
      try {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('receiver_id', user.id)
          .eq('sender_id', chatPartnerId)
          .is('read_at', null);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();

    // Clean up function to clear interval when component unmounts
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user?.id, chatPartnerId]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Ensure we scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      // Use a small timeout to ensure the DOM has updated with new messages
      setTimeout(scrollToBottom, 50);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatPartner) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender_id: user?.id,
          receiver_id: chatPartner.id,
          content: newMessage.trim(),
        },
      ]);

      if (error) throw error;
      setNewMessage('');

      // Immediately fetch messages after sending to update the UI faster
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#F5F5F5]">
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => (window.location.href = '/chat')}
        >
          Return to Chats
        </Button>
      </div>
    );
  }

  if (!user || isLoading) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading chat...</div>
      </div>
    );
  }

  if (!chatPartner) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#666666]">Loading chat partner...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F5]">
      {/* Chat Header - Fixed at top */}
      <div className="bg-white border-b border-[#E0E0E0] p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/chat')}
            className="text-[#1A1A1A] hover:text-[#666666] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {chatPartner.profile_picture_url ? (
                <Image
                  src={chatPartner.profile_picture_url}
                  alt={chatPartner.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#6C0002] text-white text-xl">
                  {chatPartner.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="font-medium text-[#1A1A1A]">{chatPartner.name}</h2>
          </div>
        </div>
        
        {/* Rating button - only shown after 5 messages */}
        {showRatingButton && (
          <button
            onClick={async () => {
              // Check if the user has already rated this person
              if (user) {
                const { data: existingRating, error } = await supabase
                  .from('ratings')
                  .select('id')
                  .eq('rater_id', user.id)
                  .eq('rated_id', chatPartnerId)
                  .single();
                
                if (existingRating) {
                  toast.error('No no no naughty, only one rating');
                  return;
                }
                
                // If no existing rating, open the dialog
                setIsRatingDialogOpen(true);
              }
            }}
            className="flex items-center space-x-1 text-[#6C0002] hover:text-[#8C0003] transition-colors"
          >
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium">Rate</span>
          </button>
        )}
      </div>

      {/* Messages - Scrollable area with newest messages at the bottom */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 pb-25">
        <div className="space-y-4 flex flex-col">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === user.id
                    ? 'bg-[#6C0002] text-white'
                    : 'bg-white text-[#1A1A1A]'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {message.sender_id === 'system' && ' (AI Generated)'}
                </p>
              </div>
            </div>
          ))}
          {/* Add invisible element at the end to ensure proper scroll space */}
          <div className="h-10 w-full" />
        </div>
      </div>

      {/* Message Input - Fixed above bottom navbar */}
      <div className="p-4 border-t border-[#E0E0E0] bg-white fixed bottom-14 left-0 right-0 z-20 shadow-sm">
        <div className="flex space-x-2 max-w-lg mx-auto">
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

      {/* Rating Dialog */}
      {isRatingDialogOpen && (
        <RatingDialog
          isOpen={isRatingDialogOpen}
          onClose={() => setIsRatingDialogOpen(false)}
          userId={chatPartnerId}
          userName={chatPartner.name}
        />
      )}
    </div>
  );
}
