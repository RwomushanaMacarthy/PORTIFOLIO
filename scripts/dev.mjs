/**
 * One command that starts both halves of the app:
 *   • the content API   (server/index.js)  → http://localhost:8787
 *   • the Vite dev server (React app)      → http://localhost:5173
 * The dev server proxies /api/* to the API, so you only ever open :5173.
 *
 *   npm run dev
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadEnv } from '../server/env.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Load .env once here; both child processes inherit these variables.
const env = loadEnv();
if (env.ADMIN_PASSWORD) console.log('   using ADMIN_PASSWORD from .env');

const children = [];

function run(name, command, args, opts = {}) {
  const isWin = process.platform === 'win32';
  // Wrap command in quotes if it contains spaces (e.g., "C:\Program Files\...")
  const formattedCommand = (isWin && command.includes(' ') && !command.startsWith('"'))
    ? `"${command}"`
    : command;

  const child = spawn(formattedCommand, args, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWin,
    ...opts,
  });

  const tag = `[${name}]`;
  const pipe = (stream) => {
    stream.setEncoding('utf8');
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) if (line.trim()) console.log(`${tag} ${line}`);
    });
  };
  pipe(child.stdout);
  pipe(child.stderr);

  child.on('exit', (code) => {
    console.log(`${tag} exited with code ${code}`);
    if (!shuttingDown) shutdown();
  });

  children.push(child);
  return child;
}

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    if (!c.killed) c.kill('SIGTERM');
  }
  setTimeout(() => process.exit(0), 300);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('\n   Starting portfolio… site → http://localhost:5173  ·  admin → http://localhost:5173/#/admin\n');
run('api', process.execPath, ['server/index.js']);
run('web', join('node_modules', '.bin', 'vite'));