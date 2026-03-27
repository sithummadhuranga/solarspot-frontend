/**
 * SolarReportCard — single solar report summary card.
 *
 * Displays estimated vs actual output, solar score, weather conditions,
 * and observation notes. Includes publish/delete actions for the report owner.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
import { useState } from 'react'
import { Cloud, Thermometer, Wind, Sun, Trash2, Globe, Lock, CheckCircle } from 'lucide-react'
import type { SolarReport } from '@/types/solar.types'
import { useDeleteSolarReportMutation, usePublishSolarReportMutation } from './solarApi'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'

interface Props {
  report: SolarReport
}

const scoreColour = (score: number) =>
  score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-lime-700' : score >= 40 ? 'text-amber-700' : 'text-rose-700'

const accuracyTone = (label?: string) => {
  switch (label) {
    case 'Overperforming':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'Accurate':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'Slightly Under':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'Underperforming':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

export function SolarReportCard({ report }: Props) {
  const { user } = useAuth()
  const ownerId = typeof report.submittedBy === 'object' ? report.submittedBy._id : report.submittedBy
  const isOwner = user?._id === ownerId
  const submitterName = typeof report.submittedBy === 'object' ? report.submittedBy.displayName : 'Community member'

  const [deleteReport]  = useDeleteSolarReportMutation()
  const [publishReport] = usePublishSolarReportMutation()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    try { await deleteReport(report._id).unwrap() }
    catch (e: unknown) { setError((e as { data?: { message?: string } })?.data?.message ?? 'Delete failed') }
  }

  const handlePublish = async () => {
    try { await publishReport(report._id).unwrap() }
    catch (e: unknown) { setError((e as { data?: { message?: string } })?.data?.message ?? 'Publish failed') }
  }

  const w = report.weatherSnapshot

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-200">
      <div className="flex items-start justify-between gap-2">
        <div>
          <time className="text-xs text-slate-500">{formatDate(report.visitedAt)}</time>
          <p className="mt-1 text-sm font-semibold text-slate-900">{submitterName}</p>
          <div className="mt-1 flex items-center gap-1.5">
            {report.status === 'published'
              ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              : <span className="text-[11px] font-medium text-amber-600">Draft</span>}
            {report.isPublic
              ? <Globe className="h-3.5 w-3.5 text-slate-500" />
              : <Lock  className="h-3.5 w-3.5 text-slate-400" />}
            <span className="text-[11px] text-slate-500">{report.isPublic ? 'Public report' : 'Private report'}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right ring-1 ring-slate-200">
          <p className={`text-3xl font-black tabular-nums ${scoreColour(report.solarScore)}`}>
            {report.solarScore}
            <span className="text-xs font-normal text-slate-400">/100</span>
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Solar score</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <div>
          <span className="text-xs text-slate-500">Est.</span>
          <span className="ml-1 font-semibold text-slate-900">{report.estimatedOutputKw} kW</span>
        </div>
        {report.actualOutputKw !== null && (
          <div>
            <span className="text-xs text-slate-500">Actual</span>
            <span className="ml-1 font-semibold text-emerald-700">{report.actualOutputKw} kW</span>
          </div>
        )}
        {report.accuracyPct !== null && (
          <div>
            <span className="text-xs text-slate-500">Accuracy</span>
            <span className="ml-1 font-semibold text-sky-700">{report.accuracyPct}%</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Thermometer className="h-3 w-3" />{w.temperatureC}°C
        </span>
        <span className="flex items-center gap-1">
          <Cloud className="h-3 w-3" />{w.cloudCoverPct}%
        </span>
        <span className="flex items-center gap-1">
          <Sun className="h-3 w-3" />UV {w.uvIndex.toFixed(1)}
        </span>
        <span className="flex items-center gap-1">
          <Wind className="h-3 w-3" />{w.windSpeedKph} km/h
        </span>
        <span className="text-slate-500">{w.weatherMain}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${accuracyTone(report.accuracyLabel)}`}>
          {report.accuracyLabel ?? 'No Data'}
        </span>
        {w.isFallback && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            Fallback weather snapshot
          </span>
        )}
      </div>

      {report.notes && (
        <p className="border-t border-slate-200 pt-2 text-sm italic text-slate-600">{report.notes}</p>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {isOwner && (
        <div className="flex gap-2 border-t border-slate-200 pt-1">
          {report.status === 'draft' && (
            <button
              onClick={handlePublish}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-600"
            >
              Publish
            </button>
          )}
          <button
            onClick={handleDelete}
            className="ml-auto flex items-center gap-1 text-xs text-rose-700 hover:text-rose-600"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
