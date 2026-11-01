/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LicenseRecord {
  id?: string;
  key: string;
  duration: '1day' | '7days' | '30days' | '90days' | 'lifetime';
  status: 'active' | 'revoked' | 'expired' | 'pending';
  boundDeviceId?: string | null;
  deviceInfo?: string | null;
  createdAt: string;
  activatedAt?: string | null;
  expiresAt?: string | null;
  notes?: string;
  createdBy?: string;
}

export interface VerificationResult {
  valid: boolean;
  needsBinding?: boolean;
  bound?: boolean;
  error?: string;
  license?: LicenseRecord;
}

/**
 * Generates a formatted license key such as TL-1DAY-7A9B-4F2E
 */
export function generateLicenseKey(
  duration: '1day' | '7days' | '30days' | '90days' | 'lifetime'
): string {
  const durationTag = duration.toUpperCase();
  const hexPart1 = Math.random().toString(16).substring(2, 6).toUpperCase();
  const hexPart2 = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `TL-${durationTag}-${hexPart1}-${hexPart2}`;
}

/**
 * Calculates expiration timestamp based on duration from a start date
 */
export function parseDurationToExpiry(
  duration: '1day' | '7days' | '30days' | '90days' | 'lifetime',
  startDate: Date = new Date()
): string | null {
  if (duration === 'lifetime') return null;

  const msInDay = 24 * 60 * 60 * 1000;
  let days = 1;
  if (duration === '1day') days = 1;
  else if (duration === '7days') days = 7;
  else if (duration === '30days') days = 30;
  else if (duration === '90days') days = 90;

  const expiry = new Date(startDate.getTime() + days * msInDay);
  return expiry.toISOString();
}

/**
 * Verifies if a license key is valid and whether the device is permitted
 */
export function verifyDeviceBinding(
  license: LicenseRecord,
  currentDeviceId: string
): VerificationResult {
  if (!license || !license.key) {
    return { valid: false, error: 'ইনভ্যালিড লাইসেন্স কি! সঠিক কি প্রবেশ করান।' };
  }

  if (license.status === 'revoked') {
    return { valid: false, error: 'এই লাইসেন্স কি-টি বাতিল (Revoked) করা হয়েছে! অ্যাডমিনের সাথে যোগাযোগ করুন।' };
  }

  if (license.status === 'expired') {
    return { valid: false, error: 'লাইসেন্সের মেয়াদ শেষ হয়ে গেছে!' };
  }

  // Check if expiration date has passed
  if (license.expiresAt) {
    const expiry = new Date(license.expiresAt).getTime();
    if (Date.now() > expiry) {
      return { valid: false, error: 'লাইসেন্সের মেয়াদ শেষ হয়ে গেছে!' };
    }
  }

  // Check device lock
  const bound = license.boundDeviceId?.trim();
  const current = currentDeviceId?.trim();

  if (!bound) {
    // Fresh key, unbound
    return {
      valid: true,
      needsBinding: true,
      license
    };
  }

  if (bound === current) {
    // Bound to this exact device
    return {
      valid: true,
      bound: true,
      license
    };
  }

  // Bound to another device
  return {
    valid: false,
    error: 'Error: License key is already bound to another device!',
    license
  };
}

/**
 * Generates deterministic or persistent hardware/browser fingerprint ID
 */
