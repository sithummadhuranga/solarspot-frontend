import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Plus,
  ShieldCheck,
  SunMedium,
  Zap,
} from 'lucide-react'
import { Layout } from '@/components/shared/Layout'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { getSafeText } from '@/lib/auth'
import { useListStationsQuery } from '@/features/stations/stationsApi'
import {
  useGetLiveWeatherQuery,
  useGetSolarReportsQuery,
  useGetStationAnalyticsQuery,
} from '@/features/weather/solarApi'
import type { Station } from '@/types/station.types'
import type { SolarReport } from '@/types/solar.types'

function formatDate(value?: string | null) {
  if (!value) return 'Unavailable'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unavailable'

  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
  }).format(parsed)
}

function stationName(station: Station | string) {
  return typeof station === 'string' ? 'Station' : station.name
}

function reportStationName(report: SolarReport) {
  return typeof report.station === 'string' ? 'Station report' : report.station.name
}

function statusBadge(status: Station['status']) {
  if (status === 'active') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  if (status === 'pending') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  if (status === 'rejected') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

function roleLabel(role: string | null) {
  if (role === 'admin') return 'Administrator'
  if (role === 'moderator') return 'Moderator'
  if (role === 'user') return 'Community member'
  return 'User'
}

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string
  value: string
  detail: string
  icon: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-[linear-gradient(145deg,#f7fee7_0%,#ffffff_55%,#ecfccb_100%)] p-5 shadow-[0_12px_30px_rgba(19,60,29,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/80">{title}</p>
          <p className="mt-3 text-3xl font-black text-[#133c1d]">{value}</p>
          <p className="mt-2 text-sm text-slate-600">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-emerald-700 shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, role, isEmailVerified } = useAuth()
  const userDisplayName = getSafeText(user?.displayName) || 'Explorer'

  const { data: stationResponse, isLoading: stationsLoading } = useListStationsQuery(
    {
      submittedBy: user?._id,
      page: 1,
      limit: 50,
      sortBy: 'newest',
    },
    { skip: !user?._id },
  )

  const { data: reportResponse, isLoading: reportsLoading } = useGetSolarReportsQuery(
    {
      userId: user?._id,
      page: 1,
      limit: 50,
      sort: 'newest',
    },
    { skip: !user?._id },
  )

  const stations = stationResponse?.data ?? []
  const reports = reportResponse?.data ?? []
  const activeStation = stations.find((station) => station.status === 'active' && station.isActive) ?? stations[0]

  const { data: liveWeatherResponse, isLoading: liveWeatherLoading } = useGetLiveWeatherQuery(
    activeStation?._id ?? '',
    { skip: !activeStation?._id },
  )

  const { data: analyticsResponse } = useGetStationAnalyticsQuery(activeStation?._id ?? '', {
    skip: !activeStation?._id,
  })

  const activeStations = stations.filter((station) => station.status === 'active' && station.isActive)
  const pendingStations = stations.filter((station) => station.status === 'pending')
  const featuredStations = stations.filter((station) => station.isFeatured)
  const publishedReports = reports.filter((report) => report.status === 'published')
  const averageRecentScore = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + report.solarScore, 0) / reports.length)
    : 0

  const latestReport = reports[0]
  const liveWeather = liveWeatherResponse?.data
  const analytics = analyticsResponse?.data

  return (
    <Layout showSidebar>
      <PageHeader
        title={`Welcome back, ${userDisplayName}`}
        description="Track your submitted stations, solar reporting activity, and the latest generation outlook from one place."
        actions={
          <>
            <Link
              to="/stations/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#133c1d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f2f17]"
            >
              <Plus className="h-4 w-4" />
              Add Station
            </Link>
            <Link
              to="/weather"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-[#133c1d] transition-colors hover:bg-emerald-50"
            >
              <SunMedium className="h-4 w-4" />
              Open Weather
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Stations"
          value={String(stationResponse?.pagination.total ?? 0)}
          detail={`${activeStations.length} active, ${pendingStations.length} pending review`}
          icon={<MapPin className="h-5 w-5" />}
        />
        <StatCard
          title="Solar Reports"
          value={String(reportResponse?.pagination.total ?? 0)}
          detail={latestReport ? `Latest score ${latestReport.solarScore}/100` : 'No solar reports submitted yet'}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Solar Watch"
          value={liveWeather ? `${liveWeather.solar.solarScore}/100` : '--'}
          detail={
            liveWeather
              ? `${liveWeather.station.name} · ${liveWeather.solar.estimatedOutputKw.toFixed(2)} kW estimated`
              : 'Add or activate a station to see a live solar snapshot'
          }
          icon={<Zap className="h-5 w-5" />}
        />
        <StatCard
          title="Account"
          value={roleLabel(role)}
          detail={isEmailVerified ? 'Email verified and ready for protected features' : 'Verify your email to unlock full access'}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">My stations</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Operational footprint</h2>
              </div>
              <Link to="/my-stations" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{activeStations.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pending</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{pendingStations.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Featured</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{featuredStations.length}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {stationsLoading ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading your submitted stations…</p>
              ) : stations.length > 0 ? (
                stations.slice(0, 4).map((station) => (
                  <Link
                    key={station._id}
                    to={`/stations/${station._id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">{station.name}</p>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(station.status)}`}>
                          {station.status}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {(station.address.city || station.address.formattedAddress || 'Location pending')} · {station.solarPanelKw} kW solar
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  You have not submitted any stations yet. Start by adding your first station so the weather and solar tools can attach to it.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Solar reports</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Recent reporting activity</h2>
              </div>
              <Link to="/solar/reports/mine" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Manage reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Published</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{publishedReports.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Recent average</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{reports.length ? `${averageRecentScore}/100` : '--'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Best current score</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{reports.length ? `${Math.max(...reports.map((report) => report.solarScore))}/100` : '--'}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {reportsLoading ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading your solar reports…</p>
              ) : reports.length > 0 ? (
                reports.slice(0, 4).map((report) => (
                  <Link
                    key={report._id}
                    to="/solar/reports/mine"
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">{reportStationName(report)}</p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(report.visitedAt)} · {report.isPublic ? 'Public report' : 'Private report'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#133c1d]">{report.solarScore}/100</p>
                      <p className="text-xs text-slate-500">{report.accuracyLabel ?? 'No accuracy data'}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                  No solar reports yet. Once you visit a station and submit a report, your latest scores and accuracy trends will appear here.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Solar insight</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{activeStation ? stationName(activeStation) : 'No active station yet'}</h2>

            {activeStation ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-[linear-gradient(140deg,#0f172a_0%,#133c1d_55%,#1f5f30_100%)] p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/80">Live output outlook</p>
                      <p className="mt-3 text-4xl font-black">{liveWeather ? `${liveWeather.solar.solarScore}/100` : '--'}</p>
                      <p className="mt-2 text-sm text-emerald-50/85">
                        {liveWeather
                          ? `${liveWeather.solar.estimatedOutputKw.toFixed(2)} kW estimated under ${liveWeather.weather.weatherMain.toLowerCase()} conditions`
                          : liveWeatherLoading
                            ? 'Loading live solar conditions…'
                            : 'Live weather will appear once data is available.'}
                      </p>
                    </div>
                    <SunMedium className="mt-1 h-6 w-6 text-emerald-200" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Analytics reports</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{analytics?.overview.totalReports ?? 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Average station score</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {analytics?.hasData ? `${Math.round(analytics.overview.avgSolarScore)}/100` : '--'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    {(activeStation.address.city || activeStation.address.formattedAddress || 'Location not specified')}
                  </div>
                  <p className="mt-2">
                    {liveWeather?.weather.isFallback
                      ? 'Showing fallback weather data because the external forecast source is unavailable right now.'
                      : 'Using the latest live weather payload from the solar intelligence service.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                Submit a station first, then the dashboard can surface live solar conditions and analytics for it.
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Profile snapshot</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Account health</h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Email status</span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CheckCircle2 className={`h-4 w-4 ${isEmailVerified ? 'text-emerald-600' : 'text-amber-500'}`} />
                  {isEmailVerified ? 'Verified' : 'Verification pending'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Role</span>
                <span className="text-sm font-semibold text-slate-900">{roleLabel(role)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Joined</span>
                <span className="text-sm font-semibold text-slate-900">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-500">Last login</span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  {formatDate(user?.lastLoginAt)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Quick actions</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">What next</h2>

            <div className="mt-5 space-y-3">
              <Link to="/my-stations" className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50">
                <div>
                  <p className="font-semibold text-slate-900">Review my stations</p>
                  <p className="mt-1 text-sm text-slate-500">Check status, featured visibility, and moderation progress.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link to="/solar/reports/mine" className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50">
                <div>
                  <p className="font-semibold text-slate-900">Manage solar reports</p>
                  <p className="mt-1 text-sm text-slate-500">Update visibility, review scores, and compare output accuracy.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link to="/weather" className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50">
                <div>
                  <p className="font-semibold text-slate-900">Open solar intelligence</p>
                  <p className="mt-1 text-sm text-slate-500">Browse forecasts, analytics, and community reporting from one view.</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              {(role === 'moderator' || role === 'admin') && (
                <Link to="/admin/solar/reports" className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50">
                  <div>
                    <p className="font-semibold text-slate-900">Moderate solar reports</p>
                    <p className="mt-1 text-sm text-slate-500">Archive, restore, and audit community submissions.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}
