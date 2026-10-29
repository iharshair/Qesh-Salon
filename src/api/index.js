// MOCK API LAYER — localStorage-backed, async with small delays.
// Replace each function body with the real backend call. Components never touch storage directly.
// Request/response shapes are documented with JSDoc.
import { local } from '../lib/storage.js';
import { config } from '../data/config.js';
import { catalog, packagesMen } from '../data/index.js';
import { ymd } from '../lib/format.js';

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const K = { user: 'qesh.user', otp: 'qesh.otp', users: 'qesh.users', bookings: 'qesh.bookings', mem: 'qesh.membership', wallet: 'qesh.wallet', orders: 'qesh.orders' };
const uid = (p) => p + Math.random().toString(36).slice(2, 8).toUpperCase();

/**
 * @typedef {{id:string,name:string,phone:string,email:string,bookingFor:'women'|'men'}} User
 * @typedef {{status:'none'|'active'|'expired',startedAt:string|null,expiresAt:string|null,referralCode?:string}} Membership
 * @typedef {{id:string,date:string,time:string,details:object,lines:object[],totals:object,status:'upcoming'|'cancelled'|'completed',payment:string,createdAt:string}} Booking
 */

export const auth = {
  /** @param {string} phone @returns {Promise<{ok:true}>} */
  async sendOtp(phone) { await wait(); local.set(K.otp, { phone, at: Date.now() }); return { ok: true }; },
  /** @param {string} phone @param {string} code @returns {Promise<{ok:boolean,isNew:boolean,user?:User}>} */
  async verifyOtp(phone, code) {
    await wait();
    if (code !== config.MOCK_OTP) return { ok: false, isNew: false }; // MOCK: accepts 123456
    const users = local.get(K.users, {});
    const user = users[phone];
    if (user) { local.set(K.user, user); return { ok: true, isNew: false, user }; }
    return { ok: true, isNew: true };
  },
  /** @param {{phone:string,name:string,email:string}} p @returns {Promise<User>} */
  async register(p) {
    await wait(150);
    const user = { id: uid('U'), phone: p.phone, name: p.name, email: p.email, bookingFor: 'women' };
    const users = local.get(K.users, {}); users[p.phone] = user; local.set(K.users, users); local.set(K.user, user); return user;
  },
  /** @returns {Promise<User|null>} */
  async me() { return local.get(K.user, null); },
  async update(patch) { const u = { ...local.get(K.user), ...patch }; local.set(K.user, u); const users = local.get(K.users, {}); users[u.phone] = u; local.set(K.users, users); return u; },
  async logout() { local.del(K.user); return { ok: true }; },
};

export const catalogApi = {
  /** @param {'women'|'men'} gender */
  async get(gender) { return { items: catalog[gender], packages: gender === 'men' ? packagesMen : [] }; },
};

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export const bookings = {
  /** @param {string} date YYYY-MM-DD @returns {Promise<{time:string,available:boolean}[]>} deterministic mock availability */
  async availability(date) {
    await wait(120);
    const [oh, om] = '10:00'.split(':').map(Number); // opening hours come from placeholders in the UI; mock uses 10-20
    const taken = new Set((local.get(K.bookings, []) || []).filter((b) => b.date === date && b.status === 'upcoming').map((b) => b.time));
    const out = [];
    for (let m = oh * 60 + om; m < 20 * 60; m += config.SLOT_MINUTES) {
      const t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      out.push({ time: t, available: hash(date + t) % 5 !== 0 && !taken.has(t) });
    }
    return out;
  },
  /** @param {object} payload {date,time,details,lines,totals,payment} @returns {Promise<Booking>} */
  async create(payload) {
    await wait(600);
    const b = { id: 'QS' + Math.random().toString(36).slice(2, 7).toUpperCase(), status: 'upcoming', createdAt: new Date().toISOString(), ...payload };
    local.set(K.bookings, [b, ...local.get(K.bookings, [])]); return b;
  },
  /** @returns {Promise<Booking[]>} */
  async list() { await wait(80); return local.get(K.bookings, []); },
  async cancel(id) { await wait(200); const l = local.get(K.bookings, []).map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)); local.set(K.bookings, l); return { ok: true }; },
  async reschedule(id, date, time) { await wait(200); const l = local.get(K.bookings, []).map((b) => (b.id === id ? { ...b, date, time } : b)); local.set(K.bookings, l); return { ok: true }; },
};

export const membership = {
  /** @returns {Promise<{orderId:string,amount:number,gst:number,total:number}>} */
  async createOrder() { await wait(200); const amount = config.MEMBERSHIP.price; const gst = Math.round(amount * config.GST_RATE * 100) / 100; const o = { orderId: uid('ORD'), amount, gst, total: Math.round((amount + gst) * 100) / 100 }; local.set(K.orders, o); return o; },
  /** @returns {Promise<Membership>} */
  async confirm(orderId) {
    await wait(200);
    const startedAt = new Date(); const expiresAt = new Date(startedAt.getTime() + config.MEMBERSHIP.days * 864e5);
    const m = { status: 'active', startedAt: startedAt.toISOString(), expiresAt: expiresAt.toISOString(), referralCode: 'QESH' + Math.random().toString(36).slice(2, 6).toUpperCase() };
    local.set(K.mem, m);
    const w = local.get(K.wallet, { qoins: 0, tx: [] });
    w.qoins += config.WELCOME_QOINS; w.tx.unshift({ label: 'Joining bonus', qoins: config.WELCOME_QOINS, worth: config.WELCOME_QOINS_VALUE, at: startedAt.toISOString() });
    local.set(K.wallet, w); return m;
  },
  /** @returns {Promise<Membership>} computes `expired` from expiresAt */
  async get() {
    const m = local.get(K.mem, null); if (!m) return { status: 'none', startedAt: null, expiresAt: null };
    return { ...m, status: new Date(m.expiresAt) > new Date() ? 'active' : 'expired' };
  },
};
export const wallet = { /** @returns {Promise<{qoins:number,tx:object[]}>} */ async get() { return local.get(K.wallet, { qoins: 0, tx: [] }); } };

/** Payment gateway interface. MOCK: resolves success after ~1.5 s. Plug in the real gateway here. */
export const payment = {
  async createOrder(order) { await wait(200); return { ...order, gatewayOrderId: uid('GW') }; },
  async pay(order, method) { await wait(1500); return { ok: true, paymentId: uid('PAY'), method, order }; },
  async verify(paymentId) { await wait(150); return { ok: true, paymentId }; },
};
export const api = { auth, catalog: catalogApi, bookings, membership, wallet, payment };
export default api;
