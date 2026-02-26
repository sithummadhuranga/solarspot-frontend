import { useState } from 'react'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AMENITY_CONFIG } from '@/components/stations/AmenityChips'
import { useCreateStation, useUpdateStation } from '@/hooks/useStations'
import type { Station } from '@/types/station.types'

// ─── Zod schema (mirrors backend Joi) ────────────────────────────────────────

const CONNECTOR_TYPES = ['USB-C', 'Type-2', 'CCS', 'CHAdeMO', 'Tesla-NACS', 'AC-Socket'] as const
const AMENITIES       = ['wifi','cafe','restroom','parking','security','shade','water','repair_shop','ev_parking'] as const
const DAYS            = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const

const connectorSchema = z.object({
  type:    z.enum(CONNECTOR_TYPES),
  powerKw: z.number().min(0.5, 'Min 0.5 kW').max(350),
  count:   z.number().int().min(1),
})

const scheduleItemSchema = z.object({
  day:       z.enum(DAYS),
  openTime:  z.string().min(1, 'Required'),
  closeTime: z.string().min(1, 'Required'),
})

const stationFormSchema = z.object({
  // Step 1
  name:            z.string().min(3, 'Min 3 characters').max(100, 'Max 100 characters'),
  description:     z.string().max(1000).optional(),
  addressMode:     z.enum(['string', 'coordinates']),
  addressString:   z.string().optional(),
  lat:             z.number().optional(),
  lng:             z.number().optional(),
  // Step 2
  solarPanelKw:    z.number().min(0.1, 'Required'),
  connectors:      z.array(connectorSchema).min(1, 'Add at least one connector'),
  alwaysOpen:      z.boolean(),
  schedule:        z.array(scheduleItemSchema).optional(),
  // Step 3
  amenities:       z.array(z.enum(AMENITIES)).optional(),
  images:          z.array(z.string().url('Must be a valid URL')).max(5).optional(),
})

type StationFormValues = z.infer<typeof stationFormSchema>

// ─── Component ────────────────────────────────────────────────────────────────

interface StationFormModalProps {
  open:      boolean
  onClose:   () => void
  /** Pass existing station to enter edit mode */
  station?:  Station
}

const STEP_LABELS = ['Basic Info', 'Technical', 'Extras']
const TOTAL_STEPS = 3

// Which fields belong to each step for per-step validation
const STEP_1_FIELDS: (keyof StationFormValues)[] = ['name', 'description', 'addressMode', 'addressString', 'lat', 'lng']
const STEP_2_FIELDS: (keyof StationFormValues)[] = ['solarPanelKw', 'connectors', 'alwaysOpen', 'schedule']

