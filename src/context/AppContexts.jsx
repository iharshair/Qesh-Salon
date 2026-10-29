import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { local, session } from '../lib/storage.js';
import { api } from '../api/index.js';
import { itemById } from '../data/index.js';

/* ---------------- Gender ---------------- */
const GenderCtx = createContext(null);
export const useGender = () => useContext(GenderCtx);
export function GenderProvider({ children }) {
  const initial = () => {
    const q = new URLSearchParams(window.location.search).get('for');
    if (q === 'men' || q === 'women') return q;
    return local.get('qesh.gender', 'women');
  };
  const [gender, setG] = useState(initial);
  const [prev, setPrev] = useState(null); // for hero cross-fade
  const timer = useRef();
  const setGender = useCallback((g) => {
    if (g === gender) return;
    const root = document.documentElement;
    root.classList.add('gfade'); // cross-fades every .gx element
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPrev(gender); setG(g); local.set('qesh.gender', g);
      requestAnimationFrame(() => root.classList.remove('gfade'));
      setTimeout(() => setPrev(null), 520);
    }, 230);
  }, [gender]);
  useEffect(() => { document.documentElement.dataset.gender = gender; }, [gender]);
  return <GenderCtx.Provider value={{ gender, prevGender: prev, setGender }}>{children}</GenderCtx.Provider>;
}

/* ---------------- Auth ---------------- */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { api.auth.me().then((u) => { setUser(u); setReady(true); }); }, []);
  const value = useMemo(() => ({
    user, ready, setUser,
    logout: async () => { await api.auth.logout(); setUser(null); },
    update: async (patch) => setUser(await api.auth.update(patch)),
  }), [user, ready]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ---------------- Membership ---------------- */
const MemCtx = createContext(null);
export const useMembership = () => useContext(MemCtx);
export function MembershipProvider({ children }) {
  const { user } = useAuth();
  const [mem, setMem] = useState({ status: 'none' });
  const [wallet, setWallet] = useState({ qoins: 0, tx: [] });
  const refresh = useCallback(async () => { setMem(await api.membership.get()); setWallet(await api.wallet.get()); }, []);
  useEffect(() => { refresh(); }, [user, refresh]);
  const isMember = !!user && mem.status === 'active';
  const daysLeft = mem.expiresAt ? Math.max(0, Math.ceil((new Date(mem.expiresAt) - Date.now()) / 864e5)) : 0;
  return <MemCtx.Provider value={{ mem, wallet, isMember, daysLeft, refresh }}>{children}</MemCtx.Provider>;
}

/* ---------------- Booking cart (sessionStorage) ---------------- */
const BookCtx = createContext(null);
export const useBooking = () => useContext(BookCtx);
export function BookingProvider({ children }) {
  const [cart, setCart] = useState(() => session.get('qesh.cart', []));
  const [draft, setDraftState] = useState(() => session.get('qesh.draft', {}));
  useEffect(() => session.set('qesh.cart', cart), [cart]);
  useEffect(() => session.set('qesh.draft', draft), [draft]);
  const add = useCallback((itemId, variantId) => setCart((c) => {
    const item = itemById(itemId); const vid = variantId || item.variants[0].id; const key = itemId + ':' + vid;
    const found = c.find((x) => x.key === key);
    if (found) return c.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x));
    return [...c, { key, itemId, variantId: vid, qty: 1 }];
  }), []);
  const setQty = useCallback((key, qty) => setCart((c) => (qty <= 0 ? c.filter((x) => x.key !== key) : c.map((x) => (x.key === key ? { ...x, qty } : x)))), []);
  const clear = useCallback(() => { setCart([]); setDraftState({}); }, []);
  const setDraft = useCallback((p) => setDraftState((d) => ({ ...d, ...p })), []);
  return <BookCtx.Provider value={{ cart, add, setQty, clear, draft, setDraft }}>{children}</BookCtx.Provider>;
}

/* ---------------- UI (modals / overlays) ---------------- */
const UICtx = createContext(null);
export const useUI = () => useContext(UICtx);
export function UIProvider({ children }) {
  const [serviceId, setServiceId] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lengthGuide, setLengthGuide] = useState(false);
  const [preselect, setPreselect] = useState(null);
  const { add } = useBooking();
  const nav = useNavigate();
  const openBooking = useCallback((opts = {}) => {
    setPreselect(null);
    if (opts.itemId) { const it = itemById(opts.itemId); if (opts.variantId || it.variants.length === 1) add(opts.itemId, opts.variantId); else setPreselect(opts.itemId); }
    setServiceId(null); setMenuOpen(false); setBookingOpen(true);
  }, [add]);
  useEffect(() => {
    const lock = serviceId || bookingOpen || menuOpen;
    document.documentElement.classList.toggle('no-scroll', !!lock);
    document.documentElement.classList.toggle('overlay-open', !!(serviceId || bookingOpen));
  }, [serviceId, bookingOpen, menuOpen]);
  return (
    <UICtx.Provider value={{ serviceId, openService: setServiceId, closeService: () => setServiceId(null), bookingOpen, openBooking, closeBooking: () => setBookingOpen(false), menuOpen, setMenuOpen, lengthGuide, setLengthGuide, preselect, nav }}>
      {children}
    </UICtx.Provider>
  );
}
