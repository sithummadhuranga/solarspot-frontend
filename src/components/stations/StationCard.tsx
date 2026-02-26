import { Link } from 'react-router-dom'
import { MapPin, Star, Zap, Sun, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConnectorBadge } from './ConnectorBadge'
import type { Station, NearbyStation } from '@/types/station.types'

const STATUS_CFG: Record<
  Station['status'],
  { label: string; bg: string; dot: string }
> = {
  active:   { label: 'Active',   bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  pending:  { label: 'Pending',  bg: 'bg-amber-50 text-amber-700 border border-amber-200',       dot: 'bg-amber-500'   },
  rejected: { label: 'Rejected', bg: 'bg-red-50 text-red-700 border border-red-200',             dot: 'bg-red-500'     },
  inactive: { label: 'Inactive', bg: 'bg-gray-50 text-gray-600 border border-gray-200',          dot: 'bg-gray-400'    },
}

interface StationCardProps {
  station:    Station | NearbyStation
  className?: string
  actions?:   React.ReactNode
}

export function StationCard({ station, className, actions }: StationCardProps) {
  const cfg        = STATUS_CFG[station.status]
  const distanceKm = 'distanceKm' in station ? station.distanceKm : undefined
  const city       = station.address?.city ?? station.address?.district ?? station.address?.formattedAddress ?? '—'

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm',
        'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden',
        className
      )}
    >
      {/* Clickable image area */}
      <Link to={`/stations/${station._id}`} className="relative block h-44 w-full overflow-hidden bg-gradient-to-br from-solar-green-50 via-emerald-50 to-teal-50 flex-shrink-0">
        {station.images.length > 0 ? (
          <img
            src={station.images[0]}
            alt={station.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-solar-green-100">
              <Zap className="h-7 w-7 text-solar-green-600" />
            </div>
          </div>
        )}

        {station.solarPanelKw > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1">
            <Sun className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-semibold text-white">{station.solarPanelKw} kW</span>
          </div>
        )}

        <div className={cn(
          'absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm',
          cfg.bg
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
          {cfg.label}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link to={`/stations/${station._id}`} className="block">
              <h3 className="truncate font-semibold text-gray-900 text-[0.95rem] leading-tight hover:text-solar-green-600 transition-colors">
                {station.name}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">{city}</span>
              {distanceKm !== undefined && (
                <span className="shrink-0 text-solar-green-600 font-semibold ml-1">· {distanceKm.toFixed(1)} km</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < Math.round(station.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {station.averageRating > 0
                ? `${station.averageRating.toFixed(1)} · ${station.reviewCount} reviews`
                : 'No reviews yet'}
            </span>
          </div>
        </div>

        {station.connectors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {station.connectors.slice(0, 3).map((c, i) => (
              <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} size="sm" />
            ))}
            {station.connectors.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                +{station.connectors.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {station.isVerified && (
              <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                <CheckCircle className="h-3 w-3" /> Verified
              </span>
            )}
            {station.amenities.length > 0 && (
              <span>{station.amenities.length} amenities</span>
            )}
          </div>
          <Link
            to={`/stations/${station._id}`}
            className="text-xs font-semibold text-solar-green-600 hover:text-solar-green-700 transition-colors"
          >
            View details →
          </Link>
        </div>

        {actions && <div className="mt-3 border-t border-gray-100 pt-3">{actions}</div>}
      </div>
    </div>
  )
}
