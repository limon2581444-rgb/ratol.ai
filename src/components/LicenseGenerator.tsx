/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Key, Sparkles, Copy, Check, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { generateLicenseKey, parseDurationToExpiry, LicenseRecord } from '../utils/license';

interface LicenseGeneratorProps {
  onGenerateKey: (license: LicenseRecord) => Promise<void>;
  currentAdminEmail?: string | null;
}

export const LicenseGenerator: React.FC<LicenseGeneratorProps> = ({
  onGenerateKey,
  currentAdminEmail
}) => {
  const [duration, setDuration] = useState<'1day' | '7days' | '30days' | '90days' | 'lifetime'>('30days');
  const [notes, setNotes] = useState<string>('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const durationOptions = [
    { id: '1day', label: '১ দিন (1 Day)', tag: 'TL-1DAY', badge: 'ট্রায়াল' },
    { id: '7days', label: '৭ দিন (7 Days)', tag: 'TL-7DAYS', badge: 'জনপ্রিয়' },
    { id: '30days', label: '৩০ দিন (30 Days)', tag: 'TL-30DAYS', badge: 'স্ট্যান্ডার্ড' },
    { id: '90days', label: '৯০ দিন (3 Months)', tag: 'TL-90DAYS', badge: 'প্রো' },
    { id: 'lifetime', label: 'লাইফটাইম (Lifetime)', tag: 'TL-LIFETIME', badge: 'ভিআইপি' }
  ] as const;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const key = generateLicenseKey(duration);
      const now = new Date();
      const expiresAt = parseDurationToExpiry(duration, now);

      const newLicense: LicenseRecord = {
        key,
        duration,
        status: 'active',
        boundDeviceId: null,
        deviceInfo: null,
        createdAt: now.toISOString(),
        activatedAt: null,
        expiresAt,
        notes: notes.trim() || 'General Client',
        createdBy: currentAdminEmail || 'admin'
      };

      await onGenerateKey(newLicense);
      setGeneratedKey(key);
      setNotes('');
    } catch (err) {
      console.error('Error creating license key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <span>লাইসেন্স কি জেনারেটর (License Key Generator)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ইউনিক সিকিউর কি তৈরি করুন যা গ্রাহকের ব্রাউজার হার্ডওয়্যার ফিঙ্গারপ্রিন্টের সাথে স্বয়ংক্রিয়ভাবে লক হয়ে যাবে।
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1.5 rounded-xl font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>অটো ডিভাইস বাইন্ডিং এনফোর্সড</span>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* Duration Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            মেয়াদ নির্বাচন করুন (Validity Period)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {durationOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDuration(opt.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  duration === opt.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-400">{opt.tag}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      duration === opt.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>
                <span className="text-xs font-semibold mt-1">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Client Notes / Name */}
        <div>
          <label htmlFor="client-notes" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            গ্রাহকের নাম বা নোট (Client Name / Identification)
          </label>
          <div className="relative">
            <input
              id="client-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="উদাঃ সাব্বির ভিআইপি মেম্বার #104, টেলিগ্রাম: @trader_pro"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            <UserCheck className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'লাইসেন্স জেনারেট হচ্ছে...' : 'নতুন লাইসেন্স কি তৈরি করুন (Generate Secure Key)'}</span>
          </button>
        </div>
      </form>

      {/* Generated Key Result Box */}
      {generatedKey && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/40 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                <span>লাইসেন্স কি সফলভাবে তৈরি হয়েছে এবং ফায়ারবেস স্টোরে যুক্ত হয়েছে!</span>
              </div>
              <div className="font-mono text-lg sm:text-xl font-bold text-white mt-1 select-all tracking-wide">
                {generatedKey}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি সম্পন্ন!' : 'কি কপি করুন'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
