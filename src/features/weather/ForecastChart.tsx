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

function formatMetric(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
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
      <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm animate-pulse">
        <div className="mb-4 h-5 w-48 rounded bg-emerald-100" />
        <div className="h-72 w-full rounded-[26px] bg-slate-50" />
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

  const payload = data.data
  const forecast = Array.isArray(payload.forecast) ? payload.forecast : []
  const bestWindows = Array.isArray(payload.bestWindows) ? payload.bestWindows : []
  const stationName = payload.station?.name ?? 'Unknown station'
  const stationSolarPanelKw = Number.isFinite(payload.station?.solarPanelKw) ? payload.station.solarPanelKw : 0
  const generatedAtText = payload.generatedAt
    ? format(new Date(payload.generatedAt), 'dd MMM HH:mm')
    : 'just now'

  const chartData = forecast.map((slot: ForecastSlot) => ({
    dt: formatTick(slot.dt),
    fullLabel: formatDt(slot.dt),
    score: slot.solarScore ?? 0,
    kw: slot.estimatedOutputKw ?? 0,
    weatherMain: slot.weatherMain,
  }))

  const bestDts = new Set(bestWindows.map((window) => formatTick(window.dt)))

  return (
    <div className="flex h-full flex-col gap-4 rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Solar Forecast</p>
            <p className="break-words text-lg font-black leading-tight text-slate-900">{stationName}</p>
            <p className="text-xs text-slate-500">{stationSolarPanelKw} kW array · Generated {generatedAtText}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {forecast.length} forecast slots
          </span>
        </div>
      </div>

      {forecast.length === 0 ? (
        <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No forecast slots are available right now.
        </div>
      ) : (
        <div className="min-h-[320px] flex-1 rounded-[26px] border border-slate-100 bg-slate-50/70 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ea" />
              <XAxis
                dataKey="dt"
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval="preserveStartEnd"
                minTickGap={22}
                tickMargin={8}
              />
              <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickMargin={6} />
              <YAxis yAxisId="kw" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} tickMargin={6} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#64748b', paddingTop: 12 }} />
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
        </div>
      )}

      {bestWindows.length > 0 && (
        <div className="grid gap-2 pt-1">
          {bestWindows.map((w, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
            >
              <div className="min-w-0">
                <p className="font-semibold text-amber-800">★ {w.label}</p>
                <p className="truncate text-amber-700">{formatDt(w.dt)}</p>
              </div>
              <p className="whitespace-nowrap font-semibold tabular-nums text-amber-900">
                {formatMetric(w.estimatedOutputKw, 2)} kW · {w.solarScore}/100
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
