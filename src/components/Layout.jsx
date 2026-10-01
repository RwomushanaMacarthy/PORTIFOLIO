/** Site chrome: header, footer, draft-preview banner and route scroll handling. */
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from './Icons.jsx';
import { useContent, useSite } from '../context/ContentContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export function Header() {
  const content = useSite();
  const { isAdmin, previewing, discard } = useContent();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const nav = content.nav || {};
  const links = nav.links || [];
  const profile = content.profile || {};

  return (
    <>
      {previewing && (
        <div className="preview-banner">
          <span className="preview-banner-text">
            <Icon name="eye" size={15} /> Previewing unsaved draft changes — visitors still see the published version.
          </span>
          <span className="preview-banner-actions">
            <Link className="btn btn-sm btn-primary" to="/admin">
              <Icon name="dashboard" size={15} /> Back to dashboard
            </Link>
            <button type="button" className="btn btn-sm btn-ghost" onClick={discard}>
              Discard draft
            </button>
          </span>
        </div>
      )}

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <img src={profile.photo} alt={`${profile.name} portrait`} />
            </span>
            <span className="brand-text">
              {nav.brand || profile.name}
              <small>{profile.role}</small>
            </span>
          </Link>

          <nav className={`nav ${open ? 'is-open' : ''}`} aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.id || link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => (isActive ? 'is-active' : '')}
              >
                {link.label}
              </NavLink>
            ))}
            {nav.ctaLabel && (
              <Link className="btn btn-primary nav-cta" to={nav.ctaTo || '/contact'}>
                {nav.ctaLabel}
              </Link>
            )}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
            {isAdmin && (
              <Link className="icon-btn" to="/admin" title="Admin dashboard" aria-label="Admin dashboard">
                <Icon name="dashboard" size={18} />
              </Link>
            )}
            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
        {open && <button className="nav-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      </header>
    </>
  );
}

export function Footer() {
  const content = useSite();
  const profile = content.profile || {};
  const footer = content.footer || {};

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src={profile.photo} alt="" />
          <p>© {new Date().getFullYear()} {profile.name}. {footer.tagline}</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {(footer.links || []).map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { loadError } = useContent();
  return (
    <div className="site-body">
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      {loadError && (
        <div className="container" style={{ paddingTop: '1rem' }}>
          <p className="notice">
            <Icon name="refresh" size={16} /> {loadError}
          </p>
        </div>
      )}
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
