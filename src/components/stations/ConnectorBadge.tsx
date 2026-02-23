import { Zap, PlugZap, Cpu, BatteryCharging, Star, Power } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConnectorType } from '@/types/station.types'

const CONNECTOR_CONFIG: Record<
  ConnectorType,
  { label: string; Icon: React.FC<{ className?: string }> }
> = {
  'USB-C':       { label: 'USB-C',      Icon: Zap },
  'Type-2':      { label: 'Type 2',     Icon: PlugZap },
  'CCS':         { label: 'CCS',        Icon: Cpu },
  'CHAdeMO':     { label: 'CHAdeMO',    Icon: BatteryCharging },
  'Tesla-NACS':  { label: 'Tesla NACS', Icon: Star },
  'AC-Socket':   { label: 'AC Socket',  Icon: Power },
}

interface ConnectorBadgeProps {
  type:     ConnectorType
  powerKw?: number
  count?:   number
  size?:    'sm' | 'md'
  className?: string
}

export function ConnectorBadge({
  type,
  powerKw,
  count,
  size = 'md',
  className,
}: ConnectorBadgeProps) {
  const config = CONNECTOR_CONFIG[type]
  const { Icon } = config

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 text-green-800 font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      <span>{config.label}</span>
      {powerKw !== undefined && <span className="opacity-70">· {powerKw} kW</span>}
      {count !== undefined && count > 1 && (
        <span className="opacity-70">× {count}</span>
      )}
    </span>
  )
}
