/**
 * StationAnalyticsPanel — Aggregated crowdsourced solar analytics for a station.
 *
 * Shows: average score, accuracy, estimated vs actual output, and a
 * 30-day trend bar chart of daily average solar scores.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
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

interface Props {
  stationId: string
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

function StatBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-slate-700/50 border border-slate-600 p-3 text-center">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  )
}

export function StationAnalyticsPanel({ stationId }: Props) {
  const { data: res, isLoading, isError } = useGetStationAnalyticsQuery(stationId)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 animate-pulse space-y-3">
        <div className="h-5 w-48 rounded bg-slate-700" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1,2,3,4].map((i) => <div key={i} className="h-16 rounded-lg bg-slate-700" />)}
        </div>
        <div className="h-40 w-full rounded bg-slate-700" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-800/60 bg-red-900/20 p-4 text-sm text-red-400">
        ⚠ Analytics data unavailable.
      </div>
    )
  }

  const analytics = res?.data
  if (!analytics) return null

  const { hasData, reportCount, avgSolarScore, avgAccuracyPct, avgEstimatedOutputKw, avgActualOutputKw, last30Days } = analytics

  if (!hasData) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 text-center space-y-2">
        <BarChart2 className="h-8 w-8 mx-auto text-slate-500" />
        <p className="text-sm text-slate-400">No community data yet for this station.</p>
        <p className="text-xs text-slate-500">Submit the first solar report to start tracking analytics!</p>
      </div>
    )
  }

  const chartData = last30Days
    .slice()
    .sort((a, b) => (a._id > b._id ? 1 : -1))
    .map((d) => ({
      date:  d._id.slice(5),          // "MM-DD"
      score: parseFloat(d.avgScore.toFixed(1)),
      count: d.reportCount,
    }))

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-emerald-400" />
        <p className="text-xs uppercase tracking-widest text-slate-400">Crowdsourced Analytics</p>
        <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          {reportCount} report{reportCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatBadge label="Avg Solar Score" value={avgSolarScore.toFixed(1)} sub="out of 10" />
        <StatBadge
          label="Avg Accuracy"
          value={avgAccuracyPct !== null ? `${avgAccuracyPct.toFixed(0)}%` : 'N/A'}
          sub="vs estimate"
        />
        <StatBadge label="Avg Est. Output" value={`${avgEstimatedOutputKw.toFixed(2)} kW`} />
        <StatBadge
          label="Avg Actual"
          value={avgActualOutputKw !== null ? `${avgActualOutputKw.toFixed(2)} kW` : 'N/A'}
        />
      </div>

      {/* 30-day trend */}
      {chartData.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">30-day daily average solar score</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                name="Avg Score"
                fill="#34d399"
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
