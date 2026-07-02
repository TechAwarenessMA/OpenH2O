import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Upload, BarChart3, List, Lightbulb, BookOpen, Info,
  Menu, X, ChevronRight, ChevronLeft,
} from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer
  const [collapsed, setCollapsed] = useState(true);         // desktop rail

  const isLanding = location.pathname === '/';

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (isLanding) return <>{children}</>;

  return (
    <>
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`sidebar no-print ${sidebarOpen ? 'sidebar--open' : ''} ${collapsed ? 'sidebar--collapsed' : ''}`}>

        {/* Logo + close button */}
        <div className="sidebar-logo-area">
          <div className="flex items-center justify-between w-full">
            <NavLink to="/" aria-label="OpenH2O Home" className={`logo-link flex items-center gap-2.5 ${collapsed && !sidebarOpen ? 'mx-auto' : ''}`}>
              <img
                src="/logo.png"
                alt="OpenH2O"
                style={{ width: '2.2rem', height: '2.2rem', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
              />
              {(!collapsed || sidebarOpen) && (
                <div className="logo-text-group">
                  <span className="logo-name">OpenH2O</span>
                  <span className="logo-sub">by TAA</span>
                </div>
              )}
            </NavLink>
            {sidebarOpen && (
              <button
                className="close-btn md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {collapsed && !sidebarOpen && hasData && <div className="collapsed-live-dot" title="Data loaded" />}
          {(!collapsed || sidebarOpen) && hasData && (
            <div className="sidebar-data-badge">
              <span className="data-dot" />
              <span>Live</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={collapsed ? item.label : undefined}
                className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon size={16} />
                {(!collapsed || sidebarOpen) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer + toggle */}
        <div className="sidebar-bottom no-print">
          {(!collapsed || sidebarOpen) && (
            <div className="sidebar-footer">
              <p>
                Free tool by{' '}
                <a href="https://www.techawarenessassociation.org" target="_blank" rel="noopener noreferrer">
                  Tech Awareness Association
                </a>
                , Shrewsbury MA
              </p>
            </div>
          )}
          <button
            className="sidebar-toggle-btn hidden md:flex"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── PAGE SHELL ─────────────────────────────────────── */}
      <div className={`page-shell ${collapsed ? 'page-shell--collapsed' : ''}`}>

        {/* Mobile topbar — hidden on desktop via CSS media query */}
        <div className="mobile-topbar no-print">
          <NavLink to="/" className="logo-link flex items-center gap-2" aria-label="OpenH2O Home">
            <img
              src="/logo.png"
              alt="OpenH2O"
              style={{ width: '1.8rem', height: '1.8rem', objectFit: 'cover', borderRadius: '4px' }}
            />
            <span className="logo-name" style={{ fontSize: '0.9rem' }}>OpenH2O</span>
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

        {/* Main content — top padding for mobile topbar handled in CSS */}
        <main className="flex-1">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
            {children}
          </div>
        </main>

        <footer className="page-footer no-print">
            <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-slate font-bold text-center sm:text-left">
                OpenH2O is a free tool by{' '}
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
