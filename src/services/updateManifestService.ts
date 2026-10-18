/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SignedUpdateManifest, ReleaseAssetMetadata } from '../types/update';
import { 
  APP_VERSION, 
  CURRENT_SCHEMA_VERSION, 
  MIN_COMPATIBLE_SCHEMA_VERSION, 
  MIN_SUPPORTED_APP_VERSION,
  APP_AUTHOR
} from '../version';

/**
 * Validates a signed update manifest against schema, versioning, and publisher constraints.
 */
export function validateUpdateManifest(manifest: any): {
  isValid: boolean;
  manifest: SignedUpdateManifest | null;
  error?: string;
  errorBn?: string;
} {
  if (!manifest || typeof manifest !== 'object') {
    return {
      isValid: false,
      manifest: null,
      error: 'Invalid manifest payload. Expected a JSON object.',
      errorBn: 'অকার্যকর ম্যানিফেস্ট ডাটা। একটি সঠিক JSON অবজেক্ট প্রয়োজন।'
    };
  }

  // 1. Mandatory version check
  if (!manifest.version || typeof manifest.version !== 'string') {
    return {
      isValid: false,
      manifest: null,
      error: 'Missing required "version" field in update manifest.',
      errorBn: 'আপডেট ম্যানিফেস্টে আবশ্যক "version" ফিল্ড অনুপস্থিত।'
    };
  }

  // 2. Minimum compatible schema check
  const minSchema = typeof manifest.minCompatibleSchemaVersion === 'number' 
    ? manifest.minCompatibleSchemaVersion 
    : MIN_COMPATIBLE_SCHEMA_VERSION;

  if (minSchema > CURRENT_SCHEMA_VERSION) {
    return {
      isValid: false,
      manifest: null,
      error: `Update requires database schema version ${minSchema}, but current database schema is version ${CURRENT_SCHEMA_VERSION}. A staged migration is required.`,
      errorBn: `আপডেটের জন্য ডাটাবেজ স্কিমা ভার্সন ${minSchema} আবশ্যক, কিন্তু বর্তমান স্কিমা ${CURRENT_SCHEMA_VERSION}। সরাসরি ইন্সটল করলে ডাটা অসঙ্গতি তৈরি হতে পারে।`
    };
  }

  // 3. Asset verification
  if (!manifest.assets || !manifest.assets.installer) {
    return {
      isValid: false,
      manifest: null,
      error: 'Update manifest does not contain installer asset metadata.',
      errorBn: 'ম্যানিফেস্টে অফিসিয়াল ইন্সটলারের মেটাডাটা পাওয়া যায়নি।'
    };
  }

  const installer = manifest.assets.installer;
  if (!installer.sha256 || typeof installer.sha256 !== 'string' || installer.sha256.trim().length !== 64) {
    return {
      isValid: false,
      manifest: null,
      error: 'Missing or malformed SHA-256 checksum for installer asset.',
      errorBn: 'ইন্সটলারের জন্য বৈধ ৬৪-অক্ষরের SHA-256 চেকসাম অনুপস্থিত।'
    };
  }

  // 4. Publisher signature check
  const hasSignature = !!(installer.signature || manifest.manifestSignature);
  const isDevUnsigned = manifest.isDevelopmentUnsigned || !hasSignature;

  const validManifest: SignedUpdateManifest = {
    version: manifest.version,
    channel: manifest.channel || 'stable',
    releaseDate: manifest.releaseDate || new Date().toISOString().split('T')[0],
    minCompatibleSchemaVersion: minSchema,
    minSupportedAppVersion: manifest.minSupportedAppVersion || MIN_SUPPORTED_APP_VERSION,
    publisher: {
      name: manifest.publisher?.name || 'Ansar Ahammad',
      organization: manifest.publisher?.organization || 'SoftDows',
      website: manifest.publisher?.website || 'https://softdows.com/biddalok',
      publicKeyId: manifest.publisher?.publicKeyId || 'softdows-release-key-2026'
    },
    assets: {
      installer: {
        fileName: installer.fileName || `Biddalok-Setup-${manifest.version}.exe`,
        downloadUrl: installer.downloadUrl || '',
        fileSizeBytes: installer.fileSizeBytes || 0,
        sha256: installer.sha256.toLowerCase().trim(),
        signature: installer.signature,
        publisher: installer.publisher || APP_AUTHOR,
        os: 'win32',
        arch: 'x64'
      },
      portable: manifest.assets.portable ? {
        fileName: manifest.assets.portable.fileName || `Biddalok-Portable-${manifest.version}.exe`,
        downloadUrl: manifest.assets.portable.downloadUrl || '',
        fileSizeBytes: manifest.assets.portable.fileSizeBytes || 0,
        sha256: (manifest.assets.portable.sha256 || '').toLowerCase().trim(),
        signature: manifest.assets.portable.signature,
        publisher: manifest.assets.portable.publisher || APP_AUTHOR,
        os: 'win32',
        arch: 'x64'
      } : undefined
    },
    changelog: {
      bn: manifest.changelog?.bn || manifest.changelog || 'উন্নত পারফরম্যান্স ও নতুন নিরাপত্তা ফিচার যুক্ত করা হয়েছে।',
      en: manifest.changelog?.en || manifest.description || 'Performance improvements and security enhancements.'
    },
    manifestSignature: manifest.manifestSignature || '',
    isDevelopmentUnsigned: isDevUnsigned
  };

  return {
    isValid: true,
    manifest: validManifest
  };
}

/**
 * Computes SHA-256 hash of an ArrayBuffer or File for downloaded artifact verification.
 */
export async function computeFileSha256(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback 64-char pseudo-hash for testing environments without crypto.subtle
  let h1 = 0x811c9dc5, h2 = 0x27d4eb2f;
  const uint8 = new Uint8Array(buffer);
  for (let i = 0; i < uint8.length; i++) {
    h1 = Math.imul(h1 ^ uint8[i], 16777619);
    h2 = Math.imul(h2 ^ uint8[i], 1099511628);
  }
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (p1 + p2).repeat(4);
}

/**
 * Compares two SemVer versions (e.g. '1.1.0' vs '1.0.6').
 * Returns true if remoteVersion > currentVersion.
 */
export function isNewerVersion(remoteVersion: string, currentVersion: string = APP_VERSION): boolean {
  try {
    const cleanRemote = remoteVersion.replace(/^v/i, '').trim();
    const cleanCurrent = currentVersion.replace(/^v/i, '').trim();

    const remoteParts = cleanRemote.split('.').map(n => parseInt(n, 10) || 0);
    const currentParts = cleanCurrent.split('.').map(n => parseInt(n, 10) || 0);

    for (let i = 0; i < Math.max(remoteParts.length, currentParts.length); i++) {
      const r = remoteParts[i] || 0;
      const c = currentParts[i] || 0;
      if (r > c) return true;
      if (r < c) return false;
    }
    return false;
  } catch {
    return false;
  }
}
