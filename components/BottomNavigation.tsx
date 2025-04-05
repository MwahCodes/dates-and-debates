import { useRouter, usePathname } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-center">
      <div className="w-full max-w-md h-16 flex items-center justify-around">
        <button
          onClick={() => router.push('/home')}
          className={`flex flex-col items-center justify-center w-1/3 ${
            pathname === '/home' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <HomeIcon />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button
          onClick={() => router.push('/chat')}
          className={`flex flex-col items-center justify-center w-1/3 ${
            pathname === '/chat' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <ChatIcon />
          <span className="text-xs mt-1">Chat</span>
        </button>

        <button
          onClick={() => router.push('/profile')}
          className={`flex flex-col items-center justify-center w-1/3 ${
            pathname === '/profile' ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>Me</AvatarFallback>
          </Avatar>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
} 