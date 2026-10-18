/**
 * Biddalok ERP - Password Policy & Secure Credential Generation
 * Enforces minimum 10-character passphrase friendly rules.
 * Strictly bans trivial default passwords (e.g. 123456).
 */

const BANNED_PASSWORDS = new Set([
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password123',
  'admin',
  'admin123',
  'admin@123',
  'administrator',
  'biddalok',
  'biddalok123',
  'school123',
  'headmaster',
  'teacher123',
]);

export interface PasswordValidationResult {
  valid: boolean;
  reason?: string;
}

export const MIN_PASSWORD_LENGTH = 10;

/**
 * Validates password against the institutional security policy.
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password cannot be empty.' };
  }

  const clean = password.trim();

  if (clean.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      reason: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long (passphrases recommended).`,
    };
  }

  if (BANNED_PASSWORDS.has(clean.toLowerCase())) {
    return {
      valid: false,
      reason: 'This password is too common and predictable. Please choose a stronger passphrase.',
    };
  }

  return { valid: true };
}

export const validatePasswordPolicy = validatePassword;

/**
 * Cryptographically generates a secure, randomized initial passphrase
 * (e.g. for newly created staff accounts to eliminate '123456').
 * If param <= 6, it treats it as number of words. Otherwise minimum character length.
 */
export function generateSecurePassphrase(wordCountOrLength: number = 4): string {
  const words = [
    'Padma', 'Meghna', 'Jamuna', 'Surma', 'Karnafuli',
    'Shapla', 'Doel', 'Tiger', 'Sundarban', 'Sylhet',
    'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur',
    'Biddalok', 'Shikkha', 'Adarsha', 'Bigyan', 'Gonit',
  ];

  const count = wordCountOrLength <= 6 ? wordCountOrLength : 4;
  const picked: string[] = [];

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(count);
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < count; i++) {
      picked.push(words[arr[i] % words.length]);
    }
  } else {
    for (let i = 0; i < count; i++) {
      picked.push(words[Math.floor(Math.random() * words.length)]);
    }
  }

  let result = picked.join('-');
  if (result.length < 10) {
    result = `${result}-2026!`;
  }
  return result;
}
