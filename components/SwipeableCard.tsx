import { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

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

  const cardStyle = {
    transform: `translateX(${offset}px) rotate(${offset * 0.1}deg)`,
    transition: isDragging ? 'none' : 'transform 0.5s ease-out',
  };

  return (
    <div
      {...handlers}
      className="relative w-full max-w-sm aspect-[4/5] rounded-xl overflow-hidden shadow-lg"
      style={cardStyle}
    >
      <img
        src={imageUrl || '/placeholder-profile.jpg'}
        alt={`${name}'s profile`}
        className="w-full h-full object-cover"
      />
      
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