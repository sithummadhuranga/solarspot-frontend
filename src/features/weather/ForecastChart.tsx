/**
 * ForecastChart — 5-day solar score + estimated output line chart.
 *
 * Uses recharts to display forecast slots annotated with solar calculations.
 * Also highlights the top 3 best charging windows as reference lines.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { useGetSolarForecastQuery } from './solarApi'
import type { ForecastSlot } from '@/types/solar.types'
import { format } from 'date-fns'

interface Props {
  stationId: string
}

function formatDt(iso: string) {
  try { return format(new Date(iso), 'dd MMM HH:mm') } catch { return iso }
}

function formatTick(iso: string) {
  try { return format(new Date(iso), 'dd HH:mm') } catch { return iso }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export function ForecastChart({ stationId }: Props) {
  const { data, isLoading, isError } = useGetSolarForecastQuery(stationId)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm animate-pulse">
        <div className="mb-4 h-5 w-48 rounded bg-emerald-100" />
        <div className="h-56 w-full rounded-2xl bg-slate-50" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
        Forecast data is temporarily unavailable.
      </div>
    )
  }

  const { forecast, bestWindows, station, generatedAt } = data.data

  const chartData = forecast.map((slot: ForecastSlot) => ({
    dt: formatTick(slot.dt),
    fullLabel: formatDt(slot.dt),
    score: slot.solarScore ?? 0,
    kw: slot.estimatedOutputKw ?? 0,
    weatherMain: slot.weatherMain,
  }))

  const bestDts = new Set(bestWindows.map((window) => formatTick(window.dt)))

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Solar Forecast</p>
            <p className="text-base font-bold text-slate-900">{station.name}</p>
            <p className="text-xs text-slate-500">{station.solarPanelKw} kW array · Generated {format(new Date(generatedAt), 'dd MMM HH:mm')}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {forecast.length} forecast slots
          </span>
        </div>
      </div>

      {forecast.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
          No forecast slots are available right now.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ea" />
            <XAxis
              dataKey="dt"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval="preserveStartEnd"
            />
            <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis yAxisId="kw" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
            {chartData
              .filter((d) => bestDts.has(d.dt))
              .map((d) => (
                <ReferenceLine
                  key={d.dt}
                  x={d.dt}
                  yAxisId="score"
                  stroke="#facc15"
                  strokeDasharray="4 3"
                  label={{ value: '★', position: 'top', fontSize: 10, fill: '#facc15' }}
                />
              ))}
            <Line
              yAxisId="score"
              type="monotone"
              dataKey="score"
              name="Solar Score (0-100)"
              stroke="#1a6b3c"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="kw"
              type="monotone"
              dataKey="kw"
              name="Estimated Output (kW)"
              stroke="#60a5fa"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {bestWindows.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {bestWindows.map((w, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
            >
              ★ {w.label} · {formatDt(w.dt)} · {w.estimatedOutputKw} kW · {w.solarScore}/100
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
