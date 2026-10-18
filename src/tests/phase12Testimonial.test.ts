import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db/database';
import { 
  createIssuedTestimonialEntity, 
  commitIssuedTestimonial,
  revokeIssuedTestimonial
} from '../services/testimonialService';
import { IssuedTestimonial, TestimonialRosterItem, TestimonialExam, Institution } from '../types';
import { useAppStore } from '../store/useAppStore';

describe('Phase 12: Testimonial Document Issuance and Verification', () => {
  const dummyItem: TestimonialRosterItem = {
    id: 'res_1',
    studentId: 'STU-001',
    studentDbId: 'db_stu_1',
    examName: 'SSC',
    passingYear: '2026',
    session: '2024-2025',
    group: 'Science',
    boardRollNo: '123456',
    registrationNo: '987654321',
    gpa: '5.00',
    board: 'Dhaka',
    name: 'Test Student',
    nameBn: 'টেস্ট স্টুডেন্ট',
    fatherName: 'Father Name',
    motherName: 'Mother Name',
    dateOfBirth: '2010-01-01',
    village: 'Test Village',
    postOffice: 'Test PO',
    upazila: 'Test Upazila',
    district: 'Test District'
  };

  const dummyExam: TestimonialExam = {
    id: 'ex_1',
    displayName: 'SSC Examination',
    displayNameBn: 'এসএসসি পরীক্ষা',
    year: '2026',
    examType: 'SSC',
    examTypeId: 'SSC',
    board: 'Dhaka'
  };

  const dummyInstitution: Institution = {
    id: 'inst_1',
    name: 'Test School',
    nameBn: 'টেস্ট স্কুল',
    eiin: '123456',
    address: 'Test',
    addressBn: 'টেস্ট',
    board: 'Dhaka',
    established: '1990',
    headmasterName: 'Headmaster'
  };

  beforeAll(async () => {
    await db.issuedTestimonials.clear();
    useAppStore.setState({ 
      issuedTestimonials: []
    });
    // Mock the guard bypass
    (globalThis as any).__vitest_bypass_security = true;
    const { useAuthStore } = await import('../store/useAuthStore');
    useAuthStore.setState({
      isAuthenticated: true,
      activeRole: 'admin',
      permissions: ['testimonial:issue', 'testimonial:revoke']
    });
  });

  it('generates an artifact-generated state and computes snapshot', async () => {
    const entity = await createIssuedTestimonialEntity(
      dummyItem,
      dummyExam,
      dummyInstitution,
      'bn',
      '2026/01',
      'db_stu_1'
    );

    expect(entity.state).toBe('artifact-generated');
    expect(entity.serialNo).toBe('2026/01');
    expect(entity.snapshotHash).toBeTruthy();
    expect(entity.snapshotData).toBeDefined();
    expect(entity.verificationToken).toContain('BDLK');
  });

  it('commits an issue to the store and db', async () => {
    const entity = await createIssuedTestimonialEntity(
      dummyItem,
      dummyExam,
      dummyInstitution,
      'bn',
      '2026/01',
      'db_stu_1'
    );

    await commitIssuedTestimonial(entity);

    const fromDb = await db.issuedTestimonials.get(entity.id);
    expect(fromDb).toBeTruthy();
    expect(fromDb!.state).toBe('artifact-generated');
  });

  it('revoking an issue marks it revoked but preserves history', async () => {
    const entity = await createIssuedTestimonialEntity(
      dummyItem,
      dummyExam,
      dummyInstitution,
      'bn',
      '2026/01',
      'db_stu_1'
    );

    await commitIssuedTestimonial(entity);
    
    await revokeIssuedTestimonial(entity.id, 'Lost original document', 'Admin');

    const revokedDb = await db.issuedTestimonials.get(entity.id);
    expect(revokedDb!.state).toBe('revoked');
    expect(revokedDb!.revokeReason).toBe('Lost original document');
    expect(revokedDb!.history!.some(h => h.action === 'REVOKED')).toBe(true);
  });
});
