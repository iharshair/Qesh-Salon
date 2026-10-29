// ONE pricing module used by cards, modals, carousel, variant picker and booking.
import { config } from '../data/config.js';
import { round2 } from './format.js';

/** @param {{standard:number,elite:number}} variant @param {boolean} member */
export const getPrice = (item, variant, member) => {
  const v = variant || item.variants[0];
  return member
    ? { main: v.elite, struck: v.standard, chip: false, member: true }
    : { main: v.standard, struck: null, elite: v.elite, chip: true, member: false };
};

/** "From" rule: cheapest variant for both prices. */
export const fromPrice = (item) => ({
  standard: Math.min(...item.variants.map((v) => v.standard)),
  elite: Math.min(...item.variants.map((v) => v.elite)),
  isFrom: item.variants.length > 1,
});

const rupee = (n) => '₹' + n.toLocaleString('en-IN');
/** Plain-text caption used under carousel cards (no buttons possible there). */
export const captionPrice = (item, member) => {
  const f = fromPrice(item);
  const pre = f.isFrom ? 'From ' : '';
  return member ? (f.isFrom ? `Elite price from ${rupee(f.elite)}` : `Elite price ${rupee(f.elite)}`) : `${pre}${rupee(f.standard)} · Elite Club ${rupee(f.elite)}`;
};

export const lengthSummary = (item) => (item.variants.length > 1 && !item.variants[0].label.startsWith('Short') ? null : item.variants.length > 1 ? 'Short · Medium · Long' : null);

/** Description: PDF text where given, else generated from variants only. */
export const describe = (item) => {
  if (item.rich?.tagline) return item.rich.tagline;
  if (item.tagline) return item.tagline;
  if (item.desc) return item.desc;
  const labels = item.variants.map((v) => v.label).filter(Boolean);
  if (labels.some((l) => /^(Short|Global Short)/.test(l))) return 'Available for Short, Medium and Long hair.';
  if (labels.length > 1) return 'Options: ' + labels.map((l) => l.replace(/\s*\(.*\)/, '')).slice(0, 4).join(', ') + (labels.length > 4 ? '…' : '.');
  return 'One price for this service.';
};
/** The reference "60min" slot: stated duration, else variant summary. */
export const durationSlot = (item) => {
  const d = item.duration || item.variants.find((v) => v.duration)?.duration;
  if (d && item.variants.filter((v) => v.duration).length === 1 && item.variants.length === 1) return { clock: true, text: d };
  if (item.variants.some((v) => /^Short/.test(v.label)) && item.variants.length <= 5) return { clock: false, text: 'Short · Medium · Long' };
  return { clock: false, text: item.variants.length > 1 ? `${item.variants.length} options` : '' };
};

/**
 * Cart: [{ key, itemId, variantId, qty }]. Returns lines, subtotal, offers, gst, total.
 * @param {(id:string)=>object} lookup
 */
export const priceCart = (cart, member, lookup) => {
  const lines = cart.map((c) => {
    const item = lookup(c.itemId);
    const variant = item.variants.find((v) => v.id === c.variantId) || item.variants[0];
    const unit = member ? variant.elite : variant.standard;
    let amount = unit * c.qty;
    if (item.cartridge && c.qty > 1) amount = unit + (unit * (c.qty - 1) * 0.5); // 2nd cartridge at 50%
    return { ...c, item, variant, unit, amount, offerNote: item.cartridge && c.qty > 1 ? '2nd cartridge at 50%' : null, discount: 0 };
  });
  const hasQualifier = lines.some((l) => l.item.hairwashQualifier);
  const pct = config.HAIRWASH_OFFER_PERCENT / 100;
  if (hasQualifier) {
    for (const l of lines) {
      if (!l.item.isHairwash || l.variant.noOffer) continue;
      const half = (config.STACK_HAIRWASH_OFFER_WITH_ELITE ? l.unit : l.variant.standard) * (1 - pct);
      const target = config.STACK_HAIRWASH_OFFER_WITH_ELITE ? half : Math.min(half, l.unit);
      const newAmount = target * l.qty;
      if (newAmount < l.amount) { l.discount = round2(l.amount - newAmount); l.offerNote = `Hairwash at ${config.HAIRWASH_OFFER_PERCENT}% OFF`; }
    }
  }
  const gross = round2(lines.reduce((s, l) => s + l.amount, 0));
  const offers = round2(lines.reduce((s, l) => s + l.discount, 0));
  const subtotal = round2(gross - offers);
  const gst = round2(subtotal * config.GST_RATE);
  const total = round2(subtotal * (1 + config.GST_RATE));
  return { lines, gross, offers, subtotal, gst, total };
};
/** What the same cart would cost with Elite prices (for the "save ₹X" line). */
export const eliteSaving = (cart, lookup) => {
  const a = priceCart(cart, false, lookup).subtotal;
  const b = priceCart(cart, true, lookup).subtotal;
  return Math.max(0, round2(a - b));
};
