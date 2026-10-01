# Rwomushana Macarthy — Private Portfolio & Admin Suite

A private, multi-page React portfolio featuring a password-protected admin dashboard designed for real-time content management without touching code.


* **Admin Suite:** `http://localhost:5173/#/admin` *(Default password: `admin123`)*

---

## ⚡ Quick Start

1. **Install Node.js** (LTS version) if you haven't already.
2. Open the project folder in **VS Code** and open the terminal (`Ctrl + ` ``).
3. Run the following commands:
```bash
npm install
npm run dev

```


4. Click `http://localhost:5173` in your terminal to open the site, or head to `/#/admin` to manage content.

---

## 🔑 Admin Dashboard Features

* **Live Preview & Drafts:** Edit any text, photo, link, or project detail. Changes preview instantly for you while visitors see the live published version.
* **One-Click Publishing:** Press **`Ctrl + S`** anywhere in the dashboard to push updates live.
* **Data Management:** All changes are automatically safely stored and backed up locally via the Express backend (`server/content.json`).

---

## 🗂️ Project Structure

```text
portfolio/
├── server/          # Express backend (handles content saves & auth)
├── src/
│   ├── admin/       # Dashboard editors & authentication panels
│   ├── components/  # Shared layouts, UI elements, and inline SVGs
│   ├── pages/       # Public views (Home, About, Projects, Experience, Contact)
│   └── context/     # State management for content & themes
└── package.json

```

---

## 🛠️ Built With

* **Frontend:** React 18, React Router, Vite
* **Backend:** Node.js, Express
* **Styling:** Custom CSS design system (Blue / Yellow / Black theme)
