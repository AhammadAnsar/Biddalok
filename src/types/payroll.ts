export type PayrollRunState = 'draft' | 'reviewed' | 'approved' | 'accrued' | 'payment_pending' | 'partly_paid' | 'paid' | 'reversed';

export interface PayPolicy {
  id: string; // e.g. policy_2026_v1
  effectiveDate: string; // YYYY-MM-DD
  currencyRounding: 'none' | 'nearest_whole' | 'up' | 'down';
  allowances: { code: string; name: string; type: 'percentage' | 'fixed'; value: number }[];
  deductions: { code: string; name: string; type: 'percentage' | 'fixed'; value: number }[];
}

export interface PayrollRun {
  id: string;
  periodId: string; // Link to fiscal period
  month: string; // YYYY-MM
  runScope: string; // e.g. 'all', 'teaching', 'non_teaching'
  state: PayrollRunState;
  policySnapshot: PayPolicy; // The policy used at the time of run
  journalId?: string; // The accrual journal reference
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface PayrollSlip {
  id: string;
  runId: string; // links to PayrollRun
  staffId: string;
  employmentTermId: string;
  
  // Proration & Attendance Impacts
  totalDays: number;
  workedDays: number;
  leaveDays: number;
  absentDays: number;
  prorationFactor: number;

  // Snapshot values
  basicSalaryMinor: number;
  
  // Explicit components to prevent zeroes being ignored
  allowances: { code: string; name: string; amountMinor: number }[];
  deductions: { code: string; name: string; amountMinor: number }[];
  
  grossSalaryMinor: number;
  totalDeductionsMinor: number;
  netSalaryMinor: number;

  paidAmountMinor: number;
  state: 'unpaid' | 'payment_pending' | 'partly_paid' | 'paid';
}

export interface PayrollDisbursement {
  id: string;
  slipId: string;
  amountMinor: number;
  date: string;
  paymentMethod: string;
  accountId: string; // Bank/Cash account ID
  referenceNo: string;
  idempotencyKey: string;
  status: 'pending' | 'failed' | 'completed';
  journalId?: string; // The payment journal reference
}
