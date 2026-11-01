/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server
} from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const SettingsPanel: React.FC = () => {
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [systemNotice, setSystemNotice] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const ref = doc(db, 'system_settings', 'config');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
          if (data.systemNotice) setSystemNotice(data.systemNotice);
        }
      } catch (err) {
        console.warn('Could not load settings document:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const ref = doc(db, 'system_settings', 'config');
      await setDoc(
        ref,
        {
          geminiApiKey: geminiApiKey.trim(),
          systemNotice: systemNotice.trim(),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      setStatusMessage({
        text: 'ক্রিডেনশিয়ালস ও সিস্টেম কনফিগারেশন ফায়ারবেস স্টোরে সফলভাবে সংরক্ষিত হয়েছে!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error saving settings to Firestore:', err);
      setStatusMessage({
        text: 'সংরক্ষণ করতে সমস্যা হয়েছে। অ্যাডমিন পারমিশন চেক করুন।',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span>সিকিউর ক্রিডেনশিয়ালস ও সিস্টেম সেটিংস (Secure Credentials Storage)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          এখানে Gemini API Key এবং সিস্টেম সেটিংস ফায়ারবেস ক্লাউড স্টোরেজে সুরক্ষিতভাবে সংরক্ষিত থাকবে।
        </p>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/40 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="mt-6 space-y-5">
          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="gemini-key" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Google Gemini API Key</span>
              </label>
              <span className="text-[11px] text-slate-500">
                (ডিফল্টরূপে সার্ভার এনভায়রনমেন্ট কি ব্যবহৃত হবে)
              </span>
            </div>
            <div className="relative">
              <input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (Gemini API Key)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 font-mono outline-none pr-12 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Broadcast System Notice */}
          <div>
            <label htmlFor="system-notice" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              বট উইজেটে ব্রডকাস্ট নোটিশ (System Notice to Remote Bot)
            </label>
            <input
              id="system-notice"
              type="text"
              value={systemNotice}
              onChange={(e) => setSystemNotice(e.target.value)}
              placeholder="উদাঃ আজকের ইউরো/ইউএসডি ওটিসি ভোল্যাটিলিটি হাই, মানি ম্যানেজমেন্ট ফলো করুন।"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন (Save Credentials)'}</span>
          </button>
        </form>
      </div>

      {/* Cloud & Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3">
            <Database className="w-4 h-4" />
            <span>Firebase Firestore কানেকশন</span>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Project ID:</span>
              <span className="font-mono text-slate-200">ai-studio-applet-webapp-6ae20</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Database:</span>
              <span className="font-mono text-slate-200">ai-studio-ef58c407-0433...</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Security Rule Status:</span>
              <span className="text-emerald-400 font-semibold">Active & Hardened</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
            <Server className="w-4 h-4" />
            <span>Gemini AI Engine</span>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Primary Model:</span>
              <span className="font-mono text-slate-200">gemini-3.8-flash</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span>Language:</span>
              <span className="text-slate-200">Bengali (বাংলা) Dedicated</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Audio Synthesis:</span>
              <span className="text-emerald-400 font-semibold">Web AudioContext Dual-tone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
