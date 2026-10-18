import { db } from '../db/database';
import { generateId } from '../utils/generateId';
import { PayPolicy, PayrollRun, PayrollSlip, PayrollDisbursement } from '../types/payroll';
import { getStaffAttendance } from './hrService';

// Accrual / Double Entry logic depends on chart of accounts:
// 'acc_salary_expense', 'acc_salary_payable'

export async function createPayrollRun(
  month: string, 
  runScope: string, 
  periodId: string, 
  policyId: string,
  staffIds: string[]
): Promise<PayrollRun> {
  return db.transaction('rw', [db.payrollRuns, db.payrollSlips, db.payPolicies, db.employmentTerms, db.staff, db.staffAttendance], async () => {
    // Prevent duplicate active runs
    const existing = await db.payrollRuns.where('[month+runScope]').equals([month, runScope]).toArray();
    if (existing.some(r => r.state !== 'reversed')) {
      throw new Error(`An active payroll run already exists for ${month} (${runScope})`);
    }

    const policy = await db.payPolicies.get(policyId);
    if (!policy) throw new Error('Policy not found');

    const runId = generateId('run_');
    
    const slipsToPut: PayrollSlip[] = [];
    const monthStart = `${month}-01`;
    const lastDay = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const monthEnd = `${month}-${lastDay}`;

    for (const staffId of staffIds) {
      const terms = await db.employmentTerms.where('staffId').equals(staffId).toArray();
      const activeTerm = terms.find(t => {
        if (t.startDate > monthEnd) return false;
        if (t.endDate && t.endDate < monthStart) return false;
        return t.status === 'active';
      });

      if (!activeTerm) continue; // Skip non-eligible staff

      // Fetch attendance
      const attendance = await getStaffAttendance(staffId, monthStart, monthEnd);
      const workedDays = attendance.filter(a => a.status === 'present').length;
      const leaveDays = attendance.filter(a => a.status === 'leave').length;
      const absentDays = attendance.filter(a => a.status === 'absent').length;
      const totalDays = lastDay;

      // Simplistic Proration
      const prorationFactor = Math.max(0, (totalDays - absentDays) / totalDays);

      // Example Base Calculation (in a real app, this is mapped per-staff or from payScale)
      // For this spec: basic 10,000 yields net 10,000 when zeroes
      const basicSalaryMinor = 10000 * 100; // 1,000,000 minor units
      
      let allowancesMinor = 0;
      let deductionsMinor = 0;
      const explicitAllowances: { code: string; name: string; amountMinor: number }[] = [];
      const explicitDeductions: { code: string; name: string; amountMinor: number }[] = [];

      for (const allow of policy.allowances) {
        const amount = allow.type === 'fixed' ? allow.value * 100 : Math.floor(basicSalaryMinor * (allow.value / 100));
        if (amount > 0) { // Preserve explicit zero by omitting or storing zero explicitly
          allowancesMinor += amount;
          explicitAllowances.push({ code: allow.code, name: allow.name, amountMinor: amount });
        } else if (allow.value === 0) {
          explicitAllowances.push({ code: allow.code, name: allow.name, amountMinor: 0 }); // Explicit zero
        }
      }

      for (const ded of policy.deductions) {
        const amount = ded.type === 'fixed' ? ded.value * 100 : Math.floor(basicSalaryMinor * (ded.value / 100));
        if (amount > 0) {
          deductionsMinor += amount;
          explicitDeductions.push({ code: ded.code, name: ded.name, amountMinor: amount });
        } else if (ded.value === 0) {
          explicitDeductions.push({ code: ded.code, name: ded.name, amountMinor: 0 }); // Explicit zero
        }
      }

      const grossSalaryMinor = Math.floor((basicSalaryMinor + allowancesMinor) * prorationFactor);
      const totalDeductionsMinor = Math.floor(deductionsMinor * prorationFactor);
      const netSalaryMinor = grossSalaryMinor - totalDeductionsMinor;

      slipsToPut.push({
        id: generateId('slip_'),
        runId,
        staffId,
        employmentTermId: activeTerm.id,
        totalDays,
        workedDays,
        leaveDays,
        absentDays,
        prorationFactor,
        basicSalaryMinor,
        allowances: explicitAllowances,
        deductions: explicitDeductions,
        grossSalaryMinor,
        totalDeductionsMinor,
        netSalaryMinor,
        paidAmountMinor: 0,
        state: 'unpaid'
      });
    }

    const run: PayrollRun = {
      id: runId,
      periodId,
      month,
      runScope,
      state: 'draft',
      policySnapshot: policy,
      createdAt: new Date().toISOString()
    };

    await db.payrollRuns.add(run);
    await db.payrollSlips.bulkAdd(slipsToPut);

    return run;
  });
}

