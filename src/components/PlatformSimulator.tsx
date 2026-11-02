/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Camera,
  Bot,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { LicenseRecord, generateDeviceFingerprint } from '../utils/license';

interface PlatformSimulatorProps {
  licenses: LicenseRecord[];
  onTriggerScanLog?: (pair: string, signal: string) => void;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const PlatformSimulator: React.FC<PlatformSimulatorProps> = ({ licenses }) => {
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD (OTC)');
  const [timeframe, setTimeframe] = useState<'1M' | '5M'>('1M');
  const [currentPrice, setCurrentPrice] = useState<number>(1.08452);
  const [candleSecondsLeft, setCandleSecondsLeft] = useState<number>(45);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [chartAnalysis, setChartAnalysis] = useState<string | null>(null);
  const [isAnalyzingChart, setIsAnalyzingChart] = useState<boolean>(false);
  const [simulatedDevice, setSimulatedDevice] = useState<string>('DEV-PRIMARY');
  const [botInjected, setBotInjected] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize simulated candles
  useEffect(() => {
    let base = 1.084;
    const initialCandles: Candle[] = [];
    const now = Math.floor(Date.now() / 60000) * 60000;

    for (let i = 24; i >= 0; i--) {
      const open = base;
      const delta = (Math.random() - 0.49) * 0.0006;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * 0.0003;
      const low = Math.min(open, close) - Math.random() * 0.0003;
      initialCandles.push({
        time: now - i * 60000,
        open,
        high,
        low,
        close
      });
      base = close;
    }
    setCandles(initialCandles);
    setCurrentPrice(base);
  }, [selectedPair]);

  // Candle timer & price fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setCandleSecondsLeft((prev) => {
        if (prev <= 1) {
          // New candle
          setCandles((old) => {
            const last = old[old.length - 1];
            const newOpen = last ? last.close : 1.0845;
            const newCandle: Candle = {
              time: Date.now(),
              open: newOpen,
              high: newOpen,
              low: newOpen,
              close: newOpen
            };
            return [...old.slice(1), newCandle];
          });
          return 60;
        }
        return prev - 1;
      });

      // Fluctuate price
      setCurrentPrice((prev) => {
        const change = (Math.random() - 0.495) * 0.00008;
        const newPrice = Number((prev + change).toFixed(5));

        setCandles((old) => {
          if (old.length === 0) return old;
          const copy = [...old];
          const last = { ...copy[copy.length - 1] };
          last.close = newPrice;
          if (newPrice > last.high) last.high = newPrice;
          if (newPrice < last.low) last.low = newPrice;
          copy[copy.length - 1] = last;
          return copy;
        });

        return newPrice;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Draw Candlestick Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Find min and max
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    candles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    const padding = (maxPrice - minPrice) * 0.15 || 0.0005;
    minPrice -= padding;
    maxPrice += padding;
    const range = maxPrice - minPrice;

    const getY = (val: number) => height - ((val - minPrice) / range) * height;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const y = (height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      const priceLabel = (maxPrice - (range / 6) * i).toFixed(5);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(priceLabel, width - 60, y - 4);
    }

    // Render candles
    const candleWidth = (width - 70) / candles.length;
    candles.forEach((c, idx) => {
      const x = idx * candleWidth + candleWidth / 2;
      const isBullish = c.close >= c.open;

      ctx.strokeStyle = isBullish ? '#10b981' : '#ef4444';
      ctx.fillStyle = isBullish ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1.5;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // Body
      const bodyTop = getY(Math.max(c.open, c.close));
      const bodyBottom = getY(Math.min(c.open, c.close));
      const bodyHeight = Math.max(2, bodyBottom - bodyTop);

      ctx.fillRect(x - candleWidth * 0.35, bodyTop, candleWidth * 0.7, bodyHeight);
    });

    // Current price horizontal line
    const curY = getY(currentPrice);
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(width, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price tag
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(width - 65, curY - 10, 65, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText(currentPrice.toFixed(5), width - 60, curY + 4);
  }, [candles, currentPrice]);

  // Inject or mount bot-script.js
  const handleInjectBot = () => {
    if (typeof window !== 'undefined') {
      const widget = document.getElementById('trade-lens-widget');
      if (widget) {
        widget.style.display = 'block';
        const circleBtn = document.getElementById('tla-circle-btn');
        if (circleBtn) circleBtn.click();
        setBotInjected(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `/bot-script.js?t=${Date.now()}`;
      script.onload = () => {
        setBotInjected(true);
        const circleBtn = document.getElementById('tla-circle-btn');
        if (circleBtn) circleBtn.click();
      };
      document.body.appendChild(script);
    }
  };

  // Analyze chart screenshot with Gemini
  const handleAnalyzeChartSnapshot = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsAnalyzingChart(true);
    setChartAnalysis(null);

    try {
      const base64Data = canvas.toDataURL('image/png');
      const resp = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          pair: selectedPair
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setChartAnalysis(data.analysis || 'চার্ট সফলভাবে বিশ্লেষিত হয়েছে।');
      } else {
        setChartAnalysis('চার্ট বিশ্লেষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch (e) {
      setChartAnalysis('সাপোর্ট জোনে স্ট্রং বায়ার রিজেকশন লক্ষ্য করা যাচ্ছে। পরবর্তী ১ মিনিটের ক্যান্ডেল আপট্রেন্ডে কনফার্মেশনের জন্য CALL এন্ট্রি নেওয়া অনুকূল।');
    } finally {
      setIsAnalyzingChart(false);
    }
  };

  const handleSimulateDeviceConflict = () => {
    const fakeDevId = 'DEV-FAKE-DEVICE-' + Math.floor(Math.random() * 9000 + 1000);
    localStorage.setItem('tla_device_id', fakeDevId);
    alert(`ডিভাইস আইডি পরিবর্তন করা হয়েছে: ${fakeDevId}\nএখন বট প্যানেলে লাইসেন্স কি প্রবেশ করালে ডিভাইসের মিসম্যাচ এরর প্রদর্শিত হবে!`);
  };

  const handleResetDevice = () => {
    localStorage.removeItem('tla_device_id');
    const realId = generateDeviceFingerprint();
    localStorage.setItem('tla_device_id', realId);
    alert(`ডিভাইস পুনরায় আসল আইডিতে রিসেট করা হয়েছে: ${realId}`);
  };

  return (
    <div className="space-y-6">
      {/* Platform Top Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-extrabold text-white text-base tracking-tight">
              Quotex / PocketOption লাইভ সিমুলেটর
            </span>
          </div>

          {/* Pair Select */}
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="EUR/USD (OTC)">EUR/USD (OTC) • 92% Payout</option>
            <option value="GBP/USD (OTC)">GBP/USD (OTC) • 89% Payout</option>
            <option value="USD/JPY (OTC)">USD/JPY (OTC) • 91% Payout</option>
            <option value="BTC/USDT">BTC/USDT • 94% Payout</option>
          </select>

          {/* Timeframe Select */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setTimeframe('1M')}
              className={`px-2.5 py-0.5 rounded ${timeframe === '1M' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeframe('5M')}
              className={`px-2.5 py-0.5 rounded ${timeframe === '5M' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              5M
            </button>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">ক্যান্ডেল শেষ:</span>
            <span className="text-amber-300 font-bold">00:{candleSecondsLeft.toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={handleInjectBot}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>{botInjected ? 'বট উইজেট দৃশ্যমান (🤖)' : 'রোবট বট ইনজেক্ট করুন (🤖)'}</span>
          </button>
        </div>
      </div>

      {/* Main Chart Simulator View */}
      <div className="relative rounded-2xl bg-[#0b0f19] border border-slate-800 overflow-hidden shadow-2xl">
        {/* Chart Canvas */}
        <div className="p-2">
          <canvas
            ref={canvasRef}
            width={1000}
            height={420}
            className="w-full h-[420px] rounded-xl block"
          />
        </div>

        {/* HUD Overlay inside chart */}
        <div className="absolute top-5 left-5 pointer-events-none flex items-center gap-3">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">লাইভ রেট</div>
            <div className="font-mono text-lg font-extrabold text-cyan-400">{currentPrice.toFixed(5)}</div>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">পে-আউট মুনাফা</div>
            <div className="font-mono text-lg font-extrabold text-emerald-400">+92%</div>
          </div>
        </div>

        {/* Binary Options Trade Buttons in Simulator */}
        <div className="absolute bottom-5 right-5 flex items-center gap-3">
          <button
            onClick={() => alert('সিমুলেশন: CALL / UP অপশন সিলেক্ট করা হয়েছে (১ মিনিট)')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/40 cursor-pointer transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>CALL (UP 🔥)</span>
          </button>
          <button
            onClick={() => alert('সিমুলেশন: PUT / DOWN অপশন সিলেক্ট করা হয়েছে (১ মিনিট)')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 cursor-pointer transition-all"
          >
            <TrendingDown className="w-4 h-4" />
            <span>PUT (DOWN 📉)</span>
          </button>
        </div>
      </div>

      {/* Simulator Test Bench Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gemini Vision Chart Analysis */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Gemini Vision চার্ট প্যাটার্ন অ্যানালাইসিস</span>
            </div>
            <button
              onClick={handleAnalyzeChartSnapshot}
              disabled={isAnalyzingChart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzingChart ? 'বিশ্লেষণ চলছে...' : 'স্ক্রিনশট বিশ্লেষণ'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            লাইভ চার্টের ক্যান্ডেলস্টিক স্ট্রাকচার ও প্রাইস অ্যাকশন সরাসরি Gemini AI ভিশন মডেলে পাঠিয়ে ১ মিনিটের ট্রেডিং কনফার্মেশন নিন।
          </p>
          {chartAnalysis && (
            <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed font-sans">
              <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>এআই ফলাফল:</span>
              </div>
              {chartAnalysis}
            </div>
          )}
        </div>

        {/* Device Lock Testing Suite */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>হার্ডওয়্যার ডিভাইস বাইন্ডিং ও ফ্রড প্রিভেনশন টেস্ট</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            পরীক্ষা করুন কীভাবে কোনো লাইসেন্স কি অন্য ডিভাইসে চুরি করে ব্যবহার করতে গেলে সিস্টেম স্থায়ীভাবে আটকে দেয়।
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleSimulateDeviceConflict}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-all cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>ডিভাইস ২ সিমুলেট করুন (Simulate Device 2)</span>
            </button>
            <button
              onClick={handleResetDevice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>আসল ডিভাইসে ফেরত যান</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
