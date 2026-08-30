/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import packageJson from '../../package.json';

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
 * Compare two semver strings (e.g. '1.0.6' > '1.0.5')
 */
export function isNewerVersion(remoteVer: string, currentVer: string): boolean {
  try {
    const cleanRemote = remoteVer.replace(/^v/i, '').trim();
    const cleanCurrent = currentVer.replace(/^v/i, '').trim();

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

/**
 * Check GitHub repository for the latest release
 */
export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  const currentVersion = packageJson.version;
  
  if (!navigator.onLine) {
    return {
      hasUpdate: false,
      currentVersion,
      latestRelease: null,
      error: 'ইন্টারনেট সংযোগ পাওয়া যায়নি। অফলাইন মোডে আছেন।'
    };
  }

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      },
      cache: 'no-cache'
    });

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

    // Find windows exe or asset
    let downloadUrl = data.html_url;
    let assetName = 'Biddalok Update';

    if (Array.isArray(data.assets) && data.assets.length > 0) {
      const exeAsset = data.assets.find((a: any) => a.name.endsWith('.exe')) || data.assets[0];
      if (exeAsset) {
        downloadUrl = exeAsset.browser_download_url;
        assetName = exeAsset.name;
      }
    }

    const releaseInfo: UpdateReleaseInfo = {
      version: remoteVersion,
      releaseDate: data.published_at ? new Date(data.published_at).toLocaleDateString('bn-BD') : 'সম্প্রতি প্রকাশিত',
      name: data.name || `বিদ্যালোক ভার্সন ${remoteVersion}`,
      body: data.body || 'নতুন ফিচার এবং পারফরম্যান্স অপ্টিমাইজেশন যুক্ত করা হয়েছে।',
      downloadUrl,
      assetName,
      htmlUrl: data.html_url
    };

    return {
      hasUpdate,
      currentVersion,
      latestRelease: releaseInfo
    };
  } catch (error: any) {
    return {
      hasUpdate: false,
      currentVersion,
      latestRelease: null,
      error: error?.message || 'আপডেট তথ্য যাচাই করা সম্ভব হয়নি।'
    };
  }
}
