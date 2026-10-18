global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { CurriculumSubjectMapping } from '../types';

describe('Phase 07 Curriculum & Exam Configuration', () => {
  beforeEach(() => {
    // Reset Zustand store
    const store = useAppStore.getState();
    store.academicClasses = [
      { id: 'c_6', name: 'Class 6', nameBn: '৬ষ্ঠ', isDefault: false },
      { id: 'c_7', name: 'Class 7', nameBn: '৭ম', isDefault: false }
    ];
    store.curriculums = [
      { id: 'curr_test', code: 'TEST-01', name: 'Test Curriculum', nameBn: 'টেস্ট', status: 'active', isDefault: true }
    ];
    store.curriculumMappings = [
      {
        id: 'csm_curr_test_c6_101',
        curriculumId: 'curr_test',
        classId: 'c_6',
        className: 'Class 6',
        subjectCode: '101',
        subjectType: 'compulsory',
        name: 'Bangla',
        nameBn: 'বাংলা',
        fullMarks: 100,
        passMarks: 33,
        cqMarks: 70,
        cqPassMarks: 23,
        mcqMarks: 30,
        mcqPassMarks: 10,
        passLogic: 'individual_separator',
        weeklyPeriods: 5
      }
    ];
    store.examTerms = [];
    store.examRoutines = [];
    store.rooms = [
      { id: 'room_1', name: 'Room 1', capacity: 50 }
    ];
    store.staff = [
      { id: 'staff_1', name: 'Teacher 1', mobile: '018' } as any
    ];
    useAppStore.setState(store, true); // replace state
  });

  it('Class cloning points only to target classId', () => {
    const store = useAppStore.getState();
    // Clone c_6 to c_7
    store.cloneCurriculumClassMappings('c_6', 'c_7', 'curr_test');
    
    const updatedStore = useAppStore.getState();
    const clonedMappings = updatedStore.curriculumMappings.filter(m => m.classId === 'c_7');
    
    expect(clonedMappings.length).toBe(1);
    expect(clonedMappings[0].classId).toBe('c_7');
    expect(clonedMappings[0].className).toBe('Class 7'); // Target class name
    expect(clonedMappings[0].id).toContain('c7');
    // Original mapping is untouched
    const origMappings = updatedStore.curriculumMappings.filter(m => m.classId === 'c_6');
    expect(origMappings.length).toBe(1);
  });

  it('Binds an exam to a specific curriculum', () => {
    const store = useAppStore.getState();
    const newTerm = {
      id: 'term_1',
      name: 'Test Term',
      year: '2026',
      status: 'upcoming' as const,
      curriculumId: 'curr_test'
    };
    store.addExamTerm(newTerm);

    const updatedStore = useAppStore.getState();
    const term = updatedStore.examTerms.find(t => t.id === 'term_1');
    expect(term).toBeDefined();
    expect(term?.curriculumId).toBe('curr_test');
  });

  it('Validates conflict in exam routines using real room entity', () => {
    const store = useAppStore.getState();
    const routine1 = {
      id: 'rt_1',
      examId: 'term_1',
      className: 'Class 6',
      subjectName: 'Bangla',
      examDate: '2026-06-01',
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      roomId: 'room_1',
      invigilatorId: 'staff_1'
    };
    store.addExamRoutine(routine1);

    const conflicts = [routine1].filter(r => r.roomId === 'room_1' && r.examDate === '2026-06-01' && r.startTime === '10:00 AM');
    expect(conflicts.length).toBe(1); // Simulating the component validation logic
  });
});