export function StationFormModal({ open, onClose, station }: StationFormModalProps) {
  const isEdit = Boolean(station)
  const [step, setStep] = useState(0)

  const createMutation = useCreateStation()
  const updateMutation = useUpdateStation(station?._id ?? '')

  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    formState: { errors },
  } = useForm<StationFormValues>({
    resolver: zodResolver(stationFormSchema),
    defaultValues: station
      ? {
          name:          station.name,
          description:   station.description ?? '',
          addressMode:   'string',
          addressString: station.address?.formattedAddress ?? '',
          solarPanelKw:  station.solarPanelKw,
          connectors:    station.connectors.length > 0
            ? station.connectors
            : [{ type: 'Type-2', powerKw: 7, count: 1 }],
          alwaysOpen:    station.operatingHours?.alwaysOpen ?? true,
          schedule:      station.operatingHours?.schedule ?? [],
          amenities:     (station.amenities ?? []) as StationFormValues['amenities'],
          images:        station.images ?? [],
        }
      : {
          addressMode: 'string',
          connectors:  [{ type: 'Type-2', powerKw: 7, count: 1 }],
          alwaysOpen:  true,
          amenities:   [],
          images:      [],
        },
  })

  const { fields: connectorFields, append: addConnector, remove: removeConnector } =
    useFieldArray({ control, name: 'connectors' })

  const { fields: scheduleFields, append: addDay, remove: removeDay } =
    useFieldArray({ control, name: 'schedule' })

  const addressMode = useWatch({ control, name: 'addressMode' })
  const alwaysOpen  = useWatch({ control, name: 'alwaysOpen' })

  async function goNext() {
    const fields = step === 0 ? STEP_1_FIELDS : STEP_2_FIELDS
    const valid = await trigger(fields)
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleClose() {
    reset()
    setStep(0)
    onClose()
  }

  function onSubmit(values: StationFormValues) {
    const dto = {
      name:         values.name,
      description:  values.description,
      addressString: values.addressMode === 'string' ? values.addressString : undefined,
      lat:          values.addressMode === 'coordinates' ? values.lat : undefined,
      lng:          values.addressMode === 'coordinates' ? values.lng : undefined,
      solarPanelKw: values.solarPanelKw,
      connectors:   values.connectors,
      amenities:    values.amenities,
      images:       values.images?.filter(Boolean),
      operatingHours: {
        alwaysOpen: values.alwaysOpen,
        schedule:   values.alwaysOpen ? [] : (values.schedule ?? []),
      },
    }

    if (isEdit && station) {
      updateMutation.mutate(dto, { onSuccess: handleClose })
    } else {
      createMutation.mutate(dto, { onSuccess: handleClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Station' : 'Submit a Station'}</DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="mt-2 mb-6">
          <div className="flex justify-between mb-2">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`text-xs font-medium ${i <= step ? 'text-green-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Step 1: Basic Info ────────────────────────────────────── */}
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="name">Station name <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="e.g. Colombo Solar Hub" {...register('name')} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe the station, its surroundings or access…"
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
              </div>

              {/* Address mode toggle */}
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex gap-2">
                  <Controller
                    name="addressMode"
                    control={control}
                    render={({ field }) => (
                      <>
                        <button
                          type="button"
                          onClick={() => field.onChange('string')}
                          className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors ${
                            field.value === 'string'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Address text
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange('coordinates')}
                          className={`flex-1 rounded-md border py-1.5 text-sm font-medium transition-colors ${
                            field.value === 'coordinates'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          Lat / Lng
                        </button>
                      </>
                    )}
                  />
                </div>

                {addressMode === 'string' ? (
                  <Input
                    placeholder="e.g. 42 Galle Road, Colombo 03, Sri Lanka"
                    {...register('addressString')}
                  />
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input type="number" step="any" placeholder="Latitude" {...register('lat', { valueAsNumber: true })} />
                      {errors.lat && <p className="text-xs text-red-600">{errors.lat.message}</p>}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Input type="number" step="any" placeholder="Longitude" {...register('lng', { valueAsNumber: true })} />
                      {errors.lng && <p className="text-xs text-red-600">{errors.lng.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Step 2: Technical ─────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="solarPanelKw">Solar panel capacity (kWp) <span className="text-red-500">*</span></Label>
                <Input id="solarPanelKw" type="number" step="0.1" min="0.1" placeholder="e.g. 10" {...register('solarPanelKw', { valueAsNumber: true })} />
                {errors.solarPanelKw && <p className="text-xs text-red-600">{errors.solarPanelKw.message}</p>}
              </div>

              {/* Connectors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Connectors <span className="text-red-500">*</span></Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addConnector({ type: 'Type-2', powerKw: 7, count: 1 })}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {errors.connectors && !Array.isArray(errors.connectors) && (
                  <p className="text-xs text-red-600">{errors.connectors.message}</p>
                )}
                <div className="space-y-2">
                  {connectorFields.map((cField, idx) => (
                    <div key={cField.id} className="flex gap-2 items-start rounded-lg border border-gray-200 p-3">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Controller
                          name={`connectors.${idx}.type`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {CONNECTOR_TYPES.map((t) => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <div>
                          <Input type="number" step="0.5" min="0.5" placeholder="kW"
                            {...register(`connectors.${idx}.powerKw`, { valueAsNumber: true })}
                          />
                          {errors.connectors?.[idx]?.powerKw && (
                            <p className="text-xs text-red-600 mt-0.5">{errors.connectors[idx].powerKw?.message}</p>
                          )}
                        </div>
                        <div>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Count"
                            {...register(`connectors.${idx}.count`, { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeConnector(idx)}
                        disabled={connectorFields.length === 1}
                        className="mt-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating hours */}
              <div className="space-y-2">
                <Label>Operating hours</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Controller
                    name="alwaysOpen"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded accent-green-600"
                      />
                    )}
                  />
                  <span className="text-sm text-gray-700">Open 24 / 7</span>
                </label>

                {!alwaysOpen && (
                  <div className="space-y-2 rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Weekly schedule</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addDay({ day: 'Mon', openTime: '08:00', closeTime: '20:00' })}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add day
                      </Button>
                    </div>
                    {scheduleFields.map((sf, idx) => (
                      <div key={sf.id} className="flex gap-2 items-center">
                        <Controller
                          name={`schedule.${idx}.day`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS.map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <Input type="time" {...register(`schedule.${idx}.openTime`)} className="w-28" />
                        <span className="text-gray-400 text-sm">–</span>
                        <Input type="time" {...register(`schedule.${idx}.closeTime`)} className="w-28" />
                        <button
                          type="button"
                          onClick={() => removeDay(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Step 3: Extras ────────────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* Amenities */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <Controller
                  name="amenities"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2">
                      {AMENITIES.map((amenity) => {
                        const cfg = AMENITY_CONFIG[amenity]
                        const { Icon } = cfg
                        const selected = field.value?.includes(amenity)
                        return (
                          <label
                            key={amenity}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                              selected
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected ?? false}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...(field.value ?? []), amenity]
                                  : (field.value ?? []).filter((a) => a !== amenity)
                                field.onChange(next)
                              }}
                              className="sr-only"
                            />
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{cfg.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
              </div>

              {/* Images — up to 5 Cloudinary / CDN URLs */}
              <div className="space-y-2">
                <Label>Images <span className="text-gray-400 font-normal">(up to 5 URLs)</span></Label>
                <div className="space-y-2">
                  {([0, 1, 2, 3, 4] as const).map((i) => (
                    <div key={i}>
                      <Input
                        type="url"
                        placeholder={`Image URL ${i + 1}`}
                        {...register(`images.${i}`)}
                      />
                      {Array.isArray(errors.images) && errors.images[i] && (
                        <p className="mt-0.5 text-xs text-red-600">{errors.images[i]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review summary */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1 text-sm">
                <p className="font-medium text-gray-800">Ready to submit</p>
                <p className="text-gray-500">
                  Your station will be reviewed by a moderator before going live.
                  You'll receive an email when it's approved or rejected.
                </p>
              </div>
            </>
          )}

          {/* ─── Navigation ─────────────────────────────────────────── */}
          <DialogFooter className="border-t pt-4 mt-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={goBack} disabled={isPending}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            )}
            <div className="flex-1" />
            {step < TOTAL_STEPS - 1 ? (
              <Button type="button" onClick={goNext}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save changes' : 'Submit station'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
