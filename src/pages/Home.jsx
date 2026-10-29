import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGender, useMembership, useUI } from '../context/AppContexts.jsx';
import { tileCount, packagesMen, itemsFor } from '../data/index.js';
import { placeholders } from '../data/placeholders.js';
import { membership } from '../data/membership.js';
import { config } from '../data/config.js';
import { captionPrice, describe, durationSlot } from '../lib/pricing.js';
import { inr } from '../lib/format.js';
import Hero from '../components/RippleHero.jsx';
import ServicesView, { toCarouselItems } from '../components/ServicesView.jsx';
import FlexCarousel from '../components/FlexCarousel.jsx';
import { Slot, TaggedHeading, Icon, useReveal, ArrowRight } from '../components/ui.jsx';

const ABOUT = {
  women: { head: ['WE', { tag: 'ABOUT US' }, 'HELP CREATE MOMENTS OF BEAUTY FOR YOU', { tag: 'ABOUT US' }, 'AND YOUR GLOW', { tag: 'ABOUT US' }],
    p: "Qesh is a premium unisex salon in Dhanori, Pune, offering expert care for hair, skin and nails. We provide personalized consultations to select treatments that precisely address each client's individual needs." },
  men: { head: ['WE', { tag: 'ABOUT US' }, 'HELP CREATE MOMENTS OF CONFIDENCE FOR YOU', { tag: 'ABOUT US' }, 'AND YOUR STYLE', { tag: 'ABOUT US' }],
    p: "Qesh is a premium unisex salon in Dhanori, Pune, offering expert grooming for hair, beard, skin and nails. We provide personalized consultations to select services that precisely address each client's individual needs." },
};
const STRIP = [['hair', 'HAIR', 'x'], ['skin', 'SKIN', 'ticket'], ['hands-feet', 'HANDS & FEET', 'x']];

