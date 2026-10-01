/**
 * AdminApp — the dashboard at /#/admin
 * Everything you can see on the public site can be edited from here.
 */
import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Icon from '../components/Icons.jsx';
import { useContent, useSite } from '../context/ContentContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  AboutEditor,
  ContactEditor,
  ExperienceEditor,
  HomeEditor,
  MediaEditor,
  NavEditor,
  OverviewEditor,
  ProfileEditor,
  ProjectsEditor,
  SettingsEditor,
  SkillsEditor,
} from './editors.jsx';

/* -------------------------------------------------------------------- login */

function Login() {
  const { login } = useContent();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const site = useSite();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(password);
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card card" onSubmit={submit}>
        <div className="brand-row">
          <img src={site.profile?.photo} alt="" />
          <span>
            <strong>{site.profile?.name}</strong>
            <br />
            <span className="ae-hint">Content dashboard</span>
          </span>
        </div>
        <h1>
          <Icon name="lock" size={20} /> Sign in
        </h1>
        <p className="ae-hint" style={{ marginBottom: '1rem' }}>
          Enter the admin password to edit every page of the site.
        </p>

        <label className="ae-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={busy || !password}>
          {busy ? 'Checking…' : 'Sign in'}
        </button>

        <p className="ae-hint" style={{ marginTop: '.9rem', marginBottom: 0 }}>
          Default password is <code>admin123</code> — set <code>ADMIN_PASSWORD</code> on the server to change it.
        </p>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------- shell */

const PAGES = [
  { id: 'overview', label: 'Overview', icon: 'dashboard', path: '/admin', element: <OverviewEditor /> },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/admin/profile', element: <ProfileEditor /> },
  { id: 'media', label: 'Photo', icon: 'image', path: '/admin/media', element: <MediaEditor /> },
  { id: 'home', label: 'Home page', icon: 'home', path: '/admin/home', element: <HomeEditor /> },
  { id: 'about', label: 'About page', icon: 'spark', path: '/admin/about', element: <AboutEditor /> },
  { id: 'skills', label: 'Skills', icon: 'code', path: '/admin/skills', element: <SkillsEditor /> },
  { id: 'projects', label: 'Projects', icon: 'briefcase', path: '/admin/projects', element: <ProjectsEditor /> },
  { id: 'experience', label: 'Experience', icon: 'cap', path: '/admin/experience', element: <ExperienceEditor /> },
  { id: 'contact', label: 'Contact page', icon: 'mail', path: '/admin/contact', element: <ContactEditor /> },
  { id: 'nav', label: 'Menu & footer', icon: 'menu', path: '/admin/nav', element: <NavEditor /> },
  { id: 'settings', label: 'Settings', icon: 'lock', path: '/admin/settings', element: <SettingsEditor /> },
];

function StatusPill() {
  const { dirty, status } = useContent();
  if (status === 'saving') return <span className="save-state">Saving…</span>;
  if (status === 'saved') return <span className="save-state saved">Saved ✓</span>;
  if (status === 'error') return <span className="save-state error">Save failed</span>;
  if (dirty) return <span className="save-state dirty">Unsaved changes</span>;
  return <span className="save-state">Up to date</span>;
}

function Toast() {
  const { message, status } = useContent();
  if (!message) return null;
  const tone = status === 'error' ? 'error' : 'success';
  return (
    <div className={`toast ${tone}`} role="status" aria-live="polite">
      <Icon name={tone === 'error' ? 'close' : 'check'} size={16} />
      {message}
    </div>
  );
}

function Shell({ page }) {
  const { draft, content, save, discard, dirty, status, logout } = useContent();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const site = draft || content || {};

  // Warn before closing the tab with unpublished changes.
  useEffect(() => {
    const handler = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  useEffect(() => {
    // Ctrl/Cmd + S publishes, like a real CMS.
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const current = PAGES.find((p) => p.id === page) || PAGES[0];

  return (
    <div className="admin-body">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-side-head">
            <img src={site.profile?.photo} alt="" />
            <span>
              {site.profile?.shortName || 'Admin'}
              <br />
              <span className="ae-hint">Content dashboard</span>
            </span>
          </div>

          <nav className="admin-side-links" aria-label="Dashboard sections">
            {PAGES.map((p) => (
              <NavLink key={p.id} to={p.path} end={p.path === '/admin'}>
                <Icon name={p.icon} size={16} /> {p.label}
              </NavLink>
            ))}
          </nav>

          <div className="admin-side-foot">
            <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={() => navigate('/')}>
              <Icon name="eye" size={16} /> View site
            </button>
            <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={toggle}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} /> {theme === 'dark' ? 'Light' : 'Dark'} theme
            </button>
            <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={logout}>
              <Icon name="logout" size={16} /> Sign out
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <div>
              <h1>{current.label}</h1>
              <p>Edit the content, press Save, and your live pages update straight away.</p>
            </div>
            <div className="admin-actions">
              <StatusPill />
              <button type="button" className="btn btn-ghost btn-sm" onClick={discard} disabled={!dirty}>
                <Icon name="refresh" size={16} /> Discard
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={save}
                disabled={!dirty || status === 'saving'}
              >
                <Icon name="save" size={16} /> {status === 'saving' ? 'Saving…' : 'Save & publish'}
              </button>
            </div>
          </div>

          {current.element}

          <p className="ae-hint" style={{ marginTop: '2rem' }}>
            Tip: press <strong>Ctrl/Cmd + S</strong> to publish from anywhere in the dashboard. Changes are previewed on
            the public site while you are signed in, but only become visible to visitors after you save.
          </p>
        </main>
      </div>
      <Toast />
    </div>
  );
}

/* --------------------------------------------------------------------- app */

export default function AdminApp() {
  const { isAdmin, loading } = useContent();

  if (loading) {
    return (
      <div className="login-wrap">
        <p className="muted">Loading content…</p>
      </div>
    );
  }

  if (!isAdmin) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<Shell page="overview" />} />
      {PAGES.filter((p) => p.id !== 'overview').map((p) => (
        <Route key={p.id} path={p.path.replace('/admin/', '')} element={<Shell page={p.id} />} />
      ))}
      <Route path="*" element={<Shell page="overview" />} />
    </Routes>
  );
}

export { Login, Shell, PAGES };
