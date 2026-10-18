import { db } from '../database';
import { generateId } from '../../utils/generateId';

export async function migratePhase09Finance() {
  return db.transaction('rw', [
    db.financialTransactions, db.accounts, db.feeHeads, db.invoices, 
    db.invoiceLines, db.receipts, db.receiptAllocations, db.journals, 
    db.journalLines, db.fiscalPeriods, db.quarantineRecords
  ], async () => {
    
    const count = await db.accounts.count();
    if (count > 0) return; // Already migrated

    // 1. Setup default chart of accounts
    const accounts = [
      { id: 'acc_cash', code: '1001', name: 'Cash in Hand', type: 'asset', isBank: false },
      { id: 'acc_bank', code: '1002', name: 'Main Bank Account', type: 'asset', isBank: true },
      { id: 'acc_ar', code: '1201', name: 'Accounts Receivable', type: 'asset', isBank: false },
      { id: 'acc_advance', code: '2101', name: 'Student Advance / Unallocated Credit', type: 'liability', isBank: false },
      { id: 'acc_tuition', code: '4001', name: 'Tuition Fee Income', type: 'income', isBank: false },
      { id: 'acc_admission', code: '4002', name: 'Admission Fee Income', type: 'income', isBank: false },
      { id: 'acc_general_expense', code: '5001', name: 'General Expense', type: 'expense', isBank: false }
    ];
    await db.accounts.bulkAdd(accounts);

    // 2. Setup default fee heads
    const feeHeads = [
      { id: 'fh_tuition', name: 'Tuition Fee', accountId: 'acc_tuition', defaultAmountMinor: 50000 },
      { id: 'fh_admission', name: 'Admission Fee', accountId: 'acc_admission', defaultAmountMinor: 100000 }
    ];
    await db.feeHeads.bulkAdd(feeHeads);

    // 3. Setup default fiscal period (current year)
    const year = new Date().getFullYear();
    const periodId = 'fp_' + year;
    await db.fiscalPeriods.add({
      id: periodId,
      name: `FY ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      isClosed: false
    });

    // 4. Migrate old transactions
    const oldTxns = await db.financialTransactions.toArray();
    
    for (const txn of oldTxns) {
      if (txn.type === 'expense') {
        // Simple expense journal
        const jrnId = generateId('jrn_');
        await db.journals.add({
          id: jrnId,
          voucherNo: txn.voucherNo || `JV-EXP-${Date.now()}`,
          date: txn.date,
          periodId: periodId,
          description: txn.title || 'Migrated Expense',
          type: 'migration',
          referenceId: txn.id,
          status: 'posted'
        });
        await db.journalLines.bulkAdd([
          { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_general_expense', debitMinor: txn.amount * 100, creditMinor: 0 },
          { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_cash', debitMinor: 0, creditMinor: txn.amount * 100 }
        ]);
      } else if (txn.type === 'income') {
        if (txn.studentId) {
          // Received from student. Create invoice AND receipt (cash basis assumption for old data)
          const amountMinor = txn.amount * 100;
          
          // Invoice
          const invId = generateId('inv_');
          await db.invoices.add({
            id: invId,
            invoiceNo: `INV-MIG-${txn.voucherNo || Date.now()}`,
            studentId: txn.studentId,
            date: txn.date,
            dueDate: txn.date,
            periodId: periodId,
            totalAmountMinor: amountMinor,
            status: 'posted'
          });
          
          await db.invoiceLines.add({
            id: generateId('invl_'),
            invoiceId: invId,
            feeHeadId: txn.category === 'admission_fee' ? 'fh_admission' : 'fh_tuition',
            amountMinor: amountMinor
          });

          // Invoice Journal
          const invJrnId = generateId('jrn_');
          await db.journals.add({
            id: invJrnId,
            voucherNo: `JV-INV-${txn.id}`,
            date: txn.date,
            periodId: periodId,
            description: 'Migrated Invoice',
            type: 'migration',
            referenceId: invId,
            status: 'posted'
          });
          await db.journalLines.bulkAdd([
            { id: generateId('jrnl_'), journalId: invJrnId, accountId: 'acc_ar', debitMinor: amountMinor, creditMinor: 0 },
            { id: generateId('jrnl_'), journalId: invJrnId, accountId: txn.category === 'admission_fee' ? 'acc_admission' : 'acc_tuition', debitMinor: 0, creditMinor: amountMinor }
          ]);

          // Receipt
          const recId = generateId('rec_');
          await db.receipts.add({
            id: recId,
            receiptNo: `REC-MIG-${txn.voucherNo || Date.now()}`,
            studentId: txn.studentId,
            date: txn.date,
            amountMinor: amountMinor,
            paymentMethod: txn.paymentMethod || 'cash',
            accountId: 'acc_cash',
            status: 'posted'
          });

          // Allocation
          await db.receiptAllocations.add({
            id: generateId('reca_'),
            receiptId: recId,
            invoiceId: invId,
            amountMinor: amountMinor
          });

          // Receipt Journal
          const recJrnId = generateId('jrn_');
          await db.journals.add({
            id: recJrnId,
            voucherNo: `JV-REC-${txn.id}`,
            date: txn.date,
            periodId: periodId,
            description: 'Migrated Receipt',
            type: 'migration',
            referenceId: recId,
            status: 'posted'
          });
          await db.journalLines.bulkAdd([
            { id: generateId('jrnl_'), journalId: recJrnId, accountId: 'acc_cash', debitMinor: amountMinor, creditMinor: 0 },
            { id: generateId('jrnl_'), journalId: recJrnId, accountId: 'acc_ar', debitMinor: 0, creditMinor: amountMinor }
          ]);

        } else {
          // General income
          const jrnId = generateId('jrn_');
          await db.journals.add({
            id: jrnId,
            voucherNo: txn.voucherNo || `JV-INC-${Date.now()}`,
            date: txn.date,
            periodId: periodId,
            description: txn.title || 'Migrated Income',
            type: 'migration',
            referenceId: txn.id,
            status: 'posted'
          });
          await db.journalLines.bulkAdd([
            { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_cash', debitMinor: txn.amount * 100, creditMinor: 0 },
            { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_tuition', debitMinor: 0, creditMinor: txn.amount * 100 }
          ]);
        }
      }
    }

  });
}
