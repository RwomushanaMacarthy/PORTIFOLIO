# Rwomushana Macarthy — Portfolio + Content Dashboard

A multi-page React portfolio (blue · yellow · black) with a password-protected admin
dashboard that can edit **every piece of text, photo and link on the site** — no code
changes needed after setup.

```
site    →  http://localhost:5173          (Home, About, Projects, Experience, Contact)
admin   →  http://localhost:5173/#/admin  (password: admin123 by default)
```

---

## Run it in VS Code (step by step)

**1. Install Node.js** (once) — download the LTS installer from <https://nodejs.org>.
Check it worked: open a terminal and run `node -v` (should print v18 or higher).

**2. Get the project onto your machine** — unzip this folder somewhere easy, e.g.
`Documents\macarthy-portfolio` (Windows) or `~/Projects/macarthy-portfolio` (macOS/Linux).

**3. Open it in VS Code** — `File ▸ Open Folder…` and pick the folder that contains
`package.json` (not its parent). VS Code will offer to install the recommended
extensions — click *Install*.

**4. Open the built-in terminal** — `Terminal ▸ New Terminal` (or press `` Ctrl+` ``).

**5. Install dependencies** (once, and again after you change `package.json`):

```bash
npm install
```

**6. Start everything:**

```bash
npm run dev
```

Two servers start together:

| Where | URL |
|---|---|
| Public site | <http://localhost:5173> |
| Admin dashboard | <http://localhost:5173/#/admin> — password `admin123` |

Hold **Ctrl** (or **Cmd**) and click the `http://localhost:5173/` link in the terminal to
open it in your browser. **Stop the servers with `Ctrl + C`** in the terminal.

**7. Optional — change the dashboard password.** Copy `.env.example` to `.env` and edit it:

```
ADMIN_PASSWORD=my-strong-password
PORT=8787
```

Restart with `Ctrl + C` then `npm run dev` again. (`.env` is git-ignored.)

### Even quicker, using VS Code's own controls

- **`Ctrl + Shift + B`** — runs the default task *“Start portfolio (site + dashboard)”*
  (same as `npm run dev`). Other tasks are in `Terminal ▸ Run Task…`.
- **`F5`** — launches the *“Run portfolio (API + site)”* compound debug config, so you can
  set breakpoints in `server/index.js` **and** in the React code (via Chrome/Edge devtools).

### Editing the code

- Vite hot-reloads the browser the moment you save a file — no restart needed.
- Changes to `server/index.js` (the API) **do** need a restart: `Ctrl + C`, then `npm run dev`.
- Content you edit in the dashboard is saved to `server/content.json`; you can open that
  file in VS Code to see exactly what is being stored.

### Common problems

| Symptom | Fix |
|---|---|
| `npm : command not found` / *not recognized* | Node.js isn't installed (or VS Code needs restarting after installing it). |
| `Port 5173 is already in use` | Another dev server is running. Close it, or change `server.port` in `vite.config.js`. |
| `Port 8787 is already in use` / `EADDRINUSE` | An old API process is still alive. Close it, or set `PORT=8788` in `.env` and update the proxy target in `vite.config.js`. |
| PowerShell blocks `npm.ps1` | Use a **Command Prompt** terminal in VS Code, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. |
| Dashboard says *Content API not reachable* | The API half isn't running — start with `npm run dev` (not `npm run dev:web`), or run `npm run dev:api` in a second terminal. |
| Blank page after editing | Read the terminal output — Vite prints the file and line of any syntax error. |

---

## Quick start

```bash
npm install
npm run dev          # starts the React site AND the content API together
```

`npm run dev` runs two processes:

| Process | Port | What it does |
|---|---|---|
| Vite dev server | 5173 | Serves the React app, proxies `/api/*` to the API |
| Content API (Express) | 8787 | Reads/writes `server/content.json` — what the dashboard saves to |

Open **http://localhost:5173** for the site and **/#/admin** for the dashboard.

Other scripts: `npm run build` (production build into `dist/`), `npm run preview`,
`npm run dev:api` (API only), `npm run seed` (reset `content.json` from defaults),
`npm run test:api` (end-to-end API tests).

---

## The admin dashboard

Sign in at `/#/admin` with the password (default `admin123` — see *Security* below).

Every section of the public site has its own editor. Changes go into a **draft**:

- The draft survives a page refresh (kept in the browser).
- While you're signed in, the site **previews your draft** so you can check it first —
  visitors keep seeing the published version until you press **Save & publish**.
- `Ctrl/Cmd + S` publishes from anywhere in the dashboard.
- **Discard** throws the draft away and reloads the published content.
- **Settings** lets you export/import the whole content file as JSON, and reset to defaults.

### What each editor controls

| Editor | Controls |
|---|---|
| **Overview** | Counts, last published time, publish/discard, quick links |
| **Profile** | Name, role, summary, availability, location, email, phone, CV link, typewriter lines |
| **Photo** | Upload an image (or paste a URL), restore the illustrated portrait, remove it |
| **Home page** | Eyebrow, hero title, hero buttons, code card, stat tiles, "what I do" cards, quote |
| **About page** | Heading, story paragraphs, quick facts, quick-history timeline |
| **Skills** | Skill groups + chips, working-skill bars (About page) |
| **Projects** | Page copy, plus per-project: title, slug, blurb, case-study intro, year, role, tags, bullets, accent colour, links, featured flag |
| **Experience** | Timeline entries (role, organisation, period, location, bullets) |
| **Contact page** | All wording, headings, button label, success message |
| **Menu & footer** | Nav links, header button, footer tagline/links, social links + icons |
| **Settings** | JSON backup / restore / reset, session info |

---

## Project layout

```
portfolio/
├─ index.html
├─ vite.config.js          dev server + /api proxy
├─ package.json
├─ scripts/
│  ├─ dev.mjs              runs API + Vite together (npm run dev)
│  ├─ seed.mjs             reset content.json from defaults
│  └─ api-test.mjs         end-to-end tests for the content API
├─ server/
│  ├─ index.js             Express content API (auth, read/write, reset)
│  ├─ content.json         ← your live content (created on first run)
│  └─ content.backup.json  ← rolling backup of the previous save
└─ src/
   ├─ main.jsx             providers + router bootstrap
   ├─ App.jsx              routes (public pages + /admin/*)
   ├─ styles.css           all styling, blue/yellow/black theme variables
   ├─ content/defaults.js  the shipped default content document
   ├─ context/
   │  ├─ ContentContext.jsx  content store, draft, auth, save/publish
   │  └─ ThemeContext.jsx    dark/light theme
   ├─ components/
   │  ├─ Layout.jsx        header, footer, draft-preview banner
   │  ├─ Icons.jsx         inline SVG icon set
   │  └─ ui.jsx            Reveal, Typewriter, Chips, Bar, PhotoCard…
   ├─ pages/               Home, About, Projects, ProjectDetail, Experience, Contact, NotFound
   └─ admin/
      ├─ AdminApp.jsx      login gate + dashboard shell + routes
      ├─ editors.jsx       one editor per site section
      └─ Fields.jsx        generic Field / ListEditor / ItemListEditor / Accordion
```

### Pages and URLs

Routing uses `HashRouter`, so the built site works on any static host with **no server
rewrites** (GitHub Pages, Netlify, plain shared hosting).

```
/                     Home
/about                About + skills
/projects             Project grid with tech filters
/projects/:slug       Case study per project
/experience           Education & experience timeline
/contact              Contact form + details
/admin                Dashboard (and /admin/profile, /admin/projects, …)
```

---

## Deploying

**Option A — static site only (no dashboard live).** `npm run build` then upload `dist/`.
The site keeps working: if `/api/content` can't be reached it falls back to the built-in
defaults in `src/content/defaults.js` and shows a small notice.

**Option B — site + live dashboard (recommended).** The dashboard needs the Node API
running, so host both together (Render, Railway, Fly.io, a VPS):

```bash
ADMIN_PASSWORD="something-strong" npm run build
ADMIN_PASSWORD="something-strong" node server/index.js   # serves the API
```

Then point a static server at `dist/` and proxy `/api` to port 8787 — or add
`app.use(express.static('dist'))` to `server/index.js` and serve everything from one port.

**Editing content without the dashboard:** you can also edit `server/content.json` by hand
(or `src/content/defaults.js` for the shipped defaults) and restart the API.

---

## Security notes

- The password comes from the **`ADMIN_PASSWORD`** environment variable; the default
  `admin123` is only meant for local development — change it before deploying.
- Sessions are bearer tokens held in memory for 8 hours. Restarting the API signs you out.
- Saves are authenticated and rate-limited only by the length of your password, so put the
  API behind HTTPS in production. For multi-user setups, swap the single password for real
  accounts (e.g. Passport/Auth.js) — the token logic in `server/index.js` is the only thing
  you'd need to change.

## Tech

React 18 · react-router-dom 6 · Vite 5 · Express 4 · plain CSS with variables · no UI kit,
no icon package (icons are inline SVG), no CSS framework.
