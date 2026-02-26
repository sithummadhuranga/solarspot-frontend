import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ChevronLeft, Star, MapPin, Zap, Sun, Clock, CheckCircle,
  Shield, User, Calendar, Loader2, AlertTriangle, Edit2,
  MessageSquare, CloudSun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/shared/Navbar'
import { ConnectorBadge } from '@/components/stations/ConnectorBadge'
import { RejectionReasonModal } from '@/components/stations/RejectionReasonModal'
import { useStation, useApproveStation, useRejectStation } from '@/hooks/useStations'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { Amenity } from '@/types/station.types'

const AMENITY_INFO: Record<Amenity, { label: string; emoji: string }> = {
  wifi:        { label: 'Wi-Fi',       emoji: '📶' },
  cafe:        { label: 'Café',        emoji: '☕' },
  restroom:    { label: 'Restroom',    emoji: '🚿' },
  parking:     { label: 'Parking',     emoji: '🅿️' },
  security:    { label: 'Security',    emoji: '🛡️' },
  shade:       { label: 'Shade',       emoji: '⛱️' },
  water:       { label: 'Water',       emoji: '💧' },
  repair_shop: { label: 'Repair Shop', emoji: '🔧' },
  ev_parking:  { label: 'EV Parking',  emoji: '🚗' },
}