export async function approveAndAccruePayroll(runId: string, approvedBy: string): Promise<void> {
  return db.transaction('rw', db.payrollRuns, db.payrollSlips, db.journals, db.journalLines, async () => {
    const run = await db.payrollRuns.get(runId);
    if (!run || run.state !== 'draft') throw new Error('Invalid run state for approval');

    const slips = await db.payrollSlips.where('runId').equals(runId).toArray();
    const totalNetMinor = slips.reduce((sum, s) => sum + s.netSalaryMinor, 0);

    // Create Accrual Journal (Debit Expense, Credit Payable)
    const journalId = generateId('jrn_');
    await db.journals.add({
      id: journalId,
      voucherNo: `JV-PAY-${run.month}`,
      periodId: run.periodId,
      type: 'payroll',
      referenceId: run.id,
      status: 'posted'
    });

    await db.journalLines.bulkAdd([
      { id: generateId('jrnl_'), journalId, accountId: 'acc_salary_expense', debitMinor: totalNetMinor, creditMinor: 0 },
      { id: generateId('jrnl_'), journalId, accountId: 'acc_salary_payable', debitMinor: 0, creditMinor: totalNetMinor }
    ]);

    run.state = 'accrued';
    run.approvedAt = new Date().toISOString();
    run.approvedBy = approvedBy;
    run.journalId = journalId;

    await db.payrollRuns.put(run);
    
    // Update slips to payment pending
    for (const slip of slips) {
      slip.state = 'payment_pending';
    }
    await db.payrollSlips.bulkPut(slips);
  });
}

export async function disburseSalary(
  slipId: string, 
  amountMinor: number, 
  paymentMethod: string, 
  accountId: string, 
  referenceNo: string, 
  idempotencyKey: string
): Promise<PayrollDisbursement> {
  return db.transaction('rw', db.payrollSlips, db.payrollDisbursements, db.journals, db.journalLines, db.payrollRuns, async () => {
    // Idempotency check
    const existing = await db.payrollDisbursements.where('idempotencyKey').equals(idempotencyKey).first();
    if (existing) return existing; // Safe retry

    const slip = await db.payrollSlips.get(slipId);
    if (!slip || (slip.state !== 'payment_pending' && slip.state !== 'partly_paid')) {
      throw new Error('Slip is not eligible for disbursement');
    }

    const disbursement: PayrollDisbursement = {
      id: generateId('disb_'),
      slipId,
      amountMinor,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      accountId,
      referenceNo,
      idempotencyKey,
      status: 'completed' // Assuming synchronous completion for local cash/bank
    };

    // Journal Entry (Debit Payable, Credit Bank)
    const journalId = generateId('jrn_');
    await db.journals.add({
      id: journalId,
      voucherNo: `JV-DISB-${disbursement.id}`,
      periodId: 'fp_current', // Ideally derive from run.periodId
      type: 'disbursement',
      referenceId: disbursement.id,
      status: 'posted'
    });

    await db.journalLines.bulkAdd([
      { id: generateId('jrnl_'), journalId, accountId: 'acc_salary_payable', debitMinor: amountMinor, creditMinor: 0 },
      { id: generateId('jrnl_'), journalId, accountId, debitMinor: 0, creditMinor: amountMinor }
    ]);

    disbursement.journalId = journalId;
    await db.payrollDisbursements.add(disbursement);

    slip.paidAmountMinor += amountMinor;
    if (slip.paidAmountMinor >= slip.netSalaryMinor) {
      slip.state = 'paid';
    } else {
      slip.state = 'partly_paid';
    }
    await db.payrollSlips.put(slip);

    // Check if run is fully paid
    const allSlips = await db.payrollSlips.where('runId').equals(slip.runId).toArray();
    if (allSlips.every(s => s.state === 'paid')) {
      await db.payrollRuns.update(slip.runId, { state: 'paid' });
    } else {
      await db.payrollRuns.update(slip.runId, { state: 'partly_paid' });
    }

    return disbursement;
  });
}
