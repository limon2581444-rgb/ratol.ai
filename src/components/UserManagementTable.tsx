/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Copy,
  Check,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Unlock,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { LicenseRecord } from '../utils/license';

interface UserManagementTableProps {
  licenses: LicenseRecord[];
  onToggleStatus: (key: string, newStatus: 'active' | 'revoked') => Promise<void>;
  onUnbindDevice: (key: string) => Promise<void>;
  onDeleteKey: (key: string) => Promise<void>;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  licenses,
  onToggleStatus,
  onUnbindDevice,
  onDeleteKey
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'bound' | 'revoked' | 'expired'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredLicenses = licenses.filter((lic) => {
    const matchesSearch =
      lic.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.notes && lic.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lic.boundDeviceId && lic.boundDeviceId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return lic.status === 'active';
    if (statusFilter === 'bound') return lic.status === 'active' && !!lic.boundDeviceId;
    if (statusFilter === 'revoked') return lic.status === 'revoked';
    if (statusFilter === 'expired') {
      if (lic.status === 'expired') return true;
      if (lic.expiresAt && new Date(lic.expiresAt).getTime() < Date.now()) return true;
      return false;
    }

    return true;
  });

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Table Header & Search Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>ইউজার ও লাইসেন্স ম্যানেজমেন্ট (Live Keys & Devices)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            সমস্ত লাইসেন্স কি-র স্ট্যাটাস, ডিভাইস ফিঙ্গারপ্রিন্ট লকিং এবং পারমিশন রিয়েল-টাইমে ট্র্যাক করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="কি, ডিভাইস বা গ্রাহকের নাম..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              সব ({licenses.length})
            </button>
            <button
              onClick={() => setStatusFilter('bound')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'bound' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              লকড ডিভাইস
            </button>
            <button
              onClick={() => setStatusFilter('revoked')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'revoked' ? 'bg-red-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              বাতিলকৃত
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">লাইসেন্স কি (License Key)</th>
              <th className="py-3.5 px-4">মেয়াদ ও তারিখ</th>
              <th className="py-3.5 px-4">স্ট্যাটাস</th>
              <th className="py-3.5 px-4">বাউন্ড ডিভাইস আইডি (Device ID)</th>
              <th className="py-3.5 px-4">গ্রাহক / নোট</th>
              <th className="py-3.5 px-4 text-right">অ্যাকশন (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredLicenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-slate-600" />
                    <span>কোনো লাইসেন্স কি পাওয়া যায়নি</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLicenses.map((lic) => {
                const isRevoked = lic.status === 'revoked';
                const isExpired =
                  lic.status === 'expired' ||
                  (lic.expiresAt && new Date(lic.expiresAt).getTime() < Date.now());
                const isBound = lic.boundDeviceId && lic.boundDeviceId.trim() !== '';

                return (
                  <tr key={lic.key} className="hover:bg-slate-800/40 transition-colors">
                    {/* License Key */}
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-300 font-bold select-all">{lic.key}</span>
                        <button
                          onClick={() => handleCopy(lic.key)}
                          title="কি কপি করুন"
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                        >
                          {copiedKey === lic.key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Duration & Expiry */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 uppercase">
                          {lic.duration}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {lic.expiresAt
                            ? new Date(lic.expiresAt).toLocaleDateString()
                            : 'লাইফটাইম'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isRevoked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                          <ShieldAlert className="w-3 h-3" />
                          <span>REVOKED (বাতিল)</span>
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>EXPIRED (মেয়াদোত্তীর্ণ)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>ACTIVE (সক্রিয়)</span>
                        </span>
                      )}
                    </td>

                    {/* Bound Device ID */}
                    <td className="py-3 px-4">
                      {isBound ? (
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300">
                            {lic.boundDeviceId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">
                          এখনও কোনো ডিভাইসে লক হয়নি
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-slate-300">
                      <span className="truncate max-w-[160px] inline-block" title={lic.notes}>
                        {lic.notes || '-'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Revoke / Reactivate Button */}
                        {isRevoked ? (
                          <button
                            onClick={() => onToggleStatus(lic.key, 'active')}
                            title="পুনরায় সক্রিয় করুন"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleStatus(lic.key, 'revoked')}
                            title="লাইসেন্স বাতিল (Revoke) করুন"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}

                        {/* Unbind Device Lock */}
                        {isBound && (
                          <button
                            onClick={() => onUnbindDevice(lic.key)}
                            title="ডিভাইস লক রিলিজ করুন (Unbind Device)"
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-colors cursor-pointer"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Key */}
                        <button
                          onClick={() => onDeleteKey(lic.key)}
                          title="লাইসেন্স মুছে ফেলুন"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
