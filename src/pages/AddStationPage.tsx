import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/shared/Navbar'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Zap, Plus, Trash2, ChevronRight, ChevronLeft, CheckCircle,
  Sun, Clock, AlignLeft, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateStation } from '@/hooks/useStations'
import { cn } from '@/lib/utils'
import { CONNECTOR_TYPES, AMENITIES, DEFAULT_MAP_CENTER } from '@/lib/constants'
import type { ConnectorType, Amenity, CreateStationDto, OperatingHours } from '@/types/station.types'

const AMENITY_LABELS: Record<Amenity, { label: string; emoji: string }> = {
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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
type Day = typeof DAYS[number]

const PIN_ICON = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24S32 27 32 16C32 7.163 24.837 0 16 0z" fill="#133c1d" opacity="0.9"/>
    <circle cx="16" cy="16" r="8" fill="white"/>
    <circle cx="16" cy="16" r="4" fill="#8cc63f"/>
  </svg>`,
  iconSize:    [32, 40],
  iconAnchor:  [16, 40],
  popupAnchor: [0, -40],
  className:   '',
})

interface ConnectorInput {
  type:    ConnectorType
  powerKw: number
  count:   number
}

interface ScheduleRow {
  day:       Day
  openTime:  string
  closeTime: string
  enabled:   boolean
}

interface WizardState {
  lat:           number | null
  lng:           number | null
  addressString: string
  name:          string
  description:   string
  solarPanelKw:  number
  connectors:    ConnectorInput[]
  amenities:     Amenity[]
  images:        string[]
  alwaysOpen:    boolean
  schedule:      ScheduleRow[]
}

const DEFAULT_STATE: WizardState = {
  lat: null, lng: null, addressString: '',
  name: '', description: '', solarPanelKw: 0,
  connectors:  [{ type: 'Type-2', powerKw: 7, count: 1 }],
  amenities:   [],
  images:      [],
  alwaysOpen:  true,
  schedule:    DAYS.map((day) => ({ day, openTime: '08:00', closeTime: '20:00', enabled: true })),
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng) } })
  return null
}

function MapPicker({
  lat, lng, onChange,
}: {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <MapContainer
        center={lat !== null && lng !== null ? [lat, lng] : DEFAULT_MAP_CENTER}
        zoom={13}
        style={{ height: 320, width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        {lat !== null && lng !== null && <Marker position={[lat, lng]} icon={PIN_ICON} />}
      </MapContainer>
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        {lat !== null && lng !== null
          ? `📍 Pinned: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
          : '👆 Click on the map to place a pin'}
      </div>
    </div>
  )
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  const labels = ['Location', 'Connectors', 'Details', 'Review']
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {labels.map((label, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
              i + 1 < step   ? 'bg-[#8cc63f] text-[#133c1d]' :
              i + 1 === step ? 'bg-[#8cc63f] text-[#133c1d] ring-4 ring-[#8cc63f]/20' :
                               'bg-gray-100 text-gray-400'
            )}>
              {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn(
              'hidden sm:block text-xs font-medium',
              i + 1 <= step ? 'text-[#133c1d]' : 'text-gray-400'
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1.5 rounded-full bg-gray-100">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#8cc63f] transition-all duration-500"
          style={{ width: `${((step - 1) / (total - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default function AddStationPage() {
  const navigate      = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<WizardState>(DEFAULT_STATE)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const createStation = useCreateStation()

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  function addConnector() {
    update('connectors', [...form.connectors, { type: 'Type-2', powerKw: 7, count: 1 }])
  }

  function removeConnector(i: number) {
    update('connectors', form.connectors.filter((_, j) => j !== i))
  }

  function updateConnector(i: number, field: keyof ConnectorInput, value: ConnectorType | number) {
    update('connectors', form.connectors.map((c, j) => j === i ? { ...c, [field]: value } : c))
  }

  function toggleAmenity(a: Amenity) {
    update('amenities', form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a])
  }

  function removeImage(i: number) {
    update('images', form.images.filter((_, j) => j !== i))
  }

  function updateSchedule(i: number, field: keyof ScheduleRow, value: string | boolean) {
    update('schedule', form.schedule.map((s, j) => j === i ? { ...s, [field]: value } : s))
  }

  function validate(s: number): boolean {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!form.name.trim())        errs.name     = 'Station name is required'
      if (!form.lat || !form.lng)   errs.location = 'Please place a pin on the map'
    }
    if (s === 2 && form.connectors.length === 0) {
      errs.connectors = 'Add at least one connector'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() { if (validate(step)) setStep((s) => Math.min(s + 1, 4)) }
  function back() { setStep((s) => Math.max(s - 1, 1)) }

  function submit() {
    if (!validate(step)) return
    const operatingHours: OperatingHours = {
      alwaysOpen: form.alwaysOpen,
      schedule:   form.alwaysOpen
        ? []
        : form.schedule.filter((s) => s.enabled).map(({ day, openTime, closeTime }) => ({ day, openTime, closeTime })),
    }
    const dto: CreateStationDto = {
      name:          form.name,
      description:   form.description || undefined,
      addressString: form.addressString || undefined,
      lat:           form.lat ?? undefined,
      lng:           form.lng ?? undefined,
      solarPanelKw:  form.solarPanelKw,
      connectors:    form.connectors,
      amenities:     form.amenities,
      images:        form.images,
      operatingHours,
    }
    createStation.mutate(dto, {
      onSuccess: (data) => navigate(`/stations/${data.data._id}`),
    })
  }

  const stepTitles = [
    'Where is the station?',
    'Configure connectors',
    'Add details & amenities',
    'Review & submit',
  ]
  const stepIcons = [
    <MapPin className="h-5 w-5" />,
    <Zap className="h-5 w-5" />,
    <AlignLeft className="h-5 w-5" />,
    <CheckCircle className="h-5 w-5" />,
  ]

  return (
    <div className="min-h-screen bg-[#f5faf0]">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#8cc63f] text-[#133c1d]">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-sg font-bold text-[#133c1d]">Add a Charging Station</h1>
            <p className="text-sm text-gray-500">Step {step} of 4 — {stepTitles[step - 1]}</p>
          </div>
        </div>

        <StepIndicator step={step} total={4} />

        <div className="rounded-[20px] bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 space-y-6">

          {/* Step heading */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-[16px] bg-[#8cc63f]/10 text-[#8cc63f]">
              {stepIcons[step - 1]}
            </div>
            <h2 className="text-lg font-sg font-semibold text-[#133c1d]">{stepTitles[step - 1]}</h2>
          </div>

          {/* ── STEP 1: Location ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Station Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. SolarSpot Colombo City Centre"
                  className={cn('mt-1.5', errors.name && 'border-red-400')}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </Label>
                <p className="mb-2 text-xs text-gray-500">
                  Click on the map to place the station pin, or type an address below.
                </p>
                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onChange={(lat, lng) => { update('lat', lat); update('lng', lng) }}
                />
                {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address (optional)
                </Label>
                <Input
                  id="address"
                  value={form.addressString}
                  onChange={(e) => update('addressString', e.target.value)}
                  placeholder="e.g. 123 Galle Road, Colombo 03"
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Leave blank if you've placed a pin — coordinates will be used for geocoding.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Connectors ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Add all connector types available at this station.</p>

              {errors.connectors && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {errors.connectors}
                </div>
              )}

              {form.connectors.map((connector, i) => (
                <div key={i} className="rounded-[16px] border border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Connector {i + 1}</span>
                    {form.connectors.length > 1 && (
                      <button
                        onClick={() => removeConnector(i)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="mb-1 block text-xs text-gray-500">Type</Label>
                      <select
                        value={connector.type}
                        onChange={(e) => updateConnector(i, 'type', e.target.value as ConnectorType)}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#8cc63f] focus:outline-none"
                      >
                        {CONNECTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-gray-500">Power (kW)</Label>
                      <Input
                        type="number" min={1} max={350}
                        value={connector.powerKw}
                        onChange={(e) => updateConnector(i, 'powerKw', Number(e.target.value))}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-gray-500">Ports</Label>
                      <Input
                        type="number" min={1} max={20}
                        value={connector.count}
                        onChange={(e) => updateConnector(i, 'count', Number(e.target.value))}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addConnector}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-[#8cc63f]/30 py-3 text-sm font-medium text-[#8cc63f] hover:border-[#8cc63f] hover:bg-[#8cc63f]/10 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Another Connector
              </button>
            </div>
          )}

          {/* ── STEP 3: Details ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="desc" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe the station — surroundings, accessibility, special features…"
                  rows={3}
                  className="mt-1.5 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="solar" className="text-sm font-medium text-gray-700">
                  Solar Panel Capacity (kWp)
                </Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <Sun className="h-5 w-5 shrink-0 text-amber-400" />
                  <Input
                    id="solar"
                    type="number" min={0} max={1000}
                    value={form.solarPanelKw}
                    onChange={(e) => update('solarPanelKw', Number(e.target.value))}
                    className="max-w-[140px]"
                  />
                  <span className="text-sm text-gray-500">kWp installed</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Amenities</Label>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {(AMENITIES as readonly Amenity[]).map((a) => {
                    const { label, emoji } = AMENITY_LABELS[a]
                    const selected = form.amenities.includes(a)
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-[16px] border p-2.5 text-xs font-medium transition-all',
                          selected
                            ? 'border-[#8cc63f] bg-[#8cc63f]/10 text-[#133c1d]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        )}
                      >
                        <span className="text-lg">{emoji}</span>
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Image URLs */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Photo URLs</Label>
                <p className="mb-2 text-xs text-gray-400">Add direct image URLs to show in the station gallery.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const inp = (e.currentTarget.elements.namedItem('imgUrl') as HTMLInputElement)
                    const url = inp.value.trim()
                    if (url) { update('images', [...form.images, url]); inp.value = '' }
                  }}
                  className="flex gap-2"
                >
                  <Input name="imgUrl" placeholder="https://example.com/photo.jpg" className="flex-1" />
                  <Button type="submit" variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>
                </form>
                {form.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.images.map((src, i) => (
                      <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Operating Hours */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Operating Hours</Label>
                <div className="mt-2.5 space-y-3">
                  <button
                    onClick={() => update('alwaysOpen', !form.alwaysOpen)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-[16px] border px-4 py-2.5 text-sm font-medium transition-colors',
                      form.alwaysOpen
                        ? 'border-[#8cc63f] bg-[#8cc63f]/10 text-[#133c1d]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    {form.alwaysOpen ? '✓ Open 24/7 (Always Open)' : 'Set custom hours'}
                  </button>

                  {!form.alwaysOpen && (
                    <div className="space-y-2 rounded-[16px] border border-gray-100 bg-gray-50 p-3">
                      {form.schedule.map((s, i) => (
                        <div key={s.day} className="flex items-center gap-3">
                          <button
                            onClick={() => updateSchedule(i, 'enabled', !s.enabled)}
                            className={cn(
                              'w-12 shrink-0 rounded-full py-1 text-center text-xs font-semibold transition-colors',
                              s.enabled ? 'bg-[#8cc63f] text-[#133c1d]' : 'bg-gray-200 text-gray-400'
                            )}
                          >
                            {s.day}
                          </button>
                          {s.enabled ? (
                            <>
                              <Input
                                type="time" value={s.openTime}
                                onChange={(e) => updateSchedule(i, 'openTime', e.target.value)}
                                className="h-8 w-28 bg-white text-xs"
                              />
                              <span className="text-xs text-gray-400">to</span>
                              <Input
                                type="time" value={s.closeTime}
                                onChange={(e) => updateSchedule(i, 'closeTime', e.target.value)}
                                className="h-8 w-28 bg-white text-xs"
                              />
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Closed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review ───────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-[16px] bg-[#8cc63f]/10 border border-[#8cc63f]/30 p-4">
                <p className="text-sm font-medium text-[#133c1d]">
                  Review your station details before submitting for moderation.
                </p>
              </div>

              <div className="divide-y divide-gray-100 space-y-0">
                <div className="pb-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{form.name}</p>
                  {form.addressString && <p className="mt-0.5 text-sm text-gray-500">{form.addressString}</p>}
                  {form.lat !== null && form.lng !== null && (
                    <p className="mt-0.5 text-xs text-gray-400">{form.lat.toFixed(5)}, {form.lng.toFixed(5)}</p>
                  )}
                </div>

                <div className="py-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Connectors</p>
                  <div className="flex flex-wrap gap-2">
                    {form.connectors.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                        <Zap className="h-3 w-3 text-[#8cc63f]" />
                        {c.type} · {c.powerKw} kW · {c.count} port{c.count !== 1 ? 's' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="py-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Solar & Hours</p>
                  <p className="text-sm text-gray-700">
                    <Sun className="mr-1 inline-block h-3.5 w-3.5 text-amber-400" />
                    {form.solarPanelKw} kWp solar
                    {form.alwaysOpen && (
                      <span className="ml-3">
                        <Clock className="mr-1 inline-block h-3.5 w-3.5 text-[#8cc63f]" />
                        Open 24/7
                      </span>
                    )}
                  </p>
                  {form.description && (
                    <p className="mt-1.5 text-sm italic text-gray-600">"{form.description}"</p>
                  )}
                </div>

                {form.amenities.length > 0 && (
                  <div className="py-4">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {form.amenities.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 rounded-full border border-[#8cc63f]/30 bg-[#8cc63f]/10 px-3 py-1 text-xs font-medium text-[#133c1d]">
                          {AMENITY_LABELS[a].emoji} {AMENITY_LABELS[a].label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {form.images.length > 0 && (
                  <div className="pt-4">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Photos ({form.images.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {form.images.map((src, i) => (
                        <img key={i} src={src} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-gray-200 object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                After submission, your station will be reviewed by a moderator before becoming publicly visible. This usually takes less than 24 hours.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-5 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={back} className="gap-1.5 rounded-[16px]">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <Button
              onClick={next}
              className="gap-1.5 rounded-[16px] bg-[#8cc63f] text-[#133c1d] hover:bg-[#7ab334] font-sg font-semibold"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={createStation.isPending}
              className="gap-1.5 rounded-[16px] bg-[#8cc63f] px-6 text-[#133c1d] hover:bg-[#7ab334] font-sg font-semibold"
            >
              {createStation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> Submit Station</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
