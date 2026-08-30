/**
 * Cryptographic security utilities for Biddalok ERP
 * Provides SHA-256 hashing, salt generation, and Dynamic Challenge-Response Support OTP
 */

const SUPPORT_SECRET_SALT = 'SoftDows@Biddalok#2026#SecureSupportKey';

export function generateSalt(length: number = 16): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback random string
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const cleanPass = (password || '').trim();
  const cleanSalt = (salt || '').trim();
  const combined = `${cleanSalt}:${cleanPass}:biddalok_secure_erp`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(combined);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('WebCrypto subtle digest failed, falling back to simple hash', e);
    }
  }

  // Fallback 32-bit FNV-1a based hex digest
  let h1 = 0x811c9dc5;
  for (let i = 0; i < combined.length; i++) {
    h1 ^= combined.charCodeAt(i);
    h1 = (h1 * 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, '0');
}

export async function verifyPassword(
  attemptPass: string, 
  salt: string, 
  storedHash: string
): Promise<boolean> {
  if (!storedHash || !salt) return false;
  const cleanAttempt = (attemptPass || '').trim();
  const computed = await hashPassword(cleanAttempt, salt);
  return computed === storedHash;
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
 * Calculates the Single-Use One-Time Support Recovery OTP
 * SoftDows Support team inputs the Challenge Code and gets this 6-digit OTP.
 */
export async function calculateSupportRecoveryOTP(challengeCode: string): Promise<string> {
  const normalized = (challengeCode || '').trim().toUpperCase();
  const combined = `${normalized}:${SUPPORT_SECRET_SALT}`;
  
  // Compute deterministic hash to extract 6 digits
  let hashVal = 0x811c9dc5;
  for (let i = 0; i < combined.length; i++) {
    hashVal ^= combined.charCodeAt(i);
    hashVal = (hashVal * 0x01000193) >>> 0;
  }
  
  const otpNumber = (Math.abs(hashVal) % 900000) + 100000; // Guarantee 6 digits (100000 - 999999)
  return String(otpNumber);
}

/**
 * Verifies if the entered OTP matches the challenge code
 */
export async function verifySupportOTP(challengeCode: string, enteredOTP: string): Promise<boolean> {
  if (!challengeCode || !enteredOTP) return false;
  const expectedOTP = await calculateSupportRecoveryOTP(challengeCode);
  return expectedOTP === (enteredOTP || '').trim();
}
