import { Link } from 'react-router-dom'
import { MapPin, Star, Zap, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ConnectorBadge } from './ConnectorBadge'
import type { Station, NearbyStation } from '@/types/station.types'

const STATUS_BADGE: Record<
  Station['status'],
  { label: string; variant: 'primary' | 'amber' | 'destructive' | 'secondary' }
> = {
  active:   { label: 'Active',   variant: 'primary' },
  pending:  { label: 'Pending',  variant: 'amber' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  inactive: { label: 'Inactive', variant: 'secondary' },
}

interface StationCardProps {
  station:    Station | NearbyStation
  className?: string
  /** Show Edit/Delete action buttons */
  actions?: React.ReactNode
}

export function StationCard({ station, className, actions }: StationCardProps) {
  const statusCfg  = STATUS_BADGE[station.status]
  const distanceKm = 'distanceKm' in station ? station.distanceKm : undefined
  const city       = station.address?.city ?? station.address?.formattedAddress ?? '—'

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden',
        className
      )}
    >
      {/* Image strip */}
      <div className="h-36 w-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
        {station.images.length > 0 ? (
          <img
            src={station.images[0]}
            alt={station.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Zap className="h-10 w-10 text-green-300" />
          </div>
        )}
      </div>

      {/* Status badge overlay */}
      <div className="absolute right-3 top-3">
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="truncate font-semibold text-gray-900 text-sm">{station.name}</h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{city}</span>
              {distanceKm !== undefined && (
                <span className="shrink-0 text-green-600 font-medium">
                  · {distanceKm.toFixed(1)} km
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {station.isVerified && (
              <CheckCircle className="h-4 w-4 text-green-600" title="Verified" />
            )}
            <span className="flex items-center gap-0.5 text-xs font-medium text-gray-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {station.averageRating > 0
                ? station.averageRating.toFixed(1)
                : '—'}
            </span>
          </div>
        </div>

        {/* Connectors */}
        {station.connectors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {station.connectors.slice(0, 3).map((c, i) => (
              <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} size="sm" />
            ))}
            {station.connectors.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                +{station.connectors.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {station.solarPanelKw} kWp solar · {station.reviewCount} reviews
          </span>
          <Link
            to={`/stations/${station._id}`}
            className="text-xs font-medium text-green-600 hover:text-green-700"
          >
            View →
          </Link>
        </div>

        {actions && <div className="mt-3 border-t pt-3">{actions}</div>}
      </div>
    </div>
  )
}
