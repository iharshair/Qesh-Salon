// Men's grooming packages ("Essentials"). Men only.
const common = {
  badges: [['PRECISION', 'Sharp lines. Every time.'], ['PREMIUM', 'Top-tier grooming.'], ['TAILORED', 'To your style. Every visit.']],
  section: 'packages',
};
export const packagesMen = [
  { ...common, id: 'pkg-essentials', name: 'ESSENTIALS', img: 'package-essentials', tagline: 'Smart, no-fuss grooming for the practical guy.',
    includes: ['Haircut (By Senior)', 'Beard Styling/Clean Shave', 'Face & Neck Detan'], duration: '75-90 MIN',
    variants: [{ id: 'v0', label: '', standard: 2100, elite: 1680, duration: '75-90 MIN' }] },
  { ...common, id: 'pkg-essentials-plus', name: 'ESSENTIALS PLUS', img: 'package-essentials-plus', tagline: 'Extra care-to-confidence routine for men who groom to stand out.',
    includes: ['Haircut (By Senior)', 'Beard Styling/Clean Shave', 'Face & Neck Detan', 'Glow Facial'], duration: '2.5-3 HRS',
    variants: [{ id: 'v0', label: '', standard: 3750, elite: 3000, duration: '2.5-3 HRS' }] },
  { ...common, id: 'pkg-essentials-pro', name: 'ESSENTIALS PRO', img: 'package-essentials-pro', tagline: 'Signature luxury grooming for men who treat every detail as nonnegotiable.',
    includes: ['Haircut (By Senior)', 'Beard Styling/Clean Shave', 'Face & Neck Detan', 'Fruit Facial', 'Express Manicure & Pedicure'], duration: '3.5-4 HRS',
    variants: [{ id: 'v0', label: '', standard: 6000, elite: 4800, duration: '3.5-4 HRS' }] },
];
