import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../db/database';
import { createInvoice, postReceipt, reverseReceipt, getStudentBalance } from '../services/financeService';
import { generateId } from '../utils/generateId';

describe('Phase 09: Finance & Accounting Engine', () => {
  beforeAll(async () => {
    // Clear the DB to ensure a clean state
    await db.accounts.clear();
    await db.fiscalPeriods.clear();
    await db.feeHeads.clear();
    await db.invoices.clear();
    await db.invoiceLines.clear();
    await db.receipts.clear();
    await db.receiptAllocations.clear();
    await db.journals.clear();
    await db.journalLines.clear();
    
    // Setup basic chart of accounts
    await db.accounts.bulkAdd([
      { id: 'acc_cash', code: '1001', name: 'Cash', type: 'asset' },
      { id: 'acc_ar', code: '1201', name: 'Accounts Receivable', type: 'asset' },
      { id: 'acc_tuition', code: '4001', name: 'Tuition Fee Income', type: 'income' },
      { id: 'acc_advance', code: '2101', name: 'Advance', type: 'liability' }
    ]);
    await db.fiscalPeriods.add({ id: 'fp_current', name: 'Current', startDate: '2026-01-01', endDate: '2026-12-31', isClosed: false });
  });

  it('Billing 100 students at 500 yields 50,000', async () => {
    let totalBilled = 0;
    const studentIds = Array.from({ length: 100 }).map((_, i) => "st_" + i);
    
    // Bill 100 students 500 each (in minor units: 50000 paisa/cents)
    for (const st of studentIds) {
      await createInvoice(
        st, 'fp_current', 
        [{ feeHeadId: 'fh_tuition', amountMinor: 50000, incomeAccountId: 'acc_tuition' }], 
        'acc_ar', '2026-01-01', '2026-01-15'
      );
    }

    const allInvoices = await db.invoices.toArray();
    totalBilled = allInvoices.reduce((sum, inv) => sum + inv.totalAmountMinor, 0);
    expect(totalBilled).toBe(100 * 50000); // 5,000,000 minor units = 50,000 major units

    // Check AR balance in ledger
    const arLines = await db.journalLines.where('accountId').equals('acc_ar').toArray();
    const arBalance = arLines.reduce((sum, l) => sum + (l.debitMinor || 0) - (l.creditMinor || 0), 0);
    expect(arBalance).toBe(5000000);
  });

  it('A 200 allocation against 500 leaves 300 due', async () => {
    // Check balance of st_0 before payment
    const balBefore = await getStudentBalance('st_0');
    expect(balBefore.billed).toBe(50000);
    expect(balBefore.balance).toBe(50000);

    // Make a 200 payment (20000 minor units)
    const invoice = await db.invoices.where('studentId').equals('st_0').first();
    await postReceipt('st_0', 'fp_current', 20000, 'cash', 'acc_cash', 
      [{ invoiceId: invoice!.id, amountMinor: 20000, receivableAccountId: 'acc_ar' }], 
      'acc_advance', '2026-01-05'
    );

    const balAfter = await getStudentBalance('st_0');
    expect(balAfter.paid).toBe(20000);
    expect(balAfter.balance).toBe(30000); // 300 left
    expect(balAfter.advance).toBe(0);
  });

  it('Advance payment correctly tracked', async () => {
    // Pay 500 when only 300 is due
    const invoice = await db.invoices.where('studentId').equals('st_0').first();
    
    // Receipt for 50000, but only allocate 30000 to invoice. 20000 becomes advance.
    await postReceipt('st_0', 'fp_current', 50000, 'cash', 'acc_cash', 
      [{ invoiceId: invoice!.id, amountMinor: 30000, receivableAccountId: 'acc_ar' }], 
      'acc_advance', '2026-01-10'
    );

    const bal = await getStudentBalance('st_0');
    expect(bal.balance).toBe(0); // 50000 billed, 50000 allocated
    expect(bal.advance).toBe(20000); // 200 advance
  });

  it('Reversing a receipt restores balance and balances journals', async () => {
    const balBefore = await getStudentBalance('st_1');
    const invoice = await db.invoices.where('studentId').equals('st_1').first();
    
    const receipt = await postReceipt('st_1', 'fp_current', 50000, 'cash', 'acc_cash', 
      [{ invoiceId: invoice!.id, amountMinor: 50000, receivableAccountId: 'acc_ar' }], 
      'acc_advance', '2026-01-05'
    );

    let bal = await getStudentBalance('st_1');
    expect(bal.balance).toBe(0); // Paid in full

    // Now reverse the receipt
    await reverseReceipt(receipt.id, 'fp_current', 'admin', 'Wrong student');

    bal = await getStudentBalance('st_1');
    expect(bal.balance).toBe(50000); // Balance restored

    // Ensure double entry still balances for the reversal journal
    const revJournal = await db.journals.where('type').equals('reversal').first();
    const revLines = await db.journalLines.where('journalId').equals(revJournal!.id).toArray();
    
    const debits = revLines.reduce((sum, l) => sum + (l.debitMinor || 0), 0);
    const credits = revLines.reduce((sum, l) => sum + (l.creditMinor || 0), 0);
    expect(debits).toBe(50000);
    expect(credits).toBe(50000);
    expect(debits).toEqual(credits);
  });
});
