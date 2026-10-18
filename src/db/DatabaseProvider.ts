import { executeCommand } from '../store/commandBridge';

export const DatabaseProvider = {
  async queryStudents(filters: any, limit: number, offset: number): Promise<{ data: any[], total: number }> {
    return executeCommand('queryStudents', 'students', { filters, limit, offset });
  },

  async getAll<T>(tableName: string): Promise<T[]> {
    return executeCommand<T[]>('getAll', tableName);
  },

  async getSettings(key: string): Promise<any> {
    try {
      const all = await executeCommand<any[]>('getAll', 'system_settings');
      const row = all?.find(r => r.key === key);
      if (!row) return null;
      return typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
    } catch {
      return null;
    }
  },

  async saveSettings(key: string, value: any): Promise<void> {
    const valStr = typeof value === 'string' ? value : JSON.stringify(value);
    await executeCommand('insertOrReplace', 'system_settings', { key, value: valStr });
  },

  async insertOrReplace(tableName: string, data: any): Promise<void> {
    await executeCommand('insertOrReplace', tableName, data);
  },

  async bulkInsertOrReplace(tableName: string, items: any[]): Promise<void> {
    await executeCommand('bulkInsertOrReplace', tableName, { items });
  },

  async delete(tableName: string, id: string): Promise<void> {
    await executeCommand('delete', tableName, { id });
  },

  async bulkDelete(tableName: string, ids: string[]): Promise<void> {
    await executeCommand('bulkDelete', tableName, { ids });
  }
};
