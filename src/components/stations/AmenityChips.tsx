import {
  Wifi, Coffee, Users, Car, Shield,
  Umbrella, Droplets, Wrench, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Amenity } from '@/types/station.types'

const AMENITY_CONFIG: Record<Amenity, { label: string; Icon: React.FC<{ className?: string }> }> = {
  wifi:        { label: 'Wi-Fi',      Icon: Wifi },
  cafe:        { label: 'Café',       Icon: Coffee },
  restroom:    { label: 'Restroom',   Icon: Users },
  parking:     { label: 'Parking',    Icon: Car },
  security:    { label: 'Security',   Icon: Shield },
  shade:       { label: 'Shade',      Icon: Umbrella },
  water:       { label: 'Water',      Icon: Droplets },
  repair_shop: { label: 'Repair',     Icon: Wrench },
  ev_parking:  { label: 'EV Parking', Icon: Zap },
}

interface AmenityChipsProps {
  amenities: Amenity[]
  /** Show only icons without labels (compact mode) */
  compact?: boolean
  className?: string
}

export function AmenityChips({ amenities, compact = false, className }: AmenityChipsProps) {
  if (amenities.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {amenities.map((key) => {
        const config = AMENITY_CONFIG[key]
        if (!config) return null
        const { Icon } = config
        return (
          <span
            key={key}
            title={config.label}
            className="inline-flex items-center gap-1 rounded-full border border-[#8cc63f]/20 bg-[#8cc63f]/10 px-2.5 py-0.5 text-xs text-[#133c1d]"
          >
            <Icon className="h-3 w-3" />
            {!compact && <span>{config.label}</span>}
          </span>
        )
      })}
    </div>
  )
}

/** Exported so forms can render an amenity picker */
export { AMENITY_CONFIG }
