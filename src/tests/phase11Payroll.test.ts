import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db/database';
import { createPayrollRun, approveAndAccruePayroll, disburseSalary } from '../services/payrollService';
import { markAttendance } from '../services/hrService';

describe('Phase 11: Payroll calculation and disbursement', () => {
  beforeAll(async () => {
    await db.payrollDisbursements.clear();
    await db.payrollSlips.clear();
    await db.payrollRuns.clear();
    await db.payPolicies.clear();
    await db.journals.clear();
    await db.journalLines.clear();
    await db.staffAttendance.clear();
    await db.employmentTerms.clear();
    await db.staff.clear();

    // 1 Staff Member
    await db.staff.add({ id: 'stf_100', customStaffId: 'STF-100', staffType: 'teaching', name: 'Hasib', designation: 'Teacher', role: 'teacher', contact: '' });
    await db.employmentTerms.add({ id: 'term_100', staffId: 'stf_100', startDate: '2026-01-01', status: 'active' });

    // Mark 30 days present for 2026-04
    for (let i = 1; i <= 30; i++) {
      const d = i < 10 ? `0${i}` : `${i}`;
      await markAttendance('stf_100', `2026-04-${d}`, 'present', '08:00', '16:00', 'manual', 'admin');
    }
  });

  it('Calculates correctly with explicit zero allowances/deductions (10000 basic yields 10000 net)', async () => {
    // Insert zero policy
    const policyId = 'pol_test';
    await db.payPolicies.add({
      id: policyId,
      effectiveDate: '2026-01-01',
      currencyRounding: 'none',
      allowances: [{ code: 'HOUSE', name: 'House Rent', type: 'fixed', value: 0 }], // explicit zero
      deductions: [{ code: 'TAX', name: 'Tax', type: 'fixed', value: 0 }] // explicit zero
    });

    const run = await createPayrollRun('2026-04', 'all', 'fp_1', policyId, ['stf_100']);
    expect(run.state).toBe('draft');
    expect(run.policySnapshot.allowances[0].value).toBe(0);

    const slips = await db.payrollSlips.where('runId').equals(run.id).toArray();
    expect(slips.length).toBe(1);

    const slip = slips[0];
    expect(slip.basicSalaryMinor).toBe(1000000); // 10k
    
    // Allowances and deductions arrays preserve the explicit zero
    expect(slip.allowances.length).toBe(1);
    expect(slip.allowances[0].amountMinor).toBe(0);
    
    expect(slip.grossSalaryMinor).toBe(1000000);
    expect(slip.totalDeductionsMinor).toBe(0);
    expect(slip.netSalaryMinor).toBe(1000000);
    expect(slip.state).toBe('unpaid');
  });

  it('Changing period logic (duplicate run protection)', async () => {
    // Should throw error if creating another active run for 2026-04 'all'
    const policy = await db.payPolicies.toCollection().first();
    await expect(
      createPayrollRun('2026-04', 'all', 'fp_1', policy!.id, ['stf_100'])
    ).rejects.toThrow('An active payroll run already exists');
  });

  it('Approving run accrues liability in journals', async () => {
    const run = await db.payrollRuns.toCollection().first();
    await approveAndAccruePayroll(run!.id, 'admin');

    const updatedRun = await db.payrollRuns.get(run!.id);
    expect(updatedRun!.state).toBe('accrued');
    expect(updatedRun!.journalId).toBeTruthy();

    const slip = await db.payrollSlips.toCollection().first();
    expect(slip!.state).toBe('payment_pending');

    const lines = await db.journalLines.where('journalId').equals(updatedRun!.journalId!).toArray();
    expect(lines.length).toBe(2);
    
    const expense = lines.find(l => l.accountId === 'acc_salary_expense');
    expect(expense!.debitMinor).toBe(1000000);
    
    const payable = lines.find(l => l.accountId === 'acc_salary_payable');
    expect(payable!.creditMinor).toBe(1000000);
  });

  it('Failed/pending transfers never show paid, idempotency protects retries', async () => {
    const slip = await db.payrollSlips.toCollection().first();
    
    // Attempt disbursement
    const d1 = await disburseSalary(slip!.id, 500000, 'bank', 'acc_bank_1', 'REF001', 'idemp_key_1');
    expect(d1.amountMinor).toBe(500000);
    
    // Retry with same idempotency key
    const d2 = await disburseSalary(slip!.id, 500000, 'bank', 'acc_bank_1', 'REF001', 'idemp_key_1');
    expect(d2.id).toBe(d1.id); // Same object returned

    const updatedSlip = await db.payrollSlips.get(slip!.id);
    expect(updatedSlip!.paidAmountMinor).toBe(500000); // Only 5k paid out of 10k
    expect(updatedSlip!.state).toBe('partly_paid');
  });

  it('Full disbursement settles run state and payable journal', async () => {
    const slip = await db.payrollSlips.toCollection().first();
    
    // Pay remaining 500000
    await disburseSalary(slip!.id, 500000, 'bank', 'acc_bank_1', 'REF002', 'idemp_key_2');

    const finalSlip = await db.payrollSlips.get(slip!.id);
    expect(finalSlip!.paidAmountMinor).toBe(1000000);
    expect(finalSlip!.state).toBe('paid');

    const run = await db.payrollRuns.get(finalSlip!.runId);
    expect(run!.state).toBe('paid');

    // Total Journal Entries for acc_salary_payable
    const lines = await db.journalLines.where('accountId').equals('acc_salary_payable').toArray();
    const totalCredit = lines.reduce((sum, l) => sum + (l.creditMinor || 0), 0);
    const totalDebit = lines.reduce((sum, l) => sum + (l.debitMinor || 0), 0);
    
    expect(totalCredit).toBe(1000000); // from accrual
    expect(totalDebit).toBe(1000000); // 500000 + 500000 from two disbursements
    expect(totalCredit - totalDebit).toBe(0); // Account cleared!
  });
});
