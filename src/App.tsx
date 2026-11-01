/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnalyticsGrid } from './components/AnalyticsGrid';
import { LicenseGenerator } from './components/LicenseGenerator';
import { UserManagementTable } from './components/UserManagementTable';
import { BookmarkletModal } from './components/BookmarkletModal';
import { SettingsPanel } from './components/SettingsPanel';
import { PlatformSimulator } from './components/PlatformSimulator';
import { LicenseRecord } from './utils/license';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'bookmarklet' | 'settings'>('dashboard');
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [apiScanCount, setApiScanCount] = useState<number>(142);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial seed demo licenses for immediate instant testing
  const defaultInitialKeys: LicenseRecord[] = [
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

  // Initialize immediately
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('tla_admin_licenses');
    if (!existing) {
      localStorage.setItem('tla_admin_licenses', JSON.stringify(defaultInitialKeys));
    }
    (window as any).__TRADE_LENS_LICENSES__ = existing ? JSON.parse(existing) : defaultInitialKeys;
  }

  // Subscribe to real-time Firestore licenses collection
  useEffect(() => {
    let isMounted = true;
    const path = 'licenses';

    try {
      const q = collection(db, path);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted) return;
          const remoteList: LicenseRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as LicenseRecord;
            remoteList.push({ ...data, key: data.key || d.id });
          });

          if (remoteList.length > 0) {
            setLicenses(remoteList);
          } else {
            // Seed defaults if brand new database
            setLicenses(defaultInitialKeys);
            defaultInitialKeys.forEach(async (initKey) => {
              try {
                await setDoc(doc(db, 'licenses', initKey.key), initKey);
              } catch (e) {
                // Ignore seed write error
              }
            });
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore snapshot notice, using fallback state:', error.message);
          handleFirestoreError(error, OperationType.GET, path);
          if (isMounted) {
            setLicenses(defaultInitialKeys);
            setLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      console.warn('Firestore connection fallback:', err);
      setLicenses(defaultInitialKeys);
      setLoading(false);
    }
  }, []);

  // Sync to window and localStorage for bot script access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__TRADE_LENS_LICENSES__ = licenses;
      localStorage.setItem('tla_admin_licenses', JSON.stringify(licenses));
    }
  }, [licenses]);

  // Ensure remote bot script is loaded so user can test floating robot directly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = document.getElementById('trade-lens-widget');
      if (!existing) {
        const script = document.createElement('script');
        script.src = `/bot-script.js?t=${Date.now()}`;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Handlers
  const handleGenerateKey = async (newLicense: LicenseRecord) => {
    // 1. Update local state immediately for instant feedback
    setLicenses((prev) => [newLicense, ...prev]);

    // 2. Persist to Firestore
    try {
      await setDoc(doc(db, 'licenses', newLicense.key), newLicense);
    } catch (err) {
      console.error('Error saving license to Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, `licenses/${newLicense.key}`);
    }
  };

  const handleToggleStatus = async (key: string, newStatus: 'active' | 'revoked') => {
    setLicenses((prev) =>
      prev.map((l) => (l.key === key ? { ...l, status: newStatus } : l))
    );

    try {
      await updateDoc(doc(db, 'licenses', key), { status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      handleFirestoreError(err, OperationType.UPDATE, `licenses/${key}`);
    }
  };

  const handleUnbindDevice = async (key: string) => {
    setLicenses((prev) =>
      prev.map((l) => (l.key === key ? { ...l, boundDeviceId: null, activatedAt: null } : l))
    );

    try {
      await updateDoc(doc(db, 'licenses', key), {
        boundDeviceId: null,
        activatedAt: null
      });
    } catch (err) {
      console.error('Error unbinding device:', err);
      handleFirestoreError(err, OperationType.UPDATE, `licenses/${key}`);
    }
  };

  const handleDeleteKey = async (key: string) => {
    setLicenses((prev) => prev.filter((l) => l.key !== key));

    try {
      await deleteDoc(doc(db, 'licenses', key));
    } catch (err) {
      console.error('Error deleting license:', err);
      handleFirestoreError(err, OperationType.DELETE, `licenses/${key}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeLicensesCount={licenses.filter((l) => l.status === 'active').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            {/* Real-Time Analytics Grid */}
            <AnalyticsGrid licenses={licenses} apiScanCount={apiScanCount} />

            {/* License Key Generator Control Panel */}
            <LicenseGenerator
              onGenerateKey={handleGenerateKey}
              currentAdminEmail={auth.currentUser?.email}
            />

            {/* Live User Management Table */}
            <UserManagementTable
              licenses={licenses}
              onToggleStatus={handleToggleStatus}
              onUnbindDevice={handleUnbindDevice}
              onDeleteKey={handleDeleteKey}
            />
          </div>
        )}

        {activeTab === 'simulator' && (
          <PlatformSimulator
            licenses={licenses}
            onTriggerScanLog={(pair, sig) => setApiScanCount((c) => c + 1)}
          />
        )}

        {activeTab === 'bookmarklet' && <BookmarkletModal />}

        {activeTab === 'settings' && <SettingsPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Trade Lens AI</strong> • Advanced Binary Options Trading Assistant & License Engine
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Quotex & Pocket Option Compatible</span>
            <span>•</span>
            <span>Hardware Fingerprint Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
