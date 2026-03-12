import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Upload, BarChart3, List, Lightbulb, BookOpen, Info, X, Menu } from 'lucide-react';

const navItems = [
  { to: '/',            label: 'Upload',      icon: Upload },
  { to: '/dashboard',   label: 'My Impact',   icon: BarChart3 },
  { to: '/breakdown',   label: 'Breakdown',   icon: List },
  { to: '/insights',    label: 'Insights',    icon: Lightbulb },
  { to: '/methodology', label: 'Methodology', icon: BookOpen },
  { to: '/about',       label: 'About',       icon: Info },
];

export default function Layout({ children, hasData }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLanding = location.pathname === '/';

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Landing page: full-screen, no sidebar or topbar
  if (isLanding) {
    return <>{children}</>;
  }

  // Inner pages: sidebar layout
  return (
    <>
      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside className={`sidebar no-print ${sidebarOpen ? 'sidebar--open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo-area">
          <NavLink
            to="/"
            aria-label="OpenPrompt Home"
            className="logo-link flex items-center gap-2.5"
          >
            <div className="logo-box">
              <span className="logo-letter">O</span>
            </div>
            <div className="logo-text-group">
              <span className="logo-name">OpenPrompt</span>
              <span className="logo-sub">by TAA</span>
            </div>
          </NavLink>

          {hasData && (
            <div className="sidebar-data-badge">
              <span className="data-dot" />
              <span>Live</span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon size={14} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer no-print">
          <p>
            Free tool by{' '}
            <a
              href="https://www.techawarenessassociation.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tech Awareness Association
            </a>
            , Shrewsbury MA
          </p>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── PAGE SHELL ─────────────────────────────────────── */}
      <div className="page-shell">

        {/* Mobile top bar — visible only on small screens */}
        <div className="mobile-topbar md:hidden no-print">
          <NavLink
            to="/"
            className="logo-link flex items-center gap-2"
            aria-label="OpenPrompt Home"
          >
            <div className="logo-box logo-box--sm">
              <span className="logo-letter logo-letter--sm">O</span>
            </div>
            <span className="logo-name" style={{ fontSize: '0.9rem' }}>OpenPrompt</span>
          </NavLink>

          <div className="flex items-center gap-2">
            {hasData && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.2rem 0.5rem',
                background: 'rgba(46,204,113,0.1)',
                border: '1.5px solid rgba(46,204,113,0.35)',
                fontSize: '0.58rem', fontWeight: 900,
                color: '#2ECC71', textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>
                <span className="data-dot" />
                Live
              </div>
            )}
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 pt-[56px] md:pt-0">
          <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="page-footer no-print">
          <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate font-bold text-center sm:text-left">
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
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-wider flex-shrink-0">
              <NavLink to="/methodology" className="text-navy hover:text-green transition-colors">Methodology</NavLink>
              <NavLink to="/about" className="text-navy hover:text-green transition-colors">About</NavLink>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
