import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateLicenseKey,
  parseDurationToExpiry,
  verifyDeviceBinding,
  generateDeviceFingerprint,
  parseBinarySignalResponse,
  LicenseRecord
} from './license';

test('generateLicenseKey creates properly formatted keys', () => {
  const key1Day = generateLicenseKey('1day');
  assert.match(key1Day, /^TL-1DAY-[0-9A-F]{4}-[0-9A-F]{4}$/);

  const key30Day = generateLicenseKey('30days');
  assert.match(key30Day, /^TL-30DAYS-[0-9A-F]{4}-[0-9A-F]{4}$/);

  const keyLifetime = generateLicenseKey('lifetime');
  assert.match(keyLifetime, /^TL-LIFETIME-[0-9A-F]{4}-[0-9A-F]{4}$/);
});

test('parseDurationToExpiry calculates correct day intervals', () => {
  const now = new Date('2026-11-01T12:00:00Z');
  const exp1Day = parseDurationToExpiry('1day', now);
  assert.equal(exp1Day, '2026-11-02T12:00:00.000Z');

  const exp7Day = parseDurationToExpiry('7days', now);
  assert.equal(exp7Day, '2026-11-08T12:00:00.000Z');

  const expLifetime = parseDurationToExpiry('lifetime', now);
  assert.equal(expLifetime, null);
});

test('generateDeviceFingerprint returns deterministic hash for identical environment', () => {
  const env = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    screen: { width: 1920, height: 1080, colorDepth: 24 },
    language: 'bn-BD',
    timezone: 'Asia/Dhaka',
    hardwareConcurrency: 8
  };
  const fp1 = generateDeviceFingerprint(env);
  const fp2 = generateDeviceFingerprint(env);
  assert.equal(fp1, fp2);
  assert.match(fp1, /^DEV-[0-9A-F]{8}-[0-9A-F]{8}$/);
});

test('verifyDeviceBinding allows first-time binding to unbound license', () => {
  const unboundKey: LicenseRecord = {
    key: 'TL-1DAY-TEST-0001',
    duration: '1day',
    status: 'active',
    boundDeviceId: null,
    createdAt: new Date().toISOString()
  };

  const res = verifyDeviceBinding(unboundKey, 'DEV-ABC1-XYZ2');
  assert.equal(res.valid, true);
  assert.equal(res.needsBinding, true);
});

test('verifyDeviceBinding allows same bound device', () => {
  const boundKey: LicenseRecord = {
    key: 'TL-1DAY-TEST-0001',
    duration: '1day',
    status: 'active',
    boundDeviceId: 'DEV-ABC1-XYZ2',
    createdAt: new Date().toISOString()
  };

  const res = verifyDeviceBinding(boundKey, 'DEV-ABC1-XYZ2');
  assert.equal(res.valid, true);
  assert.equal(res.bound, true);
});

test('verifyDeviceBinding permanently blocks second device', () => {
  const boundKey: LicenseRecord = {
    key: 'TL-1DAY-TEST-0001',
    duration: '1day',
    status: 'active',
    boundDeviceId: 'DEV-DEVICE-ONE',
    createdAt: new Date().toISOString()
  };

  const res = verifyDeviceBinding(boundKey, 'DEV-DEVICE-TWO');
  assert.equal(res.valid, false);
  assert.equal(
    res.error,
    'Error: License key is already bound to another device!'
  );
});

test('verifyDeviceBinding rejects revoked license', () => {
  const revokedKey: LicenseRecord = {
    key: 'TL-1DAY-TEST-REVOKED',
    duration: '1day',
    status: 'revoked',
    boundDeviceId: 'DEV-ABC1-XYZ2',
    createdAt: new Date().toISOString()
  };

  const res = verifyDeviceBinding(revokedKey, 'DEV-ABC1-XYZ2');
  assert.equal(res.valid, false);
  assert.match(res.error || '', /বাতিল/);
});

test('parseBinarySignalResponse correctly parses JSON structured output', () => {
  const sampleJson = JSON.stringify({
    signal: 'CALL',
    displaySignal: 'CALL / UP 🔥',
    confidence: 94,
    bengaliReason: 'স্ট্রং সাপোর্ট লেভেলে হ্যামার ক্যান্ডেল রিজেকশন এবং ভলিউম বৃদ্ধি পেয়েছে।',
    entryAdvice: 'পরবর্তী ১ মিনিটের ক্যান্ডেল শুরুতেই এন্ট্রি নিন।'
  });

  const parsed = parseBinarySignalResponse(sampleJson);
  assert.equal(parsed.signal, 'CALL');
  assert.equal(parsed.displaySignal, 'CALL / UP 🔥');
  assert.equal(parsed.confidence, 94);
  assert.match(parsed.bengaliReason, /সাপোর্ট লেভেলে/);
});
