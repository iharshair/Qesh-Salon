import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGender, useUI } from '../context/AppContexts.jsx';
import { config } from '../data/config.js';
import { placeholders } from '../data/placeholders.js';
import { itemsFor } from '../data/index.js';
import { Logo } from './ui.jsx';
import TechText from './TechText.jsx';

export default function Footer() {
  const { gender } = useGender(); const ui = useUI(); const [done, setDone] = useState(false); const [email, setEmail] = useState('');
  const top = itemsFor(gender).filter((i) => !i.includes).slice(0, 4);
  const C = config.contact;
  return (
    <footer className="ftr">
      <div className="cols">
        <div>
          <Link to="/" className="logo"><Logo /></Link>
          <p style={{ maxWidth: 360, margin: '0 0 6px' }}>Stay in Touch with Qesh. Be the first to know about new treatments, seasonal offers and care tips directly to your inbox.</p>
          <form className="sub" onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}>
            <input type="email" required placeholder={done ? 'Thank you, you are subscribed' : 'Email'} aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={done} />
            <button type="submit" disabled={done}>Subscribe</button>
          </form>
          <p style={{ marginTop: 18, maxWidth: 360, fontSize: 12, opacity: .8 }}>{C.address}<br /><a className="ulink" href={C.phoneTel}>{C.phoneDisplay}</a><br />5% GST applicable on all service rates</p>
        </div>
        <div className="gx"><h5>Top services</h5><ul>{top.map((i) => <li key={i.id}><a href="#s" onClick={(e) => { e.preventDefault(); ui.openService(i.id); }}>{i.name.replace('*', '').toLowerCase().replace(/(^|[\s/(-])\w/g, (m) => m.toUpperCase())}</a></li>)}</ul></div>
        <div><h5>Navigation</h5><ul>{[['/about', 'About'], ['/services', 'Services'], ['/elite-club', 'Elite Club'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([to, l]) => <li key={to}><Link to={to}>{l}</Link></li>)}</ul></div>
        <div><h5>Follow us</h5><ul><li><a className="ulink" href={placeholders.instagramUrl} target="_blank" rel="noreferrer">Instagram</a></li><li><a className="ulink" href={C.mapUrl} target="_blank" rel="noreferrer">Google Maps</a></li></ul></div>
      </div>
      <div className="legal"><Link to="/privacy">Privacy Policy</Link><span>•</span><Link to="/terms">Terms</Link><span style={{ marginLeft: 'auto' }}>© {new Date().getFullYear()} Qesh Salon</span></div>
      <div className="fwm"><TechText text="QESH SALON" fontFamily="'Archivo Variable', 'Helvetica Neue', Arial, sans-serif" fontWeight={800} letterSpacing={-0.05} fitWidth padX="var(--pad)" padTop={75} padBottom={25} color="#0b0b0b" accentColor="#0b0b0b" /></div>
    </footer>
  );
}
