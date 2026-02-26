import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

import carSvg from '@/assets/images/car.svg'
import chargingStationSvg from '@/assets/images/charging station.svg'

const SG = "'Space Grotesk', sans-serif"
const IN = "'Inter', sans-serif"

/* ─────────────────────────────────────────────────────────────────────────── */
/* Responsive injection — ensures the layout works at every breakpoint.        */
/* We inject a <style> block once so we don't need Tailwind for responsive CSS */
const RESPONSIVE_CSS = `
  /* ── Base (mobile-first) ── */
  .lp-hero-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2rem;
    min-height: unset;
    padding-top: 2.5rem;
    padding-bottom: 160px;
  }
  .lp-hero-text { width: 100%; max-width: 100%; }
  .lp-hero-car-wrap {
    position: relative;
    width: 100%;
    height: 260px;
    overflow: visible;
  }
  .lp-hero-car {
    position: absolute;
    bottom: 5px; /* raised slightly */
    right: -5%;
    width: 110%;
    height: auto;
    filter: drop-shadow(0 24px 40px rgba(0,0,0,0.22));
  }
  .lp-nav-middle { display: none; }
  .lp-nav-right { display: none; }
  .lp-nav-auth { display: flex; }
  .lp-circles div { display: none; }

  /* ── Tablet ≥ 768px ── */
  @media (min-width: 768px) {
    .lp-hero-inner {
      flex-direction: row;
      align-items: center;
      min-height: 75vh;
      gap: 1rem;
      padding-top: 3rem;
    }
    .lp-hero-text { width: 50%; max-width: 52%; flex-shrink: 0; }
    .lp-hero-car-wrap { width: 50%; height: 400px; }
    .lp-hero-car { width: 120%; right: -10%; }
    .lp-nav-right { display: flex; }
    .lp-nav-auth { display: none; }
    .lp-circles div { display: block; }
  }

  /* ── Desktop ≥ 1024px ── */
  @media (min-width: 1024px) {
    .lp-hero-inner { gap: 2rem; min-height: 82vh; }
    .lp-hero-text { width: 45%; max-width: 45%; }
    .lp-hero-car-wrap { height: 580px; }
    .lp-hero-car { width: 175%; right: -8%; bottom: 15px; } /* moved up and left */
    .lp-nav-middle { display: flex; }
  }

  /* ── Wide ≥ 1280px ── */
  @media (min-width: 1280px) {
    .lp-hero-car { width: 195%; right: -10%; bottom: 25px; } /* moved up and left */
    .lp-hero-car-wrap { height: 600px; }
  }

  /* About section responsive */
  .lp-about-cols {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: center;
  }
  .lp-charger-col { width: 180px; }
  .lp-about-text-col { width: 100%; }
  .lp-features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 640px) {
    .lp-features-grid { grid-template-columns: 1fr 1fr; }
    .lp-charger-col { width: 200px; }
  }
  @media (min-width: 900px) {
    .lp-about-cols { flex-direction: row; align-items: flex-end; }
    .lp-charger-col { width: 260px; flex-shrink: 0; }
    .lp-about-text-col { flex: 1; }
    .lp-features-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (min-width: 1100px) {
    .lp-charger-col { width: 480px; }
  }
  @media (min-width: 1280px) {
    .lp-charger-col { width: 560px; }
  }

  /* Stats grid responsive */
  .lp-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    text-align: center;
  }
  @media (min-width: 768px) {
    .lp-stats-grid { grid-template-columns: repeat(4, 1fr); }
  }

  /* Typography scale */
  .lp-h1 {
    font-size: clamp(1.9rem, 5.5vw, 3.6rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-weight: 800;
    margin: 0;
    font-family: ${SG};
  }

  /* Scroll bounce animation */
  @keyframes lp-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(6px); }
  }
  .lp-arrow-btn { animation: lp-bounce 2s ease-in-out infinite; }

  /* Card hover */
  .lp-card {
    background: #fff;
    border-radius: 20px;
    padding: 1.75rem 1.5rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.04);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .lp-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 55px rgba(26,107,60,0.14);
  }
`

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div style={{ fontFamily: IN, background: '#8cc63f', overflowX: 'hidden' }}>
      <style>{RESPONSIVE_CSS}</style>

      {/* ── Top Bar ── */}
      <div style={{
        background: '#3b7012', color: '#fff', fontSize: '0.8rem',
        padding: '0.55rem 0', textAlign: 'center', fontFamily: IN, letterSpacing: '0.01em'
      }}>
        Book Online &nbsp;|&nbsp; You can request booking (pending confirmation) in 24 hours
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position: 'relative', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{ fontSize: '1.6rem' }}>🌞</span>
            <span style={{ fontFamily: SG, fontWeight: 800, fontSize: '1.35rem', color: '#133c1d', letterSpacing: '-0.02em' }}>SolarSpot</span>
          </Link>

          {/* Nav Links — hidden on mobile */}
          <div className="lp-nav-middle" style={{ alignItems: 'center', gap: '1.5rem' }}>
            {[
              { label: '• Home', href: '#hero' },
              { label: 'About Us', href: '#about' },
              { label: 'Services', to: '/stations' },
              { label: 'Gallery', to: '/stations' },
              { label: 'Blog', to: '/weather' },
              { label: 'Contact Us', href: '#footer' },
            ].map((item, i) =>
              item.to ? (
                <Link key={item.label} to={item.to} style={{ fontFamily: IN, fontWeight: i === 0 ? 700 : 500, fontSize: '0.93rem', color: '#133c1d', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} style={{ fontFamily: IN, fontWeight: i === 0 ? 700 : 500, fontSize: '0.93rem', color: '#133c1d', textDecoration: 'none' }}>
                  {item.label}
                </a>
              )
            )}
          </div>

          {/* Right — Phone + CTA (hidden on mobile, visible on tablets+) */}
          <div className="lp-nav-right" style={{ alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#133c1d' }}>
              <span style={{ fontSize: '1.3rem' }}>📞</span>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 500 }}>Please Make a call</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>(+94) 11 234 5678</div>
              </div>
            </div>
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              style={{
                background: '#1a1a1a', color: '#fff', padding: '0.6rem 1.3rem',
                borderRadius: '10px', fontFamily: SG, fontWeight: 600, fontSize: '0.9rem',
                textDecoration: 'none', whiteSpace: 'nowrap'
              }}
            >
              {isAuthenticated ? 'Dashboard ›' : 'Get a Quote ›'}
            </Link>
          </div>

          {/* Mobile-only small auth buttons */}
          <div className="lp-nav-auth" style={{ alignItems: 'center', gap: '0.5rem' }}>
            {!isAuthenticated && (
              <Link to="/login" style={{ fontFamily: SG, fontWeight: 700, fontSize: '0.85rem', color: '#133c1d', textDecoration: 'none', padding: '0.4rem 0.9rem', border: '2px solid #133c1d', borderRadius: '8px' }}>Login</Link>
            )}
            <Link to={isAuthenticated ? '/dashboard' : '/register'} style={{ background: '#1a1a1a', color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '8px', fontFamily: SG, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              {isAuthenticated ? 'Dashboard' : 'Sign Up'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section id="hero" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Concentric Circles — decorative, visible at tablet+ */}
        <div className="lp-circles">
          <div style={{ position: 'absolute', top: '-18%', right: '-10%', width: '900px', height: '900px', borderRadius: '50%', background: '#97cf42', zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-6%', right: '-3%', width: '700px', height: '700px', borderRadius: '50%', background: '#a2d94d', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '5%', right: '6%', width: '530px', height: '530px', borderRadius: '50%', background: '#afde5a', zIndex: 2, pointerEvents: 'none' }} />
        </div>

        {/* Content */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
          <div className="lp-hero-inner">

            {/* LEFT — Text */}
            <div className="lp-hero-text">
              <h1 className="lp-h1">
                <span style={{ color: '#fff', display: 'block' }}>Premium Power Of The</span>
                <span style={{ color: '#133c1d', display: 'block' }}>Charging And Future Industry</span>
              </h1>

              <p style={{
                fontFamily: IN, fontWeight: 400, fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                color: 'rgba(255,255,255,0.88)', lineHeight: 1.75,
                marginTop: '1.25rem', marginBottom: '2rem', maxWidth: '460px'
              }}>
                Experience the future of electric vehicle charging with our cutting-edge solutions.
                Fast, reliable, and eco-friendly charging stations for your home or business.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
                <Link
                  to={isAuthenticated ? '/stations' : '/register'}
                  style={{
                    background: '#1a1a1a', color: '#fff', padding: '0.8rem 2rem',
                    borderRadius: '10px', fontFamily: IN, fontWeight: 600, fontSize: '0.95rem',
                    textDecoration: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                  }}
                >
                  Book Now &nbsp;›
                </Link>

                {/* Social row */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em' }}>
                  {['FB', 'TW', 'YT', 'LD'].map((s, i, arr) => (
                    <span key={s}>
                      <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{s}</a>
                      {i < arr.length - 1 && <span style={{ opacity: 0.4, marginLeft: '0.5rem' }}>|</span>}
                    </span>
                  ))}
                  <span style={{ marginLeft: '0.5rem', opacity: 0.5 }}>—</span>
                  <span style={{ marginLeft: '0.5rem' }}>Follow Us</span>
                </div>
              </div>
            </div>

            {/* RIGHT — Car image (charger inside car.svg) */}
            <div className="lp-hero-car-wrap">
              <img
                src={carSvg}
                alt="Electric vehicle at solar charging station"
                className="lp-hero-car"
              />
            </div>

          </div>
        </div>

        {/* Bottom SVG Curve */}
        <div style={{ position: 'absolute', bottom: '-2px', left: 0, width: '100%', zIndex: 20, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 110" style={{ display: 'block', width: '100%', height: 'clamp(55px, 8vw, 100px)' }} preserveAspectRatio="none">
            <path d="M0,110 L0,0 Q720,160 1440,0 L1440,110 Z" fill="#f5faf0" />
          </svg>
          {/* Down-arrow button — centered on the curve */}
          <a
            href="#about"
            className="lp-arrow-btn"
            style={{
              position: 'absolute', bottom: 'clamp(16px, 3vw, 28px)', left: '50%',
              transform: 'translateX(-50%)',
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
              textDecoration: 'none'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── SCROLL 2 — About / Charging Station Feature ──────── */}
      {/* ─────────────────────────────────────────────────────── */}
      <section id="about" style={{ background: '#f5faf0', padding: 'clamp(5rem, 10vw, 8rem) 0 clamp(3rem, 6vw, 5rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>

          <div className="lp-about-cols">

            {/* Charging Station Image — now properly in its own section */}
            <div className="lp-charger-col" style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={chargingStationSvg}
                alt="Solar EV charging station"
                style={{
                  width: '100%', height: 'auto',
                  filter: 'drop-shadow(16px 24px 30px rgba(0,0,0,0.18))',
                }}
              />
            </div>

            {/* About Text + Feature cards */}
            <div className="lp-about-text-col">
              <span style={{
                fontFamily: SG, fontWeight: 700, fontSize: '0.75rem', color: '#1a6b3c',
                textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.6rem'
              }}>
                ● About Us
              </span>
              <h2 style={{
                fontFamily: SG, fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                letterSpacing: '-0.025em', color: '#0f172a', lineHeight: 1.1, margin: '0 0 1rem'
              }}>
                Driving Innovation{' '}
                <span style={{ color: '#1a6b3c' }}>In Every Charge</span>
              </h2>
              <p style={{
                fontFamily: IN, color: '#64748b', fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                lineHeight: 1.75, maxWidth: '540px', marginBottom: '2rem'
              }}>
                SolarSpot connects EV drivers with the largest network of solar charging stations,
                helping you discover, rate, and share the best charging experiences.
              </p>

              {/* Feature cards */}
              <div className="lp-features-grid">
                {[
                  { icon: '📍', title: 'Geospatial Discovery', desc: 'Interactive map to find solar stations near you — search by distance & availability.' },
                  { icon: '☀️', title: 'Solar Intelligence', desc: 'Real-time solar forecasts so you know the best charging windows.' },
                  { icon: '⭐', title: 'Community Ratings', desc: 'Rate and review stations to help EV drivers find top experiences.' },
                  { icon: '🌿', title: 'Eco-Friendly Network', desc: 'Every station runs on 100% clean solar energy — charge guilt-free.' },
                ].map((f) => (
                  <div key={f.title} className="lp-card">
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', marginBottom: '1rem'
                    }}>
                      {f.icon}
                    </div>
                    <h3 style={{ fontFamily: SG, fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: '0 0 0.4rem' }}>{f.title}</h3>
                    <p style={{ fontFamily: IN, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: '#133c1d', padding: '2.5rem 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div className="lp-stats-grid">
            {[
              { num: '150+', label: 'Solar Stations' },
              { num: '5K+', label: 'Active Drivers' },
              { num: '100%', label: 'Eco Friendly' },
              { num: '24/7', label: 'Weather Updates' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: SG, fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: '#8cc63f', letterSpacing: '-0.03em' }}>{s.num}</div>
                <div style={{ fontFamily: IN, fontWeight: 500, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!isAuthenticated && (
        <section style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem' }}>
            <h2 style={{ fontFamily: SG, fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', letterSpacing: '-0.03em', color: '#133c1d', margin: '0 0 1rem' }}>Ready to Power Up?</h2>
            <p style={{ fontFamily: IN, color: '#166534', fontSize: 'clamp(0.9rem, 2.2vw, 1.05rem)', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 2rem' }}>
              Join thousands of EV drivers discovering the best solar-powered charging stations across Sri Lanka.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ background: '#133c1d', color: '#fff', padding: '0.85rem 2.2rem', borderRadius: '10px', fontFamily: SG, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 6px 24px rgba(19,60,29,0.3)' }}>
                Create Free Account →
              </Link>
              <Link to="/stations" style={{ background: '#fff', color: '#133c1d', padding: '0.85rem 2.2rem', borderRadius: '10px', fontFamily: SG, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', border: '2px solid #dcfce7', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                Browse Stations
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer id="footer" style={{ background: '#0b2614', padding: 'clamp(2.5rem, 5vw, 4rem) 0 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🌞</span>
                <span style={{ fontFamily: SG, fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.02em' }}>SolarSpot</span>
              </div>
              <p style={{ fontFamily: IN, fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                Discover, submit, and rate solar-powered charging stations across Sri Lanka.
              </p>
            </div>

            {[
              { title: 'Platform', links: [{ label: 'Stations', to: '/stations' }, { label: 'Weather', to: '/weather' }, { label: 'Dashboard', to: '/dashboard' }] },
              { title: 'Account', links: [{ label: 'Log In', to: '/login' }, { label: 'Sign Up', to: '/register' }, { label: 'Profile', to: '/profile' }] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: SG, fontWeight: 700, fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link to={l.to} style={{ fontFamily: IN, fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 style={{ fontFamily: SG, fontWeight: 700, fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>Contact</h4>
              <div style={{ fontFamily: IN, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 2 }}>
                <div>📍 Colombo, Sri Lanka</div>
                <div>📧 info@solarspot.app</div>
                <div>📞 (+94) 11 234 5678</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: IN, fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} SolarSpot. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['Privacy Policy', 'Terms of Service'].map(t => (
                <a key={t} href="#" style={{ fontFamily: IN, fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>{t}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
