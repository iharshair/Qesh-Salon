// IMAGE SLOT DICTIONARY (law). The file name without extension IS the slot id.
// Pattern: <area>_<gender>_<detail>.<ext>  (lowercase, parts split by "_", words by "-")
import { itemsFor, SECTIONS } from './index.js';

export const SIZES = {
  hero: '3000×2000 (min 2400 wide), landscape, bottom 25% calm',
  tile: '1600×1600, square, subject centred',
  service: '1200×1500, 4:5 portrait, subject centred',
  modal2: '1200×800, 3:2 landscape',
  story: '2400×1500, landscape, calm/dark area on the right',
  cta: '2400×1500, landscape, calm area left/top',
  blog: '1200×1500, 4:5 portrait',
  review: '1200×900, 4:3 landscape (before/after side by side)',
  gallery: '1800×1200, 3:2 landscape',
  logo: 'PNG with transparent background',
  misc: 'see notes',
};

export const SLOTS = [];
const add = (id, type, where, group) => SLOTS.push({ id, type, where, group, size: SIZES[type] || SIZES.misc });

// Shared
add('logo_light', 'logo', 'Logo, light/white version (over hero, dark sections)', 'Shared');
add('logo_dark', 'logo', 'Logo, dark version (white header, footer, forms)', 'Shared');
add('favicon', 'misc', 'Browser tab icon (optional)', 'Shared');
add('og-share', 'misc', 'Link-preview image (optional)', 'Shared');
for (let i = 1; i <= 6; i++) add(`gallery_${i}`, 'gallery', `Salon gallery on About page, slot ${i} (hidden if empty)`, 'Shared');

for (const g of ['women', 'men']) {
  const G = g === 'women' ? 'Women' : 'Men';
  add(`hero_${g}`, 'hero', 'Hero background (ripple effect)', `Home — ${G}`);
  for (const t of ['all', 'hair', 'skin', 'hands-feet'])
    add(`tile_${g}_${t}`, 'tile', t === 'all' ? 'ALL filter tile' : `${t.toUpperCase()} filter tile + home strip card`, `Home — ${G}`);
  add(`story_${g}`, 'story', 'Story of Qesh image (mirror spot)', `Home — ${G}`);
  add(`cta_${g}`, 'cta', 'Book a consultation full-bleed background', `Home — ${G}`);
  for (let i = 1; i <= 3; i++) add(`blog_${g}_${i}`, 'blog', `Newsletter / blog card ${i}`, `Home — ${G}`);
  for (let i = 1; i <= 4; i++) add(`review_${g}_${i}`, 'review', `Review card ${i} photo`, `Home — ${G}`);
  for (const item of itemsFor(g)) add(`service_${g}_${item.img}`, 'service', `${item.name} card + first image of its pop-up`, `Services — ${G}`);
  for (const s of SECTIONS[g]) add(`modal2_${g}_${s.id}`, 'modal2', `Second image in pop-ups of ${s.title}`, `Pop-up second images — ${G}`);
}
export const SLOT_IDS = new Set(SLOTS.map((s) => s.id));
