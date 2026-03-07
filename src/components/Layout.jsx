import { NavLink, useLocation } from 'react-router-dom';
import { Upload, BarChart3, List, Lightbulb, BookOpen, Info } from 'lucide-react';

const navItems = [
  { to: '/',             label: 'Upload',      icon: Upload },
  { to: '/dashboard',    label: 'My Impact',   icon: BarChart3 },
  { to: '/breakdown',    label: 'Breakdown',   icon: List },
  { to: '/insights',     label: 'Insights',    icon: Lightbulb },
  { to: '/methodology',  label: 'Methodology', icon: BookOpen },
  { to: '/about',        label: 'About',       icon: Info },
];

const mobileNavItems = [
  { to: '/',          label: 'Upload',    icon: Upload },
  { to: '/dashboard', label: 'My Impact', icon: BarChart3 },
  { to: '/breakdown', label: 'Breakdown', icon: List },
  { to: '/about',     label: 'About',     icon: Info },
];

export default function Layout({ children, hasData }) {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* ── MOBILE TOP BAR ─────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b-4 border-navy no-print">
        <NavLink to="/" aria-label="OpenPrompt Home" className="flex items-center gap-2">
          <div className="h-10 w-10 bg-navy border-2 border-navy flex items-center justify-center">
            <span className="text-green font-black text-lg">O</span>
          </div>
          <span className="text-xl font-black text-navy tracking-tight">OpenPrompt</span>
        </NavLink>
        {hasData && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green/15 border-2 border-green">
            <div className="w-2 h-2 bg-green" />
            <span className="text-xs font-black text-green uppercase tracking-wider">Data Loaded</span>
          </div>
        )}
      </div>

      {/* ── DESKTOP SIDEBAR + CONTENT WRAPPER ──────────────── */}
      <div className="flex flex-1">

        {/* ── SIDEBAR (desktop / iPad only) ──────────────── */}
        <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-60 lg:w-64 bg-navy border-r-4 border-black z-50 no-print animate-slide-in-left sidebar-scroll">

          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-3 px-5 py-5 border-b-4 border-black hover:bg-black transition-colors"
            aria-label="OpenPrompt Home"
          >
            <div className="h-11 w-11 bg-green border-2 border-green flex items-center justify-center flex-shrink-0">
              <span className="text-navy font-black text-2xl">O</span>
            </div>
            <div>
              <div className="text-xl font-black text-white tracking-tight leading-none">OpenPrompt</div>
              <div className="text-xs text-green font-black uppercase tracking-widest mt-0.5">by TAA</div>
            </div>
          </NavLink>

          {/* Upload status badge */}
          {hasData && (
            <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 bg-green/15 border-2 border-green/40">
              <div className="w-2 h-2 bg-green" />
              <span className="text-xs font-black text-green uppercase tracking-wider">Data Loaded</span>
            </div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 py-4" aria-label="Main navigation">
            {navItems.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3.5 text-sm font-black uppercase tracking-wider transition-all relative border-l-4 animate-fade-in ${
                    isActive
                      ? 'bg-green text-ink border-green pl-5'
                      : 'text-white border-transparent hover:bg-white/10 hover:border-green/50 hover:pl-6'
                  }`
                }
                style={{ animationDelay: `${i * 60}ms` }}
                aria-label={item.label}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer credit */}
          <div className="px-5 py-4 border-t-2 border-white/20">
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider leading-relaxed">
              Free tool by<br />
              <a
                href="https://www.techawarenessassociation.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green/80 hover:text-green transition-colors"
              >
                Tech Awareness Association
              </a>
              <br />Shrewsbury, MA
            </p>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-screen md:ml-60 lg:ml-64">
          <main className="flex-1 w-full mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-10 pb-28 md:pb-12 max-w-5xl">
            {children}
          </main>

          {/* Footer — desktop only */}
          <footer className="hidden md:block bg-white border-t-4 border-navy py-6 px-8 no-print">
            <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-slate font-bold">
                OpenPrompt is a free tool by{' '}
                <a
                  href="https://www.techawarenessassociation.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green underline font-black"
                >
                  Tech Awareness Association
                </a>
                , a student-founded nonprofit in Shrewsbury, MA.
              </p>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-wider">
                <NavLink to="/methodology" className="text-navy hover:text-green transition-colors">Methodology</NavLink>
                <NavLink to="/about" className="text-navy hover:text-green transition-colors">About</NavLink>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-navy flex items-center justify-around py-2 z-50 bottom-nav no-print">
        {mobileNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors min-h-12 min-w-[56px] ${
                isActive ? 'text-ink bg-green border-t-4 border-navy -mt-1' : 'text-navy'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
