import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/inter-tight';
import './styles/base.css';
import './styles/pages.css';
import App from './App.jsx';
import { GenderProvider, AuthProvider, MembershipProvider, BookingProvider, UIProvider } from './context/AppContexts.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GenderProvider><AuthProvider><MembershipProvider><BookingProvider><UIProvider><App /></UIProvider></BookingProvider></MembershipProvider></AuthProvider></GenderProvider>
  </BrowserRouter>
);
