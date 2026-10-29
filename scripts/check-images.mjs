// npm run check-images — prints FILLED / BLANK for every slot and lists files that match no slot.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SLOTS, SLOT_IDS } from '../src/data/slots.js';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/images');
const EXT = /\.(jpg|jpeg|png|webp)$/i;
const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const have = new Set(files.filter((f) => EXT.test(f)).map((f) => f.replace(EXT, '').toLowerCase()));
let n = 0;
for (const s of SLOTS) {
  const ok = have.has(s.id);
  if (ok) n++;
  console.log(`${ok ? 'FILLED' : 'BLANK '}  ${s.id}`);
}
const unplaced = files.filter((f) => EXT.test(f) && !SLOT_IDS.has(f.replace(EXT, '').toLowerCase()));
console.log(`\n${n}/${SLOTS.length} slots filled.`);
console.log('Note: logo_light is derived from logo_dark with a CSS filter when blank.');
if (unplaced.length) { console.log('\nFiles that match no slot (unplaced):'); unplaced.forEach((f) => console.log('  ' + f)); }
