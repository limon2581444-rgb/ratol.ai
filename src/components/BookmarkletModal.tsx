/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bookmark,
  Copy,
  Check,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Bot,
  Volume2
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
      {/* Notice Card */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-indigo-500/40 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">
                ১-ক্লিক বুকমার্কলেট (শুধু গোল রোবট আইকন আসবে 🤖)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ফুল ওয়েবসাইট আসবে না
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              এই কোডটি আপনার ব্রাউজারের বুকমার্কে সেভ করে Quotex বা Pocket Option এ ক্লিক করলে কোনো পূর্ণ ওয়েবসাইট ওপেন হবে না — শুধুমাত্র স্ক্রিনের উপর <strong>ড্র্যাগেবল গোল রোবট আইকনটি (🤖)</strong> আসবে এবং ক্লিক করলে <strong>"সিগন্যাল নিন"</strong> ও মুখে ভয়েসে কথা বলার <strong>"কথা বলুন"</strong> ফিচার কাজ করবে।
            </p>
          </div>
        </div>
      </div>

      {/* Bookmarklet Code Boxes */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>বুকমার্কলেট কোড কপি করুন (Bookmarklet Codes)</span>
        </h3>

        {/* Local/Hosted App Code */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-300">
              ১. হোস্ট লিঙ্ক বুকমার্কলেট (Local / Current Host):
            </span>
            <button
              onClick={() => copyToClipboard(appBookmarkletCode, false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {copiedAppBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAppBookmarklet ? 'কপি সম্পন্ন!' : '১ ক্লিকে কোড কপি করুন'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-cyan-200 select-all border border-slate-800 break-all">
            {appBookmarkletCode}
          </div>
        </div>

        {/* Remote Vercel Code */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-300">
              ২. রিমোট লিঙ্ক বুকমার্কলেট (sabbirasistent.vercel.app):
            </span>
            <button
              onClick={() => copyToClipboard(vercelBookmarkletCode, true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              {copiedVercelBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedVercelBookmarklet ? 'কপি সম্পন্ন!' : 'কোড কপি করুন'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-indigo-200 select-all border border-slate-800 break-all">
            {vercelBookmarkletCode}
          </div>
        </div>

        {/* Warning & Clarification */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong>মনে রাখবেন:</strong> ব্রাউজারে বর্তমান ওয়েবপেজটিকে বুকমার্ক না করে, যেকোনো একটি বুকমার্কের <strong>Edit / URL</strong> ঘরে গিয়ে সম্পূর্ণ লিংকটি মুছে উপরের <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">javascript:(function...</code> কোডটি পেস্ট করবেন। তাহলে আর কখনোই ফুল ওয়েবসাইট লোড হবে না, শুধু গোল রোবট আইকনটি ভেসে উঠবে।
          </div>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PC Guide */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3">
            <Monitor className="w-4 h-4" />
            <span>ল্যাপটপ / কম্পিউটারে ইনস্টল নিয়ম:</span>
          </div>
          <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
            <li>বুকমার্ক বারে রাইট-ক্লিক করে <strong>"Add page..."</strong> চাপুন।</li>
            <li>Name ঘরে লিখুন: <strong>Trade Lens AI</strong></li>
            <li>URL ঘরে পেস্ট করুন: উপরের কপি করা কোডটি।</li>
            <li>এখন <strong>Quotex</strong> বা <strong>Pocket Option</strong> এ গিয়ে বুকমার্কে ক্লিক করুন — স্ক্রিনে সাথে সাথে গোল রোবট আইকন ভেসে উঠবে!</li>
          </ol>
        </div>

        {/* Mobile Guide */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
            <Smartphone className="w-4 h-4" />
            <span>মোবাইলে ইনস্টল নিয়ম (Chrome / Kiwi Browser):</span>
          </div>
          <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
            <li>যেকোনো পেজে গিয়ে বুকমার্ক যোগ করুন।</li>
            <li>বুকমার্কে গিয়ে <strong>Edit Bookmark</strong> এ চাপুন।</li>
            <li>URL বক্সে আগের লিংক মুছে উপরের কোডটি পেস্ট করে সেভ করুন।</li>
            <li>Quotex ওপেন করে ব্রাউজারের অ্যাড্রেস বারে <strong>Trade Lens</strong> লিখলেই বুকমার্কটি আসবে, চাপ দিলেই রোবট চলে আসবে!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