export default function Home() {
  const { gender } = useGender(); const { isMember } = useMembership(); const ui = useUI(); const nav = useNavigate();
  const [tile, setTile] = useState('all');
  const A = ABOUT[gender];
  // One "Our services" section with two states: the 3-card strip, then (after a click) the full services view in its place.
  const [mode, setMode] = useState('strip'); const [leaving, setLeaving] = useState(false); const stripRef = useRef(null);
  const openTile = (t) => {
    if (leaving) return; setTile(t); setLeaving(true);
    setTimeout(() => { setMode('full'); setLeaving(false); requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('services-view')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))); }, 700);
  };
  // scroll-linked "lift": cards rise at different speeds as the strip scrolls into view
  useEffect(() => {
    if (mode !== 'strip') return; const el = stripRef.current; if (!el) return; let raf = 0;
    const upd = () => { raf = 0; const r = el.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.85))); el.style.setProperty('--p', (1 - Math.pow(1 - p, 3)).toFixed(4)); };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); }; upd();
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [mode]);
  const [cref, cin] = useReveal({ threshold: 0.3 });
  const [ri, setRi] = useState(0);
  useEffect(() => { document.title = 'Qesh Salon — A Step to Your Best Self | Dhanori, Pune'; }, []);
  const pkgItems = useMemo(() => toCarouselItems(packagesMen, 'men', isMember), [isMember]);
  const total = tileCount(gender, 'all');
  return (
    <main className="home">
      <Hero />
      <div className="after">
        <section className="about" id="about">
          <div className="gx"><TaggedHeading parts={A.head} />
            <p>{A.p}</p></div>
          <Link to="/about" className="ulink">Read More</Link>
        </section>

        {mode === 'strip' && (
        <section className={'strip' + (leaving ? ' leaving' : '')} id="strip" ref={stripRef}>
          <h2>OUR SERVICES</h2>
          <div className="row gx">
            {STRIP.map(([t, label, ic]) => (
              <button key={t} className="scard" onClick={() => openTile(t)}>
                <Slot id={`tile_${gender}_${t}`} alt={label} />
                <span className="lab">{label}<small>{tileCount(gender, t)} services</small></span>
                <Icon k={ic} className="ico" />
              </button>
            ))}
          </div>
          <button className="ulink view" onClick={() => openTile('all')}>View All</button>
        </section>)}

        {mode === 'full' && <ServicesView tile={tile} setTile={setTile} enter />}

        {gender === 'men' && (
          <section className="packages gx" id="packages">
            <TaggedHeading parts={[{ tag: 'GROOMING' }, 'PACKAGES']} staticTags />
            <FlexCarousel key={'pk-' + gender + '-' + isMember} items={pkgItems} initialIndex={1} onOpen={(it) => ui.openService(it.id)} onBook={(it) => ui.openBooking({ itemId: it.id })} />
          </section>
        )}

        <section className="teaser">
          <div><TaggedHeading parts={['ELITE', { tag: 'CLUB' }]} staticTags /><p className="sub">{membership.tagline}</p></div>
          <div>
            <ul>{membership.teaser.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="price">{inr(config.MEMBERSHIP.price)} · Valid for {config.MEMBERSHIP.days} Days · +5% GST</div>
            <Link className="btn" to="/elite-club/checkout">Join Elite Club</Link><Link className="ulink" to="/elite-club">Learn more</Link>
          </div>
        </section>

        <section className="reviews">
          <TaggedHeading parts={['REAL', { tag: placeholders.rating + ' AVERAGE RATING' }, 'RESULTS', { br: 1 }, 'NO FILTERS NO RETOUCHING', { br: 1 }, 'JUST', { tag: placeholders.reviewCount + ' REVIEWS' }, 'REAL PEOPLE']} />
          <div className="rwrap gx"><div className="rtrack" style={{ transform: `translateX(calc(${-ri} * (50% + 7px)))` }}>
            {placeholders.reviews.map((r, i) => (
              <article className="rcard" key={i}><div className="st">★★★★★ {placeholders.rating}</div><p style={{ margin: 0 }}>{r.text}</p>
                <Slot id={`review_${gender}_${i + 1}`} alt="" className="rph" /><div className="who">{r.name}<small>{r.service}, {r.date}</small></div></article>
            ))}
          </div></div>
          <div className="rnav"><div className="dots">{placeholders.reviews.slice(0, 3).map((_, i) => <i key={i} className={ri === i ? 'on' : ''} onClick={() => setRi(i)} />)}</div>
            <button aria-label="Next reviews" onClick={() => setRi((ri + 1) % 3)}><ArrowRight /></button></div>
        </section>

        <section className="story dark">
          <Slot id={`story_${gender}`} alt="" className="bgslot gx" />
          <div className="txt gx">
            <h2 className="h-display">THE STORY<br />OF QESH</h2>
            {placeholders.story.map((t) => <p key={t}>{t}</p>)}
            <div className="nums"><h4>Qesh in numbers</h4><div>
              <span><small>Services:</small><b>{total}</b></span><span><small>Elite Club:</small><b>{config.MEMBERSHIP.days} days</b></span><span><small>Welcome bonus:</small><b>{config.WELCOME_QOINS} Qoins</b></span></div></div>
            <Link to="/about" className="ulink">Read More</Link>
          </div>
        </section>

        <section className="cta">
          <Slot id={`cta_${gender}`} alt="" className="bg gx" />
          <div className={'box' + (cin ? ' in' : '')} ref={cref}>
            <h2 className="h-display">DIDN'T FIND<br />WHAT YOU'RE<br />LOOKING FOR?</h2>
            <p>Not sure which service is right for you? Our stylists at Qesh Salon will assess your hair type, damage level, and goals to recommend the right treatments.</p>
            <a href="#book" className="ulink" onClick={(e) => { e.preventDefault(); ui.openBooking(); }}>Book a consultation</a>
            <a className="tel" href={config.contact.phoneTel}>{config.contact.phoneDisplay}</a>
          </div>
        </section>

        <section className="news">
          <TaggedHeading parts={['NEWSLETTER']} />
          <div className="ncards gx">
            {placeholders.blog.map((b, i) => (
              <Link key={b.slug} to={`/blog/${b.slug}`} className="ncard"><Slot id={`blog_${gender}_${i + 1}`} alt="" /><span className="in">{b.title}<small>{b.date}</small></span></Link>
            ))}
          </div>
          <Link to="/blog" className="ulink view">View All</Link>
        </section>
      </div>
    </main>
  );
}
