/**
 * Authenticated Encryption & Cryptographic Verification Engine for Biddalok Backups
 * 
 * Complies with F-05, F-18 & Phase 5:
 * - Replaces fixed XOR/Base64 with AES-256-GCM authenticated encryption.
 * - Uses PBKDF2-SHA-256 key derivation with 100,000 iterations.
 * - Generates fresh, cryptographically strong random salt (16 bytes) and IV (12 bytes) per backup.
 * - End-to-end payload checksum validation using SHA-256.
 * - Backward-compatible legacy decryption adapter for older backups.
 */

import { BackupPayload, BackupManifest, EncryptedBackupEnvelope } from '../types/backup';

const DEFAULT_SYSTEM_BACKUP_PHRASE = 'BIDDALOK-ERP-CANONICAL-2026-SYSTEM-KEY';
const PBKDF2_ITERATIONS = 100000;
const AES_KEY_LENGTH = 256;
const GCM_TAG_LENGTH = 128;
const BACKUP_MAGIC = 'BIDDALOK_ENCRYPTED_BACKUP_V5';
const LEGACY_XOR_KEY = 'BD-ERP-2026-SECURE-BACKUP-KEY-V1';

/**
 * Returns the environment's SubtleCrypto instance
 */
function getSubtleCrypto(): SubtleCrypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  throw new Error('WebCrypto SubtleCrypto is not available in the current runtime environment.');
}

/**
 * Converts a string to UTF-8 Uint8Array
 */
function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts a UTF-8 ArrayBuffer/Uint8Array to string
 */
function decodeUtf8(buf: ArrayBuffer | Uint8Array): string {
  return new TextDecoder().decode(buf);
}

/**
 * Converts Uint8Array to Hex string
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Converts Hex string to Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.trim();
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hexadecimal string');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Converts ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts Base64 to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Computes SHA-256 hash of a string payload
 */
export async function computeSha256(data: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const buffer = encodeUtf8(data);
  const hashBuffer = await subtle.digest('SHA-256', buffer);
  return uint8ArrayToHex(new Uint8Array(hashBuffer));
}

/**
 * Derives a 256-bit AES-GCM CryptoKey using PBKDF2-SHA-256
 */
async function deriveAesGcmKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const rawKey = encodeUtf8(password || DEFAULT_SYSTEM_BACKUP_PHRASE);

  const baseKey = await subtle.importKey(
    'raw',
    rawKey,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: AES_KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a full backup payload with AES-256-GCM and generates a complete Envelope
 */
export async function encryptBackupPayload(
  payload: BackupPayload,
  manifestPartial: Omit<BackupManifest, 'checksumSha256' | 'encryptionMetadata' | 'verification'>,
  password?: string
): Promise<{ envelope: EncryptedBackupEnvelope; serialized: string }> {
  const subtle = getSubtleCrypto();
  const effectivePassword = password && password.trim().length > 0 ? password.trim() : DEFAULT_SYSTEM_BACKUP_PHRASE;

  // 1. Serialize payload & compute plaintext SHA-256 checksum
  const serializedPayload = JSON.stringify(payload);
  const checksumSha256 = await computeSha256(serializedPayload);

  // 2. Generate cryptographically strong random salt (16 bytes) and IV (12 bytes)
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(salt);
    globalThis.crypto.getRandomValues(iv);
  } else {
    throw new Error('CSPRNG (getRandomValues) is not available');
  }

  // 3. Derive AES-GCM Key
  const aesKey = await deriveAesGcmKey(effectivePassword, salt);

  // 4. Encrypt with AES-GCM (appends 128-bit authentication tag)
  const ciphertextBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: GCM_TAG_LENGTH,
    },
    aesKey,
    encodeUtf8(serializedPayload)
  );

  const encryptedData = arrayBufferToBase64(ciphertextBuffer);

  // 5. Build full manifest (CRITICAL: NEVER include secret keys in manifest!)
  const manifest: BackupManifest = {
    ...manifestPartial,
    checksumSha256,
    encryptionMetadata: {
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA-256',
      iterations: PBKDF2_ITERATIONS,
      saltHex: uint8ArrayToHex(salt),
      ivHex: uint8ArrayToHex(iv),
      tagLengthBits: GCM_TAG_LENGTH,
    },
    verification: {
      isVerified: false,
      verifiedAtUTC: '',
      verifiedChecksumMatch: false,
    },
  };

  // 6. Verification Dry-Run: Decrypt & verify immediately
  try {
    const testDecrypted = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: GCM_TAG_LENGTH,
      },
      aesKey,
      ciphertextBuffer
    );
    const testString = decodeUtf8(testDecrypted);
    const testChecksum = await computeSha256(testString);
    if (testChecksum === checksumSha256) {
      manifest.verification.isVerified = true;
      manifest.verification.verifiedAtUTC = new Date().toISOString();
      manifest.verification.verifiedChecksumMatch = true;
    } else {
      throw new Error('Pre-flight backup verification failed: Checksum mismatch');
    }
  } catch (verifyErr) {
    throw new Error(`Export verification failed: ${verifyErr instanceof Error ? verifyErr.message : String(verifyErr)}`);
  }

  const envelope: EncryptedBackupEnvelope = {
    magic: BACKUP_MAGIC,
    manifest,
    encryptedData,
  };

  return {
    envelope,
    serialized: JSON.stringify(envelope, null, 2),
  };
}

