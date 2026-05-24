import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register standard PWA service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('AAC Board PWA registered successfully: ', registration.scope);
      })
      .catch((err) => {
        console.warn('PWA service worker registration failed: ', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Allow registering in dev mode too for preview checks
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('AAC Board PWA registered in dev mode: ', registration.scope);
      })
      .catch((err) => {
        console.log('PWA registration skipped/failed in dev');
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

