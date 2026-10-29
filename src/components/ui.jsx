import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IMAGES } from '../data/images.js';

/** Image slot: real image if the slot has a file, otherwise a flat neutral block of the same size. */
export function Slot({ id, alt = '', className = '', style, eager, children }) {
  const src = IMAGES[id];
  return (
    <div className={'slot ' + className} style={style} data-slot={id} data-blank={src ? undefined : 'true'}>
      {src && <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false" />}
      {children}
    </div>
  );
}

export function Logo({ light, className = '' }) {
  const src = IMAGES[light ? 'logo_light' : 'logo_dark'] || IMAGES.logo_dark;
  const derived = light && !IMAGES.logo_light;
  return <img className={className} src={src} alt="Qesh Salon" style={derived ? { filter: 'brightness(0) invert(1)' } : undefined} />;
}

/** Adds `.in` to the element when it scrolls into view. */
export function useReveal(opts = { threshold: 0.35 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, opts);
    io.observe(el); return () => io.disconnect();
  }, []); // eslint-disable-line
  return [ref, seen];
}

/** ( TEXT ) bracket tag, drawn only from CSS so it scales with the heading. */
export function BTag({ children, seen, staticTag }) {
  return (
    <span className={'btag' + (seen ? ' in' : '') + (staticTag ? ' static in' : '')} aria-label={String(children)}>
      <i className="b l" aria-hidden /><span className="t">{children}</span><i className="b r" aria-hidden />
    </span>
  );
}

/** Heading with inline bracket tags. parts: strings, or {tag:'ABOUT US'} */
export function TaggedHeading({ parts, as: Tag = 'h2', className = '', staticTags }) {
  const [ref, seen] = useReveal({ threshold: 0.3 });
  return (
    <Tag ref={ref} className={'h-display ' + className}>
      {parts.map((p, i) => (typeof p === 'string' ? <React.Fragment key={i}>{p} </React.Fragment> : p.br ? <br key={i} /> : <React.Fragment key={i}><BTag seen={seen} staticTag={staticTags}>{p.tag}</BTag>{' '}</React.Fragment>))}
    </Tag>
  );
}

/** Scales text so it fills the width of its box (giant wordmark). */
export function FitText({ text, className = '', pad = 0 }) {
  const box = useRef(null); const span = useRef(null);
  const fit = () => {
    const b = box.current, s = span.current; if (!b || !s) return;
    s.style.fontSize = '100px';
    const w = s.getBoundingClientRect().width;
    const avail = b.clientWidth - pad;
    s.style.fontSize = (100 * avail) / w + 'px';
  };
  useLayoutEffect(() => {
    fit();
    const ro = new ResizeObserver(fit); ro.observe(box.current);
    document.fonts?.ready?.then(fit);
    return () => ro.disconnect();
  }, [text]); // eslint-disable-line
  return (
    <div ref={box} className={'wordmark ' + className} aria-hidden>
      <span ref={span} style={{ display: 'inline-block' }}>{text}</span>
    </div>
  );
}

export const Icon = ({ k, className = '' }) => {
  const p = { className, viewBox: '0 0 14 14', fill: 'currentColor', 'aria-hidden': true };
  if (k === 'dot') return <svg {...p}><circle cx="7" cy="7" r="6" /><circle cx="7" cy="7" r="2.4" fill="#fff" /></svg>;
  if (k === 'ticket') return <svg {...p}><path d="M1 2h12v10H1z" /><rect x="4.4" y="4.8" width="5.2" height="4.4" fill="#fff" /></svg>;
  if (k === 'cross') return <svg {...p}><path d="M1 1h4l2 3 2-3h4l-4 6 4 6H9L7 10l-2 3H1l4-6z" /></svg>;
  return <svg {...p}><path d="M1 1h3.6L7 4.4 9.4 1H13L8.8 7 13 13H9.4L7 9.6 4.6 13H1l4.2-6z" /></svg>;
};
export const ArrowRight = () => <svg viewBox="0 0 60 12" width="60" height="12" fill="none" stroke="currentColor" strokeWidth="1"><path d="M0 6h58M53 1l5 5-5 5" /></svg>;

export const useMedia = (q) => {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false));
  useEffect(() => { const mq = window.matchMedia(q); const f = () => setM(mq.matches); mq.addEventListener('change', f); f(); return () => mq.removeEventListener('change', f); }, [q]);
  return m;
};
export const webglOk = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch { return false; } };
