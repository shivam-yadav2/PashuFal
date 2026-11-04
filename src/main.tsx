import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { applySettings, BUSINESS_CONFIG } from './config/business';
import './index.css';

async function bootstrap() {
  // Pull the owner's admin-edited settings before the first render, so every
  // component reading BUSINESS_CONFIG shows live values. If the API is
  // unreachable the built-in defaults are used and the site still renders.
  try {
    const res = await fetch('/api/settings');
    const body = await res.json();
    if (body?.success) applySettings(body.data);
  } catch (err) {
    console.warn('Could not load site settings; using defaults.', err);
  }
  document.title = BUSINESS_CONFIG.brandName;
  createRoot(document.getElementById('root')!).render(<App />);
}

bootstrap();
