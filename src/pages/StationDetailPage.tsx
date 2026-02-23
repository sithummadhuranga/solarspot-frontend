import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ArrowLeft, CheckCircle, Edit, Star, MapPin,
  Zap, Clock, User, ShieldCheck, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConnectorBadge } from '@/components/stations/ConnectorBadge'
import { AmenityChips } from '@/components/stations/AmenityChips'
import { StationFormModal } from '@/components/stations/StationFormModal'
import { RejectionReasonModal } from '@/components/stations/RejectionReasonModal'
import { useStation, useApproveStation, useRejectStation } from '@/hooks/useStations'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { label: string; variant: 'primary' | 'amber' | 'destructive' | 'secondary' }
> = {
  active:   { label: 'Active',   variant: 'primary' },
  pending:  { label: 'Pending Review', variant: 'amber' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

function makePin() {
  return L.divIcon({
    html: `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'>
      <path d='M14 0C6.268 0 0 6.268 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.268 21.732 0 14 0z' fill='#16a34a'/>
      <circle cx='14' cy='14' r='6' fill='white'/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    className: '',
  })
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-gray-700 font-semibold">{rating.toFixed(1)}</span>
      <span className="text-gray-400 text-sm">({count} reviews)</span>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StationDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { user, isAdmin, isModerator, isOwner } = useAuth()

  const [editOpen,   setEditOpen]   = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [imgIndex,   setImgIndex]   = useState(0)

  const { data, isLoading, error } = useStation(id)
  const approveMutation = useApproveStation()
  const rejectMutation  = useRejectStation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-600">Station not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
      </div>
    )
  }

  const station    = data.data
  const statusCfg  = STATUS_STYLES[station.status] ?? STATUS_STYLES.inactive
  const canEdit    = isAdmin || isOwner(station.submittedBy?._id)
  const canModerate = isModerator && station.status === 'pending'
  const [lng, lat] = station.location?.coordinates ?? [79.8612, 6.9271]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 truncate text-base font-semibold text-gray-900">{station.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          {station.isVerified && (
            <CheckCircle className="h-5 w-5 text-green-600" aria-label="Verified" />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* ── Image carousel ──────────────────────────────────────── */}
        {station.images.length > 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={station.images[imgIndex]}
              alt={`${station.name} – image ${imgIndex + 1}`}
              className="h-64 w-full object-cover"
            />
            {station.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex((i) => (i - 1 + station.images.length) % station.images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                >
                  ‹
                </button>
                <button
                  onClick={() => setImgIndex((i) => (i + 1) % station.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {station.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100">
            <Zap className="h-16 w-16 text-green-300" />
          </div>
        )}

        {/* ── Rating ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <StarRow rating={station.averageRating} count={station.reviewCount} />
          {station.isFeatured && (
            <Badge variant="amber">⭐ Featured</Badge>
          )}
        </div>

        {/* ── Info grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoTile icon={<Zap className="h-4 w-4 text-yellow-500" />} label="Solar capacity">
            {station.solarPanelKw} kWp
          </InfoTile>
          <InfoTile icon={<CheckCircle className="h-4 w-4 text-green-600" />} label="Status">
            {statusCfg.label}
          </InfoTile>
          <InfoTile icon={<Star className="h-4 w-4 text-amber-400" />} label="Reviews">
            {station.reviewCount}
          </InfoTile>
        </div>

        {/* ── Connectors ────────────────────────────────────────────── */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Connectors</h2>
          <div className="flex flex-wrap gap-2">
            {station.connectors.map((c, i) => (
              <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} count={c.count} />
            ))}
          </div>
        </section>

        {/* ── Amenities ─────────────────────────────────────────────── */}
        {station.amenities.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Amenities</h2>
            <AmenityChips amenities={station.amenities} />
          </section>
        )}

        {/* ── Operating hours ────────────────────────────────────────── */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Operating hours
          </h2>
          {station.operatingHours.alwaysOpen ? (
            <Badge variant="primary">Open 24 / 7</Badge>
          ) : station.operatingHours.schedule.length > 0 ? (
            <table className="w-full text-sm border-collapse">
              <tbody>
                {station.operatingHours.schedule.map((row) => (
                  <tr key={row.day} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 font-medium text-gray-700 w-16">{row.day}</td>
                    <td className="py-1.5 text-gray-500">{row.openTime} – {row.closeTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400">No schedule provided</p>
          )}
        </section>

        {/* ── Address + mini map ─────────────────────────────────────── */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Location
          </h2>
          {station.address?.formattedAddress && (
            <p className="mb-3 text-sm text-gray-600">{station.address.formattedAddress}</p>
          )}
          <div className="h-48 overflow-hidden rounded-xl border border-gray-200 pointer-events-none">
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution=""
              />
              <Marker position={[lat, lng]} icon={makePin()} />
            </MapContainer>
          </div>
        </section>

        {/* ── Description ───────────────────────────────────────────── */}
        {station.description && (
          <section>
            <h2 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{station.description}</p>
          </section>
        )}

        {/* ── Submitted by ──────────────────────────────────────────── */}
        <section className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
          {station.submittedBy?.avatar ? (
            <img
              src={station.submittedBy.avatar}
              alt={station.submittedBy.displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <User className="h-5 w-5 text-green-600" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{station.submittedBy?.displayName}</p>
            <p className="text-xs text-gray-400">Submitted {formatDate(station.createdAt)}</p>
          </div>
        </section>

        {/* ── Rejection reason ──────────────────────────────────────── */}
        {station.status === 'rejected' && station.rejectionReason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700 mb-1">Rejection reason</p>
            <p className="text-sm text-red-600">{station.rejectionReason}</p>
          </div>
        )}

        {/* ── Verified by ───────────────────────────────────────────── */}
        {station.isVerified && station.verifiedAt && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Verified on {formatDate(station.verifiedAt)}
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 pt-2">
          {/* Owner / admin edit */}
          {canEdit && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Station
            </Button>
          )}

          {/* Moderator actions */}
          {canModerate && (
            <>
              <Button
                variant="default"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate(station._id)}
              >
                {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
              <Button
                variant="destructive"
                disabled={rejectMutation.isPending}
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
            </>
          )}
        </div>

        {/* Spacer for bottom */}
        <div className="h-8" />
      </div>

      {/* Modals */}
      {canEdit && (
        <StationFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          station={station}
        />
      )}

      <RejectionReasonModal
        open={rejectOpen}
        stationName={station.name}
        isPending={rejectMutation.isPending}
        onClose={() => setRejectOpen(false)}
        onSubmit={(reason) => {
          rejectMutation.mutate(
            { id: station._id, dto: { rejectionReason: reason } },
            { onSuccess: () => setRejectOpen(false) }
          )
        }}
      />

      {/* Silence unused user warning — used indirectly via isOwner/isAdmin */}
      {user && <></>}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoTile({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wide font-medium">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-gray-900">{children}</p>
    </div>
  )
}
