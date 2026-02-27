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
import { useAppSelector } from '@/app/hooks'
import { formatDate } from '@/lib/utils'

interface Props {
  report: SolarReport
}

const scoreColour = (score: number) =>
  score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-yellow-400' : score >= 3 ? 'text-orange-400' : 'text-red-400'

export function SolarReportCard({ report }: Props) {
  const user   = useAppSelector((s) => s.auth?.user)
  const ownerId = typeof report.submittedBy === 'object' ? report.submittedBy._id : report.submittedBy
  const isOwner = user?._id === ownerId

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
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3 hover:border-slate-600 transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <time className="text-xs text-slate-400">{formatDate(report.visitedAt)}</time>
          <div className="flex items-center gap-1.5 mt-0.5">
            {report.status === 'published'
              ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              : <span className="text-[11px] text-yellow-500 font-medium">Draft</span>}
            {report.isPublic
              ? <Globe className="h-3.5 w-3.5 text-slate-400" />
              : <Lock  className="h-3.5 w-3.5 text-slate-500" />}
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold tabular-nums ${scoreColour(report.solarScore)}`}>
            {report.solarScore}
            <span className="text-xs text-slate-400 font-normal">/10</span>
          </p>
          <p className="text-xs text-slate-400">solar score</p>
        </div>
      </div>

      {/* Output row */}
      <div className="flex flex-wrap gap-3 text-sm">
        <div>
          <span className="text-slate-400 text-xs">Est.</span>
          <span className="ml-1 font-semibold text-white">{report.estimatedOutputKw} kW</span>
        </div>
        {report.actualOutputKw !== null && (
          <div>
            <span className="text-slate-400 text-xs">Actual</span>
            <span className="ml-1 font-semibold text-emerald-300">{report.actualOutputKw} kW</span>
          </div>
        )}
        {report.accuracyPct !== null && (
          <div>
            <span className="text-slate-400 text-xs">Accuracy</span>
            <span className="ml-1 font-semibold text-blue-300">{report.accuracyPct}%</span>
          </div>
        )}
      </div>

      {/* Weather snapshot */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
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

      {/* Notes */}
      {report.notes && (
        <p className="text-xs text-slate-400 italic border-t border-slate-700/60 pt-2">{report.notes}</p>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Owner actions */}
      {isOwner && (
        <div className="flex gap-2 pt-1 border-t border-slate-700/60">
          {report.status === 'draft' && (
            <button
              onClick={handlePublish}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Publish
            </button>
          )}
          <button
            onClick={handleDelete}
            className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
