import React, { useState } from 'react';
import { api } from '../api/index.js';

/** Method tiles (UPI / Card / Net banking). Calls payment.pay(order) — MOCK, resolves success after ~1.5 s. */
export default function PaymentStep({ order, onPaid, label = 'Pay now' }) {
  const [m, setM] = useState('UPI'); const [busy, setBusy] = useState(false);
  const pay = async () => { setBusy(true); const o = await api.payment.createOrder(order); const r = await api.payment.pay(o, m); const v = await api.payment.verify(r.paymentId); setBusy(false); if (v.ok) onPaid(r); };
  return (
    <div>
      <div className="steps" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {['UPI', 'Card', 'Net banking'].map((x) => <button key={x} type="button" className={'stile' + (m === x ? ' on' : '')} onClick={() => setM(x)}><b>{x}</b></button>)}
      </div>
      <p className="note" style={{ margin: '10px 0 16px' }}>Demo payment. No money is taken. The real gateway plugs into <code>api.payment</code>.</p>
      <button className="btn block" disabled={busy} onClick={pay}>{busy ? 'Processing…' : label}</button>
    </div>
  );
}
