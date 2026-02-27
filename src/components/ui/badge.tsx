import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-gray-100 text-gray-900',
        primary:     'bg-green-100 text-green-800',
        secondary:   'bg-gray-100 text-gray-600',
        destructive: 'bg-red-100 text-red-800',
        amber:       'bg-amber-100 text-amber-800',
        blue:        'bg-blue-100 text-blue-800',
        outline:     'border border-gray-300 text-gray-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
