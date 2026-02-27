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
import { Cloud, Thermometer, Wind, Zap, Sun } from 'lucide-react'
import { useGetLiveWeatherQuery } from './solarApi'

interface Props {
  stationId: string
}

const scoreColour = (score: number) => {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 5) return 'text-yellow-400'
  if (score >= 3) return 'text-orange-400'
  return 'text-red-400'
}

const scoreBg = (score: number) => {
  if (score >= 8) return 'bg-emerald-900/40 border-emerald-700'
  if (score >= 5) return 'bg-yellow-900/40 border-yellow-700'
  if (score >= 3) return 'bg-orange-900/40 border-orange-700'
  return 'bg-red-900/40 border-red-700'
}

export function SolarWidget({ stationId }: Props) {
  const { data, isLoading, isError } = useGetLiveWeatherQuery(stationId)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-700" />
        <div className="h-4 w-3/4 rounded bg-slate-700" />
        <div className="h-4 w-1/2 rounded bg-slate-700" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-red-800/60 bg-red-900/20 p-4 text-sm text-red-400">
        ⚠ Solar weather data temporarily unavailable.
      </div>
    )
  }

  const { weather, estimatedOutputKw, solarScore, stationName, solarPanelKw } = data.data

  return (
    <div className={`rounded-xl border p-5 space-y-4 ${scoreBg(solarScore)}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Live Solar Output</p>
          <p className="text-lg font-semibold text-white">{stationName}</p>
          <p className="text-xs text-slate-400">{solarPanelKw} kW panel</p>
        </div>
        <div className="text-center">
          <p className={`text-4xl font-bold tabular-nums ${scoreColour(solarScore)}`}>
            {solarScore}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">/ 10 score</p>
        </div>
      </div>

      {/* Weather row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={<Thermometer className="h-3.5 w-3.5" />} label="Temp" value={`${weather.temperatureC}°C`} />
        <Stat icon={<Cloud className="h-3.5 w-3.5" />}        label="Cloud" value={`${weather.cloudCoverPct}%`} />
        <Stat icon={<Sun className="h-3.5 w-3.5" />}          label="UV"    value={`${weather.uvIndex.toFixed(1)}`} />
        <Stat icon={<Wind className="h-3.5 w-3.5" />}         label="Wind"  value={`${weather.windSpeedKph} km/h`} />
      </div>

      {/* Output */}
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-400" />
        <span className="text-xl font-bold text-white tabular-nums">{estimatedOutputKw} kW</span>
        <span className="text-sm text-slate-400">estimated output now</span>
      </div>

      {/* OWM Attribution — REQUIRED by free-tier licence */}
      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-700/60">
        Weather data powered by{' '}
        <a
          href="https://openweathermap.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-slate-300"
        >
          OpenWeatherMap
        </a>
      </p>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-slate-800/50 py-2 px-3">
      <span className="text-slate-400 mb-0.5">{icon}</span>
      <span className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-white tabular-nums">{value}</span>
    </div>
  )
}
