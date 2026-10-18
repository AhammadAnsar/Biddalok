import { create } from 'zustand';
import { db } from '../db/database';
import { StudentAttendance } from '../types';

interface StudentAttendanceStore {
  attendanceRecords: StudentAttendance[];
  loadAttendance: (classId: string, sectionId: string, date: string) => Promise<void>;
  saveAttendance: (records: StudentAttendance[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useStudentAttendanceStore = create<StudentAttendanceStore>((set, get) => ({
  attendanceRecords: [],
  loading: false,
  error: null,
  
  loadAttendance: async (classId, sectionId, date) => {
    set({ loading: true, error: null });
    try {
      // Find matching attendance for the class, section, date combination
      const records = await db.table('studentAttendance')
        .where('[classId+sectionId+date]')
        .equals([classId, sectionId, date])
        .toArray();
      set({ attendanceRecords: records, loading: false });
    } catch (error) {
      console.error('Failed to load attendance:', error);
      set({ error: 'Failed to load attendance records.', loading: false });
    }
  },
  
  saveAttendance: async (records) => {
    set({ loading: true, error: null });
    try {
      await db.transaction('rw', db.table('studentAttendance'), async () => {
        // Upsert by primary key (id)
        await db.table('studentAttendance').bulkPut(records);
      });
      
      // Update local state by merging
      const current = get().attendanceRecords;
      const updated = [...current];
      records.forEach(r => {
        const idx = updated.findIndex(u => u.studentId === r.studentId);
        if (idx >= 0) updated[idx] = r;
        else updated.push(r);
      });
      
      set({ attendanceRecords: updated, loading: false });
    } catch (error) {
      console.error('Failed to save attendance:', error);
      set({ error: 'Failed to save attendance records.', loading: false });
    }
  }
}));
