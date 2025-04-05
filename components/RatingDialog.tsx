'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function RatingDialog({ 
  isOpen, 
  onClose, 
  userId, 
  userName 
}: RatingDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, supabase } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to rate');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if the user has already rated this person
      const { data: existingRating, error: checkError } = await supabase
        .from('ratings')
        .select('id')
        .eq('rater_id', user.id)
        .eq('rated_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If rating exists, update it, otherwise insert a new one
      let error;
      if (existingRating) {
        const { error: updateError } = await supabase
          .from('ratings')
          .update({ 
            score: rating,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);
        
        error = updateError;
        
      } else {
        const { error: insertError } = await supabase
          .from('ratings')
          .insert({
            rater_id: user.id,
            rated_id: userId,
            score: rating
          });
        
        error = insertError;
      }

      if (error) throw error;

      toast.success('Rating submitted successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Rate {userName}</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            How would you rate your conversation with {userName}?
          </p>

          <div className="flex items-center justify-center space-x-2 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    (hoveredRating ? value <= hoveredRating : value <= rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div className="text-lg font-semibold mb-6">
            {rating > 0 ? `${rating} / 10` : 'Select a rating'}
          </div>

          <div className="flex space-x-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#6C0002] text-white hover:bg-[#8C0003]"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 