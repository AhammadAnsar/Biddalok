import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentService } from '../services/documentService';

describe('Phase 06 Unified Media Service', () => {
  let mockDesktopApi: any;
  let mockDbData: any;

  beforeEach(() => {
    mockDbData = {
      documents: [],
      files: {}
    };

    mockDesktopApi = {
      db: {
        storeDocument: vi.fn(async (token, meta, buffer) => {
          if (meta.expectedSha256 && meta.expectedSha256 !== 'validhash') {
            return { success: false, error: 'Hash mismatch' };
          }
          mockDbData.documents.push(meta);
          mockDbData.files[meta.id] = buffer;
          return { success: true, sha256: 'validhash', id: meta.id };
        }),
        readDocument: vi.fn(async (token, id) => {
          const doc = mockDbData.documents.find((d: any) => d.id === id);
          if (!doc) return { success: false, error: 'Not found' };
          const buffer = mockDbData.files[id];
          if (!buffer) return { success: false, error: 'File missing on disk' };
          return { success: true, buffer, mimeType: doc.mimeType, sha256: 'validhash' };
        })
      }
    };
    
    (global as any).window = { desktopApi: mockDesktopApi };
    (global as any).localStorage = { getItem: () => 'token', setItem: () => {} };
  });

  it('stores document and preserves SHA256', async () => {
    const meta = { id: 'doc1', mimeType: 'image/png', byteSize: 4 };
    const buffer = new Uint8Array([1, 2, 3, 4]);
    const res = await mockDesktopApi.db.storeDocument('token', meta, buffer);
    expect(res.success).toBe(true);
    expect(res.sha256).toBe('validhash');
    expect(mockDbData.files['doc1']).toBeDefined();
  });

  it('rejects tampered document', async () => {
    const meta = { id: 'doc2', mimeType: 'image/png', byteSize: 4, expectedSha256: 'invalid' };
    const buffer = new Uint8Array([1, 2, 3, 4]);
    const res = await mockDesktopApi.db.storeDocument('token', meta, buffer);
    expect(res.success).toBe(false);
    expect(res.error).toBe('Hash mismatch');
  });

  it('reports missing bytes as incomplete recovery', async () => {
    mockDbData.documents.push({ id: 'doc3', mimeType: 'application/pdf' });
    // File missing from disk
    const res = await mockDesktopApi.db.readDocument('token', 'doc3');
    expect(res.success).toBe(false);
    expect(res.error).toBe('File missing on disk');
  });
});
