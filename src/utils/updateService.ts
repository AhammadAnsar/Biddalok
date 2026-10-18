/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APP_VERSION, MIN_COMPATIBLE_SCHEMA_VERSION, MIN_SUPPORTED_APP_VERSION, APP_AUTHOR } from '../version';
import { SignedUpdateManifest } from '../types/update';
import { validateUpdateManifest, isNewerVersion } from '../services/updateManifestService';

export { isNewerVersion };

export interface UpdateReleaseInfo {
  version: string;
  releaseDate: string;
  name: string;
  body: string;
  downloadUrl?: string;
  assetName?: string;
  htmlUrl?: string;
  isMandatory?: boolean;
  minSupportedVersion?: string;
  minCompatibleSchemaVersion?: number;
  fileSizeBytes?: number;
  sha256?: string;
  signature?: string;
  manifest?: SignedUpdateManifest | null;
  isDevelopmentUnsigned?: boolean;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestRelease: UpdateReleaseInfo | null;
  error?: string;
}

// Official GitHub Repository for Biddalok releases
export const GITHUB_REPO_OWNER = 'AhammadAnsar';
export const GITHUB_REPO_NAME = 'Biddalok';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
export const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;

/**
 * Check GitHub repository for the latest release and its signed manifest.
 */
export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  const currentVersion = APP_VERSION;
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      hasUpdate: false,
      currentVersion,
      latestRelease: null,
      error: 'ইন্টারনেট সংযোগ পাওয়া যায়নি। অফলাইন মোডে অ্যাপটি সম্পূর্ণ কার্যকর আছে।'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      },
      cache: 'no-cache',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          hasUpdate: false,
          currentVersion,
          latestRelease: null
        };
      }
      throw new Error(`GitHub API Error (${response.status})`);
    }

    const data = await response.json();
    const remoteVersion = (data.tag_name || data.name || '').replace(/^v/i, '').trim();
    const hasUpdate = isNewerVersion(remoteVersion, currentVersion);

    let parsedManifest: SignedUpdateManifest | null = null;
    let downloadUrl = data.html_url;
    let assetName = `Biddalok-Setup-${remoteVersion}.exe`;
    let fileSizeBytes = 0;
    let sha256 = '';
    let signature = '';
    let isDevelopmentUnsigned = true;

    // Check if a signed release-manifest.json exists among assets
    if (Array.isArray(data.assets) && data.assets.length > 0) {
      const manifestAsset = data.assets.find((a: any) => a.name === 'release-manifest.json');
      if (manifestAsset && manifestAsset.browser_download_url) {
        try {
          const manifestResp = await fetch(manifestAsset.browser_download_url);
          if (manifestResp.ok) {
            const rawJson = await manifestResp.json();
            const validation = validateUpdateManifest(rawJson);
            if (validation.isValid && validation.manifest) {
              parsedManifest = validation.manifest;
              downloadUrl = validation.manifest.assets.installer.downloadUrl || downloadUrl;
              assetName = validation.manifest.assets.installer.fileName || assetName;
              fileSizeBytes = validation.manifest.assets.installer.fileSizeBytes || 0;
              sha256 = validation.manifest.assets.installer.sha256 || '';
              signature = validation.manifest.assets.installer.signature || '';
              isDevelopmentUnsigned = validation.manifest.isDevelopmentUnsigned || false;
            }
          }
        } catch (mErr) {
          console.warn('Failed to parse remote release-manifest.json:', mErr);
        }
      }

      // If manifest did not provide installer details, inspect assets for .exe
      if (!sha256) {
        const exeAsset = data.assets.find((a: any) => a.name.endsWith('.exe')) || data.assets[0];
        if (exeAsset) {
          downloadUrl = exeAsset.browser_download_url;
          assetName = exeAsset.name;
          fileSizeBytes = exeAsset.size || 0;
        }

        // Look for checksum file (.sha256 or CHECKSUMS)
        const checksumAsset = data.assets.find((a: any) => a.name.includes('.sha256') || a.name.includes('CHECKSUM'));
        if (checksumAsset && checksumAsset.browser_download_url) {
          try {
            const csResp = await fetch(checksumAsset.browser_download_url);
            if (csResp.ok) {
              const csText = await csResp.text();
              const match = csText.match(/[a-fA-F0-9]{64}/);
              if (match) {
                sha256 = match[0].toLowerCase();
              }
            }
          } catch {
            // Ignore checksum fetch error
          }
        }
      }
    }

    const releaseInfo: UpdateReleaseInfo = {
      version: remoteVersion,
      releaseDate: data.published_at ? new Date(data.published_at).toLocaleDateString('bn-BD') : 'সম্প্রতি প্রকাশিত',
      name: data.name || `বিদ্যালোক ভার্সন ${remoteVersion}`,
      body: data.body || 'নতুন ফিচার এবং পারফরম্যান্স অপ্টিমাইজেশন যুক্ত করা হয়েছে।',
      downloadUrl,
      assetName,
      htmlUrl: data.html_url,
      minSupportedVersion: parsedManifest?.minSupportedAppVersion || MIN_SUPPORTED_APP_VERSION,
      minCompatibleSchemaVersion: parsedManifest?.minCompatibleSchemaVersion || MIN_COMPATIBLE_SCHEMA_VERSION,
      fileSizeBytes,
      sha256,
      signature,
      manifest: parsedManifest,
      isDevelopmentUnsigned
    };

    return {
      hasUpdate,
      currentVersion,
      latestRelease: releaseInfo
    };
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    return {
      hasUpdate: false,
      currentVersion,
      latestRelease: null,
      error: isOffline 
        ? 'ইন্টারনেট সংযোগ পাওয়া যায়নি। অফলাইন মোডে আছেন।' 
        : isTimeout 
          ? 'আপডেট সার্ভারের সাথে সংযোগের সময় শেষ হয়েছে। অফলাইনে বিদ্যালয়ের সকল কার্যক্রম সচল রয়েছে।' 
          : (error?.message || 'আপডেট তথ্য যাচাই করা সম্ভব হয়নি।')
    };
  }
}
