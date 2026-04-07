import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value:     number
  onChange?: (rating: number) => void
  size?:     'sm' | 'md' | 'lg'
  readonly?: boolean
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function StarRating({ value, onChange, size = 'md', readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const starSize = SIZE_MAP[size]
  const displayValue = hovered || value

  return (
    <div
      className={cn('flex items-center gap-0.5', !readonly && 'cursor-pointer')}
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const filled = starValue <= displayValue
        return (
          <Star
            key={i}
            className={cn(
              starSize,
              'transition-colors',
              filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200',
              !readonly && 'hover:fill-amber-300 hover:text-amber-300',
            )}
            onMouseEnter={() => !readonly && setHovered(starValue)}
            onClick={() => !readonly && onChange?.(starValue)}
          />
        )
      })}
    </div>
  )
}
