import { get, set } from 'idb-keyval';

export interface DocumentMetadata {
  id: string;
  ownerType?: string;
  ownerId?: string;
  mimeType: string;
  byteSize: number;
  sha256?: string;
  expectedSha256?: string;
  source?: string;
  version?: number;
}

export interface DocumentServiceAdapter {
  storeDocument(meta: DocumentMetadata, buffer: Uint8Array): Promise<{ success: boolean; sha256?: string; id?: string; error?: string }>;
  readDocument(id: string): Promise<{ success: boolean; buffer?: Uint8Array; mimeType?: string; sha256?: string; error?: string }>;
}

function getDesktopApi() {
  return typeof window !== 'undefined' ? (window as any).desktopApi : null;
}

/**
 * Desktop (Electron) Adapter using IPC
 */
class DesktopDocumentAdapter implements DocumentServiceAdapter {
  async storeDocument(meta: DocumentMetadata, buffer: Uint8Array) {
    const api = getDesktopApi();
    const token = localStorage.getItem('sessionToken');
    return await api.db.storeDocument(token, meta, buffer);
  }

  async readDocument(id: string) {
    const api = getDesktopApi();
    const token = localStorage.getItem('sessionToken');
    return await api.db.readDocument(token, id);
  }
}

/**
 * Browser (IndexedDB) Adapter for Web Fallback
 */
class BrowserDocumentAdapter implements DocumentServiceAdapter {
  private async hashBuffer(buffer: Uint8Array): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async storeDocument(meta: DocumentMetadata, buffer: Uint8Array) {
    try {
      const sha256 = await this.hashBuffer(buffer);
      if (meta.expectedSha256 && meta.expectedSha256 !== sha256) {
        throw new Error('Hash mismatch. File corrupted.');
      }
      
      const storedMeta = { ...meta, sha256, createdAt: new Date().toISOString() };
      
      // Store blob and metadata in IndexedDB
      await set(`doc_meta_${meta.id}`, storedMeta);
      await set(`doc_blob_${meta.id}`, buffer);
      
      return { success: true, sha256, id: meta.id };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async readDocument(id: string) {
    try {
      const meta = await get(`doc_meta_${id}`);
      const buffer = await get(`doc_blob_${id}`);
      
      if (!meta || !buffer) {
        return { success: false, error: 'Document not found' };
      }
      
      return { success: true, buffer, mimeType: meta.mimeType, sha256: meta.sha256 };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}

/**
 * Unified Document Service Factory
 */
export const DocumentService: DocumentServiceAdapter = getDesktopApi() 
  ? new DesktopDocumentAdapter() 
  : new BrowserDocumentAdapter();

/**
 * Helper to convert File to Uint8Array
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Helper to convert Uint8Array back to Blob URL for rendering images/PDFs
 */
export function uint8ArrayToBlobUrl(buffer: Uint8Array, mimeType: string): string {
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
}
