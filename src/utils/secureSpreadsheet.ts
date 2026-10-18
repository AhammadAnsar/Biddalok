/**
 * Biddalok Secure Spreadsheet Parser & Generator
 * Provides hardened Excel/CSV parsing with prototype pollution defense,
 * size boundaries, row/column caps, and type-safe data extraction.
 */

import * as XLSX from 'xlsx';

export const MAX_SPREADSHEET_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
export const MAX_SPREADSHEET_ROWS = 10000;
export const MAX_SPREADSHEET_COLUMNS = 100;

export interface SecureParseOptions {
  maxRows?: number;
  maxColumns?: number;
  defval?: string;
  sheetIndex?: number;
}

export interface SecureParseResult<T = Record<string, any>> {
  success: boolean;
  data: T[];
  headers: string[];
  totalRows: number;
  error?: string;
}

/**
 * Deep recursive sanitizer that strips prototype pollution vectors (__proto__, constructor, prototype).
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeObject(item)) as unknown as T;
  }

  // Create clean dictionary with no prototype
  const clean: Record<string, any> = Object.create(null);

  for (const key of Object.keys(input as Record<string, any>)) {
    const lowerKey = key.toLowerCase().trim();
    // Block prototype pollution properties
    if (
      lowerKey === '__proto__' ||
      lowerKey === 'constructor' ||
      lowerKey === 'prototype'
    ) {
      continue;
    }

    const val = (input as Record<string, any>)[key];
    clean[key] = typeof val === 'object' && val !== null ? sanitizeObject(val) : val;
  }

  return clean as T;
}

/**
 * Validates file size before parsing.
 */
export function validateSpreadsheetFileSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= MAX_SPREADSHEET_FILE_SIZE;
}

/**
 * Securely parses an Excel buffer (ArrayBuffer or Uint8Array) into sanitized JSON.
 */
export function parseSpreadsheetBuffer<T = Record<string, any>>(
  buffer: ArrayBuffer | Uint8Array,
  options: SecureParseOptions = {}
): SecureParseResult<T> {
  const maxRows = options.maxRows ?? MAX_SPREADSHEET_ROWS;
  const maxCols = options.maxColumns ?? MAX_SPREADSHEET_COLUMNS;
  const defval = options.defval ?? '';
  const sheetIndex = options.sheetIndex ?? 0;

  try {
    if (buffer.byteLength > MAX_SPREADSHEET_FILE_SIZE) {
      return {
        success: false,
        data: [],
        headers: [],
        totalRows: 0,
        error: `File size exceeds the 15MB security limit (received ${Math.round(buffer.byteLength / 1024 / 1024)}MB).`,
      };
    }

    // Read workbook with safe options
    const wb = XLSX.read(buffer, {
      type: 'array',
      dense: true,
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    if (!wb.SheetNames || wb.SheetNames.length === 0) {
      return {
        success: false,
        data: [],
        headers: [],
        totalRows: 0,
        error: 'Spreadsheet has no valid sheets.',
      };
    }

    const sheetName = wb.SheetNames[sheetIndex] || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) {
      return {
        success: false,
        data: [],
        headers: [],
        totalRows: 0,
        error: 'Selected sheet is empty or unavailable.',
      };
    }

    // Parse raw rows as array of objects
    const rawData: any[] = XLSX.utils.sheet_to_json(ws, {
      defval,
      blankrows: false,
    });

    if (!rawData || rawData.length === 0) {
      return {
        success: false,
        data: [],
        headers: [],
        totalRows: 0,
        error: 'No tabular data rows found in the sheet.',
      };
    }

    if (rawData.length > maxRows) {
      return {
        success: false,
        data: [],
        headers: [],
        totalRows: rawData.length,
        error: `Row limit exceeded: spreadsheet contains ${rawData.length} rows (maximum permitted: ${maxRows}).`,
      };
    }

    // Extract headers and enforce column cap
    const firstRow = rawData[0] || {};
    const rawHeaders = Object.keys(firstRow);

    if (rawHeaders.length > maxCols) {
      return {
        success: false,
        data: [],
        headers: [],
        totalRows: rawData.length,
        error: `Column limit exceeded: spreadsheet contains ${rawHeaders.length} columns (maximum permitted: ${maxCols}).`,
      };
    }

    // Sanitize headers to prevent prototype pollution or special character injection
    const sanitizedHeaders = rawHeaders
      .map(h => String(h).trim())
      .filter(h => {
        const l = h.toLowerCase();
        return l !== '__proto__' && l !== 'constructor' && l !== 'prototype';
      });

    // Deeply sanitize every row
    const sanitizedRows: T[] = rawData.map(row => sanitizeObject<T>(row));

    return {
      success: true,
      data: sanitizedRows,
      headers: sanitizedHeaders,
      totalRows: sanitizedRows.length,
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      headers: [],
      totalRows: 0,
      error: `Failed to parse spreadsheet: ${err?.message || 'Invalid or corrupted file structure'}`,
    };
  }
}

/**
 * Creates and writes a secure Excel file from an array of arrays or array of objects.
 */
export function exportSecureSpreadsheet(
  data: any[][],
  sheetName: string = 'Sheet1',
  fileName: string = 'export.xlsx'
): void {
  // Phase 15: Replace manual CSV with shared compliant serializer and formula neutralization
  const neutralizedAoa = data.map(row => 
    row.map(cell => {
      if (typeof cell === 'string') {
        const trimmed = cell.trim();
        // Prevent formula injection
        if (['=', '+', '-', '@'].includes(trimmed[0])) {
          return `'${cell}`;
        }
        // Force mobile/NID/account numbers as string
        if (/^\d{10,20}$/.test(trimmed) || trimmed.startsWith('01')) {
          return { v: trimmed, t: 's' };
        }
        return cell;
      }
      return cell;
    })
  );

  const ws = XLSX.utils.aoa_to_sheet(neutralizedAoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Excel 31-char sheet limit
  
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    (window as any).showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }]
    }).then(async (handle: any) => {
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    }).catch((e: any) => {
      if (e.name !== 'AbortError') XLSX.writeFile(wb, fileName);
    });
  } else {
    XLSX.writeFile(wb, fileName);
  }
}
