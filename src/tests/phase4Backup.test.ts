import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFullInstitutionBackup, validateBackupArchive, restoreInstitutionFromBackup, performEmergencyFactoryReset } from '../services/backupService';
import { useAppStore } from '../store/useAppStore';
import { DOMAIN_REGISTRY } from '../store/domainRegistry';

describe('Phase 04 Backup, Restore & Reset', () => {
  let mockDesktopApi: any;
  let mockDbData: any;

  beforeEach(() => {
    mockDbData = {};
    for (const domain of DOMAIN_REGISTRY) {
      mockDbData[domain] = [];
    }
    
    mockDesktopApi = {
      db: {
        backup: vi.fn(async (token, password) => {
          return {
            success: true,
            payload: JSON.parse(JSON.stringify(mockDbData))
          };
        }),
        restore: vi.fn(async (token, payload, mode) => {
          if (mode === 'replace') {
            for (const domain of DOMAIN_REGISTRY) {
              mockDbData[domain] = payload[domain] || [];
            }
          } else if (mode === 'merge_overwrite') {
             for (const domain of DOMAIN_REGISTRY) {
              const current = mockDbData[domain] || [];
              const incoming = payload[domain] || [];
              const map = new Map(current.map((r: any) => [r.id, r]));
              incoming.forEach((r: any) => map.set(r.id, r));
              mockDbData[domain] = Array.from(map.values());
            }
          }
          return { success: true };
        }),
        reset: vi.fn(async () => {
          for (const domain of DOMAIN_REGISTRY) {
            mockDbData[domain] = [];
          }
          return { success: true };
        })
      }
    };
    
    (global as any).window = { desktopApi: mockDesktopApi };
    localStorage.setItem('sessionToken', 'dummy-token');
  });

  it('generates a verified backup of every registered domain', async () => {
    mockDbData.students.push({ id: 's1', name: 'Student 1' });
    const { envelope, manifest } = await createFullInstitutionBackup('my-secret');
    expect(manifest.tableCounts.students).toBe(1);
    expect(manifest.encryptionEnabled).toBe(true);
    expect(envelope.magic).toBe('BIDDALOK_ENCRYPTED_BACKUP_V5');
  });

  it('validates a backup archive and reports conflicts', async () => {
    mockDbData.students.push({ id: 's1', name: 'Student 1' });
    const { serialized } = await createFullInstitutionBackup('my-secret');
    
    // Attempt validation on same db
    const val = await validateBackupArchive(serialized, 'my-secret');
    expect(val.isValid).toBe(true);
    expect(val.conflictSummary?.overwriteCount).toBe(1);
  });

  it('restores into fresh profile (replace mode)', async () => {
    mockDbData.staff.push({ id: 'st1', name: 'Staff 1' });
    const { serialized } = await createFullInstitutionBackup('my-secret');
    
    // Reset
    await performEmergencyFactoryReset();
    expect(mockDbData.staff.length).toBe(0);
    
    const val = await validateBackupArchive(serialized, 'my-secret');
    const result = await restoreInstitutionFromBackup(val, { mergePolicy: 'replace' });
    expect(result.success).toBe(true);
    expect(mockDbData.staff.length).toBe(1);
  });

  it('fails decryption with wrong password', async () => {
    const { serialized } = await createFullInstitutionBackup('my-secret');
    const val = await validateBackupArchive(serialized, 'wrong-password');
    expect(val.isValid).toBe(false);
    expect(val.errors?.[0]).toMatch(/Decryption failed/);
  });

  it('detects tampered manifest checksum', async () => {
    const { serialized } = await createFullInstitutionBackup('my-secret');
    const envelope = JSON.parse(serialized);
    envelope.manifest.checksumSha256 = 'bad-hash';
    const val = await validateBackupArchive(JSON.stringify(envelope), 'my-secret');
    expect(val.isValid).toBe(false);
    expect(val.errors?.[0]).toMatch(/Checksum mismatch/);
  });
});
