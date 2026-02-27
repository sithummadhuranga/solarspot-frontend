/**
 * AddReportForm — Create a new crowdsourced solar observation report.
 *
 * Requires authentication; form is disabled when user is not logged in.
 * Auto-fetches live weather on submit — user only needs to supply optional
 * actualOutputKw and notes.
 *
 * Owner: Member 3 · Ref: SolarIntelligence_Module_Prompt.md → A6
 */
import { useState } from 'react'
import { useCreateSolarReportMutation } from './solarApi'
import type { CreateReportDto } from '@/types/solar.types'
import { useAppSelector } from '@/app/hooks'

interface Props {
  stationId:    string
  onSuccess?:   () => void
}

export function AddReportForm({ stationId, onSuccess }: Props) {
  const user    = useAppSelector((s) => s.auth?.user)
  const isAuthed = Boolean(user)

  const [actualOutputKw, setActualOutputKw] = useState('')
  const [notes,          setNotes]          = useState('')
  const [isPublic,       setIsPublic]       = useState(true)
  const [formError,      setFormError]      = useState<string | null>(null)

  const [createReport, { isLoading }] = useCreateSolarReportMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    try {
      const dto: CreateReportDto = {
        stationId,
        isPublic,
        notes:         notes.trim() || null,
        actualOutputKw: actualOutputKw ? parseFloat(actualOutputKw) : undefined,
      }
      await createReport(dto).unwrap()
      setActualOutputKw('')
      setNotes('')
      onSuccess?.()
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message
      setFormError(msg ?? 'Submission failed. Please try again.')
    }
  }

  if (!isAuthed) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 text-sm text-slate-400">
        Sign in to submit a solar observation report.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 space-y-4"
    >
      <p className="text-xs uppercase tracking-widest text-slate-400">Add Solar Report</p>
      <p className="text-sm text-slate-300">
        Live weather will be captured automatically. Optionally provide your actual panel reading.
      </p>

      {formError && (
        <div className="rounded-lg border border-red-800/60 bg-red-900/20 px-3 py-2 text-sm text-red-400">
          {formError}
        </div>
      )}

      <div>
        <label className="block text-xs text-slate-400 mb-1" htmlFor="actualOutputKw">
          Actual Output (kW) <span className="text-slate-600">— optional</span>
        </label>
        <input
          id="actualOutputKw"
          type="number"
          step="0.01"
          min="0"
          value={actualOutputKw}
          onChange={(e) => setActualOutputKw(e.target.value)}
          placeholder="e.g. 3.80"
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1" htmlFor="notes">
          Notes <span className="text-slate-600">— optional</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything unusual? Shade, dust, panel maintenance…"
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPublic"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-slate-600 bg-slate-700 accent-emerald-500"
        />
        <label htmlFor="isPublic" className="text-sm text-slate-300">
          Share publicly with the SolarSpot community
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Submitting…' : 'Submit Report'}
      </button>
    </form>
  )
}
