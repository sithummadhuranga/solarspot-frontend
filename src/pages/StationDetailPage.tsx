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
import { SolarWidget } from '@/features/weather/SolarWidget'
import { ForecastChart } from '@/features/weather/ForecastChart'
import { SolarReportList } from '@/features/weather/SolarReportList'
import { StationAnalyticsPanel } from '@/features/weather/StationAnalyticsPanel'
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
      <div className="min-h-screen bg-[#f5faf0]">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#1a6b3c] mx-auto" />
            <p className="text-sm font-bold text-gray-500 font-sg">Loading station…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-[#f5faf0]">
        <Navbar />
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mx-auto">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-extrabold text-[#133c1d] font-sg">Station not found</h2>
            <p className="text-sm font-medium text-gray-500">This station may have been removed or is unavailable.</p>
            <Button variant="outline" onClick={() => navigate('/stations')} className="border-2 border-gray-200 hover:border-[#8cc63f] hover:text-[#133c1d] font-bold">
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
    <div className="min-h-screen bg-[#f5faf0]">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative h-72 w-full overflow-hidden bg-[#8cc63f] sm:h-80 lg:h-96">
        {station.images.length > 0 && (
          <>
            <img
              src={station.images[imgIndex]}
              alt={station.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b2614]/90 via-[#0b2614]/40 to-transparent" />
            {/* Image dots */}
            {station.images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
                {station.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      i === imgIndex ? 'w-8 bg-[#8cc63f]' : 'w-2.5 bg-white/50 hover:bg-white/80'
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
            className="flex items-center gap-1.5 rounded-xl bg-black/40 backdrop-blur-md px-4 py-2 text-sm font-bold text-white hover:bg-black/60 transition-colors font-sg"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className={cn(
            'flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-sm tracking-wide',
            status.bg
          )}>
            <span className={cn('h-2 w-2 rounded-full', status.dot)} />
            {status.label}
          </div>
        </div>

        {/* Station name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl drop-shadow-md font-sg">
                  {station.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                    <MapPin className="h-4 w-4 shrink-0 text-[#8cc63f]" />
                    {station.address?.city ?? station.address?.district ?? station.address?.formattedAddress ?? 'Location not set'}
                  </span>
                  {station.isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/95 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                  {station.isFeatured && (
                    <span className="rounded-full bg-amber-500/95 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm tracking-wide">
                      ⭐ FEATURED
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
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* ── Left / Main column  ───────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-2">

            {/* Quick stats row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={<Star className="h-6 w-6 text-amber-500" />}
                label="Rating"
                value={station.averageRating > 0 ? `${station.averageRating.toFixed(1)} / 5` : '—'}
                sub={station.reviewCount > 0 ? `${station.reviewCount} reviews` : 'No reviews'}
              />
              <StatCard
                icon={<Sun className="h-6 w-6 text-[#1a6b3c]" />}
                label="Solar"
                value={station.solarPanelKw > 0 ? `${station.solarPanelKw} kWp` : '—'}
                sub="Installed panels"
              />
              <StatCard
                icon={<Zap className="h-6 w-6 text-[#1a6b3c]" />}
                label="Connectors"
                value={`${station.connectors.length} type${station.connectors.length !== 1 ? 's' : ''}`}
                sub={`${station.connectors.reduce((a, c) => a + c.count, 0)} total ports`}
              />
              <StatCard
                icon={<MapPin className="h-6 w-6 text-[#1a6b3c]" />}
                label="Amenities"
                value={`${station.amenities.length}`}
                sub="Available"
              />
            </div>

            {/* Description */}
            {station.description && (
              <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
                  About this station
                </h2>
                <p className="text-[0.95rem] leading-relaxed text-gray-700 font-medium">{station.description}</p>
              </div>
            )}

            {/* Connectors */}
            {station.connectors.length > 0 && (
              <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
                  Charging Connectors
                </h2>
                <div className="divide-y divide-gray-100">
                  {station.connectors.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5faf0]">
                          <Zap className="h-6 w-6 text-[#1a6b3c]" />
                        </div>
                        <div>
                          <p className="text-[0.95rem] font-bold text-[#133c1d]">{c.type}</p>
                          <p className="text-xs font-medium text-gray-500">{c.powerKw} kW per port</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-[#133c1d]">{c.count}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">port{c.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {station.connectors.map((c, i) => (
                    <ConnectorBadge key={i} type={c.type} powerKw={c.powerKw} />
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {station.amenities.length > 0 && (
              <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
                  Amenities
                </h2>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {station.amenities.map((a) => {
                    const info = AMENITY_INFO[a]
                    return (
                      <div key={a} className="flex flex-col items-center gap-2 rounded-2xl border border-[#dcfce7] bg-[#f5faf0] px-4 py-4 text-center transition-transform hover:-translate-y-1">
                        <span className="text-3xl">{info.emoji}</span>
                        <span className="text-xs font-bold text-[#133c1d]">{info.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Operating Hours */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">
                <Clock className="h-5 w-5" /> Operating Hours
              </h2>
              {station.operatingHours?.alwaysOpen ? (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <p className="text-sm font-bold text-emerald-800">Open 24 / 7 — Always available</p>
                </div>
              ) : station.operatingHours?.schedule && station.operatingHours.schedule.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {station.operatingHours.schedule.map((s) => (
                    <div key={s.day} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <span className="w-12 text-sm font-bold text-[#133c1d]">{s.day}</span>
                      <span className="text-sm font-medium text-gray-600">{s.openTime} – {s.closeTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-500">Hours not specified</p>
              )}
            </div>

            {/* ── Placeholder: Reviews (Member 2) ──────────────────────── */}
            <div className="rounded-[20px] border-2 border-dashed border-gray-200 bg-white p-8 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-500 font-sg">Reviews & Ratings</p>
              <p className="text-xs font-medium text-gray-400 mt-1">Member 2 — Reviews section will appear here</p>
            </div>

            {/* ── Solar Intelligence (Member 3) ─────────────────────── */}
            {id && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <CloudSun className="h-5 w-5 text-blue-500" />
                  <h3 className="text-base font-bold text-gray-900">Solar Intelligence</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <SolarWidget stationId={id} />
                  <ForecastChart stationId={id} />
                </div>
                <StationAnalyticsPanel stationId={id} />
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Community Reports</h4>
                  <SolarReportList stationId={id} />
                </div>
              </div>
            )}
          </div>

          {/* ── Right / Sidebar ────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Action buttons */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-3">
              {/* Edit own station */}
              {isOwner && station.status !== 'active' && (
                <Link to={`/my-stations`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-700 hover:border-[#8cc63f] hover:text-[#133c1d] transition-all"
                >
                  <Edit2 className="h-4 w-4" /> Edit Station
                </Link>
              )}

              <Link to="/map"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] py-3 text-sm font-bold text-white hover:bg-black transition-colors shadow-md font-sg"
              >
                <MapPin className="h-4 w-4" /> View on Map
              </Link>
            </div>

            {/* Moderation panel */}
            {isMod && station.status === 'pending' && (
              <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <p className="text-sm font-bold text-amber-800 font-sg">Moderation Required</p>
                </div>
                <p className="text-xs font-medium text-amber-700">This station is pending your review before going live.</p>

                {approveConf ? (
                  <div className="rounded-xl border border-emerald-200 bg-white p-4 space-y-3 shadow-sm">
                    <p className="text-xs font-bold text-gray-700">Approve this station?</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                      >
                        {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, Approve'}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 font-bold" onClick={() => setApproveConf(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={() => setApproveConf(true)}
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-bold"
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
              <div className="rounded-[20px] border border-red-200 bg-red-50 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <p className="text-xs font-bold text-red-700 mb-1.5 font-sg">Rejection Reason</p>
                <p className="text-sm font-medium text-red-600 italic">"{station.rejectionReason}"</p>
              </div>
            )}

            {/* Meta info */}
            <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3c] font-sg">Station Info</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Submitted by</p>
                    <p className="text-sm font-bold text-[#133c1d]">{station.submittedBy?.displayName ?? 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Added on</p>
                    <p className="text-sm font-bold text-[#133c1d]">
                      {new Date(station.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                {station.isVerified && station.verifiedAt && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified on</p>
                      <p className="text-sm font-bold text-[#133c1d]">
                        {new Date(station.verifiedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mini map */}
            {hasMap && (
              <div className="overflow-hidden rounded-[20px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <MapContainer
                  center={[coords[1], coords[0]]}
                  zoom={14}
                  style={{ height: 220, width: '100%' }}
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
                <div className="border-t border-gray-100 bg-[#f5faf0] px-4 py-3">
                  <Link
                    to="/map"
                    className="text-xs font-bold text-[#1a6b3c] hover:text-[#133c1d] transition-colors flex items-center gap-1"
                  >
                    Open in Map View <span className="text-lg leading-none">›</span>
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
