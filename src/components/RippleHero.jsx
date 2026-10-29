import React, { useEffect, useRef, useState } from 'react';
import { IMAGES } from '../data/images.js';
import { useGender } from '../context/AppContexts.jsx';
import { FitText, webglOk } from './ui.jsx';
import { useUI } from '../context/AppContexts.jsx';

/* Water Ripple — a real height-field water simulation on the GPU (wave equation, ping-pong textures).
   The pointer pushes the water along its exact path every frame, so slow and fast moves both react at the cursor with no lag.
   (Rebuilt from the React Bits idea; the registry could not be fetched from this environment.) */
const VS = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`;
const SIM = `precision highp float; varying vec2 vUv; uniform sampler2D uPrev; uniform vec2 uTexel; uniform vec2 uM0; uniform vec2 uM1;
uniform float uStrength; uniform float uRadius; uniform float uAspect; uniform float uDamp; uniform float uActive;
void main(){
  vec2 s = texture2D(uPrev, vUv).rg;
  float n = texture2D(uPrev, vUv + vec2(0., uTexel.y)).r; float so = texture2D(uPrev, vUv - vec2(0., uTexel.y)).r;
  float e = texture2D(uPrev, vUv + vec2(uTexel.x, 0.)).r; float w = texture2D(uPrev, vUv - vec2(uTexel.x, 0.)).r;
  float next = (n + so + e + w) * 0.5 - s.g;
  next *= uDamp;
  if (uActive > 0.5) {
    vec2 sc = vec2(uAspect, 1.0); vec2 q = vUv * sc; vec2 a = uM0 * sc; vec2 b = uM1 * sc; vec2 ab = b - a;
    float t = clamp(dot(q - a, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
    float d = length(q - (a + ab * t));
    next -= uStrength * exp(-(d * d) / (uRadius * uRadius));
  }
  gl_FragColor = vec4(next, s.r, 0., 1.);
}`;
const SHOW = `precision highp float; varying vec2 vUv; uniform sampler2D tex; uniform sampler2D uSim; uniform vec2 res; uniform vec2 imgRes; uniform vec2 uTexel; uniform float uRefr; uniform float gray;
void main(){
  float ra = res.x / res.y, ia = imgRes.x / imgRes.y; vec2 sc = vec2(1.0);
  if (ra > ia) sc.y = ia / ra; else sc.x = ra / ia;
  float hx = texture2D(uSim, vUv + vec2(uTexel.x * 1.5, 0.)).r - texture2D(uSim, vUv - vec2(uTexel.x * 1.5, 0.)).r;
  float hy = texture2D(uSim, vUv + vec2(0., uTexel.y * 1.5)).r - texture2D(uSim, vUv - vec2(0., uTexel.y * 1.5)).r;
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 tuv = (uv - 0.5) * sc + 0.5 + vec2(hx, -hy) * uRefr * sc;
  vec3 c = texture2D(tex, clamp(tuv, 0.002, 0.998)).rgb;
  vec3 nrm = normalize(vec3(-hx * 9.0, -hy * 9.0, 1.0));
  float spec = pow(max(dot(nrm, normalize(vec3(-0.35, 0.55, 0.75))), 0.0), 60.0) * 0.55;
  float shade = 1.0 + (hx * -1.8 + hy * 1.2) * 0.9;
  c = c * shade + spec;
  float g = dot(c, vec3(.299,.587,.114));
  gl_FragColor = vec4(mix(c, vec3(g), gray), 1.0);
}`;

function RippleCanvas({ src, strength = 0.2, grayscale = false, wrapRef, onFail }) {
  const cv = useRef(null);
  useEffect(() => {
    const canvas = cv.current; const wrap = wrapRef.current; if (!canvas || !wrap) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); if (!gl) { onFail && onFail(); return; }
    // float render targets: half float first (best support), then full float
    const hf = gl.getExtension('OES_texture_half_float'); const hfl = gl.getExtension('OES_texture_half_float_linear'); gl.getExtension('EXT_color_buffer_half_float');
    const ff = gl.getExtension('OES_texture_float'); const ffl = gl.getExtension('OES_texture_float_linear'); gl.getExtension('WEBGL_color_buffer_float');
    const mkTex = (w, h, type, linear) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type, null);
      const f = linear ? gl.LINEAR : gl.NEAREST; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
    const mkFbo = (t) => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; };
    const options = [];
    if (hf) options.push([hf.HALF_FLOAT_OES, !!hfl]); if (ff) options.push([gl.FLOAT, !!ffl]);
    let type = null, linear = false;
    for (const [ty, li] of options) { const t = mkTex(8, 8, ty, li); const f = mkFbo(t); const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null); if (ok) { type = ty; linear = li; break; } }
    if (type === null) { onFail && onFail(); return; }

    const mk = (t, str) => { const sh = gl.createShader(t); gl.shaderSource(sh, str); gl.compileShader(sh); return sh; };
    const prog = (fs) => { const pr = gl.createProgram(); gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); return pr; };
    const pSim = prog(SIM), pShow = prog(SHOW);
    if (!gl.getProgramParameter(pSim, gl.LINK_STATUS) || !gl.getProgramParameter(pShow, gl.LINK_STATUS)) { onFail && onFail(); return; }
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const bindQuad = (pr) => { const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0); };
    const U = (pr, n) => gl.getUniformLocation(pr, n);

    const tex = gl.createTexture(); const img = new Image(); let imgRes = [1, 1], ready = false;
    img.onload = () => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); imgRes = [img.naturalWidth, img.naturalHeight]; ready = true; };
    img.src = src;

    let W = 1, H = 1, SW = 2, SH = 2, simA, simB, fboA, fboB, dpr = 1;
    const build = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      SW = Math.min(512, Math.max(256, Math.round(W / 3))); SH = Math.max(2, Math.round(SW * H / W));
      simA = mkTex(SW, SH, type, linear); simB = mkTex(SW, SH, type, linear); fboA = mkFbo(simA); fboB = mkFbo(simB);
      for (const f of [fboA, fboB]) { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); } gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    build(); const ro = new ResizeObserver(() => build()); ro.observe(wrap);

    // pointer: remember the latest position; the frame loop draws one continuous push from the previous spot to this one
    let cur = null, last = null, splash = 0;
    const pos = (e) => { const r = wrap.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; };
    const move = (e) => { const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; cur = pos(evs.length ? evs[evs.length - 1] : e); };
    const down = (e) => { cur = pos(e); last = cur; splash = 1; };
    const leave = () => { cur = null; last = null; };
    wrap.addEventListener('pointermove', move, { passive: true }); wrap.addEventListener('pointerdown', down, { passive: true }); wrap.addEventListener('pointerleave', leave);

    let raf = 0, visible = true; const vis = () => { const v = window.scrollY < wrap.offsetHeight * 1.02; if (v !== visible) { visible = v; if (v && !raf) raf = requestAnimationFrame(frame); } };
    window.addEventListener('scroll', vis, { passive: true });
    const STEPS = 2;
    function step(read, write, rf, wf, m0, m1, str, rad, active) {
      gl.useProgram(pSim); bindQuad(pSim); gl.bindFramebuffer(gl.FRAMEBUFFER, wf); gl.viewport(0, 0, SW, SH);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, read); gl.uniform1i(U(pSim, 'uPrev'), 0); gl.uniform2f(U(pSim, 'uTexel'), 1 / SW, 1 / SH);
      gl.uniform2f(U(pSim, 'uM0'), m0[0], m0[1]); gl.uniform2f(U(pSim, 'uM1'), m1[0], m1[1]); gl.uniform1f(U(pSim, 'uStrength'), str); gl.uniform1f(U(pSim, 'uRadius'), rad);
      gl.uniform1f(U(pSim, 'uAspect'), W / H); gl.uniform1f(U(pSim, 'uDamp'), 0.9915); gl.uniform1f(U(pSim, 'uActive'), active ? 1 : 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function frame() {
      raf = 0; if (!visible) return;
      if (ready) {
        let m0 = [0, 0], m1 = [0, 0], str = 0, active = false, rad = 0.026;
        if (cur) {
          m1 = cur; m0 = last || cur; const dx = (m1[0] - m0[0]) * W, dy = (m1[1] - m0[1]) * H; const dist = Math.hypot(dx, dy);
          if (dist > 0.01 || splash) { active = true; str = Math.min(0.03, 0.004 + dist * 0.00025) * (0.6 + strength * 2); } /* energy follows distance moved, so slow and fast moves feel natural */
          last = cur;
        }
        if (splash) { active = true; str = Math.max(str, 0.1); rad = 0.045; splash = 0; if (!cur) active = false; }
        // sim: ping-pong, pointer push applied in the first step
        let rT = simA, wT = simB, rF = fboA, wF = fboB;
        for (let i = 0; i < STEPS; i++) { step(rT, wT, rF, wF, m0, m1, str, rad, active && i === 0); [rT, wT] = [wT, rT]; [rF, wF] = [wF, rF]; }
        // after the loop the freshest state is in rT; keep A as "latest" by swapping the references
        simA = rT; simB = wT; fboA = rF; fboB = wF;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(pShow); bindQuad(pShow);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U(pShow, 'tex'), 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, simA); gl.uniform1i(U(pShow, 'uSim'), 1);
        gl.uniform2f(U(pShow, 'res'), canvas.width, canvas.height); gl.uniform2f(U(pShow, 'imgRes'), imgRes[0], imgRes[1]); gl.uniform2f(U(pShow, 'uTexel'), 1 / SW, 1 / SH);
        gl.uniform1f(U(pShow, 'uRefr'), 0.5); gl.uniform1f(U(pShow, 'gray'), grayscale ? 1 : 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('scroll', vis); wrap.removeEventListener('pointermove', move); wrap.removeEventListener('pointerdown', down); wrap.removeEventListener('pointerleave', leave); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
  }, [src]); // eslint-disable-line
  return <canvas ref={cv} aria-hidden />;
}

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function HeroLayer({ g, cls, wrapRef }) {
  const src = IMAGES['hero_' + g]; const [failed, setFailed] = useState(false);
  if (!src) return <div className={'hero-layer ' + cls} />; // blank: neutral block, no effect
  if (!webglOk() || reduce()) return <div className={'hero-layer ' + cls}><img src={src} alt="" /></div>;
  return <div className={'hero-layer ' + cls}>{failed ? <img src={src} alt="" /> : <RippleCanvas src={src} wrapRef={wrapRef} onFail={() => setFailed(true)} />}</div>;
}

export default function Hero() {
  const { gender, prevGender } = useGender();
  const { openBooking } = useUI();
  const wrap = useRef(null);
  return (
    <>
    <div className="hero-spacer" data-hero-spacer aria-hidden />
    <section className="hero" ref={wrap} aria-label="Welcome to Qesh Salon" data-hero-section>
      {IMAGES['hero_' + gender] && <link rel="preload" as="image" href={IMAGES['hero_' + gender]} />}
      {prevGender && <HeroLayer key={'p' + prevGender} g={prevGender} cls="out" wrapRef={wrap} />}
      <HeroLayer key={'c' + gender} g={gender} cls={prevGender ? 'in' : ''} wrapRef={wrap} />
      <div className="bottom">
        <div className="copy">
          A Step to Your Best Self.<br />Welcome to Qesh.<br />
          <a className="ulink" href="#book" onClick={(e) => { e.preventDefault(); openBooking(); }}>Book an Appointment</a>
        </div>
        <FitText text="QESH SALON" />
      </div>
    </section>
    </>
  );
}
