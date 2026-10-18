/**
 * Centralized Authenticated API Client for Biddalok Backend Services
 * Automatically attaches session authorization token, CSRF prevention headers,
 * and handles health checks and network failures deterministically.
 */

import { useAuthStore } from '../store/useAuthStore';

export interface UploadDocumentOptions {
  file: File;
  type?: 'student' | 'staff' | 'committee' | 'institution';
  id?: string;
  docType?: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  filepath?: string;
  error?: string;
}

export interface ApiHealthResponse {
  status: 'ok' | 'error';
  host?: string;
  port?: number;
  lanEnabled?: boolean;
  version?: string;
}

export const CSRF_HEADER_NAME = 'X-Requested-With';
export const CSRF_HEADER_VALUE = 'BiddalokApp';

/**
 * Gets authentication headers including session Bearer token and CSRF header.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().sessionToken;
  const role = useAuthStore.getState().currentUser?.role;
  const headers: Record<string, string> = {
    [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (role) {
    headers['x-biddalok-role'] = role;
  }
  return headers;
}

/**
 * Performs a health check against the local/desktop API.
 */
export async function checkApiHealth(): Promise<ApiHealthResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/health', {
      headers: { [CSRF_HEADER_NAME]: CSRF_HEADER_VALUE },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { status: 'ok', ...data };
    }
    return { status: 'error' };
  } catch {
    return { status: 'error' };
  }
}

/**
 * Securely uploads a document to the server with authentication and error handling.
 */
export async function uploadDocumentSecurely(
  options: UploadDocumentOptions
): Promise<UploadResponse> {
  const { file, type = 'student', id = '', docType = 'Document' } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('id', id);
  formData.append('docType', docType);

  const authHeaders = getAuthHeaders();

  const response = await fetch('/api/upload-document', {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Upload failed with status ${response.status}`);
  }

  return data;
}

/**
 * Requests scanning of orphaned student media files (requires admin permission).
 */
export async function scanOrphanedFilesSecurely(
  validStudentIds: string[]
): Promise<{ success: boolean; orphanedFolders: any[]; totalSize: number; message?: string }> {
  const authHeaders = getAuthHeaders();
  authHeaders['Content-Type'] = 'application/json';

  const response = await fetch('/api/scan-orphaned-files', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ validStudentIds }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Scan failed with status ${response.status}`);
  }
  return data;
}

/**
 * Requests deletion of orphaned student media files (requires admin permission).
 */
export async function deleteOrphanedFilesSecurely(
  orphanedIds: string[]
): Promise<{ success: boolean; message: string }> {
  const authHeaders = getAuthHeaders();
  authHeaders['Content-Type'] = 'application/json';

  const response = await fetch('/api/delete-orphaned-files', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ orphanedIds }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Delete failed with status ${response.status}`);
  }
  return data;
}
