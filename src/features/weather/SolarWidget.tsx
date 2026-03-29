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

export function SolarWidget({ stationId }: Props) {
  const { data, isLoading, isError } = useGetLiveWeatherQuery(stationId)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
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

  const solarScore = Number.isFinite(solar?.solarScore) ? solar.solarScore : 0
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

  return (
    <div className={`space-y-4 rounded-2xl border p-5 shadow-sm ${scoreBg(solarScore)}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Live Solar Output</p>
          <p className="text-lg font-bold text-slate-900">{stationName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {stationCity}
            </span>
            <span>{stationSolarPanelKw} kW array</span>
            <span>Updated {generatedAt ? format(new Date(generatedAt), 'dd MMM HH:mm') : 'just now'}</span>
          </div>
        </div>
        <div className="min-w-[110px] rounded-2xl bg-white/80 px-4 py-3 text-center shadow-sm ring-1 ring-black/5">
          <p className={`text-4xl font-black tabular-nums ${scoreColour(solarScore)}`}>
            {solarScore}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">Solar Score / 100</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estimated output now</p>
          <div className="mt-2 flex items-end gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className="text-3xl font-black tabular-nums text-slate-900">{estimatedOutputKw}</span>
            <span className="pb-1 text-sm font-medium text-slate-500">kW</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Cloud factor {Math.round(cloudFactor * 100)}% · UV factor {Math.round(uvFactor * 100)}%
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-2">
          <Stat icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={`${temperatureC}°C`} />
          <Stat icon={<Cloud className="h-4 w-4" />} label="Cloud cover" value={`${cloudCoverPct}%`} />
          <Stat icon={<Sun className="h-4 w-4" />} label="UV index" value={uvIndex.toFixed(1)} />
          <Stat icon={<Wind className="h-4 w-4" />} label="Wind speed" value={`${windSpeedKph} km/h`} />
        </div>
      </div>

      {isFallback && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Live weather is running on fallback values because the provider response was unavailable.
        </div>
      )}

      <p className="border-t border-slate-200 pt-1 text-[11px] text-slate-500">
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
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/5">
      <span className="mb-1 text-[#1a6b3c]">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <span className="text-base font-bold tabular-nums text-slate-900">{value}</span>
    </div>
  )
}
