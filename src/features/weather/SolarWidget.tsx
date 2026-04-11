/**
 * SolarWidget — Live solar output widget for a station.
 *
 * Shows: current temperature, cloud cover, UV index, estimated kW output,
 * and solar score with a colour-coded indicator.
 *
 * ⚠ OWM Attribution — required by OpenWeatherMap free-tier licence:
 *   "Powered by OpenWeatherMap" must be displayed whenever OWM data is shown.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
import { Cloud, MapPin, Sun, Thermometer, Wind, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { useGetLiveWeatherQuery } from './solarApi'

interface Props {
  stationId: string
}

const scoreColour = (score: number) => {
  if (score >= 80) return 'text-emerald-700'
  if (score >= 60) return 'text-lime-700'
  if (score >= 40) return 'text-amber-700'
  return 'text-rose-700'
}

const scoreBg = (score: number) => {
  if (score >= 80) return 'border-emerald-200 bg-emerald-50/80'
  if (score >= 60) return 'border-lime-200 bg-lime-50/80'
  if (score >= 40) return 'border-amber-200 bg-amber-50/80'
  return 'border-rose-200 bg-rose-50/80'
}

function formatMetric(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
}

export function SolarWidget({ stationId }: Props) {
  const { data, isLoading, isError } = useGetLiveWeatherQuery(stationId)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="h-5 w-40 rounded bg-emerald-100" />
        <div className="h-4 w-full rounded bg-emerald-50" />
        <div className="h-20 rounded-2xl bg-emerald-50" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-16 rounded-2xl bg-slate-50" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
        Solar weather data is temporarily unavailable.
      </div>
    )
  }

  const payload = data.data
  const station = payload.station
  const weather = payload.weather
  const solar = payload.solar
  const generatedAt = payload.generatedAt

  const solarScore = Number.isFinite(solar?.solarScore) ? Math.round(solar.solarScore) : 0
  const estimatedOutputKw = Number.isFinite(solar?.estimatedOutputKw) ? solar.estimatedOutputKw : 0
  const cloudFactor = Number.isFinite(solar?.cloudFactor) ? solar.cloudFactor : 0
  const uvFactor = Number.isFinite(solar?.uvFactor) ? solar.uvFactor : 0

  const weatherMain = weather?.weatherMain ?? 'Unknown'
  const stationName = station?.name ?? 'Unknown station'
  const stationCity = station?.address?.city ?? 'Station weather zone'
  const stationSolarPanelKw = Number.isFinite(station?.solarPanelKw) ? station.solarPanelKw : 0
  const temperatureC = Number.isFinite(weather?.temperatureC) ? weather.temperatureC : 0
  const cloudCoverPct = Number.isFinite(weather?.cloudCoverPct) ? weather.cloudCoverPct : 0
  const uvIndex = Number.isFinite(weather?.uvIndex) ? weather.uvIndex : 0
  const windSpeedKph = Number.isFinite(weather?.windSpeedKph) ? weather.windSpeedKph : 0
  const isFallback = Boolean(weather?.isFallback)

  const scoreWidth = `${Math.max(0, Math.min(100, solarScore))}%`
  const estimatedOutputText = formatMetric(estimatedOutputKw, 2)
  const temperatureText = `${formatMetric(temperatureC, 1)}°C`
  const cloudCoverText = `${formatMetric(cloudCoverPct, 0)}%`
  const uvIndexText = formatMetric(uvIndex, 1)
  const windSpeedText = `${formatMetric(windSpeedKph, 1)} km/h`
  const lastUpdatedText = generatedAt ? format(new Date(generatedAt), 'dd MMM HH:mm') : 'just now'

  return (
    <div className={`flex h-full flex-col gap-4 rounded-[28px] border p-5 shadow-sm ${scoreBg(solarScore)}`}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Live Solar Output</p>
          <p className="mt-1 break-words text-xl font-black leading-tight text-slate-900">{stationName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {stationCity}
            </span>
            <span>{stationSolarPanelKw} kW array</span>
            <span>Updated {lastUpdatedText}</span>
          </div>
        </div>
        <div className="justify-self-start rounded-[24px] bg-white/85 px-4 py-3 text-center shadow-sm ring-1 ring-black/5 sm:min-w-[136px] sm:justify-self-end">
          <p className={`text-5xl font-black leading-none tabular-nums ${scoreColour(solarScore)}`}>
            {solarScore}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Solar Score / 100</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          <span>Current solar potential</span>
          <span>{weatherMain}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/70 ring-1 ring-black/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1a6b3c] via-[#8cc63f] to-[#f7b500]"
            style={{ width: scoreWidth }}
          />
        </div>
      </div>

      <div className="rounded-[26px] bg-white/85 p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estimated output now</p>
            <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
              <Zap className="mb-1 h-5 w-5 text-amber-500" />
              <span className="text-4xl font-black leading-none tabular-nums text-slate-900 sm:text-5xl">{estimatedOutputText}</span>
              <span className="pb-1 text-sm font-semibold text-slate-500">kW</span>
            </div>
          </div>

          <div className="grid w-full gap-2 sm:max-w-[260px] sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 px-3 py-2.5 text-emerald-900 ring-1 ring-emerald-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Cloud factor</p>
              <p className="mt-1 text-sm font-bold tabular-nums">{Math.round(cloudFactor * 100)}%</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-3 py-2.5 text-amber-900 ring-1 ring-amber-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">UV factor</p>
              <p className="mt-1 text-sm font-bold tabular-nums">{Math.round(uvFactor * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={temperatureText} />
        <Stat icon={<Cloud className="h-4 w-4" />} label="Cloud cover" value={cloudCoverText} />
        <Stat icon={<Sun className="h-4 w-4" />} label="UV index" value={uvIndexText} />
        <Stat icon={<Wind className="h-4 w-4" />} label="Wind speed" value={windSpeedText} />
      </div>

      <div className="mt-auto space-y-3">
        {isFallback && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Live weather is running on fallback values because the provider response was unavailable.
          </div>
        )}

        <p className="border-t border-slate-200 pt-2 text-[11px] text-slate-500">
          Weather data powered by{' '}
          <a
            href="https://openweathermap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            OpenWeatherMap
          </a>
        </p>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex h-full min-w-0 flex-col justify-between rounded-2xl bg-white/85 px-4 py-3 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-2 text-[#1a6b3c]">
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      </div>
      <span className="mt-3 break-words text-lg font-black leading-tight tabular-nums text-slate-900">{value}</span>
    </div>
  )
}
