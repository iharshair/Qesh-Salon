import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth, useGender, useMembership, useUI } from '../context/AppContexts.jsx';
import { api } from '../api/index.js';
import { config } from '../data/config.js';
import { placeholders } from '../data/placeholders.js';
import { membership } from '../data/membership.js';
import { itemById, itemsFor, tileCount } from '../data/index.js';
import { inr, inr2, fmtDate } from '../lib/format.js';
import { Slot, TaggedHeading, Icon } from '../components/ui.jsx';
import ServicesView from '../components/ServicesView.jsx';
import BookingFlow from '../components/BookingFlow.jsx';
import PaymentStep from '../components/Payment.jsx';
import { IMAGES } from '../data/images.js';

const Page = ({ title, desc, children, cls = '' }) => {
  useEffect(() => { document.title = `${title} — Qesh Salon`; document.querySelector('meta[name=description]')?.setAttribute('content', desc || 'Qesh Salon, Dhanori, Pune.'); window.scrollTo(0, 0); }, [title, desc]);
  return <main className={'page ' + cls}>{children}</main>;
};

export function ServicesPage() {
  const [sp] = useSearchParams(); const [tile, setTile] = useState(sp.get('tile') || 'all');
  useEffect(() => { document.title = 'Services — Qesh Salon'; window.scrollTo(0, 0); }, []);
  return <main><ServicesView tile={tile} setTile={setTile} id="services-page" /></main>;
}

export function AboutPage() {
  const { gender } = useGender(); const g = [1, 2, 3, 4, 5, 6].filter((i) => IMAGES['gallery_' + i]);
  return (
    <Page title="About us" desc="About Qesh Salon, a premium unisex salon in Dhanori, Pune.">
      <TaggedHeading parts={['ABOUT', { tag: 'QESH' }, 'SALON']} className="pg-h" staticTags />
      <div className="prose gx"><p>{gender === 'men' ? "Qesh is a premium unisex salon in Dhanori, Pune, offering expert grooming for hair, beard, skin and nails. We provide personalized consultations to select services that precisely address each client's individual needs." : "Qesh is a premium unisex salon in Dhanori, Pune, offering expert care for hair, skin and nails. We provide personalized consultations to select treatments that precisely address each client's individual needs."}</p>
        {placeholders.story.map((t) => <p key={t}>{t}</p>)}</div>
      <div className="stats gx"><div><small>Services</small><b>{tileCount(gender, 'all')}</b></div><div><small>Elite Club</small><b>{config.MEMBERSHIP.days} days</b></div><div><small>Welcome bonus</small><b>{config.WELCOME_QOINS} Qoins</b></div></div>
      {g.length > 0 && <div className="gallery">{g.map((i) => <Slot key={i} id={'gallery_' + i} alt="Qesh Salon" />)}</div>}
    </Page>
  );
}

export function ElitePage() {
  const [sp] = useSearchParams(); const { gender } = useGender(); const { isMember, mem, daysLeft } = useMembership(); const nav = useNavigate();
  const item = sp.get('service') ? itemById(sp.get('service')) : null; const v = item && [...item.variants].sort((a, b) => a.standard - b.standard)[0];
  const picks = itemsFor(gender).filter((i) => !i.includes).filter((i) => ['haircut', 'classic-facial', 'hydra-facial', 'manicure', 'pedicure', 'glow-facial', 'sugar-wax', 'de-tan', 'botox', 'beard', 'cysteine', 'balayage'].some((k) => i.id.endsWith(k))).slice(0, 4);
  const from = sp.get('from');
  return (
    <Page title="Elite Club" desc="Elite Club, an Exclusive Membership of Qesh Salon. ₹999, valid for 365 days.">
      {item && <div className="saving">This service for Elite Club members: <b>{inr(v.elite)}</b> instead of {inr(v.standard)}. <small>({item.name})</small></div>}
      <TaggedHeading parts={['ELITE', { tag: 'CLUB' }]} className="pg-h" staticTags />
      <p className="lede">{membership.tagline}</p>
      <section className="ink box"><span className="ebadge">Elite Club</span>
        <ul>{membership.benefits.map((b) => <li key={b.head}><b>{b.head}</b> {b.text}</li>)}</ul>
        <div className="pr">{inr(config.MEMBERSHIP.price)} · Valid for {config.MEMBERSHIP.days} Days · +5% GST</div>
      </section>
      {isMember ? <div className="mem-on"><p>You are an Elite Club member · valid till {fmtDate(mem.expiresAt)}</p>{daysLeft <= 30 && <Link className="btn" to={`/elite-club/checkout?from=${from || '/account'}`}>Renew</Link>}</div>
        : <Link className="btn block" to={`/elite-club/checkout${from ? '?from=' + encodeURIComponent(from) : ''}`}>{mem.status === 'expired' ? 'Renew Elite Club' : 'Join Elite Club'}</Link>}
      <h2 className="h-display sm-h">SEE WHAT YOU SAVE</h2>
      <table className="ptab"><thead><tr><th>Service</th><th className="n">Standard</th><th className="n">Elite</th><th className="n">You save</th></tr></thead>
        <tbody>{picks.map((i) => { const v0 = [...i.variants].sort((a, b) => a.standard - b.standard)[0]; return <tr key={i.id}><td>{i.name.replace('*', '')}{i.variants.length > 1 ? <span className="note"> · {v0.label}</span> : null}</td><td className="n">{inr(v0.standard)}</td><td className="n"><b>{inr(v0.elite)}</b></td><td className="n">{inr(v0.standard - v0.elite)}</td></tr>; })}</tbody></table>
      <Link className="ulink" to="/services">View full price list</Link>
      <div className="faq"><p><b>Validity.</b> 365 days from purchase.</p><p><b>GST.</b> 5% GST applicable on the membership and on all service rates.</p><p><b>Qoins.</b> 499 Qoins worth ₹100 on joining. Up to 999 Qoins worth ₹200 on every referral.</p></div>
      {from && <button className="ulink" onClick={() => nav(from)}>Go back</button>}
    </Page>
  );
}

