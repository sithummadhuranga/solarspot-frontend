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
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 animate-pulse">
        <div className="h-5 w-48 rounded bg-slate-700 mb-4" />
        <div className="h-48 w-full rounded bg-slate-700" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-red-800/60 bg-red-900/20 p-4 text-sm text-red-400">
        ⚠ Forecast data temporarily unavailable.
      </div>
    )
  }

  const { forecast, bestWindows, stationName } = data.data

  const chartData = forecast
    .filter((s: ForecastSlot) => (s.solarScore ?? 0) > 0)  // daytime only
    .map((s: ForecastSlot) => ({
      dt:     formatDt(s.dt),
      score:  s.solarScore ?? 0,
      kw:     s.estimatedOutputKw ?? 0,
    }))

  const bestDts = new Set(bestWindows.map((w) => formatDt(w.dt)))

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">5-Day Solar Forecast</p>
        <p className="text-base font-semibold text-white">{stationName}</p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No daytime slots in forecast window.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="dt"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            <YAxis yAxisId="score" domain={[0, 10]}  tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis yAxisId="kw"    orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            {/* Highlight best windows */}
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
              name="Solar Score (0–10)"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="kw"
              type="monotone"
              dataKey="kw"
              name="Est. Output (kW)"
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
              className="inline-flex items-center gap-1 rounded-full bg-yellow-900/40 border border-yellow-700 px-2.5 py-0.5 text-xs text-yellow-300"
            >
              ★ {w.label} · {formatDt(w.dt)} · {w.estimatedOutputKw} kW
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
