import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { useAppStore } from '../store/useAppStore';
import { setSecurityBypassForTesting } from '../security/guard';
import { Student } from '../types';

describe('Backup & Restore Characterization Tests', () => {
  beforeEach(() => {
    setSecurityBypassForTesting(true);
    useAppStore.setState({ students: [] });
  });

  it('exports system snapshot into a serialized string payload', () => {
    const student: Student = {
      id: 'st-backup-1',
      studentId: 'ST-BAK-01',
      name: 'Backup Test Student',
      dateOfBirth: '2010-01-01',
      gender: 'Male',
      village: 'Test Village',
      postOffice: 'Test PO',
      upazila: 'Test Upazila',
      district: 'Test District',
      fatherName: 'Test Father',
      motherName: 'Test Mother',
      classId: 'cls_10',
      class: 'Class 10',
      session: '2026',
      roll: '10',
      passingYear: '2026',
      gpa: '5.00',
      registrationNo: '12345678',
      board: 'Dhaka',
      group: 'Science',
    };
    useAppStore.getState().addStudent(student);

    const backupPayload = useAppStore.getState().exportBackupJSON();
    expect(backupPayload).toBeDefined();
    expect(typeof backupPayload).toBe('string');
    expect(backupPayload.length).toBeGreaterThan(10);
  });

  it('restores backup data roundtrip without data loss', () => {
    const student: Student = {
      id: 'st-backup-2',
      studentId: 'ST-BAK-02',
      name: 'Restorable Student',
      dateOfBirth: '2010-05-15',
      gender: 'Female',
      village: 'Village B',
      postOffice: 'PO B',
      upazila: 'Upazila B',
      district: 'District B',
      fatherName: 'Father B',
      motherName: 'Mother B',
      classId: 'cls_9',
      class: 'Class 9',
      session: '2026',
      roll: '15',
      passingYear: '2026',
      gpa: '4.80',
      registrationNo: '87654321',
      board: 'Dhaka',
      group: 'General',
    };
    useAppStore.getState().addStudent(student);

    const exportedString = useAppStore.getState().exportBackupJSON();

    // Clear state
    useAppStore.setState({ students: [] });
    expect(useAppStore.getState().students.length).toBe(0);

    // Import
    const success = useAppStore.getState().importBackupJSON(exportedString);
    expect(success).toBe(true);

    const restoredStudents = useAppStore.getState().students;
    expect(restoredStudents.length).toBe(1);
    expect(restoredStudents[0].id).toBe('st-backup-2');
    expect(restoredStudents[0].name).toBe('Restorable Student');
  });

  it('safely rejects corrupt or invalid backup strings without crashing', () => {
    const corruptPayload = 'INVALID_NON_JSON_CORRUPT_STRING';
    const result = useAppStore.getState().importBackupJSON(corruptPayload);
    expect(result).toBe(false);
  });

  it('safely rejects empty string or missing payload structure', () => {
    expect(useAppStore.getState().importBackupJSON('')).toBe(false);
    expect(useAppStore.getState().importBackupJSON('{}')).toBe(false);
  });
});
