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
import { toast } from 'sonner'
import { useCreateSolarReportMutation } from './solarApi'
import type { CreateReportDto } from '@/types/solar.types'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/errors'

interface Props {
  stationId:    string
  onSuccess?:   () => void
}

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function AddReportForm({ stationId, onSuccess }: Props) {
  const { isAuthenticated } = useAuth()

  const [visitedAt, setVisitedAt]      = useState(() => toDateTimeLocalValue(new Date()))
  const [actualOutputKw, setActualOutputKw] = useState('')
  const [notes,          setNotes]          = useState('')
  const [isPublic,       setIsPublic]       = useState(true)
  const [formError,      setFormError]      = useState<string | null>(null)

  const [createReport, { isLoading }] = useCreateSolarReportMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (actualOutputKw && Number.isNaN(Number(actualOutputKw))) {
      setFormError('Actual output must be a valid number.')
      return
    }

    try {
      const dto: CreateReportDto = {
        stationId,
        visitedAt: visitedAt ? new Date(visitedAt).toISOString() : undefined,
        isPublic,
        notes:         notes.trim() || null,
        actualOutputKw: actualOutputKw ? parseFloat(actualOutputKw) : undefined,
      }

      await createReport(dto).unwrap()
      setVisitedAt(toDateTimeLocalValue(new Date()))
      setActualOutputKw('')
      setNotes('')
      setIsPublic(true)
      toast.success('Solar report submitted.')
      onSuccess?.()
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Submission failed. Please try again.')
      setFormError(message)
      toast.error(message)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-900">Sign in to submit a solar observation report.</p>
        <p className="mt-1">
          Private and public report submission is available for authenticated users only.
          {' '}
          <Link to="/login" className="font-semibold text-[#1a6b3c] underline">
            Go to login
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Add Solar Report</p>
        <p className="text-sm text-slate-600">
          SolarSpot captures live weather automatically. You only need to add your measured output and any useful field notes.
        </p>
        <p className="text-xs text-slate-500">One report per station per day is allowed.</p>
      </div>

      {formError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {formError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" htmlFor="visitedAt">
            Visit time
          </label>
          <input
            id="visitedAt"
            type="datetime-local"
            max={toDateTimeLocalValue(new Date())}
            value={visitedAt}
            onChange={(e) => setVisitedAt(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-[#8cc63f] focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/25"
          />
          <p className="mt-1 text-xs text-slate-500">Use the time you visited the station so the report lines up with the weather snapshot.</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" htmlFor="actualOutputKw">
            Actual Output (kW)
          </label>
          <input
            id="actualOutputKw"
            type="number"
            step="0.01"
            min="0"
            value={actualOutputKw}
            onChange={(e) => setActualOutputKw(e.target.value)}
            placeholder="e.g. 3.80"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#8cc63f] focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/25"
          />
          <p className="mt-1 text-xs text-slate-500">Leave blank if you only want to contribute the weather snapshot.</p>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-slate-700 lg:col-span-2">
          <input
            id="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1a6b3c]"
          />
          <span>
            <span className="block font-semibold text-slate-900">Share publicly</span>
            <span className="text-xs text-slate-500">Public reports appear in community analytics and report feeds.</span>
          </span>
        </label>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything unusual? Shade, dust, panel maintenance…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#8cc63f] focus:outline-none focus:ring-2 focus:ring-[#8cc63f]/25"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span>Optional context helps moderators and other drivers understand unusual output readings.</span>
          <span>{notes.length}/500</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-[#1a6b3c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15552f] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Submitting…' : 'Submit Report'}
      </button>
    </form>
  )
}
