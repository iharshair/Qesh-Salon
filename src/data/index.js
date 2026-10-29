import { womenCatalog } from './catalog.women.js';
import { menCatalog } from './catalog.men.js';
import { packagesMen } from './packages.men.js';
import { SECTIONS, TILES } from './sections.js';

export const catalog = { women: womenCatalog, men: menCatalog };
export { packagesMen, SECTIONS, TILES };

/** All bookable items for a gender (packages first for men). Hands & Feet are shared items. */
export const itemsFor = (g) => (g === 'men' ? [...packagesMen, ...menCatalog] : womenCatalog);
export const itemById = (id) => [...womenCatalog, ...menCatalog, ...packagesMen].find((i) => i.id === id);
export const slotIdFor = (item, g) => `service_${g}_${item.img}`;
export const sectionFor = (g, id) => SECTIONS[g].find((s) => s.id === id);

/** Items shown for a tile (ALL = everything, packages first for men). */
export const itemsForTile = (g, tile) => {
  const secs = SECTIONS[g].filter((s) => tile === 'all' || s.tile === tile);
  const items = itemsFor(g);
  return secs.flatMap((s) => items.filter((i) => i.section === s.id).map((i) => ({ ...i, _section: s })));
};
export const lineCount = (items) => items.reduce((n, i) => n + i.variants.length, 0);
export const tileCount = (g, tile) => lineCount(itemsForTile(g, tile));
