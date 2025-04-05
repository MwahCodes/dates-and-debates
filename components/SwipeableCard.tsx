import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  profile_picture_url: string | null;
}

interface SwipeableCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeableCard({ user, onSwipe }: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setIsLeaving(true);
    const targetOffset = direction === 'left' ? -window.innerWidth : window.innerWidth;
    setOffset(targetOffset);
    
    // Wait for animation to complete before calling the handler
    setTimeout(() => {
      onSwipe(direction);
      // Reset for next card
      setOffset(0);
      setIsLeaving(false);
    }, 300);
  };

  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (!isLeaving) {
        setOffset(event.deltaX);
        setIsDragging(true);
      }
    },
    onSwipedLeft: () => {
      if (Math.abs(offset) > 100) {
        handleSwipe('left');
      } else {
        setOffset(0);
      }
      setIsDragging(false);
    },
    onSwipedRight: () => {
      if (Math.abs(offset) > 100) {
        handleSwipe('right');
      } else {
        setOffset(0);
      }
      setIsDragging(false);
    },
    onTouchEndOrOnMouseUp: () => {
      if (Math.abs(offset) <= 100) {
        setOffset(0);
      }
      setIsDragging(false);
    },
    trackMouse: true,
    trackTouch: true,
  });

  const rotation = offset * 0.1;
  const opacity = Math.min(Math.abs(offset) / 100, 1);

  return (
    <div
      {...handlers}
      className="relative w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden shadow-lg touch-none select-none"
      style={{
        transform: `translateX(${offset}px) rotate(${rotation}deg)`,
        transition: isDragging || isLeaving ? 'transform 0.3s ease-out' : 'transform 0.5s ease-out',
      }}
    >
      <div className="relative w-full h-full">
        {user.profile_picture_url ? (
          <Image
            src={user.profile_picture_url}
            alt={`${user.name}'s profile`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[#6C0002] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-4">{getInitials(user.name)}</div>
              <div className="text-2xl text-white opacity-90">{user.name}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Gradient overlay - only show with profile picture */}
      {user.profile_picture_url && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
      )}
      
      {/* Name - only show with profile picture */}
      {user.profile_picture_url && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
        </div>
      )}

      {/* Swipe indicators */}
      <div
        className={`absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full transition-opacity duration-200`}
        style={{ opacity: offset < 0 ? opacity : 0 }}
      >
        NOPE
      </div>
      <div
        className={`absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full transition-opacity duration-200`}
        style={{ opacity: offset > 0 ? opacity : 0 }}
      >
        LIKE
      </div>
    </div>
  );
} 