// Sections inside each filter tile. `tile`: hair | skin | hands-feet | packages. `modal2` = slug in modal2_<gender>_<slug>.
const D = {
  colour: 'Ammonia-based and ammonia-free colour, highlights, balayage and vivid shades. Pre-lightening is required in case of colour change. Prices are based on hair length — see our Hair Length Guide.',
  treat: 'Repair, conditioning and protein treatments for healthier hair. Not sure which to pick? Our stylists at Qesh Salon will assess your hair type, damage level, and goals to recommend the right treatments.',
  thread: 'Threading, strip less, sugar and liposoluble waxing for smooth, comfortable results.',
  facial: 'Facials and clean-ups for every skin need, with Hydra Facial and sheet masks as add-ons.',
  hands: 'Manicure, pedicure, reflexology and nail care for him and her.',
};
export const SECTIONS = {
  women: [
    { id: 'haircut-wash-styling', tile: 'hair', title: 'HAIRCUT, WASH & STYLING', desc: 'From precision cuts to blow-dry and styling, every service is done by our Master and Senior stylists. Haircuts by Master and Senior stylists include a complimentary hairwash.' },
    { id: 'hair-colour', tile: 'hair', title: 'HAIR COLOUR', desc: D.colour },
    { id: 'treatments-texture', tile: 'hair', title: 'TREATMENTS & TEXTURE', desc: D.treat },
    { id: 'threading-waxing', tile: 'skin', title: 'THREADING & WAXING', desc: D.thread },
    { id: 'facials-cleanup', tile: 'skin', title: 'FACIALS & CLEAN UP', desc: D.facial },
    { id: 'de-tan-body-polishing', tile: 'skin', title: 'DE TAN & BODY POLISHING', desc: 'Targeted de-tan and body polishing to refresh and even out your skin.' },
    { id: 'hands-feet', tile: 'hands-feet', title: 'HANDS & FEET', desc: D.hands },
  ],
  men: [
    { id: 'packages', tile: 'packages', title: 'GROOMING PACKAGES', desc: 'Precision. Premium. Tailored. Three Essentials packages, each priced as a single bookable item.' },
    { id: 'haircut-wash-beard', tile: 'hair', title: 'HAIRCUT, WASH & BEARD', desc: 'Precision haircuts, beard shaping and shaves, with a complimentary hairwash on Master and Senior stylist haircuts.' },
    { id: 'hair-colour', tile: 'hair', title: 'HAIR COLOUR', desc: D.colour },
    { id: 'treatments-texture', tile: 'hair', title: 'TREATMENTS & TEXTURE', desc: D.treat },
    { id: 'threading-waxing', tile: 'skin', title: 'THREADING & WAXING', desc: D.thread },
    { id: 'facials-cleanup', tile: 'skin', title: 'FACIALS & CLEAN UP', desc: D.facial },
    { id: 'de-tan', tile: 'skin', title: 'DE TAN', desc: 'Targeted de-tan to refresh and even out your skin.' },
    { id: 'hands-feet', tile: 'hands-feet', title: 'HANDS & FEET', desc: D.hands },
  ],
};
export const TILES = [
  { id: 'all', label: 'ALL', icon: 'dot' },
  { id: 'hair', label: 'HAIR', icon: 'x' },
  { id: 'skin', label: 'SKIN', icon: 'ticket' },
  { id: 'hands-feet', label: 'HANDS & FEET', icon: 'cross' },
];
