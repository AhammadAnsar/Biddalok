export type EmploymentStatus = 'active' | 'on_leave' | 'transferred' | 'retired' | 'suspended' | 'resigned' | 'terminated';

export interface EmploymentTerm {
  id: string;
  staffId: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate?: string;  // null if current
  designationId?: string;
  department?: string;
  status: EmploymentStatus;
  reason?: string; // Reason for transfer/resignation/etc.
}

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'late' | 'half_day';

export interface StaffAttendanceRecord {
  id: string; // Typically \`\${staffId}_\${date}\`
  staffId: string;
  date: string; // Local institution date YYYY-MM-DD
  status: AttendanceStatus;
  inTime?: string; // HH:mm
  outTime?: string; // HH:mm
  source: 'biometric' | 'manual' | 'bulk';
  updatedBy: string; // userId or staffId of actor
  correctionReason?: string; // If manually corrected later
  updatedAt: string; // ISO UTC
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  nameBn?: string;
  type: 'public' | 'weekend' | 'institution';
  isWorkingDay: boolean; // Usually false for holidays
}

export type LeaveType = 'casual' | 'sick' | 'maternity' | 'paternity' | 'earned' | 'unpaid';

export interface LeaveEntitlement {
  id: string; // \`\${staffId}_\${year}_\${leaveType}\`
  staffId: string;
  year: number;
  leaveType: LeaveType;
  daysAllowed: number;
  daysUsed: number;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: LeaveType;
  status: 'pending' | 'approved' | 'rejected' | 'canceled';
  reason: string;
  approvedBy?: string;
  appliedOn: string;
}
