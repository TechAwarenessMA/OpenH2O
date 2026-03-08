import { useState, useEffect, useRef } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef(null);
  const activeItemRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Slide the green active indicator under the correct nav item
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current || !activeItemRef.current) return;
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeItemRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
      });
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cream">

      {/* ── FLOATING TOP NAVBAR ──────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 no-print transition-all duration-300 ${
          scrolled ? 'navbar-scrolled' : ''
        }`}
      >
        <div className="navbar-inner">
          {/* Logo */}
          <NavLink
            to="/"
            aria-label="OpenPrompt Home"
            className="logo-link flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="logo-box">
              <span className="logo-letter">O</span>
            </div>
            <div className="logo-text-group">
              <span className="logo-name">OpenPrompt</span>
              <span className="logo-sub">by TAA</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav
            ref={navRef}
            aria-label="Main navigation"
            className="hidden md:flex items-center relative self-stretch"
          >
            {navItems.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  ref={isActive ? activeItemRef : null}
                  end={item.to === '/'}
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon size={14} />
                  {item.label}
                </NavLink>
              );
            })}
            {/* Sliding indicator */}
            <span
              className="nav-indicator"
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: indicatorStyle.width,
              }}
            />
          </nav>

          {/* Right: data badge + hamburger */}
          <div className="flex items-center gap-3">
            {hasData && (
              <div className="data-badge hidden sm:flex">
                <span className="data-dot" />
                <span>Live</span>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden hamburger-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE FULL-SCREEN OVERLAY ──────────────────────── */}
      <div className={`mobile-overlay ${menuOpen ? 'mobile-overlay--open' : ''}`} aria-hidden={!menuOpen}>
        {/* Backdrop */}
        <div
          className="mobile-backdrop"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel */}
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {/* Drawer header */}
          <div className="mobile-drawer-header">
            <div className="flex items-center gap-2.5">
              <div className="logo-box logo-box--sm">
                <span className="logo-letter logo-letter--sm">O</span>
              </div>
              <span className="logo-name">OpenPrompt</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="close-btn"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          {hasData && (
            <div className="mobile-data-badge">
              <span className="data-dot" />
              <span>Data Loaded</span>
            </div>
          )}

          {/* Nav links */}
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item, i) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={`mobile-nav-item ${isActive ? 'mobile-nav-item--active' : ''}`}
                  style={{ animationDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
                >
                  <item.icon size={20} />
                  {item.label}
                  {isActive && <span className="mobile-active-dot" />}
                </NavLink>
              );
            })}
          </nav>

          {/* Drawer footer */}
          <div className="mobile-drawer-footer">
            <p>Free tool by{' '}
              <a
                href="https://www.techawarenessassociation.org"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Tech Awareness Association
              </a>
              , Shrewsbury MA
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <main className="pt-[64px]">
        {location.pathname === '/' ? (
          children
        ) : (
          <div className="w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
            {children}
          </div>
        )}
      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t-4 border-navy bg-white py-6 px-6 no-print">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
  );
}
