import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n.js';
import { prefetchLandingData } from './utils/shopData';

// Start the shop's first API requests now instead of after React mounts the page
prefetchLandingData();

// After a new deploy, a tab opened earlier may ask for page chunks that no longer
// exist. Reload once to pick up the new version instead of showing an error.
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('chunk_reload_done')) return;
    sessionStorage.setItem('chunk_reload_done', '1');
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

// Register Service Worker for offline PWA functionality (production builds only,
// so local development never serves stale cached files)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
