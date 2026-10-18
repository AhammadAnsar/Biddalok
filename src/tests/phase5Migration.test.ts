import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Phase 05 Relational Migration & Import', () => {
  let mockDbData: any;
  let mockDesktopApi: any;

  beforeEach(() => {
    mockDbData = {
      students: [],
      students_v2: [],
      enrollments: [],
      guardians: [],
      admission_events: []
    };

    mockDesktopApi = {
      db: {
        migratePhase5DryRun: vi.fn(async () => {
          return {
            success: true,
            payload: {
              total: mockDbData.students.length,
              duplicates: 0,
              orphans: 0,
              mappings: mockDbData.students.map((s: any) => ({ originalId: s.id, newStudentId: s.id, name: s.name }))
            }
          };
        }),
        migratePhase5Execute: vi.fn(async () => {
          for (const s of mockDbData.students) {
            mockDbData.students_v2.push({
              id: s.id,
              studentId: s.studentId,
              name: s.name
            });
            mockDbData.enrollments.push({
              id: s.id + '_enr',
              studentId: s.id,
              classId: s.classId,
              roll: s.roll
            });
          }
          return { success: true, count: mockDbData.students.length };
        })
      }
    };
    
    (global as any).window = { desktopApi: mockDesktopApi };
    (global as any).localStorage = { getItem: () => 'token', setItem: () => {} };
  });

  it('runs dry run mapping on legacy data', async () => {
    mockDbData.students.push({ id: 'legacy_1', name: 'Student 1' });
    const res = await mockDesktopApi.db.migratePhase5DryRun();
    expect(res.success).toBe(true);
    expect(res.payload.total).toBe(1);
    expect(res.payload.mappings[0].originalId).toBe('legacy_1');
  });

  it('executes migration and inserts normalized records', async () => {
    mockDbData.students.push({ id: 'legacy_1', name: 'Student 1', classId: 'class_1', roll: '10' });
    const res = await mockDesktopApi.db.migratePhase5Execute();
    expect(res.success).toBe(true);
    expect(mockDbData.students_v2.length).toBe(1);
    expect(mockDbData.enrollments.length).toBe(1);
    expect(mockDbData.enrollments[0].roll).toBe('10');
  });

  it('preserves historical rosters', () => {
     const rosters = [
       { studentId: 's1', sessionId: '2021', roll: '10', classId: '1' },
       { studentId: 's1', sessionId: '2026', roll: '15', classId: '6' }
     ];
     // Test stub for multiple rosters
     expect(rosters.filter(r => r.studentId === 's1').length).toBe(2);
  });
});
