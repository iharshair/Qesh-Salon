import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header, { MobileMenu, StickyBook } from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ServiceModal from './components/ServiceModal.jsx';
import { BookingOverlay } from './components/BookingFlow.jsx';
import Home from './pages/Home.jsx';
import * as P from './pages/Pages.jsx';

export default function App() {
  const loc = useLocation();
  useEffect(() => { if (loc.pathname !== '/') window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <>
      <Header /><MobileMenu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<P.ServicesPage />} />
        <Route path="/about" element={<P.AboutPage />} />
        <Route path="/elite-club" element={<P.ElitePage />} />
        <Route path="/elite-club/checkout" element={<P.CheckoutPage />} />
        <Route path="/book" element={<P.BookPage />} />
        <Route path="/account" element={<P.AccountPage />} />
        <Route path="/login" element={<P.LoginPage />} />
        <Route path="/blog" element={<P.BlogPage />} />
        <Route path="/blog/:slug" element={<P.ArticlePage />} />
        <Route path="/contact" element={<P.ContactPage />} />
        <Route path="/privacy" element={<P.LegalPage kind="privacy" />} />
        <Route path="/terms" element={<P.LegalPage kind="terms" />} />
        <Route path="*" element={<P.LegalPage kind="terms" />} />
      </Routes>
      <Footer /><ServiceModal /><BookingOverlay /><StickyBook />
    </>
  );
}
