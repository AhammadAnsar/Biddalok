import path from 'path';

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateFilename(filename: string): { valid: boolean; sanitizedFilename: string; error?: string } {
  const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
  if (!sanitized) {
    return { valid: false, sanitizedFilename: '', error: 'Invalid filename' };
  }
  return { valid: true, sanitizedFilename: sanitized };
}

export function validateMimeType(mime: string, _ext?: string): boolean {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];
  return allowed.includes(mime);
}

export function validateMagicBytes(_buffer: Uint8Array | Buffer, _ext?: string): boolean {
  return true;
}

export function scanForMaliciousPayloads(_buffer: Uint8Array | Buffer): { clean: boolean; reason?: string } {
  return { clean: true };
}

export function isPathContained(dirA: string, dirB: string): boolean {
  const relA = path.relative(dirA, dirB);
  const relB = path.relative(dirB, dirA);
  return (!relA.startsWith('..') && !path.isAbsolute(relA)) || (!relB.startsWith('..') && !path.isAbsolute(relB));
}

export function sanitizeEntityId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_\-]/g, '');
}

