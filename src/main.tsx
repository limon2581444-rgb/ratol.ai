import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pre-seed default license keys for instant testing and bot script verification
if (typeof window !== 'undefined') {
  const seedKeys = [
    {
      key: 'TL-1DAY-98FA-4B2C',
      duration: '1day',
      status: 'active',
      boundDeviceId: null,
      deviceInfo: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      notes: 'সাব্বির ট্রায়াল মেম্বার #1'
    },
    {
      key: 'TL-30DAYS-81DF-72E1',
      duration: '30days',
      status: 'active',
      boundDeviceId: 'DEV-A721C4F0-1092B7E3',
      deviceInfo: 'Win32 - Chrome 124',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      activatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 27).toISOString(),
      notes: 'VIP ট্রেডার তানভীর'
    },
    {
      key: 'TL-7DAYS-33BA-88FF',
      duration: '7days',
      status: 'revoked',
      boundDeviceId: 'DEV-C8910FE2-5412A091',
      deviceInfo: 'MacIntel - Safari 17',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      activatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      notes: 'ডিভাইস ভায়োলেশনের কারণে বাতিল'
    }
  ];

  const existing = localStorage.getItem('tla_admin_licenses');
  if (!existing) {
    localStorage.setItem('tla_admin_licenses', JSON.stringify(seedKeys));
  }
  (window as any).__TRADE_LENS_LICENSES__ = existing ? JSON.parse(existing) : seedKeys;
}

createRoot(document.getElementById('root')!).render(<App />);
