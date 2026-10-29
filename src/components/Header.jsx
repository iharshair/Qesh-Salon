import React, { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth, useGender, useMembership, useUI } from '../context/AppContexts.jsx';
import { Logo } from './ui.jsx';

export function GenderToggle() {
  const { gender, setGender } = useGender();
  return (
    <div className="toggle" role="group" aria-label="Show services for">
      {['women', 'men'].map((g) => <button key={g} className={gender === g ? 'on' : ''} aria-pressed={gender === g} onClick={() => setGender(g)}>{g}</button>)}
    </div>
  );
}

export default function Header() {
  const { user } = useAuth(); const { isMember } = useMembership(); const ui = useUI(); const loc = useLocation();
  // transparent over the hero on the home page, solid white everywhere else
  useEffect(() => {
    const root = document.documentElement;
    if (loc.pathname !== '/') { root.dataset.hero = 'out'; return; }
    const hero = () => document.querySelector('[data-hero-section]');
    const onScroll = () => { const h = hero(); root.dataset.hero = h && window.scrollY < h.offsetHeight - 120 ? 'in' : 'out'; };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [loc.pathname]);
  return (
    <header className="hdr">
      <Link to="/" className="logo" aria-label="Qesh Salon home"><Logo /></Link>
      <nav aria-label="Main">
        <NavLink to="/about">About us</NavLink><NavLink to="/services">Services</NavLink><NavLink to="/elite-club">Elite Club</NavLink><NavLink to="/blog">Blog</NavLink><NavLink to="/contact">Contacts</NavLink>
      </nav>
      <span className="sp" />
      <GenderToggle />
      <Link className="acct" to={user ? '/account' : '/login'}>{user ? 'Account' : 'Login'}{isMember && <span className="chip elite">Elite</span>}</Link>
      <button className="book" onClick={() => ui.openBooking()}>Book an Appointment</button>
      <button className="menu-btn" onClick={() => ui.setMenuOpen(true)} aria-label="Open menu">Menu</button>
    </header>
  );
}

export function MobileMenu() {
  const ui = useUI(); const { user } = useAuth(); const close = () => ui.setMenuOpen(false);
  return (
    <div className={'mmenu' + (ui.menuOpen ? ' open' : '')} aria-hidden={!ui.menuOpen}>
      <div className="top"><Logo className="" /><button className="chip" onClick={close}>Close</button></div>
      <GenderToggle />
      <nav>
        {[['/about', 'About us'], ['/services', 'Services'], ['/elite-club', 'Elite Club'], ['/blog', 'Blog'], ['/contact', 'Contacts'], [user ? '/account' : '/login', user ? 'Account' : 'Login']].map(([to, l]) => <Link key={to} to={to} className="big" onClick={close}>{l}</Link>)}
      </nav>
      <button className="btn block" onClick={() => ui.openBooking()}>Book an Appointment</button>
    </div>
  );
}

export function StickyBook() {
  const ui = useUI(); const [show, setShow] = React.useState(false);
  useEffect(() => { const f = () => setShow(window.scrollY > window.innerHeight * 0.9); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  return <button className={'sticky-book' + (show ? ' show' : '')} onClick={() => ui.openBooking()}>Book an Appointment</button>;
}
