import { db } from '../db/database';
import { generateId } from '../utils/generateId';
import { StaffAttendanceRecord, AttendanceStatus, EmploymentTerm, LeaveRequest, LeaveEntitlement, Holiday } from '../types/staffHr';

// Mark daily attendance
export async function markAttendance(
  staffId: string,
  date: string,
  status: AttendanceStatus,
  inTime: string = '',
  outTime: string = '',
  source: 'biometric' | 'manual' | 'bulk',
  updatedBy: string,
  correctionReason: string = ''
): Promise<StaffAttendanceRecord> {
  return db.transaction('rw', db.staffAttendance, db.employmentTerms, async () => {
    // Generate unique ID based on staffId and date to enforce uniqueness
    const recordId = staffId + '_' + date;
    
    // Check if employment is valid for this date
    const terms = await db.employmentTerms.where('staffId').equals(staffId).toArray();
    const activeTerm = terms.find(t => {
      if (t.startDate > date) return false;
      if (t.endDate && t.endDate < date) return false;
      return t.status === 'active';
    });
    
    // Allow corrections to historical attendance even if resigned, but strictly not future
    if (!activeTerm && date > new Date().toISOString().split('T')[0]) {
      throw new Error('Cannot mark future attendance for inactive/resigned staff');
    }

    const record: StaffAttendanceRecord = {
      id: recordId,
      staffId,
      date,
      status,
      inTime,
      outTime,
      source,
      updatedBy,
      correctionReason,
      updatedAt: new Date().toISOString()
    };

    await db.staffAttendance.put(record);
    return record;
  });
}

// Bulk Mark daily attendance
export async function bulkMarkAttendance(
  records: { staffId: string; status: AttendanceStatus; inTime?: string; outTime?: string; reason?: string }[],
  date: string,
  updatedBy: string
): Promise<void> {
  return db.transaction('rw', db.staffAttendance, async () => {
    const toPut = records.map(r => ({
      id: r.staffId + '_' + date,
      staffId: r.staffId,
      date,
      status: r.status,
      inTime: r.inTime || '',
      outTime: r.outTime || '',
      source: 'bulk' as const,
      updatedBy,
      correctionReason: r.reason || '',
      updatedAt: new Date().toISOString()
    }));
    await db.staffAttendance.bulkPut(toPut);
  });
}

// Get Attendance for a specific date
export async function getAttendanceByDate(date: string): Promise<StaffAttendanceRecord[]> {
  return db.staffAttendance.where('date').equals(date).toArray();
}

// Get Attendance for a staff across a date range
export async function getStaffAttendance(staffId: string, startDate: string, endDate: string): Promise<StaffAttendanceRecord[]> {
  return db.staffAttendance
    .where('[staffId+date]')
    .between([staffId, startDate], [staffId, endDate], true, true)
    .toArray();
}
