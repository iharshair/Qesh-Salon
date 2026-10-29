import { V, one, handsFeet, facials, BOTOX_CYSTEINE_NOTE } from './catalog.shared.js';
// MEN catalogue — exact names and prices from the client PDF. [standard, elite]
const S = (id, section, name, img, variants, extra = {}) => ({ id: 'm-' + id, section, name, img, variants, ...extra });
const HW = 'Get Hairwash at 50% OFF with Haircut / Head Massage';
const hc = 'haircut-wash-beard', col = 'hair-colour', tr = 'treatments-texture', th = 'threading-waxing', de = 'de-tan';

export const menCatalog = [
  S('haircut', hc, 'HAIRCUT', 'haircut', V([['Boys (Below 12 years)', 300, 240], ['Master Stylist (Includes Complimentary Hairwash)', 500, 400], ['Senior Stylist (Includes Complimentary Hairwash)', 700, 560]]), { offers: [HW], hairwashQualifier: true }),
  S('beard', hc, 'BEARD', 'beard', V([['Shaving', 300, 240], ['Beard Trim / Style', 300, 240]])),
  S('hair-styling', hc, 'HAIR STYLING', 'hair-styling', one(200, 160)),
  S('hair-wash', hc, 'HAIR WASH', 'hair-wash', V([['Hair Wash', 250, 200], ['Pre-Wash (Before Colour Services - Without Conditioning)', 150, 120, null, { noOffer: true }]]), { isHairwash: true, offers: [HW] }),
  S('head-shave', hc, 'HEAD SHAVE', 'head-shave', V([['With Razor', 500, 400], ['With Trimmer', 300, 240]])),
  S('head-massage', hc, 'HEAD MASSAGE', 'head-massage', one(900, 720, '20 min'), { offers: [HW], hairwashQualifier: true, desc: '20 minutes including preparation.' }),

  S('ammonia-based', col, 'AMMONIA-BASED', 'ammonia-based', V([['Global Colour (Includes Moustache)', 1200, 960], ['Side Locks + Moustache', 450, 360], ['Beard', 550, 440]])),
  S('ammonia-free', col, 'AMMONIA-FREE', 'ammonia-free', V([['Global Colour (Includes Moustache)', 1300, 1040], ['Side Locks + Moustache', 500, 400], ['Beard', 600, 480]])),
  S('highlights', col, 'HIGHLIGHTS', 'highlights', V([['Per Streak', 400, 320], ['Global Highlights', 1400, 1120]])),
  S('vivids', col, 'VIVIDS (CRAZY COLOUR)*', 'vivids', V([['Per Streak', 800, 640], ['Global Highlights', 3500, 2800]]), { notes: ['*Prices of Vivids are inclusive of Pre-Lightening charges'] }),
  S('pre-lightening', col, 'PRE-LIGHTENING', 'pre-lightening', V([['Per Streak', 450, 360], ['Global', 1500, 1200]]), { notes: ['*Pre-Lightening process required in case of colour change'] }),
  S('toning-glossing', col, 'TONING / GLOSSING', 'toning-glossing', one(700, 560)),
  S('pre-lifting', col, 'PRE-LIFTING', 'pre-lifting', one(650, 520)),

  S('structure-repair', tr, 'STRUCTURE REPAIR SPA', 'structure-repair-spa', one(1650, 1320)),
  S('molecular-repair', tr, 'MOLECULAR REPAIR TREATMENT', 'molecular-repair-treatment', one(1650, 1320)),
  S('colour-sealer', tr, 'COLOUR SEALER TREATMENT', 'colour-sealer-treatment', one(1100, 880)),
  S('deep-conditioning', tr, 'DEEP CONDITIONING SPA', 'deep-conditioning-spa', one(1100, 880)),
  S('treatment-add-on', tr, 'ADD ON', 'treatment-add-on', V([['Detox Scrub (Anti-Dandruff / Anti-Oil)', 350, 280], ['Lipid Shield (for Dry / Sensitive scalp)', 700, 560]]), { tag: 'Add-On' }),
  S('cysteine', tr, 'CYSTEINE', 'cysteine', one(3300, 2640), {
    rich: { subtitle: 'TEXTURE | PROTEIN TREATMENT', tagline: 'Frizz & Dryness Control', bestFor: ['Frizzy, wavy, or curly hair that needs control.', 'Sensitised hair.', 'Clients who want long-lasting smoothness without harsh chemicals.'], footnote: BOTOX_CYSTEINE_NOTE } }),
  S('botox', tr, 'BOTOX', 'botox', one(4400, 3520), {
    rich: { subtitle: 'TEXTURE | PROTEIN TREATMENT', tagline: 'Silky, Shiny & Manageable Hair', bestFor: ['Dry, damaged, or frizzy hair.', 'Dullness from heat, colour, or pollution.', 'Anyone who wants smoother, healthier-looking hair with a natural finish.'], footnote: BOTOX_CYSTEINE_NOTE } }),

  S('threading-eyebrows', th, 'THREADING (EYEBROWS)', 'threading-eyebrows', one(100, 80)),
  S('strip-less', th, 'WAXING — STRIP LESS', 'strip-less-waxing', V([['Nose', 200, 160], ['Ears', 200, 160], ['Cheeks', 200, 160]])),

  ...facials('men'),

  S('de-tan', de, 'DE TAN', 'de-tan', V([['Face', 850, 680], ['Face + Neck', 1100, 880], ['Neck ( Back )', 550, 440], ['Hands', 650, 520], ['Full Arms', 1300, 1040]])),

  ...handsFeet,
];
