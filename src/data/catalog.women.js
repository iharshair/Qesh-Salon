import { V, one, LEN, handsFeet, facials, BOTOX_CYSTEINE_NOTE } from './catalog.shared.js';
// WOMEN catalogue — exact names and prices from the client PDF. [standard, elite]
const S = (id, section, name, img, variants, extra = {}) => ({ id: 'w-' + id, section, name, img, variants, ...extra });
const HW = 'Get Hairwash at 50% OFF with Haircut / Styling';
const NOTE_PL = '*Pre-Lightening process required in case of colour change';
const NOTE_VIV = '*Prices of Vivids are inclusive of Pre-Lightening charges';
const hc = 'haircut-wash-styling', col = 'hair-colour', tr = 'treatments-texture', th = 'threading-waxing', de = 'de-tan-body-polishing';

export const womenCatalog = [
  S('haircut', hc, 'HAIRCUT', 'haircut', V([['Fringe', 300, 240], ['Girls (Below 12 years)', 500, 400], ['Master Stylist (Includes Complimentary Hairwash)', 800, 640], ['Senior Stylist (Includes Complimentary Hairwash)', 1000, 800]]), { offers: [HW], hairwashQualifier: true }),
  S('hairwash', hc, 'HAIRWASH', 'hairwash', V([['Short Length', 400, 320], ['Medium Length', 500, 400], ['Long Length', 600, 480], ['Pre-Wash (Before Colour Services - Without Conditioning)', 350, 280, null, { noOffer: true }], ['Sulphate-free Add-on', 60, 48, null, { noOffer: true }]]), { isHairwash: true, lengthGuide: true }),
  S('blow-dry', hc, 'BLOW DRY', 'blow-dry', LEN([450, 360], [550, 440], [650, 520]), { offers: [HW], hairwashQualifier: true, lengthGuide: true }),
  S('ironing-tongs', hc, 'IRONING / TONGS', 'ironing-tongs', LEN([650, 520], [750, 600], [850, 680]), { offers: [HW], hairwashQualifier: true, lengthGuide: true }),

  S('ammonia-based', col, 'AMMONIA-BASED', 'ammonia-based', V([['Touch-up (Up to 2 inches)', 1750, 1400], ['Touch-up (Up to 4 inches)', 2200, 1760], ['Global Short Length', 3500, 2800], ['Global Medium Length', 5000, 4000], ['Global Long Length', 6600, 5280]]), { lengthGuide: true }),
  S('ammonia-free', col, 'AMMONIA-FREE', 'ammonia-free', V([['Touch-up (Up to 2 inches)', 2000, 1600], ['Touch-up (Up to 4 inches)', 2500, 2000], ['Global Short Length', 4100, 3280], ['Global Medium Length', 5500, 4400], ['Global Long Length', 6800, 5440]]), { lengthGuide: true }),
  S('highlights', col, 'HIGHLIGHTS', 'highlights', V([['Per Streak*', 450, 360], ['Short Length', 4100, 3280], ['Medium Length', 5500, 4400], ['Long Length', 6800, 5440]]), { notes: ['*Additional Hairwash charges applicable if required'], lengthGuide: true }),
  S('balayage', col, 'BALAYAGE', 'balayage', LEN([4400, 3520], [5700, 4560], [7000, 5600]), { lengthGuide: true }),
  S('pre-lightening', col, 'PRE-LIGHTENING', 'pre-lightening', V([['Per Streak', 400, 320], ['Short Length', 2000, 1600], ['Medium Length', 2750, 2200], ['Long Length', 3500, 2800]]), { notes: [NOTE_PL], lengthGuide: true }),
  S('pre-lifting', col, 'PRE-LIFTING', 'pre-lifting', one(1100, 880)),
  S('toning-glossing', col, 'TONING / GLOSSING', 'toning-glossing', LEN([1500, 1200], [1900, 1520], [2400, 1920]), { lengthGuide: true }),
  S('vivids', col, 'VIVIDS (CRAZY COLOUR)*', 'vivids', V([['Per Streak', 850, 680], ['Short Length', 8000, 6400], ['Medium Length', 10000, 8000], ['Long Length', 12000, 9600]]), { notes: [NOTE_VIV], lengthGuide: true }),

  S('structure-repair-spa', tr, 'STRUCTURE REPAIR SPA', 'structure-repair-spa', LEN([2400, 1920], [3000, 2400], [3800, 3040]), { lengthGuide: true }),
  S('molecular-repair', tr, 'MOLECULAR REPAIR TREATMENT', 'molecular-repair-treatment', LEN([2400, 1920], [3000, 2400], [3800, 3040]), { lengthGuide: true }),
  S('colour-sealer', tr, 'COLOUR SEALER TREATMENT', 'colour-sealer-treatment', LEN([1100, 880], [1550, 1240], [2000, 1600]), { lengthGuide: true }),
  S('deep-conditioning', tr, 'DEEP CONDITIONING SPA', 'deep-conditioning-spa', LEN([1100, 880], [1550, 1240], [2000, 1600]), { lengthGuide: true }),
  S('treatment-add-on', tr, 'ADD-ON', 'treatment-add-on', V([['Detox Scrub (Anti-Dandruff / Anti-Oil)', 350, 280], ['Lipid Shield (for Dry / Sensitive scalp)', 700, 560]]), { tag: 'Add-On' }),
  S('head-massage', tr, 'HEAD MASSAGE', 'head-massage', one(900, 720), { offers: ['Get Hairwash at 50% OFF with Head Massage'], hairwashQualifier: true }),
  S('botox', tr, 'BOTOX', 'botox', V([['Fringe', 1900, 1520], ['Short Length', 4700, 3760], ['Medium Length', 6600, 5280], ['Long Length', 8500, 6800]]), {
    lengthGuide: true,
    rich: { subtitle: 'TEXTURE | PROTEIN TREATMENT', tagline: 'Silky, Shiny & Manageable Hair', bestFor: ['Dry, damaged, or frizzy hair.', 'Dullness from heat, colour, or pollution.', 'Anyone who wants smoother, healthier-looking hair with a natural finish.'], footnote: BOTOX_CYSTEINE_NOTE } }),
  S('cysteine', tr, 'CYSTEINE', 'cysteine', V([['Fringe', 1750, 1400], ['Short Length', 4600, 3680], ['Medium Length', 6100, 4880], ['Long Length', 7800, 6240]]), {
    lengthGuide: true,
    rich: { subtitle: 'TEXTURE | PROTEIN TREATMENT', tagline: 'Frizz & Dryness Control', bestFor: ['Frizzy, wavy, or curly hair that needs control.', 'Sensitised hair.', 'Clients who want long-lasting smoothness without harsh chemicals.'], footnote: BOTOX_CYSTEINE_NOTE } }),

  S('threading', th, 'THREADING', 'threading', V([['Eyebrow', 100, 80], ['Face (Any one - Upper Lip / Chin / Forehead / Jawline / Side Locks / Neck)', 100, 80], ['Full Face', 400, 320]])),
  S('strip-less', th, 'WAXING — STRIP LESS', 'strip-less-waxing', V([['Underarms', 350, 280], ['Face (Any one - Upper Lip / Chin / Forehead / Jawline / Side Locks / Neck)', 200, 160], ['Full Face', 1000, 800], ['Bikini Line', 1500, 1200], ['Brazilian', 2100, 1680]])),
  S('sugar-wax', th, 'SUGAR WAX', 'sugar-wax', V([['Underarms', 220, 176], ['Half-Arms', 440, 352], ['Full Arms', 660, 528], ['Half Legs', 550, 440], ['Back/Stomach', 440, 352], ['Front', 380, 304], ['Full Legs', 900, 720], ['Full Body', 2500, 2000]])),
  S('liposoluble', th, 'LIPOSOLUBLE', 'liposoluble-wax', V([['Half-Arms', 500, 400], ['Full Arms', 850, 680], ['Half Legs', 750, 600], ['Back/Stomach', 650, 520], ['Front', 500, 400], ['Full Legs', 1100, 880], ['Full Body', 3300, 2640], ['Full Body + Bikini Line (With Strip Less Wax)', 4500, 3600]])),
  S('roll-on', th, 'ROLL ON/CARTRIDGE WAX', 'roll-on-cartridge-wax', one(1300, 1040), { offers: ['Pay for 2nd cartridge at 50%'], cartridge: true }),

  ...facials('women'),

  S('de-tan', de, 'DE TAN', 'de-tan', V([['Face', 850, 680], ['Face + Neck', 1100, 880], ['Neck (Back)', 550, 440], ['Full Arms', 1300, 1040], ['Full Legs', 2000, 1600], ['Back', 1100, 880], ['Half back', 650, 520], ['Full Body', 3300, 2640]])),
  S('body-polishing', de, 'BODY POLISHING (with Hydra Machine)', 'body-polishing', V([['Arms', 1250, 1000], ['Neck', 750, 600], ['Back', 1850, 1480]])),

  ...handsFeet,
];
