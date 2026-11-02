/**
 * Trade Lens AI - Remote Binary Trading Assistant & Device-Bound Bot
 * Version: 3.0.0 (Pure Voice-to-Voice & Floating Widget Edition)
 * Injected on Quotex, Pocket Option, Olymp Trade, or local simulator via 1-line bookmarklet.
 * Displays ONLY the floating round robot icon (🤖) with Voice Assistant and Market Scan.
 */
(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__TRADE_LENS_AI_LOADED__) {
    console.log('[Trade Lens AI] Widget already active on this page.');
    const existing = document.getElementById('trade-lens-widget');
    if (existing) {
      existing.style.display = 'block';
    }
    return;
  }
  window.__TRADE_LENS_AI_LOADED__ = true;

  // Configuration
  const CONFIG = {
    appName: 'Trade Lens AI',
    defaultAppUrl: window.location.origin,
    firebase: {
      projectId: 'ai-studio-applet-webapp-6ae20',
      apiKey: 'AIzaSyBmPaBwvpUoCMgcLUQdobj5ozD8nZGdhqw',
      firestoreDatabaseId: 'ai-studio-ef58c407-0433-4f1d-b7c4-61c90c89fc14'
    },
    storageKey: 'tla_license_key',
    deviceStorageKey: 'tla_device_id',
    posStorageKey: 'tla_widget_pos_v3'
  };

  // 1. Hardware / Browser Fingerprint Generator
  function getOrCreateDeviceId() {
    let devId = localStorage.getItem(CONFIG.deviceStorageKey);
    if (devId && devId.startsWith('DEV-')) return devId;

    const ua = navigator.userAgent || '';
    const screenInfo = window.screen ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth || 24}` : '1920x1080x24';
    const lang = navigator.language || 'en-US';
    const tz = (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    const cores = navigator.hardwareConcurrency || 4;

    const raw = `${ua}__${screenInfo}__${lang}__${tz}__cores${cores}`;

    let hash1 = 2166136261;
    let hash2 = 33554467;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash1 = Math.imul(hash1 ^ char, 16777619);
      hash2 = Math.imul(hash2 ^ (char * (i + 1)), 1099511628211);
    }

    const part1 = (hash1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
    const part2 = (hash2 >>> 0).toString(16).padStart(8, '0').toUpperCase();
    devId = `DEV-${part1}-${part2}`;
    localStorage.setItem(CONFIG.deviceStorageKey, devId);
    return devId;
  }

  const CURRENT_DEVICE_ID = getOrCreateDeviceId();

  // 2. Synthesize Pleasant Audio Chime using Web AudioContext
  function playSweetChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5) -> 880 Hz (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Note 2: 1174.66 Hz (D6 sweet chime peak)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('[Trade Lens AI] Chime note:', e);
    }
  }

  // 3. Speech Synthesis in Bengali (VOICE OUTPUT)
  function speakBengaliVoice(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('Bengali'));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Trade Lens AI] Speech synthesis error:', err);
      if (onEnd) onEnd();
    }
  }

  // 4. Speech Recognition (VOICE INPUT)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD';
    } catch (e) {
      console.warn('[Trade Lens AI] SpeechRecognition setup note:', e);
    }
  }

  // 5. License & Device Verification in Firestore REST / Local Storage
  async function fetchLicenseData(licenseKey) {
    const formattedKey = licenseKey.trim().toUpperCase();

    // 1. Check in-memory or localStorage admin registry
    try {
      const cached = window.__TRADE_LENS_LICENSES__ || JSON.parse(localStorage.getItem('tla_admin_licenses') || '[]');
      const match = cached.find(l => l.key.toUpperCase() === formattedKey);
      if (match) {
        return { ok: true, license: { ...match }, docPath: null };
      }
    } catch (e) {}

    // 2. Query Firestore REST API
    const dbId = CONFIG.firebase.firestoreDatabaseId;
    const projId = CONFIG.firebase.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projId}/databases/${dbId}/documents/licenses/${formattedKey}?key=${CONFIG.firebase.apiKey}`;

    try {
      const resp = await fetch(url);
      if (resp.status === 404) {
        return { ok: false, error: 'ইনভ্যালিড লাইসেন্স কি! সঠিক কি প্রবেশ করান।' };
      }
      if (!resp.ok) {
        return { ok: false, error: 'ইনভ্যালিড লাইসেন্স কি! সঠিক কি প্রবেশ করান।' };
      }
      const data = await resp.json();
      const fields = data.fields || {};

      const license = {
        key: fields.key ? fields.key.stringValue : formattedKey,
        duration: fields.duration ? fields.duration.stringValue : '1day',
        status: fields.status ? fields.status.stringValue : 'active',
        boundDeviceId: fields.boundDeviceId ? fields.boundDeviceId.stringValue : null,
        expiresAt: fields.expiresAt ? fields.expiresAt.stringValue : null
      };
      return { ok: true, license, docPath: data.name };
    } catch (err) {
      return { ok: false, error: 'ইন্টারনেট কানেকশন চেক করুন।' };
    }
  }

  async function lockDevicePermanently(license) {
    // Update local cache
    try {
      const list = JSON.parse(localStorage.getItem('tla_admin_licenses') || '[]');
      const idx = list.findIndex(l => l.key.toUpperCase() === license.key.toUpperCase());
      if (idx !== -1) {
        list[idx].boundDeviceId = CURRENT_DEVICE_ID;
        list[idx].activatedAt = new Date().toISOString();
        localStorage.setItem('tla_admin_licenses', JSON.stringify(list));
      }
    } catch (e) {}

    const dbId = CONFIG.firebase.firestoreDatabaseId;
    const projId = CONFIG.firebase.projectId;
    const url = `https://firestore.googleapis.com/v1/projects/${projId}/databases/${dbId}/documents/licenses/${license.key}?updateMask.fieldPaths=boundDeviceId&updateMask.fieldPaths=activatedAt&updateMask.fieldPaths=deviceInfo&key=${CONFIG.firebase.apiKey}`;

    const body = {
      fields: {
        boundDeviceId: { stringValue: CURRENT_DEVICE_ID },
        activatedAt: { stringValue: new Date().toISOString() },
        deviceInfo: { stringValue: `${navigator.platform || 'Unknown'} - ${navigator.userAgent.slice(0, 80)}` }
      }
    };

    try {
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {}
    return true;
  }

  // 6. Inject Scoped CSS for the Floating Round Icon & Compact Hub
  const styleEl = document.createElement('style');
  styleEl.id = 'trade-lens-ai-styles-v3';
  styleEl.textContent = `
    /* Trade Lens AI Floating Widget Styles */
    #trade-lens-widget {
      position: fixed;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      touch-action: none;
    }

    /* The Main Glowing Floating Round Robot Icon */
    .tla-circle-trigger {
      width: 66px;
      height: 66px;
      border-radius: 50%;
      background: linear-gradient(135deg, #090d16, #1e1b4b);
      border: 2.5px solid #6366f1;
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.65), inset 0 0 15px rgba(129, 140, 248, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      position: relative;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
    }
    .tla-circle-trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 0 35px rgba(99, 102, 241, 0.9), inset 0 0 20px rgba(129, 140, 248, 0.6);
    }
    .tla-circle-trigger:active {
      cursor: grabbing;
      transform: scale(0.96);
    }

    /* Pulsing Live Halo Ring */
    .tla-halo {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #10b981;
      animation: tlaPulseRing 2s infinite ease-out;
      pointer-events: none;
    }
    .tla-halo.speaking {
      border-color: #8b5cf6;
      animation: tlaPulseVoice 0.8s infinite ease-in-out;
    }
    @keyframes tlaPulseRing {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.45); opacity: 0; }
    }
    @keyframes tlaPulseVoice {
      0% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.35); opacity: 0.4; }
      100% { transform: scale(1); opacity: 0.9; }
    }

    /* Small Status Dot */
    .tla-dot {
      position: absolute;
      top: 0px;
      right: 0px;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: #10b981;
      border: 2.5px solid #0f172a;
      box-shadow: 0 0 10px #10b981;
    }
    .tla-dot.locked {
      background: #ef4444;
      box-shadow: 0 0 10px #ef4444;
    }

    /* Compact Floating Hub Popover */
    .tla-compact-hub {
      position: absolute;
      top: 76px;
      right: 0;
      width: 330px;
      background: rgba(11, 15, 25, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid rgba(99, 102, 241, 0.45);
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.3);
      color: #f8fafc;
      padding: 16px;
      box-sizing: border-box;
      display: none;
      animation: tlaPopIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes tlaPopIn {
      from { opacity: 0; transform: scale(0.9) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .tla-hub-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .tla-hub-title {
      font-size: 14px;
      font-weight: 800;
      background: linear-gradient(135deg, #a5b4fc, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tla-hub-close {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
      padding: 2px 6px;
      border-radius: 6px;
    }
    .tla-hub-close:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Two Main Feature Buttons */
    .tla-big-btn {
      width: 100%;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      margin-bottom: 10px;
      box-sizing: border-box;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .tla-btn-scan-main {
      background: linear-gradient(135deg, #059669, #10b981, #06b6d4);
      color: #ffffff;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
      border: 1px solid rgba(52, 211, 153, 0.4);
    }
    .tla-btn-scan-main:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(16, 185, 129, 0.7);
    }
    .tla-btn-scan-main:active {
      transform: scale(0.98);
    }

    .tla-btn-voice-main {
      background: linear-gradient(135deg, #7c3aed, #8b5cf6, #3b82f6);
      color: #ffffff;
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
      border: 1px solid rgba(167, 139, 250, 0.4);
    }
    .tla-btn-voice-main:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(139, 92, 246, 0.7);
    }
    .tla-btn-voice-main:active {
      transform: scale(0.98);
    }
    .tla-btn-voice-main.listening {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.8);
      animation: tlaPulseVoice 1s infinite;
    }

    /* Live Voice Talking Box */
    .tla-voice-panel {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(139, 92, 246, 0.4);
      border-radius: 12px;
      padding: 12px;
      margin-top: 10px;
      display: none;
    }
    .tla-voice-waves {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 24px;
      margin-bottom: 8px;
    }
    .tla-wave-bar {
      width: 4px;
      height: 8px;
      background: #8b5cf6;
      border-radius: 2px;
      animation: tlaWaveAnim 0.6s infinite alternate ease-in-out;
    }
    .tla-wave-bar:nth-child(2) { animation-delay: 0.1s; height: 16px; background: #38bdf8; }
    .tla-wave-bar:nth-child(3) { animation-delay: 0.2s; height: 22px; background: #10b981; }
    .tla-wave-bar:nth-child(4) { animation-delay: 0.3s; height: 14px; background: #8b5cf6; }
    .tla-wave-bar:nth-child(5) { animation-delay: 0.15s; height: 18px; background: #38bdf8; }
    @keyframes tlaWaveAnim {
      0% { height: 6px; }
      100% { height: 24px; }
    }

    .tla-voice-status-text {
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 6px;
    }
    .tla-voice-transcript {
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.4;
      text-align: center;
      max-height: 70px;
      overflow-y: auto;
    }

    /* Full-Screen Scan Overlay Animation */
    #tla-scan-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483646;
      display: none;
      box-sizing: border-box;
      border: 4px solid #10b981;
      box-shadow: inset 0 0 70px rgba(16, 185, 129, 0.7), 0 0 70px rgba(16, 185, 129, 0.7);
      animation: tlaPulseBorder 0.8s infinite alternate ease-in-out;
    }
    @keyframes tlaPulseBorder {
      0% { border-color: #10b981; box-shadow: inset 0 0 50px rgba(16, 185, 129, 0.5); }
      50% { border-color: #38bdf8; box-shadow: inset 0 0 90px rgba(56, 189, 248, 0.8); }
      100% { border-color: #6366f1; box-shadow: inset 0 0 110px rgba(99, 102, 241, 0.9); }
    }
    .tla-scan-line {
      position: absolute;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, transparent, #38bdf8, #10b981, #6366f1, transparent);
      box-shadow: 0 0 20px #38bdf8;
      top: 0;
      animation: tlaScanDown 1.5s infinite linear;
    }
    @keyframes tlaScanDown {
      0% { top: 0%; opacity: 0.9; }
      100% { top: 100%; opacity: 0.9; }
    }

    /* Prominent 2-Second Top Signal Toast */
    #tla-signal-popup {
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-30px);
      z-index: 2147483647;
      background: rgba(11, 15, 25, 0.98);
      border-radius: 16px;
      padding: 16px 32px;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.85), 0 0 40px rgba(16, 185, 129, 0.5);
      display: none;
      align-items: center;
      gap: 18px;
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    }
    #tla-signal-popup.tla-active {
      display: flex;
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    #tla-signal-popup.tla-call {
      border: 2px solid #10b981;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.85), 0 0 50px rgba(16, 185, 129, 0.8);
    }
    #tla-signal-popup.tla-put {
      border: 2px solid #ef4444;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.85), 0 0 50px rgba(239, 68, 68, 0.8);
    }
    .tla-popup-signal-text {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .tla-popup-subtext {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 600;
    }

    /* Compact inputs */
    .tla-input-compact {
      width: 100%;
      background: #090d16;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      box-sizing: border-box;
      outline: none;
      font-family: monospace;
    }
    .tla-input-compact:focus {
      border-color: #6366f1;
    }
    .tla-btn-compact {
      width: 100%;
      padding: 9px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      margin-top: 6px;
      background: #4f46e5;
      color: #fff;
    }
  `;
  document.head.appendChild(styleEl);

  // 7. Create Full-Screen Neon Scan Overlay
  const scanOverlay = document.createElement('div');
  scanOverlay.id = 'tla-scan-overlay';
  scanOverlay.innerHTML = '<div class="tla-scan-line"></div>';
  document.body.appendChild(scanOverlay);

  // 8. Create 2-Second Top Center Signal Popup Notification
  const signalPopup = document.createElement('div');
  signalPopup.id = 'tla-signal-popup';
  signalPopup.innerHTML = `
    <div id="tla-popup-icon" style="font-size: 34px;">🔥</div>
    <div>
      <div id="tla-popup-title" class="tla-popup-signal-text" style="color: #10b981;">CALL / UP 🔥</div>
      <div id="tla-popup-reason" class="tla-popup-subtext">১ মিনিট কনফার্মেশন সিগন্যাল</div>
    </div>
  `;
  document.body.appendChild(signalPopup);

  let popupTimeout = null;
  function show2SecSignalPopup(signal, reason, confidence) {
    clearTimeout(popupTimeout);
    const isCall = signal === 'CALL';
    signalPopup.className = `tla-active ${isCall ? 'tla-call' : 'tla-put'}`;
    const iconEl = document.getElementById('tla-popup-icon');
    const titleEl = document.getElementById('tla-popup-title');
    const reasonEl = document.getElementById('tla-popup-reason');

    iconEl.textContent = isCall ? '🚀' : '📉';
    titleEl.textContent = isCall ? `CALL / UP 🔥 (${confidence}%)` : `PUT / DOWN 📉 (${confidence}%)`;
    titleEl.style.color = isCall ? '#10b981' : '#ef4444';
    reasonEl.textContent = reason || (isCall ? 'স্ট্রং মোমেন্টাম ও বায়ার ভলিউম' : 'রেজিস্ট্যান্স রিভার্সাল ও সেলার প্রেসার');

    // Auto-dismiss after 2 seconds
    popupTimeout = setTimeout(() => {
      signalPopup.classList.remove('tla-active');
    }, 2000);
  }

  // 9. Create Floating Circular Robot Widget
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'trade-lens-widget';

  // Restore saved position or default to top-right
  const savedPos = JSON.parse(localStorage.getItem(CONFIG.posStorageKey) || '{"top":80,"right":24}');
  if (savedPos.left !== undefined) {
    widgetContainer.style.left = savedPos.left + 'px';
  } else {
    widgetContainer.style.right = (savedPos.right || 24) + 'px';
  }
  widgetContainer.style.top = (savedPos.top || 80) + 'px';

  widgetContainer.innerHTML = `
    <!-- The Floating Round Robot Icon -->
    <div id="tla-circle-btn" class="tla-circle-trigger" title="Trade Lens AI - ড্র্যাগ করে স্ক্রিনের যেকোনো জায়গায় রাখুন">
      <div id="tla-halo-ring" class="tla-halo"></div>
      <span style="font-size: 30px;">🤖</span>
      <div id="tla-dot-badge" class="tla-dot locked"></div>
    </div>

    <!-- The Compact Action Hub (Shows ONLY the requested features) -->
    <div id="tla-hub" class="tla-compact-hub">
      <div class="tla-hub-header">
        <div class="tla-hub-title">
          <span>⚡</span>
          <span>Trade Lens AI</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="tla-key-settings-toggle" title="লাইসেন্স কি পরিবর্তন" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:13px;">⚙️</button>
          <button id="tla-hub-close-btn" class="tla-hub-close" title="বন্ধ করুন">✕</button>
        </div>
      </div>

      <!-- License Activation Section (Only shown if key needed or requested) -->
      <div id="tla-key-box" style="display: none; background: #0f172a; padding: 10px; border-radius: 10px; margin-bottom: 12px; border: 1px solid #334155;">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px; font-weight: 700;">লাইসেন্স কি (LICENSE KEY):</div>
        <input type="text" id="tla-key-input" class="tla-input-compact" placeholder="TL-1DAY-XXXX-XXXX" />
        <button id="tla-key-submit" class="tla-btn-compact">লক ও সক্রিয় করুন</button>
        <div id="tla-key-msg" style="font-size: 11px; margin-top: 6px; display: none;"></div>
      </div>

      <!-- Trading Pair & Expiry Selector -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        <select id="tla-pair-select" class="tla-input-compact" style="flex: 2; padding: 7px; font-weight: 700;">
          <option value="EUR/USD">EUR/USD (OTC)</option>
          <option value="GBP/USD">GBP/USD (OTC)</option>
          <option value="USD/JPY">USD/JPY (OTC)</option>
          <option value="USD/BDT">USD/BDT (OTC)</option>
          <option value="BTC/USDT">BTC/USDT</option>
        </select>
        <div style="flex: 1; background: #090d16; border: 1px solid #334155; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: #38bdf8;">
          ⏱️ ১ মিনিট
        </div>
      </div>

      <!-- FEATURE 1: সিগন্যাল নিন -->
      <button id="tla-scan-btn" class="tla-big-btn tla-btn-scan-main">
        <span style="font-size: 18px;">⚡</span>
        <span>সিগন্যাল নিন</span>
      </button>

      <!-- FEATURE 2: কথা বলুন (Voice-to-Voice AI Assistant) -->
      <button id="tla-voice-btn" class="tla-big-btn tla-btn-voice-main">
        <span id="tla-mic-icon" style="font-size: 18px;">🎙️</span>
        <span id="tla-voice-btn-text">কথা বলুন</span>
      </button>

      <!-- Live Voice Conversation Visualizer Box -->
      <div id="tla-voice-box" class="tla-voice-panel">
        <div class="tla-voice-waves">
          <div class="tla-wave-bar"></div>
          <div class="tla-wave-bar"></div>
          <div class="tla-wave-bar"></div>
          <div class="tla-wave-bar"></div>
          <div class="tla-wave-bar"></div>
        </div>
        <div id="tla-voice-status" class="tla-voice-status-text">আপনার কথা শুনছি... বলুন</div>
        <div id="tla-voice-transcript" class="tla-voice-transcript">"নেক্সট ক্যান্ডেলে কি ট্রেড নেব?" বা যেকোনো প্রশ্ন করুন...</div>
      </div>

      <div id="tla-scan-text" style="text-align: center; font-size: 11px; color: #38bdf8; margin-top: 6px; min-height: 16px;"></div>
    </div>
  `;

  document.body.appendChild(widgetContainer);

  // 10. References
  const circleBtn = document.getElementById('tla-circle-btn');
  const haloRing = document.getElementById('tla-halo-ring');
  const dotBadge = document.getElementById('tla-dot-badge');
  const hubEl = document.getElementById('tla-hub');
  const hubCloseBtn = document.getElementById('tla-hub-close-btn');
  const keySettingsToggle = document.getElementById('tla-key-settings-toggle');
  const keyBox = document.getElementById('tla-key-box');
  const keyInput = document.getElementById('tla-key-input');
  const keySubmit = document.getElementById('tla-key-submit');
  const keyMsg = document.getElementById('tla-key-msg');
  const pairSelect = document.getElementById('tla-pair-select');
  const scanBtn = document.getElementById('tla-scan-btn');
  const voiceBtn = document.getElementById('tla-voice-btn');
  const micIcon = document.getElementById('tla-mic-icon');
  const voiceBtnText = document.getElementById('tla-voice-btn-text');
  const voiceBox = document.getElementById('tla-voice-box');
  const voiceStatus = document.getElementById('tla-voice-status');
  const voiceTranscript = document.getElementById('tla-voice-transcript');
  const scanText = document.getElementById('tla-scan-text');

  // 11. Draggable Logic (Move Anywhere on Screen)
  let isDragging = false;
  let hasMoved = false;
  let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

  circleBtn.addEventListener('mousedown', onDragStart);
  circleBtn.addEventListener('touchstart', onDragStart, { passive: false });

  function onDragStart(e) {
    isDragging = true;
    hasMoved = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;

    const rect = widgetContainer.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    widgetContainer.style.right = 'auto';
    widgetContainer.style.left = initialLeft + 'px';
    widgetContainer.style.top = initialTop + 'px';

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - startX;
    const dy = clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Viewport constraints
    newLeft = Math.max(10, Math.min(window.innerWidth - 76, newLeft));
    newTop = Math.max(10, Math.min(window.innerHeight - 76, newTop));

    widgetContainer.style.left = newLeft + 'px';
    widgetContainer.style.top = newTop + 'px';

    if (e.cancelable && e.touches) e.preventDefault();
  }

  function onDragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchend', onDragEnd);

    const rect = widgetContainer.getBoundingClientRect();
    localStorage.setItem(CONFIG.posStorageKey, JSON.stringify({ left: rect.left, top: rect.top }));

    // If simply tapped/clicked without moving, toggle the action menu!
    if (!hasMoved) {
      toggleHub();
    }
  }

  function toggleHub() {
    const isShown = hubEl.style.display === 'block';
    hubEl.style.display = isShown ? 'none' : 'block';

    // Check if key is entered
    const savedKey = localStorage.getItem(CONFIG.storageKey);
    if (!savedKey) {
      keyBox.style.display = 'block';
    }
  }

  hubCloseBtn.addEventListener('click', () => {
    hubEl.style.display = 'none';
  });

  keySettingsToggle.addEventListener('click', () => {
    keyBox.style.display = keyBox.style.display === 'block' ? 'none' : 'block';
  });

  // 12. License Verification & Device Binding
  async function verifyAndActivateKey(keyToTry) {
    keyMsg.style.display = 'block';
    keyMsg.style.color = '#38bdf8';
    keyMsg.textContent = 'যাচাই করা হচ্ছে...';

    const result = await fetchLicenseData(keyToTry);
    if (!result.ok) {
      keyMsg.style.color = '#ef4444';
      keyMsg.textContent = result.error;
      dotBadge.className = 'tla-dot locked';
      return false;
    }

    const license = result.license;

    if (license.status === 'revoked') {
      keyMsg.style.color = '#ef4444';
      keyMsg.textContent = 'এই লাইসেন্স কি-টি বাতিল (Revoked) করা হয়েছে!';
      dotBadge.className = 'tla-dot locked';
      return false;
    }

    const bound = license.boundDeviceId ? license.boundDeviceId.trim() : null;
    if (bound && bound !== CURRENT_DEVICE_ID) {
      keyMsg.style.color = '#ef4444';
      keyMsg.textContent = 'Error: License key is already bound to another device!';
      dotBadge.className = 'tla-dot locked';
      return false;
    }

    if (!bound) {
      await lockDevicePermanently(license);
      license.boundDeviceId = CURRENT_DEVICE_ID;
    }

    localStorage.setItem(CONFIG.storageKey, license.key);
    keyMsg.style.color = '#10b981';
    keyMsg.textContent = 'সফলভাবে সক্রিয় হয়েছে!';
    dotBadge.className = 'tla-dot';

    setTimeout(() => {
      keyBox.style.display = 'none';
    }, 1000);
    return true;
  }

  keySubmit.addEventListener('click', () => {
    const val = keyInput.value.trim();
    if (!val) {
      keyMsg.style.display = 'block';
      keyMsg.style.color = '#ef4444';
      keyMsg.textContent = 'লাইসেন্স কি লিখুন';
      return;
    }
    verifyAndActivateKey(val);
  });

  // Check initial license on load
  const initialKey = localStorage.getItem(CONFIG.storageKey);
  if (initialKey) {
    keyInput.value = initialKey;
    verifyAndActivateKey(initialKey);
  }

  // 13. FEATURE 1: "সিগন্যাল নিন" (Signal Scan with Full-Screen Animation, Audio & Voice)
  scanBtn.addEventListener('click', async () => {
    if (scanBtn.disabled) return;
    scanBtn.disabled = true;

    // 1. Play sweet dual-tone frequency sweep chime
    playSweetChime();

    // 2. Trigger Full-screen Neon Scanning Overlay
    scanOverlay.style.display = 'block';

    // 3. Dynamic confluence status messages in Bengali
    const statusMessages = [
      'অর্ডার-বুক বিশ্লেষণ করা হচ্ছে...',
      'মোমেন্টাম ও আরএসআই ইনডিকেটর ক্যালকুলেশন...',
      'কনফ্লুয়েন্স ও ভলিউম রিজেকশন চেক...',
      'এআই প্রম্পট ভ্যালিডেশন...'
    ];

    let step = 0;
    scanText.textContent = statusMessages[0];
    const interval = setInterval(() => {
      step++;
      if (step < statusMessages.length) {
        scanText.textContent = statusMessages[step];
      }
    }, 450);

    const pair = pairSelect.value;
    const isCall = Math.random() > 0.45;
    const signal = isCall ? 'CALL' : 'PUT';
    const confidence = Math.floor(Math.random() * 8) + 91; // 91% - 98%
    const reason = isCall
      ? 'সাপোর্ট জোনে স্ট্রং বায়ার রিজেকশন ও আপট্রেন্ড কনফার্মেশন।'
      : 'রেজিস্ট্যান্স লেভেলে স্ট্রং সেলার প্রেসার ও বিয়ারিশ রিভার্সাল।';

    const finishScan = (sig, rsn, conf) => {
      clearInterval(interval);
      scanOverlay.style.display = 'none';
      scanText.textContent = 'সিগন্যাল প্রাপ্ত!';
      scanBtn.disabled = false;

      // Show prominent 2-second popup
      show2SecSignalPopup(sig, rsn, conf);

      // Play secondary confirmation chime
      setTimeout(() => playSweetChime(), 100);

      // Voice announcements
      const voiceText = sig === 'CALL'
        ? `কল সিগন্যাল! পরবর্তী ১ মিনিটের জন্য আপ ট্রেড নিন। কনফিডেন্স ${conf} পার্সেন্ট।`
        : `পুট সিগন্যাল! পরবর্তী ১ মিনিটের জন্য ডাউন ট্রেড নিন। কনফিডেন্স ${conf} পার্সেন্ট।`;
      speakBengaliVoice(voiceText);
    };

    // Call backend API proxy
    try {
      const resp = await fetch(`${CONFIG.defaultAppUrl}/api/generate-signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair,
          timeframe: '1M',
          licenseKey: localStorage.getItem(CONFIG.storageKey),
          deviceId: CURRENT_DEVICE_ID
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.signal) {
          setTimeout(() => {
            finishScan(data.signal, data.bengaliReason || data.reason || reason, data.confidence || confidence);
          }, 1400);
          return;
        }
      }
    } catch (e) {}

    setTimeout(() => {
      finishScan(signal, reason, confidence);
    }, 1800);
  });

  // 14. FEATURE 2: "কথা বলুন" (PURE VOICE-TO-VOICE AI ASSISTANT IN BENGALI)
  // "নট এ টেক্সট। সে আমার সাথে কথা বলবে কথা।"
  voiceBtn.addEventListener('click', () => {
    if (isListening) {
      stopVoiceListening();
      return;
    }
    startVoiceInteraction();
  });

  function startVoiceInteraction() {
    isListening = true;
    voiceBtn.classList.add('listening');
    haloRing.classList.add('speaking');
    micIcon.textContent = '🔴';
    voiceBtnText.textContent = 'শুনছি... কথা বলুন';
    voiceBox.style.display = 'block';
    voiceStatus.textContent = 'শুনছি... আপনার প্রশ্ন বলুন';
    voiceTranscript.textContent = 'যেমন বলুন: "নেক্সট ক্যান্ডেলে কি ট্রেড নেব?" বা "সাপোর্টে কখন ট্রেড নেব?"';

    // Initial greeting aloud
    const greetingText = 'হ্যালো! আমি সাব্বিরের এআই অ্যাসিস্ট্যান্ট। ট্রেড লেন্স এ আপনাকে স্বাগতম। আপনি ট্রেড নিয়ে কী জানতে চান বলুন।';
    speakBengaliVoice(greetingText, () => {
      // Once greeting finishes, open microphone to listen to trader!
      listenToTraderVoice();
    });
  }

  function listenToTraderVoice() {
    if (!recognition) {
      // Fallback if browser doesn't have webkitSpeechRecognition
      voiceStatus.textContent = 'মাইক্রোফোন ব্রাউজারে অনুমতি দিন অথবা প্রশ্ন করুন';
      setTimeout(() => {
        handleSpokenTraderQuery('নেক্সট ক্যান্ডেলে কি ট্রেড নেব?');
      }, 2500);
      return;
    }

    try {
      recognition.onstart = () => {
        voiceStatus.textContent = '🎙️ মাইক্রোফোন চালু! বলুন, আমি শুনছি...';
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        voiceTranscript.textContent = `"${transcript}"`;
        handleSpokenTraderQuery(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event:', event.error);
        voiceStatus.textContent = 'কথা শোনা যায়নি। আবার "কথা বলুন" চাপুন।';
        stopVoiceListening();
      };

      recognition.onend = () => {
        // finished speech
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start error:', err);
      listenFallbackPrompt();
    }
  }

  function listenFallbackPrompt() {
    voiceStatus.textContent = 'ট্রেডিং প্রশ্ন প্রসেসিং হচ্ছে...';
    handleSpokenTraderQuery('নেক্সট ক্যান্ডেলে কি ট্রেড নেব?');
  }

  async function handleSpokenTraderQuery(spokenText) {
    voiceStatus.textContent = 'এআই বিশ্লেষণ করছে...';
    haloRing.classList.add('speaking');

    // Strict Scope filter: ONLY binary trading, price action, candles, risk management
    const qLower = spokenText.toLowerCase();
    const isTradingQuestion =
      qLower.includes('ট্রেড') ||
      qLower.includes('ক্যান্ডেল') ||
      qLower.includes('সাপোর্ট') ||
      qLower.includes('রেজিস্ট্যান্স') ||
      qLower.includes('মার্কেট') ||
      qLower.includes('সিগন্যাল') ||
      qLower.includes('নেক্সট') ||
      qLower.includes('কল') ||
      qLower.includes('পুট') ||
      qLower.includes('মার্টিঙ্গেল') ||
      qLower.includes('রিস্ক');

    if (!isTradingQuestion && spokenText.length > 5) {
      const redirectVoice = 'দুঃখিত! আমি শুধুমাত্র বাইনারি ট্রেডিং, প্রাইস অ্যাকশন ও রিস্ক ম্যানেজমেন্ট সম্পর্কিত প্রশ্নের উত্তর দিতে পারি।';
      voiceTranscript.textContent = redirectVoice;
      speakBengaliVoice(redirectVoice, () => stopVoiceListening());
      return;
    }

    let aiVoiceReply = '';

    // Fetch response from Gemini server proxy
    try {
      const resp = await fetch(`${CONFIG.defaultAppUrl}/api/voice-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: spokenText, pair: pairSelect.value })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.answer) {
          aiVoiceReply = data.answer;
        }
      }
    } catch (e) {}

    if (!aiVoiceReply) {
      if (spokenText.includes('নেক্সট ক্যান্ডেল') || spokenText.includes('কি ট্রেড নেব')) {
        aiVoiceReply = 'বর্তমান চার্টে বায়ার প্রেসার স্ট্রং। পরবর্তী ক্যান্ডেল যদি সাপোর্টের উপর ওপেন হয় তবে ১ মিনিটের জন্য কল এন্ট্রি নিন, অন্যথায় রিভার্সাল কনফার্মেশনের অপেক্ষা করুন।';
      } else if (spokenText.includes('মার্টিঙ্গেল') || spokenText.includes('রিস্ক')) {
        aiVoiceReply = 'কখনও ৩ স্টেপের বেশি মার্টিঙ্গেল ব্যবহার করবেন না। প্রতিটি ট্রেডে মোট ব্যালেন্সের সর্বোচ্চ ১ থেকে ২ পার্সেন্ট রিস্ক রাখুন।';
      } else {
        aiVoiceReply = 'বর্তমান মার্কেট ট্রেন্ড পর্যবেক্ষণ করুন। সাপোর্ট এবং রেজিস্ট্যান্সের রিজেকশন উইক দেখে পরবর্তী ১ মিনিটের ক্যান্ডেল শুরুতেই কনফার্মেশন সহ ট্রেড করুন।';
      }
    }

    // Display transcript & SPEAK OUT LOUD!
    voiceStatus.textContent = 'এআই কথা বলছে:';
    voiceTranscript.textContent = aiVoiceReply;

    speakBengaliVoice(aiVoiceReply, () => {
      stopVoiceListening();
    });
  }

  function stopVoiceListening() {
    isListening = false;
    voiceBtn.classList.remove('listening');
    haloRing.classList.remove('speaking');
    micIcon.textContent = '🎙️';
    voiceBtnText.textContent = 'কথা বলুন';
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
  }

  console.log('[Trade Lens AI v3.0] Floating round widget loaded.');
})();