/**
 * Decrypts a backup file with AES-256-GCM, validating authentication tag and checksum
 * Also handles legacy backup format gracefully.
 */
export async function decryptBackupPayload(
  fileContent: string,
  password?: string
): Promise<{ payload: BackupPayload; manifest?: BackupManifest; isLegacy: boolean }> {
  const content = fileContent.trim();
  if (!content) {
    throw new Error('EMPTY_BACKUP_PAYLOAD: The provided backup file is empty.');
  }

  // Attempt to parse as JSON envelope
  let parsedJson: any = null;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    // Not valid JSON. Could be legacy Base64 XOR string
  }

  // CASE 1: Modern Authenticated V5 Backup
  if (parsedJson && parsedJson.magic === BACKUP_MAGIC) {
    const envelope = parsedJson as EncryptedBackupEnvelope;
    if (!envelope.manifest || !envelope.encryptedData) {
      throw new Error('CORRUPT_BACKUP_ENVELOPE: Missing manifest or ciphertext.');
    }

    const { encryptionMetadata } = envelope.manifest;
    if (!encryptionMetadata || encryptionMetadata.algorithm !== 'AES-256-GCM') {
      throw new Error('UNSUPPORTED_ENCRYPTION_ALGORITHM: Backup uses unknown encryption.');
    }

    const salt = hexToUint8Array(encryptionMetadata.saltHex);
    const iv = hexToUint8Array(encryptionMetadata.ivHex);
    const subtle = getSubtleCrypto();

    const effectivePassword = password && password.trim().length > 0 ? password.trim() : DEFAULT_SYSTEM_BACKUP_PHRASE;
    const aesKey = await deriveAesGcmKey(effectivePassword, salt);

    let decryptedBuffer: ArrayBuffer;
    try {
      const cipherBuffer = base64ToArrayBuffer(envelope.encryptedData);
      decryptedBuffer = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: encryptionMetadata.tagLengthBits || GCM_TAG_LENGTH,
        },
        aesKey,
        cipherBuffer
      );
    } catch {
      throw new Error('AUTHENTICATION_FAILED: Wrong password, corrupted data, or tampered backup file.');
    }

    const decryptedString = decodeUtf8(decryptedBuffer);

    // Verify SHA-256 Checksum against manifest
    const actualChecksum = await computeSha256(decryptedString);
    if (envelope.manifest.checksumSha256 && actualChecksum !== envelope.manifest.checksumSha256) {
      throw new Error('CHECKSUM_MISMATCH: Decrypted payload does not match manifest integrity checksum.');
    }

    let payload: BackupPayload;
    try {
      payload = JSON.parse(decryptedString);
    } catch {
      throw new Error('PARSE_ERROR: Decrypted data is not valid JSON.');
    }

    return {
      payload,
      manifest: envelope.manifest,
      isLegacy: false,
    };
  }

  // CASE 2: Legacy XOR encrypted base64 string
  let legacyDecryptedStr = '';
  try {
    const decodedB64 = atob(content);
    let unxored = '';
    for (let i = 0; i < decodedB64.length; i++) {
      unxored += String.fromCharCode(decodedB64.charCodeAt(i) ^ LEGACY_XOR_KEY.charCodeAt(i % LEGACY_XOR_KEY.length));
    }
    legacyDecryptedStr = decodeURIComponent(unxored);
  } catch {
    // Not legacy XOR
  }

  if (legacyDecryptedStr) {
    try {
      const parsedLegacy = JSON.parse(legacyDecryptedStr);
      if (parsedLegacy && typeof parsedLegacy === 'object') {
        return {
          payload: parsedLegacy,
          isLegacy: true,
        };
      }
    } catch {
      // ignore
    }
  }

  // CASE 3: Raw plaintext JSON backup (legacy unencrypted)
  if (parsedJson && typeof parsedJson === 'object' && (parsedJson.students || parsedJson.institution || parsedJson.classes)) {
    return {
      payload: parsedJson,
      isLegacy: true,
    };
  }

  throw new Error('INVALID_BACKUP_FORMAT: File is neither a valid V5 authenticated backup nor recognized legacy format.');
}
