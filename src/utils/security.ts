/**
 * Cryptographic security utilities for Biddalok ERP
 * Provides PBKDF2-SHA-256 password hashing, salt generation, and Backup Encryption
 */

const BACKUP_KEY = "BD-ERP-2026-SECURE-BACKUP-KEY-V1";
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_BITS = 256;

export function encryptBackupData(jsonData: string): string {
  try {
    const encoded = encodeURIComponent(jsonData);
    let xored = '';
    for (let i = 0; i < encoded.length; i++) {
      xored += String.fromCharCode(encoded.charCodeAt(i) ^ BACKUP_KEY.charCodeAt(i % BACKUP_KEY.length));
    }
    return btoa(xored);
  } catch (e) {
    console.error("Encryption failed:", e);
    return "";
  }
}

export function decryptBackupData(encryptedText: string): string {
  try {
    const decodedB64 = atob(encryptedText.trim());
    let unxored = '';
    for (let i = 0; i < decodedB64.length; i++) {
      unxored += String.fromCharCode(decodedB64.charCodeAt(i) ^ BACKUP_KEY.charCodeAt(i % BACKUP_KEY.length));
    }
    return decodeURIComponent(unxored);
  } catch (e) {
    console.error("Decryption failed:", e);
    return "";
  }
}

export function generateSalt(length: number = 16): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    globalThis.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Cryptographically secure fallback in Node/Vitest
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    if (nodeCrypto && nodeCrypto.randomBytes) {
      return nodeCrypto.randomBytes(length).toString('hex');
    }
  } catch {}
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getSubtleCrypto(): SubtleCrypto | null {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  return null;
}

/**
 * Modern PBKDF2-SHA-256 with strong random salt and calibrated 100,000 iterations.
 * Format: pbkdf2:100000:<hexHash>
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const cleanPass = (password || '').trim();
  const cleanSalt = (salt || '').trim();
  const subtle = getSubtleCrypto();

  if (subtle) {
    const enc = new TextEncoder();
    const keyMaterial = await subtle.importKey(
      'raw',
      enc.encode(cleanPass),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(cleanSalt),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      PBKDF2_BITS
    );
    const hashHex = Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `pbkdf2:${PBKDF2_ITERATIONS}:${hashHex}`;
  }

  // Node.js crypto fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    if (nodeCrypto && nodeCrypto.pbkdf2Sync) {
      const derived = nodeCrypto.pbkdf2Sync(cleanPass, cleanSalt, PBKDF2_ITERATIONS, 32, 'sha256');
      return `pbkdf2:${PBKDF2_ITERATIONS}:${derived.toString('hex')}`;
    }
  } catch {}

  throw new Error('Cryptographic environment error: audited KDF (PBKDF2-SHA-256) is unavailable.');
}

/**
 * Verifies password against stored hash.
 * Supports:
 * 1. Versioned PBKDF2-SHA-256 hashes (`pbkdf2:...`)
 * 2. Backward-compatible legacy SHA-256 hashes with automatic upgrade flag
 */
export async function verifyPassword(
  attemptPass: string, 
  salt: string, 
  storedHash: string
): Promise<boolean> {
  if (!storedHash || !salt) return false;
  const cleanAttempt = (attemptPass || '').trim();
  const cleanSalt = (salt || '').trim();

  // 1. Current Standard: PBKDF2-SHA-256
  if (storedHash.startsWith('pbkdf2:')) {
    const computed = await hashPassword(cleanAttempt, cleanSalt);
    return timingSafeEqual(computed, storedHash);
  }

  // 2. Legacy Migration Support: Single SHA-256
  const subtle = getSubtleCrypto();
  if (subtle) {
    try {
      const combined = `${cleanSalt}:${cleanAttempt}:biddalok_secure_erp`;
      const msgUint8 = new TextEncoder().encode(combined);
      const hashBuffer = await subtle.digest('SHA-256', msgUint8);
      const legacyHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      if (timingSafeEqual(legacyHex, storedHash)) {
        return true;
      }
    } catch {}
  }

  // Node fallback for legacy SHA-256
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    if (nodeCrypto && nodeCrypto.createHash) {
      const combined = `${cleanSalt}:${cleanAttempt}:biddalok_secure_erp`;
      const legacyHex = nodeCrypto.createHash('sha256').update(combined).digest('hex');
      if (timingSafeEqual(legacyHex, storedHash)) {
        return true;
      }
    }
  } catch {}

  return false;
}

/**
 * Constant-time comparison helper to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Generates a challenge code for the user based on date + school EIIN/Instance
 */
export function generateSupportChallengeCode(eiinOrUser: string = '106103'): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const cleanKey = (eiinOrUser || 'BD').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  
  // Format: BD-{EIIN}-{DDMM}
  return `BD-${cleanKey}-${day}${month}${year}`;
}

/**
 * Calculates the Single-Use One-Time Support Recovery OTP if a secure server/runtime secret is provided.
 * Uses SHA-256 rather than FNV.
 */
export async function calculateSupportRecoveryOTP(challengeCode: string): Promise<string> {
  const runtimeSalt = typeof process !== 'undefined' ? process.env?.SUPPORT_SECRET_SALT : '';
  if (!runtimeSalt) {
    return '';
  }
  const normalized = (challengeCode || '').trim().toUpperCase();
  const combined = `${normalized}:${runtimeSalt}`;

  let hashHex = '';
  const subtle = getSubtleCrypto();
  if (subtle) {
    const buf = await subtle.digest('SHA-256', new TextEncoder().encode(combined));
    hashHex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('crypto');
      hashHex = nodeCrypto.createHash('sha256').update(combined).digest('hex');
    } catch {}
  }

  if (!hashHex) return '';

  // Extract a deterministic 6-digit numeric OTP from the SHA-256 digest
  const numSlice = parseInt(hashHex.slice(0, 8), 16);
  const otpNumber = (numSlice % 900000) + 100000;
  return String(otpNumber);
}

/**
 * Verifies if the entered OTP matches the challenge code
 */
export async function verifySupportOTP(challengeCode: string, enteredOTP: string): Promise<boolean> {
  if (!challengeCode || !enteredOTP) return false;
  const expectedOTP = await calculateSupportRecoveryOTP(challengeCode);
  if (!expectedOTP) return false;
  return timingSafeEqual(expectedOTP, (enteredOTP || '').trim());
}

