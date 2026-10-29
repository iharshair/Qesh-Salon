import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { IMAGES } from '../data/images.js';
import { Slot, webglOk, ArrowRight } from './ui.jsx';

/* Flex Carousel — rebuilt from the React Bits docs/video (the registry could not be fetched from this environment).
   Same feel: liquid wave warp, focused card largest, squeezed neighbours, captions, counter, "rise" intro.
   Differences by design (spec 12B): focusOnClick is OFF for the focused card — clicking it calls onOpen (service modal). */
const VS = `attribute vec2 aUV; uniform vec2 uRes; uniform vec4 uRect; uniform vec4 uWave; varying vec2 vUv;
void main(){ vec2 p = uRect.xy + aUV*uRect.zw; float ph = p.x*uWave.y + uWave.z; float w = sin(ph);
  p.y += uWave.x*w + uWave.w; p.x += uWave.x*0.28*cos(ph)*(aUV.y-.5);
  gl_Position = vec4(p.x/uRes.x*2.0-1.0, 1.0-p.y/uRes.y*2.0, 0., 1.); vUv = aUV; }`;
const FS = `precision mediump float; varying vec2 vUv; uniform sampler2D uTex; uniform vec2 uCover; uniform float uFocus; uniform float uAlpha;
void main(){ vec2 uv = (vUv-.5)*uCover+.5; vec4 c = texture2D(uTex, uv);
  vec3 col = c.rgb; float grad = smoothstep(.32,1.,vUv.y); col *= 1.0 - grad*mix(.62,.5,uFocus); col *= mix(.92,1.,uFocus);
  gl_FragColor = vec4(col, uAlpha); }`;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FlexCarousel = React.forwardRef(function FlexCarousel({ items, onOpen, onBook, onIndex, initialIndex = 0, gap = 12, squeeze = 0.2 }, ref) {
  const box = useRef(null), cv = useRef(null), tx = useRef([]);
  const st = useRef({ pos: initialIndex, target: initialIndex, vel: 0, idx: initialIndex });
  const [idx, setIdx] = useState(initialIndex);
  const [gl_ok, setGlOk] = useState(() => webglOk() && !reduced());
  const N = items.length;
  const itemsKey = items.map((i) => i.id).join(',');

  useImperativeHandle(ref, () => ({ goTo: (i) => { st.current.target = clamp(Math.round(i), 0, N - 1); } }), [N]);

  useEffect(() => {
    if (!gl_ok) return;
    const wrap = box.current, canvas = cv.current; const S = st.current;
    if (!wrap || !canvas) return;
    let gl = null;
    try {
      gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: true, alpha: true, preserveDrawingBuffer: true })
        || canvas.getContext('experimental-webgl');
    } catch { gl = null; }
    if (!gl || gl.isContextLost()) { setGlOk(false); return; }
    const sh = (t, s) => {
      const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; }
      return o;
    };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { setGlOk(false); return; }
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); setGlOk(false); return; }
    gl.useProgram(prog);
    // grid mesh 48 x 2
    const C = 48, verts = [], ind = [];
    for (let r = 0; r <= 2; r++) for (let c = 0; c <= C; c++) verts.push(c / C, r / 2);
    for (let r = 0; r < 2; r++) for (let c = 0; c < C; c++) { const a = r * (C + 1) + c, b = a + 1, d = a + C + 1, e = d + 1; ind.push(a, b, d, b, e, d); }
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ind), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(prog, 'aUV'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uRect', 'uWave', 'uTex', 'uCover', 'uFocus', 'uAlpha'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // textures: neutral 1x1 until the image has loaded (blank slots stay neutral)
    const neutral = (() => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([172, 166, 159, 255])); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; })();
    const tex = items.map(() => ({ t: neutral, asp: 1, req: false }));
    const load = (i) => {
      const e = tex[i]; if (e.req) return; e.req = true; const src = IMAGES[items[i].slotId]; if (!src) return;
      const im = new Image(); im.onload = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        // keep textures small enough for mobile GPUs
        let source = im; const max = 1400; if (Math.max(im.naturalWidth, im.naturalHeight) > max) { const k = max / Math.max(im.naturalWidth, im.naturalHeight); const c = document.createElement('canvas'); c.width = im.naturalWidth * k; c.height = im.naturalHeight * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); source = c; }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        e.t = t; e.asp = im.naturalWidth / im.naturalHeight; };
      im.src = src;
    };

    let W = 1, H = 1, dpr = 1;
    const resize = () => { dpr = Math.min(2, window.devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; };
    resize(); const ro = new ResizeObserver(resize); ro.observe(wrap);

    const dims = () => {
      const mobile = W < 700; const area = H - 56; const cardH = area * (mobile ? 0.94 : 0.92);
      const focusW = mobile ? Math.min(W * 0.76, cardH * 0.82) : Math.min(cardH * 0.84, W * 0.34);
      const sideW = focusW * (mobile ? 0.34 : 0.62) * (1 - squeeze * 0.35);
      return { mobile, cardH, focusW, sideW, cy: area / 2 + 4 };
    };
    const layout = (pos, D) => {
      const out = []; let left = 0;
      for (let i = 0; i < N; i++) {
        let f = clamp(1 - Math.abs(i - pos), 0, 1); f = f * f * (3 - 2 * f);
        const w = D.sideW + (D.focusW - D.sideW) * f; const h = D.cardH * (0.9 + 0.1 * f);
        out.push({ i, f, w, h, left, c: left + w / 2 }); left += w + gap;
      }
      const a = clamp(Math.floor(pos), 0, N - 1), b = clamp(a + 1, 0, N - 1), fr = pos - a;
      const cpos = out[a].c + (out[b].c - out[a].c) * fr;
      out.forEach((o) => (o.x = o.c - cpos + W / 2));
      return out;
    };
    const waveY = (x, A, k, ph) => A * Math.sin(x * k + ph);

    const t0 = performance.now(); let last = t0, raf, visible = true, rafOn = false;
    const A0 = () => H * 0.038;
    let curLayout = [], curD = dims(), curWave = { A: 0, k: 0, ph: 0 };

    function frame(nowT) {
      rafOn = false; if (!visible) return;
      const dt = Math.min(0.05, (nowT - last) / 1000); last = nowT; const t = (nowT - t0) / 1000;
      const prev = S.pos; S.pos += (S.target - S.pos) * (1 - Math.exp(-dt * 8.5)); if (Math.abs(S.target - S.pos) < 0.0005) S.pos = S.target;
      const v = dt > 0 ? (S.pos - prev) / dt : 0; S.vel += (v - S.vel) * 0.18;
      const ri = clamp(Math.round(S.target), 0, N - 1); if (ri !== S.idx) { S.idx = ri; setIdx(ri); onIndex && onIndex(ri); }
      const D = curD = dims();
      const A = A0() + clamp(Math.abs(S.vel), 0, 4) * H * 0.028; const k = (Math.PI * 2) / (W * 0.95); const ph = t * 0.55 - S.pos * 1.6;
      curWave = { A, k, ph }; const L = curLayout = layout(S.pos, D);
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uRes, W, H); gl.uniform1i(U.uTex, 0); gl.activeTexture(gl.TEXTURE0);
      try {
        for (const o of L) {
          const el = tx.current[o.i]; const vis = o.x + o.w / 2 > -60 && o.x - o.w / 2 < W + 60;
          if (!vis) { if (el && el.style.display !== 'none') el.style.display = 'none'; continue; }
          if (Math.abs(o.i - S.target) < 6) load(o.i);
          const rise = ease((t - 0.08 - Math.min(Math.abs(o.i - initialIndex), 6) * 0.07) / 0.95);
          const yoff = (1 - rise) * H * 0.42; const top = D.cy - o.h / 2;
          const e = tex[o.i]; const ca = o.w / o.h, ta = e.asp; const cover = ca > ta ? [1, ta / ca] : [ca / ta, 1];
          gl.bindTexture(gl.TEXTURE_2D, e.t);
          gl.uniform4f(U.uRect, o.x - o.w / 2, top, o.w, o.h); gl.uniform4f(U.uWave, A, k, ph, yoff);
          gl.uniform2f(U.uCover, cover[0], cover[1]); gl.uniform1f(U.uFocus, o.f); gl.uniform1f(U.uAlpha, rise);
          gl.drawElements(gl.TRIANGLES, ind.length, gl.UNSIGNED_SHORT, 0);
          if (el) { // DOM text follows the card (crisp text, real buttons)
            const wy = waveY(o.x, A, k, ph) + yoff; const m = D.mobile;
            el.style.display = 'block'; el.style.width = o.w + 'px'; el.style.height = o.h + 'px'; el.style.opacity = rise;
            el.style.transform = `translate(${o.x - o.w / 2}px, ${top + wy}px)`;
            const f = o.f; const q = el.querySelector('.in');
            if (q) {
              const ttl = q.querySelector('.ttl'), num = q.querySelector('.num'), price = q.querySelector('.price');
              const dsc = q.querySelector('.dsc'), acts = q.querySelector('.acts');
              if (ttl) ttl.style.fontSize = (m ? 15 + f * 14 : 14 + f * 26) + 'px';
              if (num) num.style.opacity = 0.5 + f * 0.5;
              if (price) price.style.display = o.w < 90 ? 'none' : 'block';
              if (dsc) { dsc.style.opacity = clamp((f - 0.55) / 0.45, 0, 1); dsc.style.display = f > 0.55 ? 'block' : 'none'; dsc.style.fontSize = (m ? 12 : 13.5) + 'px'; }
              if (acts) { acts.style.opacity = clamp((f - 0.55) / 0.45, 0, 1); acts.style.display = f > 0.55 ? 'flex' : 'none'; acts.style.pointerEvents = f > 0.9 ? 'auto' : 'none'; }
            }
          }
        }
      } catch (err) {
        console.warn('FlexCarousel frame error:', err);
      }
      rafOn = true; raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (!rafOn) { last = performance.now(); rafOn = true; raf = requestAnimationFrame(frame); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0 }); io.observe(wrap);
    kick();

    // ---- interaction ----
    const step = () => Math.max(60, curD.sideW + gap);
    let drag = null;
    const hit = (cx, cy) => { const r = wrap.getBoundingClientRect(); const x = cx - r.left; return curLayout.find((o) => x >= o.x - o.w / 2 && x <= o.x + o.w / 2); };
    const down = (e) => {
      if (e.target.closest('.acts') || e.target.closest('.arrows')) return;
      drag = { x: e.clientX, y: e.clientY, pos: S.pos, moved: false, t: performance.now(), lastX: e.clientX, lastT: performance.now(), v: 0 };
      wrap.setPointerCapture?.(e.pointerId); wrap.classList.add('drag');
    };
    const move = (e) => {
      if (!drag) return; const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) drag.moved = true;
      if (drag.moved) { S.target = S.pos = clamp(drag.pos - dx / (step() * 0.9), 0, N - 1); const now = performance.now(); drag.v = (drag.lastX - e.clientX) / Math.max(1, now - drag.lastT); drag.lastX = e.clientX; drag.lastT = now; kick(); }
    };
    const up = (e) => {
      if (!drag) return; wrap.classList.remove('drag');
      if (drag.moved) S.target = clamp(Math.round(S.pos + (drag.v * 260) / step()), 0, N - 1);
      else { const o = hit(e.clientX, e.clientY); if (o) { if (o.i === Math.round(S.target)) onOpen && onOpen(items[o.i]); else S.target = o.i; } }
      drag = null; kick();
    };
    let wheelT; const wheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // let the page scroll vertically
      e.preventDefault(); S.target = clamp(S.target + e.deltaX / (step() * 1.4), 0, N - 1); clearTimeout(wheelT); wheelT = setTimeout(() => (S.target = Math.round(S.target)), 130); kick();
    };
    const key = (e) => {
      if (e.key === 'ArrowRight') { S.target = clamp(Math.round(S.target) + 1, 0, N - 1); e.preventDefault(); kick(); }
      else if (e.key === 'ArrowLeft') { S.target = clamp(Math.round(S.target) - 1, 0, N - 1); e.preventDefault(); kick(); }
      else if (e.key === 'Enter') { onOpen && onOpen(items[clamp(Math.round(S.target), 0, N - 1)]); }
    };
    wrap.addEventListener('pointerdown', down); wrap.addEventListener('pointermove', move); wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    wrap.addEventListener('wheel', wheel, { passive: false }); wrap.addEventListener('keydown', key);
    wrap.__kick = kick;
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      wrap.removeEventListener('pointerdown', down); wrap.removeEventListener('pointermove', move); wrap.removeEventListener('pointerup', up); wrap.removeEventListener('pointercancel', up); wrap.removeEventListener('wheel', wheel); wrap.removeEventListener('keydown', key);
      try {
        gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(vb); gl.deleteBuffer(ib);
        tex.forEach((e) => e.t && e.t !== neutral && gl.deleteTexture(e.t));
        gl.deleteTexture(neutral);
      } catch {}
    };
  }, [itemsKey, gl_ok]); // eslint-disable-line

  const go = (d) => { st.current.target = clamp(Math.round(st.current.target) + d, 0, N - 1); box.current?.__kick?.(); };
  const pad2 = (n) => String(n).padStart(2, '0');

  if (!gl_ok) { // fallback: horizontal scroll-snap row (no WebGL or reduced motion)
    return (
      <div className="fb-row" role="list">
        {items.map((it, i) => (
          <button key={it.id} role="listitem" className="fcard" onClick={() => onOpen(it)}>
            <Slot id={it.slotId} alt={it.title} />
            <span className="in"><b>{it.title}</b><span>{it.caption}</span></span>
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="fc" ref={box} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Services carousel. Use arrow keys, drag or swipe.">
      <canvas ref={cv} aria-hidden />
      {items.map((it, i) => (
        <div className="cardtx" key={it.id} ref={(el) => (tx.current[i] = el)}>
          <div className="in">
            <div className="num">{pad2(i + 1)}</div>
            <div className="ttl">{it.title}</div>
            <div className="price">{it.price}{it.meta ? <span> · {it.meta}</span> : null}</div>
            <div className="dsc">{it.desc}</div>
            <div className="acts">
              <button className="bk" onClick={(e) => { e.stopPropagation(); onBook && onBook(it); }}>Book Now</button>
              <button className="lm" onClick={(e) => { e.stopPropagation(); onOpen && onOpen(it); }}>Learn More →</button>
            </div>
          </div>
        </div>
      ))}
      <div className="arrows"><button aria-label="Previous service" onClick={() => go(-1)}>←</button><button aria-label="Next service" onClick={() => go(1)}>→</button></div>
      <div className="cnt" aria-live="polite"><i /><span>{pad2(idx + 1)} / {pad2(N)}</span><i /></div>
      <ul className="sr">{items.map((it) => <li key={it.id}><button onClick={() => onOpen(it)}>{it.title}, {it.caption}</button></li>)}</ul>
    </div>
  );
});
export default FlexCarousel;
