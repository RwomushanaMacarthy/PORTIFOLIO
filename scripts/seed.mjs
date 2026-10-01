/**
 * Seeds server/content.json from the shipped defaults.
 *   npm run seed
 * (server/index.js does this automatically on first run too.)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONTENT } from '../src/content/defaults.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, '..', 'server', 'content.json');

const force = process.argv.includes('--force');
try {
  if (!force) await fs.access(target);
  console.log('content.json already exists — use "npm run seed -- --force" to overwrite.');
  process.exit(0);
} catch {
  /* file does not exist yet: continue */
}

const doc = { ...structuredClone(DEFAULT_CONTENT), meta: { updatedAt: new Date().toISOString() } };
await fs.writeFile(target, JSON.stringify(doc, null, 2), 'utf8');
console.log(`wrote ${target}`);
