import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';

interface SwipeableCardProps {
  name: string;
  imageUrl: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeableCard({ name, imageUrl, onSwipeLeft, onSwipeRight }: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    setIsLeaving(true);
    const targetOffset = direction === 'left' ? -window.innerWidth : window.innerWidth;
    setOffset(targetOffset);
    
    // Wait for animation to complete before calling the handler
    setTimeout(() => {
      direction === 'left' ? onSwipeLeft() : onSwipeRight();
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
        <Image
          src={imageUrl || '/placeholder-profile.jpg'}
          alt={`${name}'s profile`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
      
      {/* Name */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h2 className="text-2xl font-semibold text-white">{name}</h2>
      </div>

      {/* Swipe indicators - now on opposite sides */}
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