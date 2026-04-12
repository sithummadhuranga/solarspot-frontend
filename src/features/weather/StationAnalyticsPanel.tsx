
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useGetStationAnalyticsQuery } from './solarApi'
import { BarChart2, CheckCircle2 } from 'lucide-react'
import type { StationAnalytics } from '@/types/solar.types'

interface Props {
  stationId: string
}

interface TooltipPayloadEntry {
  name?: string | number
  value?: string | number
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string | number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={String(p.name)} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function StatBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="text-2xl font-black tabular-nums text-slate-900">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  )
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getBestAggregate<T extends { _id: number; avgScore: number; count: number }>(items: T[]): T | null {
  if (items.length === 0) return null
  return items.slice().sort((left, right) => right.avgScore - left.avgScore || right.count - left.count)[0] ?? null
}

function formatDayLabel(day: number) {
  return DAY_NAMES[day - 1] ?? `Day ${day}`
}

function formatHourLabel(hour: number) {
  const normalized = hour % 24
  const suffix = normalized >= 12 ? 'PM' : 'AM'
  const display = normalized % 12 || 12
  return `${display}:00 ${suffix}`
}

function formatAccuracyBucket(bucket: number | string) {
  if (typeof bucket === 'string') return bucket
  if (bucket === 0) return '0-49%'
  if (bucket === 50) return '50-69%'
  if (bucket === 70) return '70-89%'
  if (bucket === 90) return '90-109%'
  if (bucket === 110) return '110-129%'
  if (bucket === 130) return '130-200%'
  return String(bucket)
}

function buildTrendData(analytics: StationAnalytics) {
  return analytics.last30Days
    .slice()
    .sort((a, b) => (a._id > b._id ? 1 : -1))
    .map((day) => ({
      date: day._id.slice(5),
      score: Number(day.avgScore.toFixed(1)),
      count: day.reportCount,
    }))
}

export function StationAnalyticsPanel({ stationId }: Props) {
  const { data: res, isLoading, isError } = useGetStationAnalyticsQuery(stationId)

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm animate-pulse">
        <div className="h-5 w-48 rounded bg-emerald-100" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-2xl bg-slate-50" />)}
        </div>
        <div className="h-44 w-full rounded-2xl bg-slate-50" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
        Analytics data is unavailable.
      </div>
    )
  }

  const analytics = res?.data
  if (!analytics) return null

  const { hasData, overview, byDayOfWeek, byHourOfDay, accuracyDistribution } = analytics

  if (!hasData) {
    return (
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
        <BarChart2 className="mx-auto h-8 w-8 text-slate-400" />
        <p className="text-sm text-slate-600">No community data yet for this station.</p>
        <p className="text-xs text-slate-500">Submit the first solar report to start building the station analytics profile.</p>
      </div>
    )
  }

  const chartData = buildTrendData(analytics)
  const bestDay = getBestAggregate(byDayOfWeek)
  const bestHour = getBestAggregate(byHourOfDay)

  return (
    <div className="space-y-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-[#1a6b3c]" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Crowdsourced Analytics</p>
        <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          {overview.totalReports} report{overview.totalReports !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatBadge label="Avg Solar Score" value={overview.avgSolarScore.toFixed(0)} sub="out of 100" />
        <StatBadge
          label="Avg Accuracy"
          value={`${overview.avgAccuracyPct.toFixed(0)}%`}
          sub="actual vs estimate"
        />
        <StatBadge label="Avg Est. Output" value={`${overview.avgEstimatedOutputKw.toFixed(2)} kW`} />
        <StatBadge
          label="Avg Actual"
          value={`${overview.avgActualOutputKw.toFixed(2)} kW`}
          sub="manual report readings"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Best day</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{bestDay ? formatDayLabel(bestDay._id) : 'N/A'}</p>
          <p className="text-xs text-slate-500">Avg score {bestDay?.avgScore.toFixed(0) ?? '0'} from {bestDay?.count ?? 0} reports</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Best hour</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{bestHour ? formatHourLabel(bestHour._id) : 'N/A'}</p>
          <p className="text-xs text-slate-500">Avg score {bestHour?.avgScore.toFixed(0) ?? '0'} from {bestHour?.count ?? 0} reports</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Best recorded score</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{overview.maxSolarScore.toFixed(0)} / 100</p>
          <p className="text-xs text-slate-500">Lowest recorded score {overview.minSolarScore.toFixed(0)} / 100</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contributed readings</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{overview.totalReports}</p>
          <p className="text-xs text-slate-500">Published public reports in analytics</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-slate-500">30-day daily average solar score</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ea" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                name="Avg Score"
                fill="#1a6b3c"
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {accuracyDistribution.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Accuracy distribution</p>
          <div className="flex flex-wrap gap-2">
            {accuracyDistribution.map((bucket) => (
              <span
                key={String(bucket._id)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
              >
                {formatAccuracyBucket(bucket._id)} · {bucket.count} report{bucket.count !== 1 ? 's' : ''} · avg score {bucket.avgScore.toFixed(0)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
