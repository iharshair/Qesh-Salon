// All browser storage goes through here (always wrapped in try/catch).
const mk = (store) => ({
  get(key, fallback = null) { try { const v = window[store].getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { window[store].setItem(key, JSON.stringify(value)); } catch { /* ignore */ } },
  del(key) { try { window[store].removeItem(key); } catch { /* ignore */ } },
});
export const local = mk('localStorage');
export const session = mk('sessionStorage');
