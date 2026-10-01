/**
 * ContentContext — the app's content store and admin session.
 * ---------------------------------------------------------------------------
 *  • Loads the published content document from the API on boot.
 *  • Keeps a local "draft" while the admin edits, so the live site is untouched
 *    until you press Save.
 *  • If you are signed in, the site previews your draft (with a banner), so you
 *    can check a change before publishing it.
 *  • Draft survives a page refresh (localStorage) so a stray reload never loses
 *    your work.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_CONTENT } from '../content/defaults.js';

const TOKEN_KEY = 'pf-admin-token';
const DRAFT_KEY = 'pf-admin-draft';

const ContentContext = createContext(null);

/* --------------------------------------------------------------- utilities */

/** Immutably set a value at a path like ['projects','items',0,'title']. */
export function setIn(root, path, value) {
  const clone = structuredClone(root);
  let node = clone;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (node[key] === undefined || node[key] === null) node[key] = typeof path[i + 1] === 'number' ? [] : {};
    node = node[key];
  }
  node[path[path.length - 1]] = value;
  return clone;
}

export function getIn(root, path) {
  return path.reduce((acc, key) => (acc == null ? acc : acc[key]), root);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Unexpected response from ${path}`);
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* --------------------------------------------------------------- provider */

/**
 * `initialContent` lets a server render (or a test) start with content already
 * in hand instead of waiting for the fetch; the app itself never passes it.
 */
export function ContentProvider({ children, initialContent = null }) {
  const [content, setContent] = useState(initialContent); // published content
  const [draft, setDraft] = useState(null); // unsaved admin working copy
  const [loading, setLoading] = useState(!initialContent);
  const [loadError, setLoadError] = useState('');
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [status, setStatus] = useState('idle'); // idle | dirty | saving | saved | error
  const [message, setMessage] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const toastTimer = useRef(null);

  const flash = useCallback((text, nextStatus) => {
    setMessage(text);
    if (nextStatus) setStatus(nextStatus);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setMessage('');
      setStatus((s) => (s === 'saved' || s === 'error' ? 'idle' : s));
    }, 3200);
  }, []);

  /* ------------------------------------------------------------ load once */
  useEffect(() => {
    if (initialContent) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const data = await api('/api/content');
        if (cancelled) return;
        setContent(data);
        setLastSaved(data?.meta?.updatedAt || null);
      } catch (err) {
        if (cancelled) return;
        // Offline / API not running: fall back to the shipped defaults so the
        // site still renders, and tell the reader rather than showing a blank page.
        setContent(structuredClone(DEFAULT_CONTENT));
        setLoadError(
          err.status === 404 || err.name === 'TypeError'
            ? 'Content API not reachable — showing built-in defaults. Start it with "npm run dev" (or "npm run dev:api").'
            : err.message
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialContent]);

  /* ------------------------------------------- restore an unsaved draft */
  useEffect(() => {
    if (!token || !content) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.document) {
        setDraft(parsed.document);
        setStatus('dirty');
      }
    } catch {
      /* ignore malformed draft */
    }
  }, [token, content]);

  /* ----------------------------------------------------------- draft ops */
  const update = useCallback(
    (path, value) => {
      const key = Array.isArray(path) ? path : [path];
      setDraft((prev) => setIn(prev ?? content ?? DEFAULT_CONTENT, key, value));
      setStatus('dirty');
      try {
        const nextDoc = setIn(draft ?? content ?? DEFAULT_CONTENT, key, value);
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ document: nextDoc, at: Date.now() }));
      } catch {
        /* storage full (big image) — the draft still lives in memory */
      }
    },
    [content, draft]
  );

  const discard = useCallback(() => {
    setDraft(null);
    setStatus('idle');
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    flash('Draft discarded — back to the published content.');
  }, [flash]);

  /* -------------------------------------------------------------- server */
  const login = useCallback(
    async (password) => {
      const data = await api('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
      setToken(data.token);
      try {
        localStorage.setItem(TOKEN_KEY, data.token);
      } catch {
        /* ignore */
      }
      setLoadError('');
      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (token) await api('/api/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } catch {
      /* token may already be expired — that's fine */
    }
    setToken('');
    setDraft(null);
    setStatus('idle');
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }, [token]);

  const save = useCallback(async () => {
    const payload = draft ?? content;
    if (!payload) return false;
    setStatus('saving');
    try {
      const res = await api('/api/content', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setContent(payload);
      setDraft(null);
      setLastSaved(res.updatedAt);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      flash('Saved — your site is updated.', 'saved');
      return true;
    } catch (err) {
      if (err.status === 401) {
        setToken('');
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          /* ignore */
        }
        flash('Session expired — please sign in again.', 'error');
      } else {
        flash(err.message || 'Could not save.', 'error');
      }
      return false;
    }
  }, [content, draft, flash, token]);

  const resetToDefaults = useCallback(async () => {
    setStatus('saving');
    try {
      const res = await api('/api/content/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setContent(res.content);
      setDraft(null);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      flash('Content reset to the shipped defaults.', 'saved');
      return true;
    } catch (err) {
      flash(err.message || 'Reset failed.', 'error');
      return false;
    }
  }, [flash, token]);

  const importContent = useCallback(
    (doc) => {
      if (!doc || typeof doc !== 'object' || !doc.profile) return false;
      setDraft(doc);
      setStatus('dirty');
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ document: doc, at: Date.now() }));
      } catch {
        /* ignore */
      }
      flash('JSON imported into the draft — press Save to publish.');
      return true;
    },
    [flash]
  );

  /* --------------------------------------------------------------- value */
  const isAdmin = Boolean(token);
  const previewing = isAdmin && Boolean(draft);
  const active = previewing ? draft : content;

  const value = useMemo(
    () => ({
      content,
      draft,
      active,
      loading,
      loadError,
      token,
      isAdmin,
      previewing,
      status,
      message,
      lastSaved,
      dirty: Boolean(draft),
      update,
      discard,
      save,
      login,
      logout,
      resetToDefaults,
      importContent,
    }),
    [
      content,
      draft,
      active,
      loading,
      loadError,
      token,
      isAdmin,
      previewing,
      status,
      message,
      lastSaved,
      update,
      discard,
      save,
      login,
      logout,
      resetToDefaults,
      importContent,
    ]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>');
  return ctx;
}

/** Shorthand: returns the document currently being shown (draft for admins). */
export function useSite() {
  const { active } = useContent();
  return active || DEFAULT_CONTENT;
}
