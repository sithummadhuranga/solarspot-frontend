import { Link } from 'react-router-dom'
import { MapPin, Star, Zap, Sun, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConnectorBadge } from './ConnectorBadge'
import type { Station, NearbyStation } from '@/types/station.types'

const STATUS_CFG: Record<
  Station['status'],
  { label: string; bg: string; dot: string }
> = {
  active:   { label: 'Active',   bg: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/60', dot: 'bg-emerald-500' },
  pending:  { label: 'Pending',  bg: 'bg-amber-50/80 text-amber-700 border border-amber-200/60',       dot: 'bg-amber-500'   },
  rejected: { label: 'Rejected', bg: 'bg-red-50/80 text-red-700 border border-red-200/60',             dot: 'bg-red-500'     },
  inactive: { label: 'Inactive', bg: 'bg-gray-50/80 text-gray-600 border border-gray-200/60',          dot: 'bg-gray-400'    },
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
        'group relative flex flex-col rounded-2xl bg-white border border-gray-100/80',
        'shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(26,107,60,0.12)]',
        'hover:-translate-y-1.5 transition-all duration-300 overflow-hidden',
        className
      )}
    >
      {/* Image */}
      <Link to={`/stations/${station._id}`} className="relative block h-44 w-full overflow-hidden bg-gradient-to-br from-[#f5faf0] to-[#dcfce7] flex-shrink-0">
        {station.images.length > 0 ? (
          <img
            src={station.images[0]}
            alt={station.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#bbf7d0]/60">
              <Zap className="h-7 w-7 text-[#1a6b3c]" />
            </div>
          </div>
        )}

        {/* Subtle bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

        {station.isFeatured && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 shadow-sm">
            <Star className="h-3 w-3 fill-white text-white" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Featured</span>
          </div>
        )}
        {!station.isFeatured && station.solarPanelKw > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 shadow-sm">
            <Sun className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] font-bold text-white">{station.solarPanelKw} kW Solar</span>
          </div>
        )}

        <div className={cn(
          'absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md shadow-sm',
          cfg.bg
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
          {cfg.label}
        </div>

        {/* Rating overlay on image bottom-left */}
        {station.averageRating > 0 && (
          <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-white">{station.averageRating.toFixed(1)}</span>
            <span className="text-[10px] text-white/60">({station.reviewCount})</span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        {/* Title + location */}
        <Link to={`/stations/${station._id}`} className="block mb-2">
          <h3 className="truncate font-sg font-extrabold text-[#133c1d] text-[1.05rem] leading-snug group-hover:text-[#1a6b3c] transition-colors">
            {station.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 text-[0.8rem] text-gray-500 font-medium mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{city}</span>
          {distanceKm !== undefined && (
            <span className="shrink-0 text-[#1a6b3c] font-bold ml-auto text-xs">{distanceKm.toFixed(1)} km</span>
          )}
        </div>

        {/* Description snippet */}
        {station.description && (
          <p className="text-[0.78rem] leading-relaxed text-gray-400 line-clamp-2 mb-3">{station.description}</p>
        )}

        {/* Connectors */}
        {station.connectors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {station.connectors.slice(0, 3).map((c, i) => (
              <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} size="sm" />
            ))}
            {station.connectors.length > 3 && (
              <span className="inline-flex items-center rounded-lg border border-[#8cc63f]/40 bg-[#f5faf0] px-2 py-0.5 text-[11px] font-bold text-[#1a6b3c]">
                +{station.connectors.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100/80">
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
            {station.isVerified && (
              <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle className="h-3 w-3" /> Verified
              </span>
            )}
            {station.amenities.length > 0 && (
              <span className="bg-gray-50 px-2 py-0.5 rounded-md">{station.amenities.length} amenities</span>
            )}
          </div>
          <Link
            to={`/stations/${station._id}`}
            className="text-[0.8rem] font-bold text-[#1a6b3c] hover:text-[#133c1d] transition-colors flex items-center gap-1 group/link"
          >
            Details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>

        {actions && <div className="mt-3 border-t border-gray-100/80 pt-3">{actions}</div>}
      </div>
    </div>
  )
}
