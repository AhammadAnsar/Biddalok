import { describe, it, expect, beforeEach } from 'vitest';
import { 
  defaultClasses, 
  defaultGroups, 
  defaultSections, 
  defaultSessions, 
  defaultAdmissionYears 
} from '../store/useAppStore';
import { linkStudentIds } from '../utils/academicRelations';
import { asyncNonBlockingStorage, createSafeJsonStorage } from '../store/asyncStorage';
import { 
  syncClassToDexie, 
  syncGroupToDexie, 
  syncSectionToDexie, 
  syncSessionToDexie, 
  syncAdmissionYearToDexie,
  hydrateAllDexieData,
  db 
} from '../db/database';
import { Student } from '../types';

describe('Academic Structure Defaults & Persistence Suite', () => {
  it('verifies default classes have Six through Ten in English & Bengali', () => {
    expect(defaultClasses.length).toBe(5);
    const classNames = defaultClasses.map(c => c.name);
    const classBnNames = defaultClasses.map(c => c.nameBn);

    expect(classNames).toEqual(['Six', 'Seven', 'Eight', 'Nine', 'Ten']);
    expect(classBnNames).toEqual(['ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম']);
    expect(defaultClasses.find(c => c.isDefault)?.name).toBe('Six');
  });

  it('verifies default groups have General, Science, Humanities, Business Studies', () => {
    expect(defaultGroups.length).toBe(4);
    const groupNames = defaultGroups.map(g => g.name);
    const groupBnNames = defaultGroups.map(g => g.nameBn);

    expect(groupNames).toEqual(['General', 'Science', 'Humanities', 'Business Studies']);
    expect(groupBnNames).toEqual(['সাধারণ', 'বিজ্ঞান', 'মানবিক', 'ব্যবসায় শিক্ষা']);
    expect(defaultGroups.find(g => g.isDefault)?.name).toBe('General');
  });

  it('verifies default sections have General, Kaa, Kha, Gha', () => {
    expect(defaultSections.length).toBe(4);
    const sectionNames = defaultSections.map(s => s.name);
    const sectionBnNames = defaultSections.map(s => s.nameBn);

    expect(sectionNames).toEqual(['General', 'Kaa', 'Kha', 'Gha']);
    expect(sectionBnNames).toEqual(['সাধারণ', 'ক', 'খ', 'গ']);
    expect(defaultSections.find(s => s.isDefault)?.name).toBe('General');
  });

  it('verifies default sessions include 2026 alongside previous sessions', () => {
    const sessionNames = defaultSessions.map(s => s.name);
    expect(sessionNames).toContain('2026');
    expect(sessionNames).toContain('2024-2025');
    expect(sessionNames).toContain('2025-2026');
    expect(sessionNames).toContain('2026-2027');

    const defaultSess = defaultSessions.find(s => s.isDefault);
    expect(defaultSess?.name).toBe('2026');
    expect(defaultSess?.nameBn).toBe('২০২৬');
  });

  it('verifies default admission years have 2026 as default', () => {
    const defaultYr = defaultAdmissionYears.find(y => y.isDefault);
    expect(defaultYr?.year).toBe('2026');
    expect(defaultYr?.yearBn).toBe('২০২৬');
  });

  it('relationally links student records to academic IDs', () => {
    const unlinkedStudent = {
      id: 'std_test_1',
      studentId: '202606001',
      name: 'Rahim Uddin',
      nameBn: 'রহিম উদ্দিন',
      class: 'Six',
      section: 'Kaa',
      group: 'General',
      session: '2026',
      roll: '1',
      gender: 'Male',
      passingYear: '2026',
      registrationNo: '',
      board: 'কুমিল্লা'
    } as unknown as Student;

    const linked = linkStudentIds(unlinkedStudent, {
      classes: defaultClasses,
      sections: defaultSections,
      groups: defaultGroups,
      sessions: defaultSessions
    });

    expect(linked.classId).toBe('cls_six');
    expect(linked.sectionId).toBe('sec_kaa');
    expect(linked.groupId).toBe('grp_general');
    expect(linked.sessionId).toBe('sess-2026-s');
  });

  it('verifies asyncNonBlockingStorage and createSafeJsonStorage serialize and read back state', async () => {
    const storage = createSafeJsonStorage(() => asyncNonBlockingStorage);
    const testState = {
      state: {
        academicClasses: defaultClasses,
        academicGroups: defaultGroups,
        academicSections: defaultSections,
        admissionYears: defaultAdmissionYears,
        academicSessions: defaultSessions,
      },
      version: 1
    };

    await storage.setItem('test_biddalok_key', testState as any);
    const restored = await storage.getItem('test_biddalok_key');

    expect(restored).not.toBeNull();
    expect(restored?.state.academicClasses.length).toBe(5);
    expect(restored?.state.academicGroups.length).toBe(4);
    expect(restored?.state.academicSections.length).toBe(4);
    expect(restored?.state.admissionYears.length).toBe(6);
    expect(restored?.state.academicSessions.length).toBe(5);

    await storage.removeItem('test_biddalok_key');
  });
});
