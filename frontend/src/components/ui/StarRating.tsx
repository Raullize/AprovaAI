import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  starClassName?: string;
  unfilledColorClass?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  stars,
  maxStars = 3,
  size = 'sm',
  className = '',
  starClassName = '',
  unfilledColorClass = 'text-slate-300 fill-slate-300',
}) => {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  };

  const starsArray = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div className={cn('flex gap-0.5', className)}>
      {starsArray.map((s) => (
        <Star
          key={s}
          className={cn(
            sizeClasses[size],
            'transition-all',
            s <= stars ? 'text-amber-400 fill-amber-400' : unfilledColorClass,
            starClassName,
          )}
        />
      ))}
    </div>
  );
};

export default StarRating;
