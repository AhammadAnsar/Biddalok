import { DatabaseProvider } from './DatabaseProvider';

export interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  transactionId?: string;
  revisionId?: number;
}

export interface IRepository<T> {
  getAll(): Promise<CommandResult<T[]>>;
  getById(id: string): Promise<CommandResult<T | null>>;
  save(entity: T): Promise<CommandResult<void>>;
  delete(id: string): Promise<CommandResult<void>>;
}

export class BaseRepository<T extends { id: string }> implements IRepository<T> {
  constructor(protected tableName: string) {}

  async getAll(): Promise<CommandResult<T[]>> {
    try {
      const data = await DatabaseProvider.getAll<T>(this.tableName);
      return { success: true, data, transactionId: Date.now().toString() };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async getById(id: string): Promise<CommandResult<T | null>> {
    try {
      const data = await DatabaseProvider.getAll<T>(this.tableName);
      const item = data.find(d => d.id === id) || null;
      return { success: true, data: item, transactionId: Date.now().toString() };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async save(entity: T): Promise<CommandResult<void>> {
    try {
      await DatabaseProvider.insertOrReplace(this.tableName, entity);
      return { success: true, transactionId: Date.now().toString(), revisionId: 1 };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async delete(id: string): Promise<CommandResult<void>> {
    // Phase 02: Full deletion mapping to be completed in future phase
    return { success: false, error: 'Not fully implemented in Phase 02 adapter' };
  }
}

export const StudentRepository = new BaseRepository<any>('students');
export const StaffRepository = new BaseRepository<any>('staff');
