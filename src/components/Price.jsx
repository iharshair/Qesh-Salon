import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMembership, useUI } from '../context/AppContexts.jsx';
import { getPrice, fromPrice } from '../lib/pricing.js';
import { inr } from '../lib/format.js';

/** Clickable Elite chip. Stops propagation, routes to /elite-club with the service saving. */
export function EliteChip({ item, amount }) {
  const nav = useNavigate(); const loc = useLocation(); const ui = useUI();
  return (
    <button className="chip" onClick={(e) => { e.stopPropagation(); ui.closeService(); nav(`/elite-club?from=${encodeURIComponent(loc.pathname)}&service=${item.id}`); }}>
      Elite Club {inr(amount)}
    </button>
  );
}

/** Price row: guest sees standard + Elite chip; active member sees Elite as main, standard struck through. */
export function PriceRow({ item, variant }) {
  const { isMember } = useMembership();
  const f = variant ? { standard: variant.standard, elite: variant.elite, isFrom: false } : fromPrice(item);
  const pre = f.isFrom ? 'From ' : '';
  if (isMember) return (<div className="prow"><s>{pre}{inr(f.standard)}</s><b>{pre}{inr(f.elite)}</b><span className="sm" style={{ color: 'var(--red)' }}>Elite member price</span></div>);
  return (<div className="prow"><b>{pre}{inr(f.standard)}</b><EliteChip item={item} amount={f.elite} /></div>);
}

export function PriceTable({ item }) {
  const { isMember } = useMembership(); const nav = useNavigate(); const ui = useUI(); const loc = useLocation();
  const go = () => { ui.closeService(); nav(`/elite-club?from=${encodeURIComponent(loc.pathname)}&service=${item.id}`); };
  return (
    <table className="ptab">
      <thead><tr><th>Option</th><th className="n">Standard</th><th className="n">Elite Club</th></tr></thead>
      <tbody>
        {item.variants.map((v) => (
          <tr key={v.id}>
            <td>{v.label || item.name}{v.duration ? <span className="note"> · {v.duration}</span> : null}</td>
            <td className="n">{isMember ? <s>{inr(v.standard)}</s> : inr(v.standard)}</td>
            <td className="n">{isMember ? <b>{inr(v.elite)}</b> : <button className="ulink" onClick={go}>{inr(v.elite)}</button>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
