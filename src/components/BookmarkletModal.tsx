/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bookmark,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const BookmarkletModal: React.FC = () => {
  const [copiedAppBookmarklet, setCopiedAppBookmarklet] = useState<boolean>(false);
  const [copiedVercelBookmarklet, setCopiedVercelBookmarklet] = useState<boolean>(false);

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sabbirasistent.vercel.app';
  const appBookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='${appOrigin}/bot-script.js?t='+Date.now();document.head.appendChild(s);})();`;
  const vercelBookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='https://sabbirasistent.vercel.app/bot-script.js';document.head.appendChild(s);})();`;

  const copyToClipboard = (text: string, isVercel: boolean) => {
    navigator.clipboard.writeText(text);
    if (isVercel) {
      setCopiedVercelBookmarklet(true);
      setTimeout(() => setCopiedVercelBookmarklet(false), 2000);
    } else {
      setCopiedAppBookmarklet(true);
      setTimeout(() => setCopiedAppBookmarklet(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Bookmarklet Main Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                ১-ক্লিক বুকমার্কলেট ইনস্টলেশন (1-Line Bookmarklet)
              </h2>
              <p className="text-xs text-slate-400">
                যেকোনো ব্রাউজারে বুকমার্ক যোগ করে Quotex বা Pocket Option এ ক্লিক করলেই রোবট অ্যাসিস্ট্যান্ট চালু হবে।
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>কোনো এক্সটেনশন লাগবে না</span>
          </span>
        </div>

        {/* Primary Hosted App Bookmarklet */}
        <div className="space-y-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-200">
                  অফিসিয়াল হোস্ট বুকমার্কলেট (Live App Endpoint)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(appBookmarkletCode, false)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
              >
                {copiedAppBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAppBookmarklet ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-300 break-all select-all border border-slate-800">
              {appBookmarkletCode}
            </div>
          </div>

          {/* Vercel Remote URL Bookmarklet */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="text-xs font-bold text-slate-200">
                  রিমোট হোস্ট বুকমার্কলেট (https://sabbirasistent.vercel.app/bot-script.js)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(vercelBookmarkletCode, true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                {copiedVercelBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVercelBookmarklet ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-indigo-300 break-all select-all border border-slate-800">
              {vercelBookmarkletCode}
            </div>
          </div>

          {/* Drag to Bookmarks Bar Button */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-indigo-200">
              <strong>টিপস:</strong> ডেক্সটপ ব্রাউজারে নিচের বাটনটি ড্র্যাগ করে সরাসরি আপনার ব্রাউজারের বুকমার্ক বারে ছেড়ে দিন:
            </div>
            <a
              href={appBookmarkletCode}
              onClick={(e) => e.preventDefault()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-grab active:cursor-grabbing shrink-0"
              title="Drag this button to your Bookmarks Bar"
            >
              <span>🤖</span>
              <span>Trade Lens AI (টেনে বুকমার্কে রাখুন)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Desktop Setup */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-4">
            <Monitor className="w-4 h-4" />
            <span>কম্পিউটার বা ল্যাপটপে ইনস্টল নিয়ম (Chrome / Brave / Edge)</span>
          </div>
          <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
            <li className="leading-relaxed">
              আপনার ব্রাউজারের বুকমার্ক বার চালু করুন (<code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">Ctrl + Shift + B</code>)।
            </li>
            <li className="leading-relaxed">
              বুকমার্ক বারে মাউসের রাইট ক্লিক করে <strong>"Add Page..."</strong> বা <strong>"Add Bookmark"</strong> চাপুন।
            </li>
            <li className="leading-relaxed">
              নাম দিন <strong>"Trade Lens AI"</strong> এবং URL বক্সে উপরের ১-লাইনের বুকমার্কলেট কোডটি পেস্ট করুন।
            </li>
            <li className="leading-relaxed">
              Quotex বা Pocket Option ওয়েবসাইটে যান এবং বুকমার্কে ক্লিক করুন — সাথে সাথে স্ক্রিনে রোবট (🤖) অ্যাসিস্ট্যান্ট ভেসে উঠবে!
            </li>
          </ol>
        </div>

        {/* Mobile Setup */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-4">
            <Smartphone className="w-4 h-4" />
            <span>মোবাইলে ব্যবহার নিয়ম (Kiwi Browser / Chrome Mobile)</span>
          </div>
          <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside">
            <li className="leading-relaxed">
              যেকোনো পেজে গিয়ে বুকমার্ক সেভ করুন এবং সেটি এডিট করুন।
            </li>
            <li className="leading-relaxed">
              URL ঘরে মুছে উপরের ১-লাইনের বুকমার্কলেট কোডটি পেস্ট করুন।
            </li>
            <li className="leading-relaxed">
              Quotex বা Pocket Option পেজে গিয়ে ব্রাউজারের অ্যাড্রেস বারে <strong>"Trade Lens AI"</strong> লিখলে বুকমার্কটি শো করবে, চাপ দিলেই রোবট অন হয়ে যাবে!
            </li>
            <li className="leading-relaxed">
              ডিভাইস ফিঙ্গারপ্রিন্ট স্বয়ংক্রিয়ভাবে শনাক্ত হবে এবং আপনার লাইসেন্সে লক হয়ে যাবে।
            </li>
          </ol>
        </div>
      </div>

      {/* Supported Platforms */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          ১০০% সাপোর্টেড বাইনারি ট্রেডিং প্ল্যাটফর্ম সমূহ
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {['Quotex (qxbroker.com)', 'Pocket Option', 'Olymp Trade', 'IQ Option', 'Binomo', 'Deriv.com'].map((platform) => (
            <div key={platform} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
              <span className="text-xs font-semibold text-slate-200">{platform}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
