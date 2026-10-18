import { isDesktopApp } from './sqliteBridge';
import { db as dexieDb, queryStudentsIndexed } from '../db/database';

export const executeCommand = async <T = any>(action: string, domain: string, payload: any = {}): Promise<T> => {
  if (isDesktopApp() && (window as any).desktopApi?.db?.invoke) {
    const token = localStorage.getItem('sessionToken') || '';
    const result = await (window as any).desktopApi.db.invoke(action, domain, payload, token);
    if (!result.success) throw new Error(result.error);
    return result.data !== undefined ? result.data : result;
  }
  
  // Browser Mock/Fallback
  if (action === 'queryStudents') {
    const allFiltered = await queryStudentsIndexed(payload.filters);
    const total = allFiltered.length;
    let limit = payload.limit || 50;
    if (limit === -1) limit = total;
    const paginated = allFiltered.slice(payload.offset || 0, (payload.offset || 0) + limit);
    return { data: paginated, total } as unknown as T;
  }

  if (action === 'getAll') {
    if (domain === 'system_settings') {
      // In browser mode, read settings from localStorage
      const all: any[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('biddalok_setting_')) {
            const rawKey = key.replace('biddalok_setting_', '');
            const val = localStorage.getItem(key);
            if (val) all.push({ key: rawKey, value: val });
          }
        }
      } catch (e) {}
      return all as unknown as T;
    }
    return (await (dexieDb as any)[domain].toArray()) as T;
  }
  if (action === 'insertOrReplace') {
    if (domain === 'system_settings') {
      try {
        const valStr = typeof payload.value === 'string' ? payload.value : JSON.stringify(payload.value);
        localStorage.setItem(`biddalok_setting_${payload.key}`, valStr);
      } catch (e) {}
      return { success: true } as unknown as T;
    }
    await (dexieDb as any)[domain].put(payload);
    return { success: true } as unknown as T;
  }
  if (action === 'bulkInsertOrReplace') {
    const items = Array.isArray(payload) ? payload : (payload.items || []);
    if (items.length > 0) {
      await (dexieDb as any)[domain].bulkPut(items);
    }
    return { success: true, count: items.length } as unknown as T;
  }
  if (action === 'delete') {
    const id = typeof payload === 'string' ? payload : (payload.id || '');
    if (id) {
      await (dexieDb as any)[domain].delete(id);
    }
    return { success: true } as unknown as T;
  }
  if (action === 'bulkDelete') {
    const ids = Array.isArray(payload) ? payload : (payload.ids || []);
    if (ids.length > 0) {
      await (dexieDb as any)[domain].bulkDelete(ids);
    }
    return { success: true, count: ids.length } as unknown as T;
  }
  throw new Error('Unsupported command in browser fallback: ' + action);
};
