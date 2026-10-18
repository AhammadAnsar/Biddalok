/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ReleaseChannel = 'stable' | 'beta' | 'lts';

export interface ReleaseAssetMetadata {
  fileName: string;
  downloadUrl: string;
  fileSizeBytes: number;
  sha256: string;
  signature?: string;
  publisher: string;
  os: 'win32' | 'linux' | 'darwin';
  arch: 'x64' | 'ia32' | 'arm64';
}

export interface SignedUpdateManifest {
  version: string;
  channel: ReleaseChannel;
  releaseDate: string;
  minCompatibleSchemaVersion: number;
  minSupportedAppVersion: string;
  publisher: {
    name: string;
    organization: string;
    website: string;
    publicKeyId: string;
  };
  assets: {
    installer: ReleaseAssetMetadata;
    portable?: ReleaseAssetMetadata;
  };
  changelog: {
    bn: string;
    en: string;
  };
  manifestSignature: string;
  isDevelopmentUnsigned?: boolean;
}

export interface PreflightCheckItem {
  id: string;
  title: string;
  titleBn: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  details?: string;
  detailsBn?: string;
}

export interface UpdatePreflightReport {
  timestamp: string;
  canProceed: boolean;
  checks: PreflightCheckItem[];
  pendingWritesFlushed: boolean;
  backupVerified: boolean;
  freeSpaceBytes: number;
  freeSpaceHuman: string;
  isSchemaCompatible: boolean;
  hasRunningTasks: boolean;
  backupSnapshotId?: string;
}

export interface RollbackSnapshot {
  snapshotId: string;
  sourceVersion: string;
  targetVersion: string;
  schemaVersion: number;
  createdAt: string;
  totalRecords: number;
  backupDataJson: string;
  sha256: string;
}

export interface RollbackExecutionResult {
  success: boolean;
  restoredVersion: string;
  restoredRecords: number;
  message: string;
  messageBn: string;
  error?: string;
}
