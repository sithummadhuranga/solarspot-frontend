import { Link } from 'react-router-dom'
import { MapPin, Sun, Zap, Star, ArrowDown, Phone, Leaf, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStationsList } from '@/hooks/useStations'
import { StationCard } from '@/components/stations/StationCard'

import carSvg from '@/assets/images/car.svg'
import chargingStationSvg from '@/assets/images/charging station.svg'



export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const {
    data: featuredData,
    isLoading: featuredLoading,
  } = useStationsList({ sortBy: 'featured', limit: 6, page: 1, isVerified: true })
  const featuredStations = featuredData?.data ?? []

  return (
    <div className="overflow-x-hidden bg-white">

      {}
      <div className="bg-[#0b2614] text-center text-[0.78rem] font-medium tracking-wide text-white/70 py-2.5 px-4">
        🌞 Book Online &nbsp;·&nbsp; Request a booking (pending confirmation) within 24 hours
      </div>

      {}
      <nav className="relative z-50 border-b border-white/10 bg-transparent">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">

          {}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8cc63f] shadow-lg shadow-[#8cc63f]/20 transition-transform group-hover:scale-105">
              <Sun className="h-5 w-5 text-[#0b2614]" />
            </div>
            <span className="font-sg text-xl font-extrabold tracking-tight text-[#0b2614]">
              SolarSpot
            </span>
          </Link>

          {}
          <div className="hidden lg:flex items-center gap-7">
            {[
              { label: 'Home', href: '#hero' },
              { label: 'About', href: '#about' },
              { label: 'Stations', to: '/stations' },
              { label: 'Weather', to: '/weather' },
              { label: 'Contact', href: '#footer' },
            ].map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to}
                  className="text-[0.88rem] font-semibold text-[#133c1d]/80 hover:text-[#133c1d] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href}
                  className="text-[0.88rem] font-semibold text-[#133c1d]/80 hover:text-[#133c1d] transition-colors"
                >
                  {item.label}
                </a>
              )
            )}
          </div>

          {}
          <div className="flex items-center gap-3 shrink-0">
            {}
            <div className="hidden md:flex items-center gap-2.5 text-[#133c1d] mr-2">
              <Phone className="h-4 w-4 text-[#1a6b3c]" />
              <div className="leading-tight">
                <div className="text-[0.65rem] font-medium text-[#133c1d]/50 uppercase tracking-wider">Call us</div>
                <div className="text-[0.82rem] font-bold">(+94) 11 234 5678</div>
              </div>
            </div>

            {!isAuthenticated && (
              <Link to="/login"
                className="hidden sm:inline-flex text-[0.85rem] font-bold text-[#133c1d] px-4 py-2 rounded-xl border-2 border-[#133c1d]/15 hover:border-[#133c1d]/30 transition-colors"
              >
                Log in
              </Link>
            )}

            <Link to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-1.5 bg-[#133c1d] text-white px-5 py-2.5 rounded-xl text-[0.85rem] font-sg font-bold shadow-lg shadow-[#133c1d]/20 hover:bg-[#0b2614] transition-all hover:shadow-xl hover:shadow-[#133c1d]/25 active:scale-[0.98]"
            >
              {isAuthenticated ? 'Dashboard' : 'Get Started'} <span className="text-[#8cc63f]">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {}
      {}
      {}
      <section id="hero" className="relative overflow-hidden bg-[#8cc63f]">

        {}
        <div className="hero-orb w-[600px] h-[600px] bg-[#97cf42] -top-[15%] -right-[8%] opacity-60" />
        <div className="hero-orb w-[480px] h-[480px] bg-[#a2d94d] top-[5%] right-[4%] opacity-50" style={{ animationDelay: '2s' }} />
        <div className="hero-orb w-[350px] h-[350px] bg-[#afde5a] top-[15%] right-[12%] opacity-40" style={{ animationDelay: '4s' }} />

        {}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4 pt-12 pb-40 lg:pt-16 lg:pb-48 min-h-[60vh] lg:min-h-[80vh]">

            {}
            <div className="w-full lg:w-[48%] lg:shrink-0">
              <h1 className="font-sg font-extrabold tracking-tight leading-[1.05]"
                style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)' }}
              >
                <span className="block text-white drop-shadow-sm">Premium Power Of</span>
                <span className="block text-[#133c1d]">The Charging Future</span>
              </h1>

              <p className="mt-5 text-white/85 font-medium leading-relaxed max-w-[460px]"
                style={{ fontSize: 'clamp(0.92rem, 2vw, 1.05rem)' }}
              >
                Experience the future of electric vehicle charging. Fast, reliable,
                and 100% solar-powered — the greenest way to charge your EV in Sri Lanka.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={isAuthenticated ? '/stations' : '/register'}
                  className="inline-flex items-center gap-2 bg-[#133c1d] text-white px-7 py-3.5 rounded-2xl font-sg font-bold text-[0.95rem] shadow-xl shadow-black/20 hover:bg-[#0b2614] transition-all hover:shadow-2xl active:scale-[0.97]"
                >
                  Explore Stations <span className="text-[#8cc63f]">→</span>
                </Link>
                <Link to="/map"
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl font-sg font-bold text-[0.95rem] border border-white/20 hover:bg-white/25 transition-all"
                >
                  <MapPin className="h-4 w-4" /> View Map
                </Link>
              </div>

              {}
              <div className="mt-8 flex items-center gap-4 text-[0.78rem] font-semibold text-white/60 tracking-wide">
                {['FB', 'TW', 'YT', 'LD'].map((s) => (
                  <a key={s} href="#" className="hover:text-white transition-colors">{s}</a>
                ))}
                <span className="w-6 h-px bg-white/20" />
                <span>Follow Us</span>
              </div>
            </div>

            {}
            <div className="relative w-full lg:w-[52%] lg:flex-1 h-[280px] sm:h-[360px] lg:h-[520px] xl:h-[560px]">
              <img
                src={carSvg}
                alt="Electric vehicle at solar charging station"
                className="absolute bottom-0 right-[-5%] lg:right-[-8%] w-[110%] lg:w-[160%] xl:w-[180%] h-auto drop-shadow-[0_24px_40px_rgba(0,0,0,0.22)]"
              />
            </div>
          </div>
        </div>

        {}
        <div className="absolute bottom-[-2px] left-0 w-full z-20" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 110" className="block w-full" style={{ height: 'clamp(60px, 8vw, 100px)' }} preserveAspectRatio="none">
            <path d="M0,110 L0,0 Q720,160 1440,0 L1440,110 Z" fill="#fafdf7" />
          </svg>
          {}
          <a href="#about"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-[#133c1d] shadow-xl shadow-black/20 hover:bg-[#0b2614] transition-all animate-bounce"
            style={{ bottom: 'clamp(18px, 3vw, 30px)' }}
          >
            <ArrowDown className="h-5 w-5 text-[#8cc63f]" />
          </a>
        </div>
      </section>

      {}
      {}
      {}
      <section id="about" className="bg-[#fafdf7]" style={{ padding: 'clamp(5rem, 10vw, 8rem) 0 clamp(3.5rem, 7vw, 5.5rem)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 lg:gap-16">

            {}
            <div className="w-48 sm:w-56 lg:w-[420px] xl:w-[520px] shrink-0 flex justify-center">
              <img
                src={chargingStationSvg}
                alt="Solar EV charging station"
                className="w-full h-auto drop-shadow-[16px_24px_30px_rgba(0,0,0,0.15)]"
              />
            </div>

            {}
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-2 text-[0.72rem] font-sg font-bold text-[#1a6b3c] uppercase tracking-[0.15em] mb-3">
                <span className="w-2 h-2 rounded-full bg-[#8cc63f]" /> About Us
              </span>
              <h2 className="font-sg font-extrabold text-[#0f172a] leading-[1.1] tracking-tight mb-4"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)' }}
              >
                Driving Innovation{' '}
                <span className="text-gradient-animated">In Every Charge</span>
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed max-w-[540px] mb-8"
                style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}
              >
                SolarSpot connects EV drivers with the largest network of solar charging stations,
                helping you discover, rate, and share the best charging experiences.
              </p>

              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: MapPin,    title: 'Geospatial Discovery', desc: 'Interactive map to find solar stations near you — search by distance & availability.', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Sun,       title: 'Solar Intelligence',    desc: 'Real-time solar forecasts so you know the best charging windows.',                     color: 'text-amber-600', bg: 'bg-amber-50' },
                  { icon: Star,      title: 'Community Ratings',     desc: 'Rate and review stations to help EV drivers find top experiences.',                    color: 'text-purple-600', bg: 'bg-purple-50' },
                  { icon: Leaf,      title: 'Eco-Friendly Network',  desc: 'Every station runs on 100% clean solar energy — charge guilt-free.',                   color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((f) => (
                  <div key={f.title}
                    className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-glow"
                  >
                    <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform duration-300`}>
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="font-sg font-bold text-[0.95rem] text-[#0f172a] mb-1.5">{f.title}</h3>
                    <p className="text-[0.84rem] font-medium text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      {}
      {}
      <section className="relative mesh-gradient noise-overlay py-16">
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: '150+',  label: 'Solar Stations',  icon: Zap },
              { num: '5K+',   label: 'Active Drivers',  icon: BarChart3 },
              { num: '100%',  label: 'Eco Friendly',    icon: Leaf },
              { num: '24/7',  label: 'Weather Updates',  icon: Sun },
            ].map((s) => (
              <div key={s.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4 group-hover:bg-white/15 transition-colors">
                  <s.icon className="h-5 w-5 text-[#8cc63f]" />
                </div>
                <div className="font-sg font-extrabold text-[#8cc63f] tracking-tight"
                  style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)' }}
                >
                  {s.num}
                </div>
                <div className="text-[0.78rem] font-medium text-white/50 mt-1 uppercase tracking-[0.1em]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      {}
      {}
      <section className="bg-[#fafdf7]" style={{ padding: 'clamp(3.5rem, 7vw, 5.5rem) 0' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 text-[0.72rem] font-sg font-bold text-[#1a6b3c] uppercase tracking-[0.15em] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#8cc63f]" /> Featured Stations
              </span>
              <h2 className="font-sg font-extrabold text-[#0f172a] tracking-tight"
                style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2rem)' }}
              >
                Top Solar Charging Spots
              </h2>
            </div>
            <Link to="/stations"
              className="inline-flex items-center gap-1.5 font-sg font-bold text-[0.88rem] text-[#1a6b3c] hover:text-[#133c1d] transition-colors group"
            >
              View all stations <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[320px] rounded-2xl bg-[#eaf6df] animate-pulse" />
              ))}
            </div>
          ) : featuredStations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredStations.map((station) => (
                <StationCard key={station._id} station={station} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#dcfce7] bg-white p-6 text-center text-gray-500 font-medium text-sm">
              Featured stations will appear here once they are approved and marked as featured.
            </div>
          )}
        </div>
      </section>

      {}
      {}
      {}
      {!isAuthenticated && (
        <section className="relative overflow-hidden" style={{ padding: 'clamp(4rem, 8vw, 6.5rem) 0' }}>
          {}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7]/60 to-[#f0fdf4]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1a6b3c 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />

          <div className="relative z-10 mx-auto max-w-[640px] px-6 text-center">
            <h2 className="font-sg font-extrabold text-[#133c1d] tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)' }}
            >
              Ready to Power Up?
            </h2>
            <p className="text-[#166534]/80 font-medium leading-relaxed max-w-[480px] mx-auto mb-8"
              style={{ fontSize: 'clamp(0.92rem, 2vw, 1.05rem)' }}
            >
              Join thousands of EV drivers discovering the best solar-powered charging stations across Sri Lanka.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-[#133c1d] text-white px-7 py-3.5 rounded-2xl font-sg font-bold text-[0.95rem] shadow-xl shadow-[#133c1d]/25 hover:bg-[#0b2614] transition-all active:scale-[0.97]"
              >
                Create Free Account <span className="text-[#8cc63f]">→</span>
              </Link>
              <Link to="/stations"
                className="inline-flex items-center gap-2 bg-white text-[#133c1d] px-7 py-3.5 rounded-2xl font-sg font-bold text-[0.95rem] border-2 border-[#dcfce7] shadow-sm hover:border-[#8cc63f]/40 hover:shadow-md transition-all"
              >
                Browse Stations
              </Link>
            </div>
          </div>
        </section>
      )}

      {}
      {}
      {}
      <footer id="footer" className="bg-[#071a0e]" style={{ padding: 'clamp(3rem, 6vw, 4.5rem) 0 2rem' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8cc63f]/20">
                  <Sun className="h-4 w-4 text-[#8cc63f]" />
                </div>
                <span className="font-sg font-extrabold text-white text-lg tracking-tight">SolarSpot</span>
              </div>
              <p className="text-[0.82rem] text-white/35 leading-relaxed">
                Discover, submit, and rate solar-powered charging stations across Sri Lanka.
              </p>
            </div>

            {}
            <div>
              <h4 className="font-sg font-bold text-[0.7rem] text-white/70 uppercase tracking-[0.14em] mb-5">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Stations', to: '/stations' },
                  { label: 'Weather', to: '/weather' },
                  { label: 'Dashboard', to: '/dashboard' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[0.85rem] text-white/35 hover:text-white/70 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {}
            <div>
              <h4 className="font-sg font-bold text-[0.7rem] text-white/70 uppercase tracking-[0.14em] mb-5">Account</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Log In', to: '/login' },
                  { label: 'Sign Up', to: '/register' },
                  { label: 'Profile', to: '/profile' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[0.85rem] text-white/35 hover:text-white/70 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {}
            <div>
              <h4 className="font-sg font-bold text-[0.7rem] text-white/70 uppercase tracking-[0.14em] mb-5">Contact</h4>
              <div className="space-y-2.5 text-[0.85rem] text-white/35">
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[#8cc63f]/50" /> Colombo, Sri Lanka</div>
                <div className="flex items-center gap-2"><span className="text-[0.75rem]">✉</span> info@solarspot.app</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[#8cc63f]/50" /> (+94) 11 234 5678</div>
              </div>
            </div>
          </div>

          {}
          <div className="border-t border-white/[0.06] pt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[0.75rem] text-white/20">
              © {new Date().getFullYear()} SolarSpot. All rights reserved.
            </span>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service'].map((t) => (
                <a key={t} href="#" className="text-[0.75rem] text-white/20 hover:text-white/40 transition-colors">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