export function generateDeviceFingerprint(env?: {
  userAgent?: string;
  screen?: { width: number; height: number; colorDepth?: number };
  language?: string;
  timezone?: string;
  hardwareConcurrency?: number;
}): string {
  const ua = env?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'node-env');
  const screenInfo = env?.screen
    ? `${env.screen.width}x${env.screen.height}x${env.screen.colorDepth || 24}`
    : typeof window !== 'undefined' && window.screen
    ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
    : '1920x1080x24';
  const lang = env?.language || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  const tz = env?.timezone || (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC');
  const cores = env?.hardwareConcurrency || (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4);

  const raw = `${ua}__${screenInfo}__${lang}__${tz}__cores${cores}`;

  // Simple, deterministic 32-bit FNV-1a hash formatted in hex
  let hash1 = 2166136261;
  let hash2 = 33554467;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ char, 16777619);
    hash2 = Math.imul(hash2 ^ (char * (i + 1)), 1099511628211);
  }

  const part1 = (hash1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const part2 = (hash2 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  return `DEV-${part1}-${part2}`;
}

/**
 * Builds the structured binary options trading prompt in Bengali
 */
export function buildBinaryTradingPrompt(params: {
  pair: string;
  timeframe: string;
  marketTrend: 'UPTREND' | 'DOWNTREND' | 'RANGING';
  rsi: number;
  bollingerStatus: 'TOUCH_UPPER' | 'TOUCH_LOWER' | 'MIDDLE';
  supportResistance: 'NEAR_RESISTANCE' | 'NEAR_SUPPORT' | 'NO_KEY_LEVEL';
  candlePattern: string;
}): string {
  return `You are an elite Binary Options Trading Algo and Price Action Specialist named Trade Lens AI.
Analyze the following live binary market data for strict 1-MINUTE expiration trading:

Asset Pair: ${params.pair}
Candle Timeframe: ${params.timeframe}
Market Trend: ${params.marketTrend}
RSI (14): ${params.rsi}
Bollinger Bands: ${params.bollingerStatus}
Support/Resistance Level: ${params.supportResistance}
Recent Price Action Pattern: ${params.candlePattern}

STRICT INSTRUCTIONS:
1. Provide a definitive 1-minute expiration binary signal: either "CALL / UP 🔥" or "PUT / DOWN 📉".
2. Set a realistic confluence confidence percentage between 82% and 98%.
3. Provide a clear, sharp, highly professional reason in Bengali (বাংলায় ১-২ লাইনে কনক্রিট কারণ দিন: সাপোর্ট/রেজিস্ট্যান্স রিজেকশন, মোমেন্টাম ও ক্যান্ডেলস্টিক প্যাটার্ন)।
4. Return ONLY a valid JSON object with keys:
{
  "signal": "CALL" | "PUT",
  "displaySignal": "CALL / UP 🔥" | "PUT / DOWN 📉",
  "confidence": number,
  "bengaliReason": string,
  "entryAdvice": string
}`;
}

/**
 * Parses and sanitizes the Gemini AI trading response
 */
export function parseBinarySignalResponse(rawText: string): {
  signal: 'CALL' | 'PUT';
  displaySignal: string;
  confidence: number;
  bengaliReason: string;
  entryAdvice: string;
} {
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const signal: 'CALL' | 'PUT' = parsed.signal === 'CALL' ? 'CALL' : 'PUT';
      const displaySignal =
        signal === 'CALL'
          ? 'CALL / UP 🔥'
          : 'PUT / DOWN 📉';
      const confidence = Math.min(
        98,
        Math.max(80, typeof parsed.confidence === 'number' ? parsed.confidence : 88)
      );
      const bengaliReason =
        parsed.bengaliReason ||
        (signal === 'CALL'
          ? 'সাপোর্ট লেভেলে বায়ার রিজেকশন এবং আরএসআই বুলিশ ডাইভারজেন্স নিশ্চিত হয়েছে।'
          : 'স্ট্রং রেজিস্ট্যান্স লেভেলে সেলার প্রেসার এবং বিয়ারিশ রিজেকশন ক্যান্ডেল তৈরি হয়েছে।');
      const entryAdvice =
        parsed.entryAdvice || 'পরবর্তী ১ মিনিটের ক্যান্ডেল শুরুতেই এন্ট্রি নিন।';
      return { signal, displaySignal, confidence, bengaliReason, entryAdvice };
    }
  } catch (e) {
    // Fallback parser if JSON fails
  }

  // Fallback heuristic based on text scan
  const isCall = rawText.includes('CALL') || rawText.includes('UP');
  return {
    signal: isCall ? 'CALL' : 'PUT',
    displaySignal: isCall ? 'CALL / UP 🔥' : 'PUT / DOWN 📉',
    confidence: 89,
    bengaliReason: isCall
      ? 'সাপোর্ট জোনে বায়ার রিজেকশন উইক দেখা গেছে, আপট্রেন্ড মোমেন্টাম বিদ্যমান।'
      : 'রেজিস্ট্যান্স জোনে সেলারদের চাপ স্পষ্ট এবং আরএসআই ওভারবট রিভার্সাল সিগন্যাল দিচ্ছে।',
    entryAdvice: '১ মিনিটের ফিক্সড টাইমে পরবর্তী ক্যান্ডেল ওপেনিংয়ে এন্ট্রি নিন।'
  };
}
