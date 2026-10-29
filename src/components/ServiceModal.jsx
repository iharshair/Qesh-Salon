import React, { useEffect } from 'react';
import { useGender, useUI, useMembership } from '../context/AppContexts.jsx';
import { itemById, slotIdFor } from '../data/index.js';
import { placeholders } from '../data/placeholders.js';
import { describe } from '../lib/pricing.js';
import { inr } from '../lib/format.js';
import { Slot } from './ui.jsx';
import { PriceRow, PriceTable } from './Price.jsx';

export default function ServiceModal() {
  const { gender } = useGender(); const ui = useUI(); const { isMember } = useMembership();
  const item = ui.serviceId ? itemById(ui.serviceId) : null;
  useEffect(() => { const k = (e) => e.key === 'Escape' && ui.closeService(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []); // eslint-disable-line
  if (!item) return null;
  const g = item.id.startsWith('m-') || item.id.startsWith('pkg') || item.id.startsWith('men-') ? 'men' : item.id.startsWith('w-') || item.id.startsWith('women-') ? 'women' : gender;
  const rich = item.rich; const pkg = !!item.includes; const single = item.variants.length === 1;
  const sec = item.section;
  return (
    <div className="mback" onMouseDown={(e) => e.target === e.currentTarget && ui.closeService()} role="dialog" aria-modal="true" aria-label={item.name}>
      <div className="modal">
        <button className="x" aria-label="Close" onClick={ui.closeService}>×</button>
        <div className="imgs">
          <Slot id={slotIdFor(item, g)} alt={item.name} />
          <Slot id={`modal2_${g}_${sec}`} alt="" />
        </div>
        <div className="info">
          <div className="rate">★★★★★ {placeholders.modalRating}</div>
          <h3 className="h-display">{item.name.replace('*', '')}</h3>
          {rich?.subtitle && <div className="note up" style={{ letterSpacing: '.04em' }}>{rich.subtitle}</div>}
          {item.tag && <div style={{ margin: '4px 0 8px' }}><span className="chip">{item.tag}</span></div>}
          <PriceRow item={item} />
          {item.id.includes('hydra') && <div className="note">Add-on price: Non-Member {inr(item.variants[0].standard)} · Elite Club Member {inr(item.variants[0].elite)}</div>}
          <p className="d">{pkg ? item.tagline : describe(item)}</p>
          {(pkg ? item.duration : item.variants.length === 1 && item.variants[0].duration) && <div className="note">⏱ {pkg ? item.duration : item.variants[0].duration}</div>}

          {rich?.bestFor && (<><h6>Best for:</h6><ul className="sq">{rich.bestFor.map((b) => <li key={b}>{b}</li>)}</ul></>)}
          {rich?.intro && (<><p className="d" style={{ fontSize: 14 }}>{rich.intro}</p><ul className="sq">{rich.involves.map((b) => <li key={b}>{b}</li>)}</ul><h6>What it does?</h6><p className="d" style={{ fontSize: 14 }}>{rich.whatItDoes}</p></>)}
          {pkg && (<><h6>What’s involved:</h6><ul className="sq">{item.includes.map((b) => <li key={b}>{b}</li>)}</ul>
            <div className="lguide">{item.badges.map(([a, b]) => <div key={a}><b>{a}</b>{b}</div>)}</div></>)}

          {!pkg && !single && <PriceTable item={item} />}
          {item.lengthGuide && (<><h6>Hair length guide</h6><div className="lguide"><div><b>Short</b>Up to Shoulder</div><div><b>Medium</b>Up to Upper Back</div><div><b>Long</b>Below Upper Back</div></div></>)}
          {item.offers?.map((o) => <div className="offer" key={o}>{o}</div>)}
          {item.notes?.map((o) => <div className="note" key={o}>{o}</div>)}
          {rich?.footnote && <div className="note">{rich.footnote}</div>}
          <div className="note" style={{ marginTop: 10 }}>5% GST applicable on all service rates.</div>
          <div className="bookbar"><button className="btn block" onClick={() => ui.openBooking({ itemId: item.id })}>Book an Appointment</button></div>
        </div>
      </div>
    </div>
  );
}
