import { StaffMember, PayrollRecordItem } from '../types';

/**
 * Calculates progressive profile completion percentage (0 - 100%)
 */
export function calculateProfileCompletion(staff: Partial<StaffMember>): number {
  let score = 0;

  // 1. Basic Information (Weight: 25%)
  if (staff.name && staff.name.trim()) score += 5;
  if (staff.nameBn && staff.nameBn.trim()) score += 5;
  if (staff.nid && staff.nid.trim()) score += 5;
  if (staff.mobile && staff.mobile.trim()) score += 5;
  if (staff.designation && staff.designation.trim()) score += 5;

  // 2. Personal & Address Details (Weight: 20%)
  if (staff.fatherName || staff.fatherNameBn) score += 3;
  if (staff.motherName || staff.motherNameBn) score += 3;
  if (staff.gender) score += 2;
  if (staff.religion) score += 2;
  if (staff.bloodGroup) score += 2;
  // Permanent Address mapping check
  if (staff.district || staff.districtId) score += 2;
  if (staff.upazila || staff.upazilaId) score += 2;
  if (staff.village || staff.villageId) score += 2;
  // Present Address mapping check (either flagged same or filled)
  if (staff.isAddressSame !== false || staff.presentDistrict || staff.presentDistrictId) score += 2;

  // 3. Financial & Payroll (Weight: 25%)
  if (staff.bankAccountNumber && staff.bankAccountNumber.trim()) score += 8;
  if (staff.bankName && staff.bankName.trim()) score += 5;
  if (staff.basicSalary && staff.basicSalary > 0) score += 7;
  if (staff.tinNumber || staff.mobileBankingNumber) score += 5;

  // 4. Educational & Professional Qualifications (Weight: 15%)
  if (staff.educations && staff.educations.length > 0) score += 8;
  if (staff.professionalDegrees && staff.professionalDegrees.length > 0) score += 4;
  if (staff.trainings && staff.trainings.length > 0) score += 3;

  // 5. Employment & NTRCA/MPO Details (Weight: 10%)
  if (staff.employmentType) score += 4;
  if (staff.joiningDate) score += 3;
  if (staff.pdsId || staff.mpoIndexNo || staff.ntrcaRoll) score += 3;

  // 6. Photo & Documents (Weight: 5%)
  if (staff.photo && staff.photo.trim()) score += 5;

  return Math.min(100, Math.max(10, score));
}

/**
 * Generates an Institutional 9-digit Staff ID if PDS ID is not present
 * Format: [EIIN][YEAR][SERIAL] e.g. 105820261
 */
export function generateStaffId(
  existingStaffList: StaffMember[],
  pdsId?: string,
  institutionEiin?: string,
  year?: string
): { customStaffId: string; isPds: boolean } {
  if (pdsId && pdsId.trim()) {
    return {
      customStaffId: pdsId.trim(),
      isPds: true
    };
  }

  // Base EIIN (6 digits, fallback 100000 if empty)
  let cleanEiin = (institutionEiin || '').replace(/\D/g, '');
  if (cleanEiin.length < 6) {
    cleanEiin = cleanEiin.padEnd(6, '0');
  } else if (cleanEiin.length > 6) {
    cleanEiin = cleanEiin.substring(0, 6);
  }

  // Year (2 digits, e.g. "26" for 2026)
  const currentYear = year || new Date().getFullYear().toString();
  const yearSuffix = currentYear.length === 4 ? currentYear.substring(2, 4) : currentYear.slice(-2);

  // Prefix = 6 digits + 2 digits = 8 digits (e.g. "10582026")
  const prefix = `${cleanEiin}${yearSuffix}`;

  // Find max serial among non-pds IDs starting with prefix
  let maxSerial = 0;
  existingStaffList.forEach(s => {
    const cid = s.customStaffId || '';
    if (cid.startsWith(prefix)) {
      const serialPart = parseInt(cid.substring(prefix.length), 10);
      if (!isNaN(serialPart) && serialPart > maxSerial) {
        maxSerial = serialPart;
      }
    }
  });

  const nextSerial = maxSerial + 1;
  const customStaffId = `${prefix}${nextSerial}`;

  return {
    customStaffId,
    isPds: false
  };
}

/**
 * Auto-calculates payroll breakdown for a staff member
 */
export function calculateStaffPayrollItem(staff: StaffMember, bonus = 0): PayrollRecordItem {
  const basic = Number(staff.basicSalary) || 0;
  const houseRent = Number(staff.houseRent) || (basic > 0 ? 1000 : 0);
  const medical = Number(staff.medicalAllowance) || (basic > 0 ? 500 : 0);
  const special = Number(staff.specialAllowance) || 0;
  
  const totalAllowances = houseRent + medical + special + bonus;
  const grossSalary = basic + totalAllowances;

  // Deductions (if MPO: GPF 10%, Welfare+Retirement 6%)
  const gpf = Number(staff.gpfDeduction) || (staff.employmentType === 'mpo' ? Math.round(basic * 0.10) : 0);
  const welfare = Number(staff.welfareDeduction) || (staff.employmentType === 'mpo' ? Math.round(basic * 0.06) : 0);
  const other = Number(staff.otherDeductions) || 0;
  
  const totalDeductions = gpf + welfare + other;
  const netPayable = Math.max(0, grossSalary - totalDeductions);

  return {
    id: `item_${staff.id}_${Date.now()}`,
    staffId: staff.id,
    customStaffId: staff.customStaffId || '',
    staffName: staff.name,
    staffNameBn: staff.nameBn || staff.name,
    name: staff.name,
    nameBn: staff.nameBn || staff.name,
    designation: staff.designation,
    designationBn: staff.designationBn || staff.designation,
    employmentType: staff.employmentType || 'mpo',
    bankName: staff.bankName,
    bankAccountNumber: staff.bankAccountNumber,
    payCode: staff.payCode,
    basicSalary: basic,
    houseRent,
    medicalAllowance: medical,
    specialAllowance: special,
    bonus,
    totalAllowances,
    grossSalary,
    gpfDeduction: gpf,
    welfareDeduction: welfare,
    otherDeduction: other,
    otherDeductions: other,
    totalDeductions,
    netPayable,
    paymentStatus: 'pending',
    paymentMethod: staff.bankAccountNumber ? 'bank_transfer' : 'cash'
  };
}
