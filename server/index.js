/**
 * Content API — the tiny backend behind the admin dashboard.
 * ---------------------------------------------------------------------------
 *   GET    /api/health            → { ok: true }
 *   GET    /api/content           → the whole site content document
 *   PUT    /api/content           → replace it (requires Authorization: Bearer <token>)
 *   POST   /api/content/reset     → restore the shipped defaults (auth)
 *   POST   /api/login             → { password } → { token }
 *   POST   /api/logout            → invalidate token
 *
 * Storage is a plain JSON file (server/content.json) so there is no database to
 * set up. Swap the two read/write helpers below for Postgres/Mongo/S3 later if
 * you ever need to.
 *
 * Password: set ADMIN_PASSWORD in the environment. Default is "admin123" —
 * change it before you put this on the internet.
 */
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_CONTENT } from '../src/content/defaults.js';
import { loadEnv } from './env.js';

loadEnv(); // read .env (ADMIN_PASSWORD, PORT, …) before anything reads process.env

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_FILE = path.join(__dirname, 'content.json');
const BACKUP_FILE = path.join(__dirname, 'content.backup.json');

const PORT = Number(process.env.PORT || 8787);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

/* ---------------------------------------------------------------- storage */

let cache = null; // in-memory copy, avoids re-reading the file on every request

async function readContent() {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf8');
    cache = JSON.parse(raw);
  } catch {
    // First run (or the file got deleted) — fall back to the shipped defaults.
    cache = structuredClone(DEFAULT_CONTENT);
    await writeContent(cache);
  }
  return cache;
}

async function writeContent(next) {
  const stamped = { ...next, meta: { ...(next.meta || {}), updatedAt: new Date().toISOString() } };
  // keep one rolling backup so a bad save is never fatal
  try {
    await fs.copyFile(CONTENT_FILE, BACKUP_FILE);
  } catch {
    /* nothing to back up yet */
  }
  await fs.writeFile(CONTENT_FILE, JSON.stringify(stamped, null, 2), 'utf8');
  cache = stamped;
  return stamped;
}

/* ------------------------------------------------------------------- auth */

const tokens = new Map(); // token → expiry timestamp

function issueToken() {
  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, Date.now() + TOKEN_TTL_MS);
  return token;
}

function isAuthed(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return false;
  const expiry = tokens.get(token);
  if (!expiry) return false;
  if (expiry < Date.now()) {
    tokens.delete(token);
    return false;
  }
  return true;
}

function requireAuth(req, res, next) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Not authorised. Please sign in again.' });
  }
  next();
}

/* ------------------------------------------------------------------ server */

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16mb' })); // room for an inlined profile photo

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

app.get('/api/content', async (_req, res, next) => {
  try {
    res.json(await readContent());
  } catch (err) {
    next(err);
  }
});

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  // constant-time compare, so a wrong password doesn't leak its length/timing
  const given = Buffer.from(String(password ?? ''));
  const real = Buffer.from(ADMIN_PASSWORD);
  const ok = given.length === real.length && crypto.timingSafeEqual(given, real);

  if (!ok) return res.status(401).json({ error: 'Wrong password.' });
  res.json({ token: issueToken(), expiresIn: TOKEN_TTL_MS });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const token = (req.headers.authorization || '').slice(7);
  tokens.delete(token);
  res.json({ ok: true });
});

app.put('/api/content', requireAuth, async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || !body.profile || typeof body.profile !== 'object') {
      return res.status(400).json({ error: 'Invalid content document: "profile" is required.' });
    }
    const saved = await writeContent(body);
    res.json({ ok: true, updatedAt: saved.meta.updatedAt });
  } catch (err) {
    next(err);
  }
});

app.post('/api/content/reset', requireAuth, async (_req, res, next) => {
  try {
    const saved = await writeContent(structuredClone(DEFAULT_CONTENT));
    res.json({ ok: true, content: saved });
  } catch (err) {
    next(err);
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[api] error:', err);
  res.status(500).json({ error: 'Server error.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`content API listening on http://0.0.0.0:${PORT}`);
  console.log(`content file: ${CONTENT_FILE}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log('using default admin password "admin123" — set ADMIN_PASSWORD to change it');
  }
});
