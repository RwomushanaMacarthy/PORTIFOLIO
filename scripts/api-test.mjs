const BASE = 'http://localhost:5173/api';
const j = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return t.slice(0, 200); } };
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); };

// 1. health
const health = await j(await fetch(`${BASE}/health`));
check('GET /api/health through vite proxy', health?.ok === true);

// 2. content loads (this also seeds content.json on first run)
const content = await j(await fetch(`${BASE}/content`));
check('GET /api/content returns a document', content?.profile?.name === 'Rwomushana Macarthy', content?.profile?.name);
check('photo embedded in content', String(content?.profile?.photo || '').startsWith('data:image/png;base64,'));
check('projects + skills + experience present',
  content?.projects?.items?.length === 4 && content?.skills?.groups?.length === 4 && content?.experience?.items?.length === 3);

// 3. unauthorised write is rejected
const bad = await fetch(`${BASE}/content`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(content) });
check('PUT without token → 401', bad.status === 401);

// 4. wrong password rejected
const wrong = await fetch(`${BASE}/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password: 'nope' }) });
check('POST /api/login wrong password → 401', wrong.status === 401);

// 5. login
const login = await j(await fetch(`${BASE}/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ password: 'admin123' }) }));
check('POST /api/login returns token', typeof login?.token === 'string' && login.token.length > 20);
const token = login.token;

// 6. admin edits a field and saves (simulating the dashboard)
const edited = structuredClone(content);
edited.profile.role = 'Business Computing Student · Software Engineering Track';
edited.projects.items[0].title = 'Campus Hub — Student Portal (edited)';
const put = await fetch(`${BASE}/content`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(edited),
});
const putJson = await j(put);
check('PUT /api/content with token → saved', put.status === 200 && putJson?.ok === true, putJson?.updatedAt);

// 7. the change is persisted and served to the public site
const after = await j(await fetch(`${BASE}/content`));
check('edit persisted to disk', after?.profile?.role === edited.profile.role);
check('project edit persisted', after?.projects?.items?.[0]?.title.includes('(edited)'));

// 8. content.json written on disk + backup exists
const fs = await import('node:fs/promises');
const raw = JSON.parse(await fs.readFile('server/content.json', 'utf8'));
check('server/content.json updated on disk', raw.profile.role === edited.profile.role);
check('rolling backup created', await fs.access('server/content.backup.json').then(() => true, () => false));

// 9. reset restores defaults
const reset = await j(await fetch(`${BASE}/content/reset`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }));
check('POST /api/content/reset restores defaults', reset?.content?.profile?.role === 'Business Computing Student', reset?.content?.profile?.role);

// 10. logout invalidates the token
await fetch(`${BASE}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
const afterLogout = await fetch(`${BASE}/content`, { method: 'PUT', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(content) });
check('token invalid after logout → 401', afterLogout.status === 401);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
