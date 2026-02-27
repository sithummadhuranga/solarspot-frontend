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
        'group relative flex flex-col rounded-[20px] bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]',
        'hover:shadow-[0_20px_55px_rgba(26,107,60,0.14)] hover:-translate-y-2 transition-all duration-300 overflow-hidden',
        className
      )}
    >
      {/* Clickable image area */}
      <Link to={`/stations/${station._id}`} className="relative block h-48 w-full overflow-hidden bg-gradient-to-br from-[#f5faf0] to-[#dcfce7] flex-shrink-0">
        {station.images.length > 0 ? (
          <img
            src={station.images[0]}
            alt={station.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#bbf7d0]">
              <Zap className="h-8 w-8 text-[#1a6b3c]" />
            </div>
          </div>
        )}

        {station.isFeatured && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-500/95 backdrop-blur-md px-3 py-1.5 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-white text-white" />
            <span className="text-xs font-bold text-white tracking-wide">FEATURED</span>
          </div>
        )}
        {!station.isFeatured && station.solarPanelKw > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#1a1a1a]/80 backdrop-blur-md px-3 py-1.5 shadow-sm">
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white tracking-wide">{station.solarPanelKw} kW</span>
          </div>
        )}

        <div className={cn(
          'absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-sm tracking-wide',
          cfg.bg
        )}>
          <span className={cn('h-2 w-2 rounded-full shrink-0', cfg.dot)} />
          {cfg.label}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <Link to={`/stations/${station._id}`} className="block">
              <h3 className="truncate font-extrabold text-[#133c1d] text-lg leading-tight hover:text-[#1a6b3c] transition-colors font-sg">
                {station.name}
              </h3>
            </Link>
            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500 font-medium">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{city}</span>
              {distanceKm !== undefined && (
                <span className="shrink-0 text-[#1a6b3c] font-bold ml-1">· {distanceKm.toFixed(1)} km</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5',
                    i < Math.round(station.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-400">
              {station.averageRating > 0
                ? `${station.averageRating.toFixed(1)} · ${station.reviewCount} reviews`
                : 'No reviews yet'}
            </span>
          </div>
        </div>

        {station.connectors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {station.connectors.slice(0, 3).map((c, i) => (
              <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} size="sm" />
            ))}
            {station.connectors.length > 3 && (
              <span className="inline-flex items-center rounded-lg border border-[#8cc63f] bg-[#f5faf0] px-2.5 py-1 text-xs font-bold text-[#1a6b3c]">
                +{station.connectors.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
            {station.isVerified && (
              <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                <CheckCircle className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            {station.amenities.length > 0 && (
              <span className="bg-gray-50 px-2 py-1 rounded-md">{station.amenities.length} amenities</span>
            )}
          </div>
          <Link
            to={`/stations/${station._id}`}
            className="text-sm font-bold text-[#1a6b3c] hover:text-[#133c1d] transition-colors flex items-center gap-1"
          >
            View details <span className="text-lg leading-none">›</span>
          </Link>
        </div>

        {actions && <div className="mt-4 border-t border-gray-100 pt-4">{actions}</div>}
      </div>
    </div>
  )
}
