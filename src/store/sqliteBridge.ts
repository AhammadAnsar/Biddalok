/**
 * Desktop Database Location & Storage Engine Bridge
 * Provides integration between React UI and the Electron Desktop file system.
 */

export interface DbLocationInfo {
  path: string;
  directory: string;
  isCustom: boolean;
  exists: boolean;
  sizeBytes: number;
  engine: 'INDEXED_DB' | 'DESKTOP_FS';
}

export const isDesktopApp = (): boolean => {
  return !!(typeof window !== 'undefined' && (window as any).desktopApi?.isDesktop);
};

export const getDatabaseLocationInfo = async (): Promise<DbLocationInfo> => {
  if (isDesktopApp() && (window as any).desktopApi?.db?.getLocationInfo) {
    try {
      const info = await (window as any).desktopApi.db.getLocationInfo();
      return {
        ...info,
        engine: 'DESKTOP_FS',
      };
    } catch (e) {
      console.warn('Failed to get desktop DB location info:', e);
    }
  }

  // Fallback for Web/Browser Preview
  return {
    path: 'IndexedDB (Browser Storage Sandbox)',
    directory: 'Browser Managed Storage',
    isCustom: false,
    exists: true,
    sizeBytes: 0,
    engine: 'INDEXED_DB',
  };
};

export const selectCustomDatabaseLocation = async (): Promise<{ success: boolean; path?: string; directory?: string; error?: string; canceled?: boolean }> => {
  if (isDesktopApp() && (window as any).desktopApi?.db?.selectLocation) {
    try {
      return await (window as any).desktopApi.db.selectLocation();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Error selecting location' };
    }
  }

  return {
    success: false,
    error: 'Custom locations require Biddalok Desktop App.',
  };
};

export const openDatabaseFolder = async (): Promise<{ success: boolean; error?: string }> => {
  if (isDesktopApp() && (window as any).desktopApi?.db?.openFolder) {
    try {
      return await (window as any).desktopApi.db.openFolder();
    } catch (e: any) {
      return { success: false, error: e?.message };
    }
  }
  return { success: false, error: 'Available in Biddalok Desktop App.' };
};

// --- SQL Command Boundary (Phase 02) ---

export const executeQuery = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  if (isDesktopApp() && (window as any).desktopApi?.db?.query) {
    const result = await (window as any).desktopApi.db.query(sql, params);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
  throw new Error('SQLite not available in browser mode yet (fallback logic required)');
};

export const executeRun = async (sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number }> => {
  if (isDesktopApp() && (window as any).desktopApi?.db?.run) {
    const result = await (window as any).desktopApi.db.run(sql, params);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
  throw new Error('SQLite not available in browser mode yet (fallback logic required)');
};

export const executeTransaction = async (statements: { sql: string; params?: any[] }[]): Promise<any[]> => {
  if (isDesktopApp() && (window as any).desktopApi?.db?.transaction) {
    const result = await (window as any).desktopApi.db.transaction(statements);
    if (!result.success) throw new Error(result.error);
    return result.data;
  }
  throw new Error('SQLite not available in browser mode yet (fallback logic required)');
};
