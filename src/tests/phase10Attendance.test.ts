import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db/database';
import { markAttendance, getAttendanceByDate, getStaffAttendance } from '../services/hrService';
import { AttendanceStatus } from '../types/staffHr';

describe('Phase 10: Employment Leave & Dated Attendance', () => {
  beforeAll(async () => {
    await db.staffAttendance.clear();
    await db.employmentTerms.clear();
    await db.staff.clear();

    // Setup staff
    await db.staff.add({ id: 'stf_1', customStaffId: 'STF-01', staffType: 'teaching', name: 'John Doe', designation: 'Teacher', role: 'teacher', contact: '' });
    await db.staff.add({ id: 'stf_2', customStaffId: 'STF-02', staffType: 'non_teaching', name: 'Retired Jane', designation: 'Admin', role: 'admin', contact: '' });

    // Setup employment terms
    await db.employmentTerms.add({
      id: 'term_1',
      staffId: 'stf_1',
      startDate: '2026-01-01',
      status: 'active'
    });
    await db.employmentTerms.add({
      id: 'term_2',
      staffId: 'stf_2',
      startDate: '2020-01-01',
      endDate: '2025-12-31',
      status: 'retired'
    });
  });

  it('Empty register remains unmarked', async () => {
    const records = await getAttendanceByDate('2026-01-10');
    expect(records.length).toBe(0); // None are present/absent
  });

  it('Tomorrow does not inherit today’s present status', async () => {
    await markAttendance('stf_1', '2026-01-10', 'present', '08:45 AM', '', 'manual', 'admin');
    const recordsToday = await getAttendanceByDate('2026-01-10');
    expect(recordsToday.length).toBe(1);
    expect(recordsToday[0].status).toBe('present');

    const recordsTomorrow = await getAttendanceByDate('2026-01-11');
    expect(recordsTomorrow.length).toBe(0);
  });

  it('Cannot mark future attendance for retired staff', async () => {
    // Current date is mocking "2026-01-12" via environment or date boundaries
    const futureDate = '2100-01-01'; // extremely future date
    await expect(
      markAttendance('stf_2', futureDate, 'present', '08:45 AM', '', 'manual', 'admin')
    ).rejects.toThrow('Cannot mark future attendance for inactive/resigned staff');
  });

  it('Duplicate entry keys overwrite cleanly (last writer wins) instead of crashing with collisions', async () => {
    await markAttendance('stf_1', '2026-01-12', 'absent', '', '', 'manual', 'admin', 'Sick');
    let records = await getAttendanceByDate('2026-01-12');
    expect(records.length).toBe(1);
    expect(records[0].status).toBe('absent');

    // Duplicate key edit
    await markAttendance('stf_1', '2026-01-12', 'present', '09:00 AM', '', 'manual', 'admin', 'Corrected');
    records = await getAttendanceByDate('2026-01-12');
    expect(records.length).toBe(1);
    expect(records[0].status).toBe('present');
    expect(records[0].correctionReason).toBe('Corrected');
  });

  it('Historical corrections retain an audit record', async () => {
    const records = await getAttendanceByDate('2026-01-12');
    expect(records[0].correctionReason).toBe('Corrected');
    expect(records[0].updatedBy).toBe('admin');
    expect(records[0].updatedAt).toBeTruthy();
  });
});