export function CheckoutPage() {
  const { user, ready } = useAuth(); const { refresh } = useMembership(); const nav = useNavigate(); const [sp] = useSearchParams(); const from = sp.get('from') || '/';
  const [done, setDone] = useState(null); const [order, setOrder] = useState(null);
  useEffect(() => { if (!ready) return; if (!user) nav('/login?next=' + encodeURIComponent('/elite-club/checkout?from=' + from), { replace: true }); else api.membership.createOrder().then(setOrder); }, [user, ready]); // eslint-disable-line
  if (!user || !order) return <Page title="Checkout"><p className="note">Loading…</p></Page>;
  if (done) return (
    <Page title="Welcome to Elite Club"><TaggedHeading parts={['WELCOME TO', { tag: 'ELITE CLUB' }]} className="pg-h" staticTags />
      <p className="lede">Valid till {fmtDate(done.expiresAt)}. {config.WELCOME_QOINS} Qoins are credited to your Qesh Wallet.</p>
      <div className="row2"><Link className="btn" to="/book" onClick={() => {}}>Book an Appointment</Link><Link className="btn ghost" to={from}>Go back to {from === '/' ? 'home' : from.replace('/', '')}</Link></div></Page>);
  return (
    <Page title="Elite Club checkout"><TaggedHeading parts={['ELITE', { tag: 'CHECKOUT' }]} className="pg-h" staticTags />
      <div className="two">
        <div className="sum"><h6 className="lab">Order summary</h6><div className="tot"><span>Elite Club membership</span><span>{inr2(order.amount)}</span></div><div className="tot"><span>GST 5%</span><span>{inr2(order.gst)}</span></div><div className="tot big"><span>Total</span><span>{inr2(order.total)}</span></div>
          <p className="note" style={{ marginTop: 14 }}>{user.name} · {user.phone}{user.email ? ' · ' + user.email : ''}</p></div>
        <div><h6 className="lab">Payment</h6><PaymentStep order={order} label={`Pay ${inr2(order.total)}`} onPaid={async () => { const m = await api.membership.confirm(order.orderId); await refresh(); setDone(m); }} /></div>
      </div>
    </Page>
  );
}

export function LoginPage() {
  const { setUser } = useAuth(); const nav = useNavigate(); const [sp] = useSearchParams(); const next = sp.get('next') || '/account';
  const [phase, setPhase] = useState('phone'); const [phone, setPhone] = useState(''); const [code, setCode] = useState(''); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const run = async (fn) => { setBusy(true); setErr(''); try { await fn(); } finally { setBusy(false); } };
  return (
    <Page title="Login"><TaggedHeading parts={[{ tag: 'LOGIN' }]} className="pg-h" staticTags />
      <div className="form narrow">
        {phase === 'phone' && <><label className="fld"><span>Phone number*</span><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Enter phone" /></label>
          <button className="btn block" disabled={busy || phone.replace(/\D/g, '').length < 10} onClick={() => run(async () => { await api.auth.sendOtp(phone); setPhase('otp'); })}>Send OTP</button></>}
        {phase === 'otp' && <><label className="fld"><span>OTP*</span><input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="Enter 6-digit code" /></label><p className="note">Demo: use {config.MOCK_OTP}.</p>
          {err && <p className="note">{err}</p>}
          <button className="btn block" disabled={busy || code.length < 4} onClick={() => run(async () => { const r = await api.auth.verifyOtp(phone, code); if (!r.ok) return setErr('Wrong code. Try again.'); if (r.isNew) setPhase('new'); else { setUser(r.user); nav(next); } })}>Verify</button></>}
        {phase === 'new' && <><p className="note">Welcome. Tell us your name.</p><label className="fld"><span>Full name*</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" /></label><label className="fld"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" /></label>
          <button className="btn block" disabled={busy || !name.trim()} onClick={() => run(async () => { setUser(await api.auth.register({ phone, name, email })); nav(next); })}>Create account</button></>}
      </div>
    </Page>
  );
}

