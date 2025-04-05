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

  const handlers = useSwipeable({
    onSwiping: (event) => {
      setOffset(event.deltaX);
      setIsDragging(true);
    },
    onSwipedLeft: () => {
      if (Math.abs(offset) > 100) {
        onSwipeLeft();
      } else {
        setOffset(0);
      }
      setIsDragging(false);
    },
    onSwipedRight: () => {
      if (Math.abs(offset) > 100) {
        onSwipeRight();
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

  return (
    <div
      {...handlers}
      className="relative w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 ease-out"
      style={{
        transform: `translateX(${offset}px) rotate(${offset * 0.1}deg)`,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
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

      {/* Swipe indicators */}
      <div
        className={`absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full transform transition-opacity ${
          offset < -50 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        NOPE
      </div>
      <div
        className={`absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full transform transition-opacity ${
          offset > 50 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        LIKE
      </div>
    </div>
  );
} 