// Shared builders + the shared catalogue (Hands & Feet, Facials, Hydra, Sheet Mask).
// Item shape: { id, section, name, img, desc?, notes?, offers?, variants:[{id,label,standard,elite,duration?}], rich? }
// `img` is the slot slug: slot id = service_<gender>_<img>. Prices are excl. GST. Elite is stored, never computed.
export const V = (rows) =>
  rows.map(([label, standard, elite, duration, extra], i) => ({ id: 'v' + i, label, standard, elite, ...(duration ? { duration } : {}), ...(extra || {}) }));
export const one = (standard, elite, duration) => V([['', standard, elite, duration]]);
export const LEN = (s, m, l) => V([['Short Length', ...s], ['Medium Length', ...m], ['Long Length', ...l]]);

const HF = (id, name, rows, extra = {}) => ({ id: 'shared-' + id, section: 'hands-feet', name, img: id, shared: true, variants: V(rows), ...extra });

export const handsFeet = [
  HF('manicure', 'MANICURE', [['Express', 800, 640], ['Classic', 1200, 960], ['Luxe', 1850, 1480], ['Qesh Signature', 2150, 1720]]),
  HF('pedicure', 'PEDICURE', [['Express', 800, 640], ['Classic', 1300, 1040], ['Luxe', 2000, 1600], ['Qesh Signature', 2250, 1800]]),
  HF('reflexology', 'REFLEXOLOGY', [['Feet (30 Minutes including preparation)', 1100, 880, '30 min'], ['Hands & Feet (60 Minutes including preparation)', 2000, 1600, '60 min']]),
  HF('nails', 'NAILS', [['Cut & File', 300, 240], ['Cut & File + Paint', 450, 360]]),
];

// Facials + add-ons: same names and prices for women and men, separate image slots.
export const facials = (g) => {
  const F = (slug, name, std, elite, extra = {}) => ({ id: `${g}-${slug}`, section: 'facials-cleanup', name, img: slug, variants: one(std, elite), ...extra });
  return [
    F('super-food-signature-facial', 'SUPER FOOD SIGNATURE FACIAL', 3850, 3080),
    F('korean-glass-facial', 'KOREAN GLASS FACIAL', 2750, 2200),
    F('fruit-facial', 'FRUIT FACIAL', 2300, 1840),
    F('classic-facial', 'CLASSIC FACIAL', 1950, 1560),
    F('glow-facial', 'GLOW FACIAL', 1650, 1320),
    F('clean-up', 'CLEAN UP', 950, 760),
    F('hydra-facial', 'HYDRA FACIAL', 4000, 3200, {
      tag: 'Add-On',
      rich: {
        tagline: 'The Glow Booster',
        intro: 'A refreshing, non-invasive facial add-on for your skin that:',
        involves: ['Deeply cleanses', 'Exfoliates', 'Hydrates', 'Nourishes'],
        involvesTitle: 'IT:',
        whatItDoes: 'Smoother. Brighter. Plumper. Instantly refreshed skin that brings your confidence forward.',
        footnote: "For best results, regular sessions are recommended based on your skin's needs.",
      },
    }),
    F('sheet-mask', 'SHEET MASK', 750, 600, { tag: 'Add-On' }),
  ];
};

export const BOTOX_CYSTEINE_NOTE =
  'Not sure which to pick? Our stylists at Qesh Salon will assess your hair type, damage level, and goals to recommend the right treatments.';
