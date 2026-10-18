import { create } from 'zustand';
import { db } from '../db/database';

export interface Guardian {
  id: string;
  name: string;
  nameBn?: string;
  primaryContact: string;
  relation: string;
  nid?: string;
  occupation?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentGuardian {
  id: string;
  studentId: string;
  guardianId: string;
  relation: string;
  isEmergencyContact: boolean;
  isPrimary: boolean;
}

interface GuardianStore {
  guardians: Guardian[];
  studentGuardians: StudentGuardian[];
  loadGuardians: () => Promise<void>;
  saveGuardian: (guardian: Guardian, studentLinks: StudentGuardian[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useGuardianStore = create<GuardianStore>((set, get) => ({
  guardians: [],
  studentGuardians: [],
  loading: false,
  error: null,
  
  loadGuardians: async () => {
    set({ loading: true, error: null });
    try {
      const g = await db.table('guardians').toArray();
      const sg = await db.table('student_guardians').toArray();
      set({ guardians: g, studentGuardians: sg, loading: false });
    } catch (error) {
      set({ error: 'Failed to load guardians.', loading: false });
    }
  },
  
  saveGuardian: async (guardian, studentLinks) => {
    set({ loading: true, error: null });
    try {
      await db.transaction('rw', db.table('guardians'), db.table('student_guardians'), async () => {
        await db.table('guardians').put(guardian);
        // Remove existing links for this guardian
        const existingLinks = await db.table('student_guardians').where('guardianId').equals(guardian.id).toArray();
        const existingIds = existingLinks.map(l => l.id);
        if (existingIds.length > 0) {
          await db.table('student_guardians').bulkDelete(existingIds);
        }
        if (studentLinks.length > 0) {
          await db.table('student_guardians').bulkPut(studentLinks);
        }
      });
      await get().loadGuardians();
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to save guardian.', loading: false });
    }
  }
}));