const STATUS_CFG = {
  active:   { label: 'Active',   bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  pending:  { label: 'Pending',  bg: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500'   },
  rejected: { label: 'Rejected', bg: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500'     },
  inactive: { label: 'Inactive', bg: 'bg-gray-50 text-gray-600 border-gray-200',          dot: 'bg-gray-400'    },
}

const STATION_PIN = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24S32 27 32 16C32 7.163 24.837 0 16 0z" fill="#1a6b3c" opacity="0.9"/>
    <circle cx="16" cy="16" r="8" fill="white"/>
    <path d="M19 13h-2V11h-2v2h-2v2h2v6h2v-6h2v-2z" fill="#1a6b3c"/>
  </svg>`,
  iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40], className: '',
})

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-solar-green-50">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export default function StationDetailPage() {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const [imgIndex, setImgIndex]         = useState(0)
  const [rejectOpen, setRejectOpen]     = useState(false)
  const [approveConf, setApproveConf]   = useState(false)

  const { data, isLoading, error } = useStation(id)
  const approveMutation            = useApproveStation()
  const rejectMutation             = useRejectStation()

  const station  = data?.data
  const isMod    = user?.role === 'moderator' || user?.role === 'admin'
  const isOwner  = user?._id === station?.submittedBy?._id

  function handleApprove() {
    if (!station) return
    approveMutation.mutate(station._id, { onSuccess: () => setApproveConf(false) })
  }

  function handleReject(reason: string) {
    if (!station) return
    rejectMutation.mutate({ id: station._id, dto: { rejectionReason: reason } }, {
      onSuccess: () => setRejectOpen(false),
    })
  }

  // ── Loading & Error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-solar-green-500 mx-auto" />
            <p className="text-sm text-gray-500">Loading station…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Station not found</h2>
            <p className="text-sm text-gray-500">This station may have been removed or is unavailable.</p>
            <Button variant="outline" onClick={() => navigate('/stations')}>
              <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to Stations
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const status = STATUS_CFG[station.status]
  const coords = station.location?.coordinates  // [lng, lat]
  const hasMap = coords && coords.length === 2

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-solar-green-800 via-solar-green-700 to-solar-green-600 sm:h-80 lg:h-96">
        {station.images.length > 0 && (
          <>
            <img
              src={station.images[imgIndex]}
              alt={station.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {/* Image dots */}
            {station.images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {station.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      i === imgIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                    )}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Top nav */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-xl bg-black/30 backdrop-blur-sm px-3 py-2 text-sm font-medium text-white hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm',
            status.bg
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
            {status.label}
          </div>
        </div>

        {/* Station name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl drop-shadow-sm">
                  {station.name}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {station.address?.city ?? station.address?.district ?? station.address?.formattedAddress ?? 'Location not set'}
                  </span>
                  {station.isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold text-white">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {station.isFeatured && (
                    <span className="rounded-full bg-amber-500/90 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold text-white">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="hidden sm:flex flex-col items-end shrink-0">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i}
                      className={cn('h-5 w-5', i < Math.round(station.averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-white/20 text-white/20'
                      )}
                    />
                  ))}
                </div>
                <p className="mt-0.5 text-xs text-white/70">
                  {station.averageRating > 0
                    ? `${station.averageRating.toFixed(1)} · ${station.reviewCount} reviews`
                    : 'No reviews yet'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Left / Main column  ───────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Quick stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={<Star className="h-5 w-5 text-amber-500" />}
                label="Rating"
                value={station.averageRating > 0 ? `${station.averageRating.toFixed(1)} / 5` : '—'}
                sub={station.reviewCount > 0 ? `${station.reviewCount} reviews` : 'No reviews'}
              />
              <StatCard
                icon={<Sun className="h-5 w-5 text-solar-green-600" />}
                label="Solar"
                value={station.solarPanelKw > 0 ? `${station.solarPanelKw} kWp` : '—'}
                sub="Installed panels"
              />
              <StatCard
                icon={<Zap className="h-5 w-5 text-solar-green-600" />}
                label="Connectors"
                value={`${station.connectors.length} type${station.connectors.length !== 1 ? 's' : ''}`}
                sub={`${station.connectors.reduce((a, c) => a + c.count, 0)} total ports`}
              />
              <StatCard
                icon={<MapPin className="h-5 w-5 text-solar-green-600" />}
                label="Amenities"
                value={`${station.amenities.length}`}
                sub="Available"
              />
            </div>

            {/* Description */}
            {station.description && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  About this station
                </h2>
                <p className="text-sm leading-relaxed text-gray-700">{station.description}</p>
              </div>
            )}

            {/* Connectors */}
            {station.connectors.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Charging Connectors
                </h2>
                <div className="divide-y divide-gray-50">
                  {station.connectors.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-solar-green-50">
                          <Zap className="h-4 w-4 text-solar-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.type}</p>
                          <p className="text-xs text-gray-500">{c.powerKw} kW per port</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{c.count}</p>
                        <p className="text-xs text-gray-400">port{c.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {station.connectors.map((c, i) => (
                    <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} />
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {station.amenities.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Amenities
                </h2>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {station.amenities.map((a) => {
                    const info = AMENITY_INFO[a]
                    return (
                      <div key={a} className="flex flex-col items-center gap-1.5 rounded-xl border border-solar-green-100 bg-solar-green-50 px-3 py-3 text-center">
                        <span className="text-2xl">{info.emoji}</span>
                        <span className="text-xs font-medium text-solar-green-800">{info.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Operating Hours */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <Clock className="h-4 w-4" /> Operating Hours
              </h2>
              {station.operatingHours?.alwaysOpen ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-sm font-semibold text-emerald-700">Open 24 / 7 — Always available</p>
                </div>
              ) : station.operatingHours?.schedule && station.operatingHours.schedule.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {station.operatingHours.schedule.map((s) => (
                    <div key={s.day} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <span className="w-12 text-sm font-semibold text-gray-700">{s.day}</span>
                      <span className="text-sm text-gray-500">{s.openTime} – {s.closeTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Hours not specified</p>
              )}
            </div>

            {/* ── Placeholder: Reviews (Member 2) ──────────────────────── */}
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-500">Reviews & Ratings</p>
              <p className="text-xs text-gray-400 mt-1">Member 2 — Reviews section will appear here</p>
            </div>

            {/* ── Placeholder: Weather (Member 3) ─────────────────────── */}
            <div className="rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/50 p-6 text-center">
              <CloudSun className="mx-auto h-8 w-8 text-blue-300 mb-2" />
              <p className="text-sm font-medium text-blue-500">Weather & Best Charging Time</p>
              <p className="text-xs text-blue-400 mt-1">Member 3 — Weather widget will appear here</p>
            </div>
          </div>

          {/* ── Right / Sidebar ────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Action buttons */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
              {/* Edit own station */}
              {isOwner && station.status !== 'active' && (
                <Link to={`/my-stations`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4" /> Edit Station
                </Link>
              )}

              <Link to="/map"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-solar-green-600 py-2.5 text-sm font-semibold text-white hover:bg-solar-green-700 transition-colors"
              >
                <MapPin className="h-4 w-4" /> View on Map
              </Link>
            </div>

            {/* Moderation panel */}
            {isMod && station.status === 'pending' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-800">Moderation Required</p>
                </div>
                <p className="text-xs text-amber-600">This station is pending your review before going live.</p>

                {approveConf ? (
                  <div className="rounded-xl border border-emerald-200 bg-white p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">Approve this station?</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, Approve'}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setApproveConf(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setApproveConf(true)}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setRejectOpen(true)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Rejection reason */}
            {station.status === 'rejected' && station.rejectionReason && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600 italic">"{station.rejectionReason}"</p>
              </div>
            )}

            {/* Meta info */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Station Info</h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Submitted by</p>
                    <p className="text-sm font-medium text-gray-800">{station.submittedBy?.displayName ?? 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Added on</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(station.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                {station.isVerified && station.verifiedAt && (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-400">Verified on</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(station.verifiedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mini map */}
            {hasMap && (
              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <MapContainer
                  center={[coords[1], coords[0]]}
                  zoom={14}
                  style={{ height: 200, width: '100%' }}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  dragging={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                  />
                  <Marker position={[coords[1], coords[0]]} icon={STATION_PIN} />
                </MapContainer>
                <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
                  <Link
                    to="/map"
                    className="text-xs font-medium text-solar-green-600 hover:text-solar-green-700 transition-colors"
                  >
                    Open in Map View →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection modal */}
      <RejectionReasonModal
        open={rejectOpen}
        stationName={station.name}
        isPending={rejectMutation.isPending}
        onClose={() => setRejectOpen(false)}
        onSubmit={handleReject}
      />
    </div>
  )
}