export function AccountPage() {
  const { user, ready, logout, update } = useAuth(); const { mem, wallet, isMember, daysLeft } = useMembership(); const nav = useNavigate(); const ui = useUI();
  const [tab, setTab] = useState('overview'); const [list, setList] = useState([]); const [resched, setResched] = useState(null);
  const load = () => api.bookings.list().then(setList);
  useEffect(() => { if (ready && !user) nav('/login?next=/account', { replace: true }); else load(); }, [ready, user]); // eslint-disable-line
  if (!user) return <Page title="Account"><p className="note">Loading…</p></Page>;
  const up = list.filter((b) => b.status === 'upcoming'); const past = list.filter((b) => b.status !== 'upcoming');
  const first = user.name.split(' ')[0].toUpperCase(); const code = mem.referralCode;
  return (
    <Page title="Account">
      <TaggedHeading parts={['HELLO', { tag: 'ACCOUNT' }, first]} className="pg-h" staticTags />
      <div className="tiles">{[['overview', 'OVERVIEW'], ['bookings', 'BOOKINGS'], ['membership', 'MEMBERSHIP'], ['details', 'DETAILS']].map(([k, l]) => <button key={k} className={'tile' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}><span className="lab">{l}</span></button>)}</div>
      <div className="acc">
        {tab === 'overview' && <><div className="ink box"><h3 className="h-display">ELITE CLUB</h3>{isMember ? <p><span className="ebadge on">Active</span> Valid till {fmtDate(mem.expiresAt)} · {daysLeft} days left</p> : <><p>{mem.status === 'expired' ? 'Expired' : 'Not a member'}</p><Link className="btn" style={{ background: '#fff', color: '#0b0b0b' }} to="/elite-club/checkout?from=/account">{mem.status === 'expired' ? 'Renew' : 'Join Elite Club'}</Link></>}</div>
          <h6 className="lab">Upcoming booking</h6>{up[0] ? <div className="bcard"><b>{fmtDate(up[0].date)} · {up[0].time}</b><small>{up[0].lines.map((l) => l.name).join(', ')}</small></div> : <p className="note">No upcoming booking. <button className="ulink" onClick={() => ui.openBooking()}>Book an Appointment</button></p>}
          <h6 className="lab">Qoins balance</h6><p className="qn">{wallet.qoins} Qoins</p></>}
        {tab === 'bookings' && <>{[['Upcoming', up], ['Past', past]].map(([t, l]) => <div key={t}><h6 className="lab">{t}</h6>{!l.length && <p className="note">None.</p>}{l.map((b) => (
          <div className="bcard" key={b.id}><div><b>{b.id} · {fmtDate(b.date)} · {b.time}</b><small>{b.lines.map((x) => `${x.name}${x.label ? ' (' + x.label + ')' : ''}`).join(', ')}</small><small>{inr2(b.totals.total)} · {b.status}</small></div>
            {b.status === 'upcoming' && <div className="row2"><button className="btn ghost sm" onClick={() => setResched(resched === b.id ? null : b.id)}>Reschedule</button><button className="btn ghost sm" onClick={async () => { if (confirm('Cancel this booking?')) { await api.bookings.cancel(b.id); load(); } }}>Cancel</button></div>}
            {resched === b.id && <div className="rs"><input type="date" min={new Date().toISOString().slice(0, 10)} onChange={(e) => (b._d = e.target.value)} /><input type="time" step="1800" onChange={(e) => (b._t = e.target.value)} /><button className="btn sm" onClick={async () => { if (b._d && b._t) { await api.bookings.reschedule(b.id, b._d, b._t); setResched(null); load(); } }}>Save</button></div>}
          </div>))}</div>)}</>}
        {tab === 'membership' && <><p>Status: <b>{isMember ? 'Active' : mem.status === 'expired' ? 'Expired' : 'Not a member'}</b>{mem.startedAt && <> · Purchased {fmtDate(mem.startedAt)} · Expires {fmtDate(mem.expiresAt)}</>}</p>
          <ul className="sq">{membership.benefits.map((b) => <li key={b.head}>{b.head} {b.text}</li>)}</ul>
          {isMember && code && <p>Referral code <b>{code}</b> <button className="ulink" onClick={() => navigator.clipboard?.writeText(code)}>Copy</button> · <a className="ulink" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent('Join Qesh Salon Elite Club with my code ' + code)}`}>Share on WhatsApp</a></p>}
          <h6 className="lab">Qoins wallet</h6>{wallet.tx.length ? wallet.tx.map((t, i) => <p key={i} className="note">{t.label} · +{t.qoins} Qoins · worth ₹{t.worth}</p>) : <p className="note">No transactions yet. Joining gives 499 Qoins worth ₹100. Referrals give up to 999 Qoins worth ₹200.</p>}
          {(mem.status === 'expired' || (isMember && daysLeft <= 30)) && <Link className="btn" to="/elite-club/checkout?from=/account">Renew</Link>}</>}
        {tab === 'details' && <div className="form narrow"><label className="fld"><span>Full name</span><input defaultValue={user.name} onBlur={(e) => update({ name: e.target.value })} /></label><label className="fld"><span>Email</span><input defaultValue={user.email} onBlur={(e) => update({ email: e.target.value })} /></label>
          <div className="fld"><span>Booking for</span><div className="seg">{[['men', 'Men'], ['women', 'Women']].map(([g, l]) => <button key={g} className={user.bookingFor === g ? 'on' : ''} onClick={() => update({ bookingFor: g })}>{l}</button>)}</div></div>
          <button className="btn ghost" onClick={async () => { await logout(); nav('/'); }}>Log out</button></div>}
      </div>
    </Page>
  );
}

export function BookPage() { return <Page title="Book an appointment"><BookingFlow asPage /></Page>; }

export function BlogPage() {
  const { gender } = useGender();
  return <Page title="Blog" desc="Notes from Qesh Salon."><TaggedHeading parts={['BLOG']} className="pg-h" staticTags /><div className="ncards gx" style={{ maxWidth: 1500 }}>{placeholders.blog.map((b, i) => <Link key={b.slug} to={`/blog/${b.slug}`} className="ncard"><Slot id={`blog_${gender}_${i + 1}`} /><span className="in">{b.title}<small>{b.date}</small></span></Link>)}</div></Page>;
}
export function ArticlePage() {
  const { slug } = useParams(); const { gender } = useGender(); const i = placeholders.blog.findIndex((b) => b.slug === slug); const b = placeholders.blog[i];
  if (!b) return <Page title="Not found"><p>Article not found. <Link className="ulink" to="/blog">Back to blog</Link></p></Page>;
  return <Page title={b.title}><Slot id={`blog_${gender}_${i + 1}`} className="cover" /><h1 className="h-display pg-h" style={{ fontSize: 'clamp(30px,5vw,80px)' }}>{b.title}</h1><p className="note">{b.date}</p><div className="prose">{b.body.map((p) => <p key={p}>{p}</p>)}</div><Link to="/blog" className="ulink">All articles</Link></Page>;
}

export function ContactPage() {
  const C = config.contact; const [sent, setSent] = useState(false);
  return (
    <Page title="Contact" desc="Contact Qesh Salon, Dhanori, Pune."><TaggedHeading parts={["WE'D LOVE TO", { tag: 'GET IN TOUCH' }, 'HEAR FROM YOU']} className="pg-h" staticTags />
      <div className="two"><form className="form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <label className="fld"><span>Full name*</span><input required placeholder="Enter name" /></label><label className="fld"><span>Email*</span><input required type="email" placeholder="Enter email" /></label><label className="fld"><span>Message*</span><input required placeholder="Say Hi!" /></label>
        <button className="btn block" disabled={sent}>{sent ? 'Thank you. We will reply soon.' : 'Send'}</button></form>
        <div className="prose"><p>{C.address}</p><p><a className="ulink" href={C.phoneTel}>{C.phoneDisplay}</a></p><p><a className="ulink" href={C.mapUrl} target="_blank" rel="noreferrer">Open in Google Maps</a></p><p className="note">5% GST applicable on all service rates.</p></div></div>
    </Page>
  );
}

export const LegalPage = ({ kind }) => (
  <Page title={kind === 'privacy' ? 'Privacy Policy' : 'Terms'}><h1 className="h-display pg-h" style={{ fontSize: 'clamp(36px,6vw,96px)' }}>{kind === 'privacy' ? 'PRIVACY POLICY' : 'TERMS'}</h1>
    <div className="prose"><p>Placeholder text. Replace with the client's {kind === 'privacy' ? 'privacy policy' : 'terms of service'} before launch.</p><p>5% GST applicable on all service rates. Elite Club is valid for 365 days from purchase.</p></div></Page>
);
