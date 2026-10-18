import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { setSecurityBypassForTesting } from '../security/guard';
import { toBengaliNumber, toEnglishNumber } from '../utils/bengaliUtils';
import { findClass } from '../utils/academicRelations';
import { Student } from '../types';

describe('Student Module Characterization Tests', () => {
  beforeEach(() => {
    setSecurityBypassForTesting(true);
    // Reset or isolate students list before test
    useAppStore.setState({ students: [] });
  });

  it('correctly creates and saves a student into the store', () => {
    const newStudent: Student = {
      id: 'test-student-1',
      studentId: 'ST-101',
      name: 'Rahim Uddin',
      nameBn: 'রহিম উদ্দিন',
      classId: 'cls_10',
      class: 'Class 10',
      sectionId: 'sec_a',
      section: 'A',
      session: '2026',
      roll: '1',
      rollBn: '১',
      academicYear: '2026',
      dateOfBirth: '2010-01-01',
      village: 'Village A',
      postOffice: 'PO A',
      upazila: 'Upazila A',
      district: 'District A',
      fatherName: 'Karim Uddin',
      fatherNameBn: 'করিম উদ্দিন',
      motherName: 'Fatema Begum',
      motherNameBn: 'ফাতেমা বেগম',
      mobile: '01711000000',
      gender: 'Male',
      religion: 'Islam',
      bloodGroup: 'A+',
      status: 'Active',
      passingYear: '2026',
      gpa: '5.00',
      registrationNo: 'REG-101',
      board: 'Dhaka',
      group: 'Science',
    };

    useAppStore.getState().addStudent(newStudent);
    const students = useAppStore.getState().students;

    expect(students.length).toBe(1);
    expect(students[0].id).toBe('test-student-1');
    expect(students[0].name).toBe('Rahim Uddin');
    expect(students[0].nameBn).toBe('রহিম উদ্দিন');
  });

  it('updates an existing student without corrupting other records', () => {
    const studentA: Student = {
      id: 'student-a',
      studentId: 'ST-001',
      name: 'Student A',
      nameBn: 'ছাত্র ক',
      classId: 'cls_9',
      class: 'Class 9',
      session: '2026',
      roll: '5',
      dateOfBirth: '2011-02-02',
      village: 'Village A',
      postOffice: 'PO A',
      upazila: 'Upazila A',
      district: 'District A',
      fatherName: 'Father A',
      motherName: 'Mother A',
      mobile: '01811111111',
      gender: 'Male',
      status: 'Active',
      passingYear: '2026',
      gpa: '4.50',
      registrationNo: 'REG-A',
      board: 'Dhaka',
      group: 'General',
    };
    const studentB: Student = {
      id: 'student-b',
      studentId: 'ST-002',
      name: 'Student B',
      nameBn: 'ছাত্র খ',
      classId: 'cls_9',
      class: 'Class 9',
      session: '2026',
      roll: '6',
      dateOfBirth: '2011-03-03',
      village: 'Village B',
      postOffice: 'PO B',
      upazila: 'Upazila B',
      district: 'District B',
      fatherName: 'Father B',
      motherName: 'Mother B',
      mobile: '01822222222',
      gender: 'Female',
      status: 'Active',
      passingYear: '2026',
      gpa: '4.80',
      registrationNo: 'REG-B',
      board: 'Dhaka',
      group: 'General',
    };

    useAppStore.getState().addStudent(studentA);
    useAppStore.getState().addStudent(studentB);

    useAppStore.getState().updateStudent('student-a', {
      name: 'Student A Updated',
      roll: '1',
    });

    const students = useAppStore.getState().students;
    const updatedA = students.find(s => s.id === 'student-a');
    const unchangedB = students.find(s => s.id === 'student-b');

    expect(updatedA?.name).toBe('Student A Updated');
    expect(updatedA?.roll).toBe('1');
    expect(unchangedB?.name).toBe('Student B');
  });

  it('deletes a student cleanly by ID', () => {
    const student: Student = {
      id: 'student-del',
      studentId: 'ST-DEL',
      name: 'To Delete',
      classId: 'cls_6',
      class: 'Class 6',
      session: '2026',
      roll: '99',
      dateOfBirth: '2014-04-04',
      village: 'Village Del',
      postOffice: 'PO Del',
      upazila: 'Upazila Del',
      district: 'District Del',
      fatherName: 'Father Del',
      motherName: 'Mother Del',
      gender: 'Male',
      status: 'Active',
      passingYear: '2026',
      gpa: '3.50',
      registrationNo: 'REG-DEL',
      board: 'Dhaka',
      group: 'General',
    };

    useAppStore.getState().addStudent(student);
    expect(useAppStore.getState().students.some(s => s.id === 'student-del')).toBe(true);

    useAppStore.getState().deleteStudent('student-del');
    expect(useAppStore.getState().students.some(s => s.id === 'student-del')).toBe(false);
  });

  it('correctly maps Bengali numerals for rolls and IDs', () => {
    expect(toBengaliNumber('12345')).toBe('১২৩৪৫');
    expect(toBengaliNumber('Roll-07')).toBe('Roll-০৭');
    expect(toEnglishNumber('১২৩৪৫')).toBe('12345');
    expect(toEnglishNumber('রোল-০৭')).toBe('রোল-07');
  });

  it('relationally resolves class, section, and group metadata from store IDs', () => {
    useAppStore.getState().addAcademicClass({
      id: 'cls_10',
      name: 'Class Ten',
      nameBn: '১০ম শ্রেণি',
      code: '10',
      status: 'Active',
      isDefault: false,
    });

    const store = useAppStore.getState();
    const classById = findClass('cls_10', store.academicClasses);
    expect(classById).toBeDefined();
    expect(classById?.name).toBe('Class Ten');
    expect(classById?.nameBn).toBe('১০ম শ্রেণি');

    // Also resolves by Bengali name
    const classByBn = findClass('১০ম শ্রেণি', store.academicClasses);
    expect(classByBn).toBeDefined();
    expect(classByBn?.id).toBe('cls_10');
  });
});
