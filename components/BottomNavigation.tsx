'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageCircle, User, Award } from 'lucide-react';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    // Only navigate if we're not already on that page
    if (pathname !== path) {
      router.push(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        <button
          onClick={() => handleNavigation('/home')}
          className={`flex flex-col items-center p-2 w-full h-full active:bg-gray-100 ${
            pathname === '/home' ? 'text-[#6C0002]' : 'text-gray-600'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          onClick={() => handleNavigation('/chat')}
          className={`flex flex-col items-center p-2 w-full h-full active:bg-gray-100 ${
            pathname === '/chat' ? 'text-[#6C0002]' : 'text-gray-600'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs mt-1">Chat</span>
        </button>

        <button
          onClick={() => handleNavigation('/leaderboard')}
          className={`flex flex-col items-center p-2 w-full h-full active:bg-gray-100 ${
            pathname === '/leaderboard' ? 'text-[#6C0002]' : 'text-gray-600'
          }`}
        >
          <Award size={24} />
          <span className="text-xs mt-1">Ratings</span>
        </button>

        <button
          onClick={() => handleNavigation('/profile')}
          className={`flex flex-col items-center p-2 w-full h-full active:bg-gray-100 ${
            pathname === '/profile' ? 'text-[#6C0002]' : 'text-gray-600'
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
} 