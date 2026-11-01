/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KeyRound, Smartphone, ShieldAlert, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { LicenseRecord } from '../utils/license';

interface AnalyticsGridProps {
  licenses: LicenseRecord[];
  apiScanCount: number;
}

export const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({ licenses, apiScanCount }) => {
  const totalKeys = licenses.length;
  const activeBoundUsers = licenses.filter(
    (l) => l.status === 'active' && l.boundDeviceId && l.boundDeviceId.trim() !== ''
  ).length;
  const activeUnboundKeys = licenses.filter(
    (l) => l.status === 'active' && (!l.boundDeviceId || l.boundDeviceId.trim() === '')
  ).length;
  const revokedKeys = licenses.filter((l) => l.status === 'revoked').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Licenses */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 p-5 shadow-lg backdrop-blur-sm group hover:border-indigo-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            মোট লাইসেন্স কি (Total)
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{totalKeys}</span>
          <span className="text-xs text-indigo-400 font-medium">জেনারেটেড</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold">{activeUnboundKeys} টি</span>
          <span>নতুন ব্যবহারের জন্য প্রস্তুত</span>
        </div>
      </div>

      {/* Active Bound Users */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 p-5 shadow-lg backdrop-blur-sm group hover:border-emerald-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            লকড ডিভাইস (Active Users)
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {activeBoundUsers}
          </span>
          <span className="text-xs text-emerald-300 font-medium">লাইভ বাউন্ড</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>হার্ডওয়্যার ফিঙ্গারপ্রিন্টে স্থায়ী লকড</span>
        </div>
      </div>

      {/* Revoked Keys */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 p-5 shadow-lg backdrop-blur-sm group hover:border-red-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            বাতিলকৃত কি (Revoked)
          </span>
          <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-red-400 tracking-tight">{revokedKeys}</span>
          <span className="text-xs text-red-300 font-medium">ব্লকড</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-red-400 font-semibold">{revokedKeys > 0 ? 'নিরাপত্তা বলবৎ' : 'কোনো ফ্রড নেই'}</span>
          <span>• রিয়েলটাইম লক</span>
        </div>
      </div>

      {/* API Usage & Signals */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/60 p-5 shadow-lg backdrop-blur-sm group hover:border-cyan-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            এআই সিগন্যাল স্ক্যান (API Usage)
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-cyan-400 tracking-tight">
            {apiScanCount}
          </span>
          <span className="text-xs text-cyan-300 font-medium">কলস</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini 3.8 Flash • ৯৪% একিউরেসি</span>
        </div>
      </div>
    </div>
  );
};
