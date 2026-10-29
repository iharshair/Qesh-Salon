import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useBooking, useGender, useMembership, useUI } from '../context/AppContexts.jsx';
import { api } from '../api/index.js';
import { itemById, itemsFor, SECTIONS, TILES, sectionFor } from '../data/index.js';
import { config } from '../data/config.js';
import { placeholders } from '../data/placeholders.js';
import { priceCart, eliteSaving, describe } from '../lib/pricing.js';
import { inr, inr2, ymd, pad, fmtDate } from '../lib/format.js';
import { TaggedHeading, Slot } from './ui.jsx';
import PaymentStep from './Payment.jsx';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const t12 = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`; };

function Calendar({ value, onPick }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const max = new Date(today.getTime() + config.BOOKING_WINDOW_DAYS * 864e5);
  const [m, setM] = useState(value ? new Date(value + 'T00:00') : new Date(today.getFullYear(), today.getMonth(), 1));
  const first = new Date(m.getFullYear(), m.getMonth(), 1); const lead = (first.getDay() + 6) % 7; const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i + 1))];
  const canPrev = new Date(m.getFullYear(), m.getMonth() - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(m.getFullYear(), m.getMonth() + 1, 1) <= max;
  return (
    <div className="cal">
      <div className="calh"><b>{MONTHS[m.getMonth()]} {m.getFullYear()}</b>
        <span><button disabled={!canPrev} onClick={() => setM(new Date(m.getFullYear(), m.getMonth() - 1, 1))} aria-label="Previous month">←</button><button disabled={!canNext} onClick={() => setM(new Date(m.getFullYear(), m.getMonth() + 1, 1))} aria-label="Next month">→</button></span></div>
      <div className="calg">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <i key={d} className="dow">{d}</i>)}
        {cells.map((d, i) => d ? (<button key={i} disabled={d < today || d > max} className={'day' + (value === ymd(d) ? ' on' : '')} onClick={() => onPick(ymd(d))}>{d.getDate()}</button>) : <i key={i} />)}</div>
    </div>
  );
}

function Slots({ date, value, onPick }) {
  const [slots, setSlots] = useState(null);
  useEffect(() => { setSlots(null); if (date) api.bookings.availability(date).then(setSlots); }, [date]);
  if (!date) return <p className="note">Pick a day to see times.</p>;
  if (!slots) return <p className="note">Loading times…</p>;
  const g = [['Morning', (h) => h < 12], ['Afternoon', (h) => h >= 12 && h < 17], ['Evening', (h) => h >= 17]];
  return g.map(([name, f]) => { const list = slots.filter((s) => f(+s.time.slice(0, 2))); return list.length ? (
    <div key={name} style={{ marginBottom: 14 }}><h6 className="lab">{name}</h6><div className="slots">{list.map((s) => <button key={s.time} disabled={!s.available} className={'slotb' + (value === s.time ? ' on' : '')} onClick={() => onPick(s.time)}>{t12(s.time)}</button>)}</div></div>) : null; });
}

function Field({ label, children }) { return <label className="fld"><span>{label}</span>{children}</label>; }

export default function BookingFlow({ onClose, asPage }) {
  const { user } = useAuth(); const { isMember } = useMembership(); const { gender } = useGender(); const ui = useUI(); const nav = useNavigate();
  const B = useBooking(); const { draft, setDraft, cart } = B;
  const [step, setStep] = useState(1); const [done, setDone] = useState(null); const [busy, setBusy] = useState(false);
  const [tile, setTile] = useState('all'); const [q, setQ] = useState(''); const [open, setOpen] = useState(ui.preselect); const [guide, setGuide] = useState(false);
  const d = { name: user?.name || '', phone: user?.phone || '', email: user?.email || '', bookingFor: gender, notes: '', ...draft };
  const set = (p) => setDraft(p);
  const priced = useMemo(() => priceCart(cart, isMember, itemById), [cart, isMember]);
  const saving = eliteSaving(cart, itemById);
  const [payMode, setPayMode] = useState('salon');
  const close = () => { onClose ? onClose() : nav('/'); };
  useEffect(() => { if (ui.preselect) { setOpen(ui.preselect); } }, [ui.preselect]);

  const valid2 = d.name.trim() && /^[0-9+\s-]{8,}$/.test(d.phone);
  const bf = d.bookingFor || gender;
  const list = useMemo(() => {
    let items = itemsFor(bf);
    if (tile === 'packages') items = items.filter((i) => i.section === 'packages');
    else if (tile !== 'all') { const secs = SECTIONS[bf].filter((s) => s.tile === tile).map((s) => s.id); items = items.filter((i) => secs.includes(i.section)); }
    if (q.trim()) items = items.filter((i) => (i.name + ' ' + i.variants.map((v) => v.label).join(' ')).toLowerCase().includes(q.toLowerCase()));
    return items;
  }, [bf, tile, q]);
  const tiles = bf === 'men' ? [...TILES, { id: 'packages', label: 'PACKAGES' }] : TILES;

  const confirm = async (pay) => {
    setBusy(true);
    const b = await api.bookings.create({ date: d.date, time: d.time, details: { name: d.name, phone: d.phone, email: d.email, bookingFor: d.bookingFor, notes: d.notes }, lines: priced.lines.map((l) => ({ itemId: l.itemId, variantId: l.variantId, qty: l.qty, name: l.item.name, label: l.variant.label, amount: l.amount, discount: l.discount })), totals: { gross: priced.gross, offers: priced.offers, subtotal: priced.subtotal, gst: priced.gst, total: priced.total, member: isMember }, payment: pay || 'Pay at the salon' });
    setBusy(false); setDone(b); B.clear();
  };
  const ics = (b) => {
    const [y, m, dd] = b.date.split('-'); const [h, mi] = b.time.split(':'); const s = `${y}${m}${dd}T${h}${mi}00`; const eH = pad(+h + 1);
    const t = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:${b.id}@qesh\r\nDTSTART:${s}\r\nDTEND:${y}${m}${dd}T${eH}${mi}00\r\nSUMMARY:Qesh Salon appointment\r\nLOCATION:${config.contact.address.replace(/,/g, '\\,')}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/calendar' })); a.download = `qesh-${b.id}.ics`; a.click();
  };
  const joinElite = () => { onClose && onClose(); nav('/elite-club/checkout?from=' + encodeURIComponent('/book')); };

  const Summary = (
    <div className="sumwrap">
    <aside className="sum">
      <h6 className="lab">Your booking</h6>
      {priced.lines.length === 0 && <p className="note">No services added yet.</p>}
      {priced.lines.map((l) => (
        <div className="sl" key={l.key}><div><b>{l.item.name.replace('*', '')}</b>{l.variant.label && <small>{l.variant.label}</small>}{l.offerNote && <small>{l.offerNote}</small>}</div>
          <div className="q"><button onClick={() => B.setQty(l.key, l.qty - 1)} aria-label="Less">−</button><span>{l.qty}</span><button onClick={() => B.setQty(l.key, l.qty + 1)} aria-label="More">+</button></div>
          <div className="a">{inr(l.amount - l.discount)}</div></div>
      ))}
      <div className="tot"><span>Subtotal</span><span>{inr2(priced.gross)}</span></div>
      {priced.offers > 0 && <div className="tot"><span>Offers</span><span>− {inr2(priced.offers)}</span></div>}
      <div className="tot"><span>GST 5%</span><span>{inr2(priced.gst)}</span></div>
      <div className="tot big"><span>Total</span><span>{inr2(priced.total)}</span></div>
      {!isMember && saving > 0 && <p className="note" style={{ marginTop: 12 }}>Join Elite Club for {inr(config.MEMBERSHIP.price)} + GST and save {inr(saving)} on this booking. <button className="ulink" onClick={joinElite}>Join</button></p>}
      {isMember && <p className="note" style={{ marginTop: 12 }}>Elite member prices applied.</p>}
    </aside>
    <div className="nav3">
      <button className="btn ghost" onClick={() => setStep(step - 1)}>Back</button>
      {step === 3 && <button className="btn" disabled={!cart.length} onClick={() => setStep(4)}>Continue</button>}
    </div>
    </div>
  );

  if (done) return (
    <div className="bk-wrap"><TaggedHeading parts={['BOOKING', { tag: 'CONFIRMED' }]} className="bk-h" staticTags />
      <div className="conf">
        <p>Booking ID <b>{done.id}</b></p><p>{fmtDate(done.date)} at {t12(done.time)}</p>
        <p>{done.details.name} · {done.details.phone}</p>
        <ul className="sq">{done.lines.map((l, i) => <li key={i}>{l.name}{l.label ? ` — ${l.label}` : ''} × {l.qty}</li>)}</ul>
        <p><b>Total {inr2(done.totals.total)}</b> incl. 5% GST · {done.payment}</p>
        <p className="note">{config.contact.address}<br /><a className="ulink" href={config.contact.phoneTel}>{config.contact.phoneDisplay}</a></p>
        <div className="row2"><button className="btn ghost" onClick={() => ics(done)}>Add to calendar</button><Link className="btn" to="/account" onClick={onClose}>View in Account</Link></div>
      </div></div>
  );

  const steps = ['Date & time', 'Your details', 'Services', 'Confirm'];
  return (
    <div className="bk-wrap">
      <TaggedHeading parts={['BOOK AN', { tag: 'APPOINTMENT' }]} className="bk-h" staticTags />
      <div className="steps">{steps.map((s, i) => <button key={s} className={'stile' + (step === i + 1 ? ' on' : '')} disabled={i + 1 > step && !(i + 1 === step + 1)} onClick={() => i + 1 < step && setStep(i + 1)}><small>0{i + 1}</small><b>{s}</b></button>)}</div>

      {step === 1 && (<div className="two"><div><Calendar value={d.date} onPick={(x) => set({ date: x, time: null })} /></div><div><h6 className="lab">Time</h6><Slots date={d.date} value={d.time} onPick={(t) => set({ time: t })} /></div></div>)}
      {step === 2 && (
        <div className="form">
          <Field label="Full name*"><input value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="Enter name" /></Field>
          <Field label="Phone*"><input value={d.phone} readOnly={!!user} onChange={(e) => set({ phone: e.target.value })} placeholder="Enter phone" inputMode="tel" /></Field>
          <Field label="Email"><input type="email" value={d.email} onChange={(e) => set({ email: e.target.value })} placeholder="Enter email" /></Field>
          <div className="fld"><span>Booking for</span><div className="seg" role="group" aria-label="Booking for">{[['men', 'Men'], ['women', 'Women']].map(([g, l]) => <button type="button" key={g} className={bf === g ? 'on' : ''} aria-pressed={bf === g} onClick={() => set({ bookingFor: g })}>{l}</button>)}</div></div>
          <Field label="Notes (optional)"><input value={d.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Anything we should know?" /></Field>
        </div>)}
      {step === 3 && (
        <div className="svc">
          <div>
            <div className="tiles mini">{tiles.map((t) => <button key={t.id} className={'tile' + (t.id === 'packages' ? ' nopic' : '') + (tile === t.id ? ' on' : '')} aria-pressed={tile === t.id} onClick={() => setTile(t.id)}>{t.id !== 'packages' && <Slot id={`tile_${bf}_${t.id}`} alt="" />}<span className="lab">{t.label}</span></button>)}</div>
            <input className="srch" placeholder="Search services" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search services" />
            <div className="rows">
              {list.map((it) => {
                const multi = it.variants.length > 1; const isOpen = open === it.id;
                return (
                  <div className="row" key={it.id}>
                    <div className="rh"><div><b>{it.name.replace('*', '')}</b>{it.tag && <span className="chip" style={{ marginLeft: 8 }}>{it.tag}</span>}<small>{sectionFor(bf, it.section)?.title}</small></div>
                      <div className="rp">{multi ? `From ${inr(Math.min(...it.variants.map((v) => isMember ? v.elite : v.standard)))}` : inr(isMember ? it.variants[0].elite : it.variants[0].standard)}</div>
                      <button className="btn ghost sm" onClick={() => (multi ? setOpen(isOpen ? null : it.id) : B.add(it.id))}>{multi ? (isOpen ? 'Close' : 'Choose') : 'Add'}</button></div>
                    {multi && isOpen && (<div className="vp">
                      {it.lengthGuide && <button className="ulink note" onClick={() => setGuide(!guide)}>Hair length guide</button>}
                      {it.lengthGuide && guide && <div className="lguide"><div><b>Short</b>Up to Shoulder</div><div><b>Medium</b>Up to Upper Back</div><div><b>Long</b>Below Upper Back</div></div>}
                      {it.variants.map((v) => (<div className="vr" key={v.id}><span>{v.label}</span><span>{isMember ? <><s>{inr(v.standard)}</s> <b>{inr(v.elite)}</b></> : <>{inr(v.standard)} <Link className="chip" to={`/elite-club?from=/book&service=${it.id}`} onClick={onClose}>Elite {inr(v.elite)}</Link></>}</span><button className="btn ghost sm" onClick={() => B.add(it.id, v.id)}>Add</button></div>))}
                      {it.offers?.map((o) => <div className="note" key={o}>{o}</div>)}{it.notes?.map((o) => <div className="note" key={o}>{o}</div>)}
                    </div>)}
                  </div>);
              })}
              {!list.length && <p className="note">No services match.</p>}
            </div>
            {priced.lines.some((l) => /Master|Senior/.test(l.variant.label)) && priced.lines.some((l) => l.item.isHairwash) && <p className="note">Master and Senior stylist haircuts already include a complimentary hairwash.</p>}
          </div>
          {Summary}
        </div>)}
      {step === 4 && (
        <div className="svc"><div className="review">
          <h6 className="lab">Appointment</h6><p>{d.date && fmtDate(d.date)} at {d.time && t12(d.time)}</p>
          <h6 className="lab">Details</h6><p>{d.name} · {d.phone}{d.email ? ' · ' + d.email : ''}<br />Booking for {bf}{d.notes ? ' · ' + d.notes : ''}</p>
          <h6 className="lab">Payment</h6>
          {config.ENABLE_ONLINE_PAYMENT_FOR_BOOKINGS ? (
            <><div className="steps" style={{ gridTemplateColumns: '1fr 1fr' }}>{[['salon', 'Pay at the salon'], ['online', 'Pay online']].map(([k, l]) => <button key={k} className={'stile' + (payMode === k ? ' on' : '')} onClick={() => setPayMode(k)}><b>{l}</b></button>)}</div>
              {payMode === 'online' ? <PaymentStep order={{ amount: priced.total }} onPaid={(r) => confirm('Paid online · ' + r.method)} label={`Pay ${inr2(priced.total)}`} /> : <button className="btn block" disabled={busy} onClick={() => confirm()}>{busy ? 'Saving…' : 'Confirm Booking'}</button>}</>
          ) : (<><p>Pay at the salon.</p><button className="btn block" disabled={busy} onClick={() => confirm()}>{busy ? 'Saving…' : 'Confirm Booking'}</button></>)}
        </div>{Summary}</div>)}

      {step < 3 && (
        <div className="nav2">
          <button className="btn ghost" onClick={() => (step === 1 ? close() : setStep(step - 1))}>{step === 1 ? 'Close' : 'Back'}</button>
          <button className="btn" disabled={(step === 1 && !(d.date && d.time)) || (step === 2 && !valid2)} onClick={() => setStep(step + 1)}>Continue</button>
        </div>)}
    </div>
  );
}

export function BookingOverlay() {
  const ui = useUI();
  useEffect(() => { if (!ui.bookingOpen) return; const k = (e) => e.key === 'Escape' && ui.closeBooking(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [ui.bookingOpen]); // eslint-disable-line
  if (!ui.bookingOpen) return null;
  return (<div className="bk-over" role="dialog" aria-modal="true" aria-label="Book an appointment"><button className="bk-x" aria-label="Close" onClick={ui.closeBooking}>×</button><BookingFlow onClose={ui.closeBooking} /></div>);
}
