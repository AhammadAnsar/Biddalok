import { db } from '../db/database';
import { generateId } from '../utils/generateId';
import { Journal, JournalLine, Invoice, InvoiceLine, Receipt, ReceiptAllocation, Concession, Refund } from '../types/finance';

// Helper to ensure journals balance
function validateJournalBalance(lines: Partial<JournalLine>[]) {
  const debitSum = lines.reduce((sum, line) => sum + (line.debitMinor || 0), 0);
  const creditSum = lines.reduce((sum, line) => sum + (line.creditMinor || 0), 0);
  if (debitSum !== creditSum) {
    throw new Error(`Journal does not balance. Debits: ${debitSum}, Credits: ${creditSum}`);
  }
}

export async function createInvoice(
  studentId: string,
  periodId: string,
  lines: { feeHeadId: string, amountMinor: number, incomeAccountId: string }[],
  receivableAccountId: string,
  date: string,
  dueDate: string
): Promise<Invoice> {
  return db.transaction('rw', db.invoices, db.invoiceLines, db.journals, db.journalLines, async () => {
    // 1. Create Invoice
    const invoiceId = generateId('inv_');
    const totalAmountMinor = lines.reduce((sum, l) => sum + l.amountMinor, 0);
    
    const invoice: Invoice = {
      id: invoiceId,
      invoiceNo: `INV-${Date.now()}`,
      studentId,
      date,
      dueDate,
      periodId,
      totalAmountMinor,
      status: 'posted'
    };
    await db.invoices.add(invoice);

    // 2. Create Invoice Lines
    const invoiceLines: InvoiceLine[] = lines.map(l => ({
      id: generateId('invl_'),
      invoiceId,
      feeHeadId: l.feeHeadId,
      amountMinor: l.amountMinor
    }));
    await db.invoiceLines.bulkAdd(invoiceLines);

    // 3. Post Journal (Debit AR, Credit Incomes)
    const journalId = generateId('jrn_');
    const journalLines: Partial<JournalLine>[] = [
      { accountId: receivableAccountId, debitMinor: totalAmountMinor, creditMinor: 0 }
    ];
    lines.forEach(l => {
      journalLines.push({ accountId: l.incomeAccountId, debitMinor: 0, creditMinor: l.amountMinor });
    });
    validateJournalBalance(journalLines);

    const journal: Journal = {
      id: journalId,
      voucherNo: `JV-${Date.now()}`,
      date,
      periodId,
      description: `Invoice ${invoice.invoiceNo} for student ${studentId}`,
      type: 'invoice',
      referenceId: invoiceId,
      status: 'posted'
    };
    await db.journals.add(journal);
    await db.journalLines.bulkAdd(journalLines.map(l => ({ ...l, id: generateId('jrnl_'), journalId } as JournalLine)));

    return invoice;
  });
}

export async function postReceipt(
  studentId: string,
  periodId: string,
  amountMinor: number,
  paymentMethod: string,
  cashAccountId: string,
  allocations: { invoiceId: string, amountMinor: number, receivableAccountId: string }[],
  advanceAccountId: string,
  date: string
): Promise<Receipt> {
  return db.transaction('rw', db.receipts, db.receiptAllocations, db.journals, db.journalLines, db.invoices, async () => {
    const allocatedAmount = allocations.reduce((sum, a) => sum + a.amountMinor, 0);
    if (allocatedAmount > amountMinor) {
      throw new Error('Cannot allocate more than receipt amount');
    }
    const advanceAmount = amountMinor - allocatedAmount;

    // 1. Create Receipt
    const receiptId = generateId('rec_');
    const receipt: Receipt = {
      id: receiptId,
      receiptNo: `REC-${Date.now()}`,
      studentId,
      date,
      amountMinor,
      paymentMethod,
      accountId: cashAccountId,
      status: 'posted'
    };
    await db.receipts.add(receipt);

    // 2. Create Allocations
    if (allocations.length > 0) {
      await db.receiptAllocations.bulkAdd(allocations.map(a => ({
        id: generateId('reca_'),
        receiptId,
        invoiceId: a.invoiceId,
        amountMinor: a.amountMinor
      })));
    }

    // 3. Post Journal (Debit Cash, Credit AR / Advance)
    const journalId = generateId('jrn_');
    const journalLines: Partial<JournalLine>[] = [
      { accountId: cashAccountId, debitMinor: amountMinor, creditMinor: 0 }
    ];
    
    // Group allocations by receivable account just in case
    const arCredits = new Map<string, number>();
    allocations.forEach(a => {
      arCredits.set(a.receivableAccountId, (arCredits.get(a.receivableAccountId) || 0) + a.amountMinor);
    });
    
    arCredits.forEach((amt, accId) => {
      journalLines.push({ accountId: accId, debitMinor: 0, creditMinor: amt });
    });

    if (advanceAmount > 0) {
      journalLines.push({ accountId: advanceAccountId, debitMinor: 0, creditMinor: advanceAmount });
    }

    validateJournalBalance(journalLines);

    const journal: Journal = {
      id: journalId,
      voucherNo: `RV-${Date.now()}`,
      date,
      periodId,
      description: `Receipt ${receipt.receiptNo} for student ${studentId}`,
      type: 'receipt',
      referenceId: receiptId,
      status: 'posted'
    };
    await db.journals.add(journal);
    await db.journalLines.bulkAdd(journalLines.map(l => ({ ...l, id: generateId('jrnl_'), journalId } as JournalLine)));

    return receipt;
  });
}

export async function reverseReceipt(
  receiptId: string,
  periodId: string,
  reversedById: string,
  reversalReason: string
): Promise<void> {
  return db.transaction('rw', db.receipts, db.journals, db.journalLines, async () => {
    const receipt = await db.receipts.get(receiptId);
    if (!receipt || receipt.status !== 'posted') throw new Error('Invalid or already reversed receipt');

    // Find original journal
    const origJournal = await db.journals.where('referenceId').equals(receiptId).first();
    if (!origJournal) throw new Error('Original journal not found');

    const origLines = await db.journalLines.where('journalId').equals(origJournal.id).toArray();

    // Create reversing journal (flip debits and credits)
    const revJournalId = generateId('jrn_');
    const revLines: Partial<JournalLine>[] = origLines.map(l => ({
      accountId: l.accountId,
      debitMinor: l.creditMinor,
      creditMinor: l.debitMinor
    }));
    validateJournalBalance(revLines);

    await db.journals.add({
      id: revJournalId,
      voucherNo: `REV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      periodId,
      description: `Reversal of Receipt ${receipt.receiptNo}: ${reversalReason}`,
      type: 'reversal',
      referenceId: receiptId,
      status: 'posted'
    });
    await db.journalLines.bulkAdd(revLines.map(l => ({ ...l, id: generateId('jrnl_'), journalId: revJournalId } as JournalLine)));

    // Mark receipt as reversed
    await db.receipts.update(receiptId, { status: 'reversed', reversedById, reversalReason });
  });
}

export async function getStudentBalance(studentId: string): Promise<{ billed: number, paid: number, advance: number, balance: number }> {
  // Billed = sum of all posted invoices
  const invoices = await db.invoices.where('studentId').equals(studentId).filter(i => i.status === 'posted').toArray();
  const billed = invoices.reduce((sum, i) => sum + i.totalAmountMinor, 0);

  // Paid allocations against invoices
  const invoiceIds = invoices.map(i => i.id);
  const allocations = await db.receiptAllocations.where('invoiceId').anyOf(invoiceIds).toArray();
  // Filter allocations that belong to 'posted' receipts
  const receiptIds = allocations.map(a => a.receiptId);
  const receipts = await db.receipts.where('id').anyOf(receiptIds).filter(r => r.status === 'posted').toArray();
  const validReceiptIds = new Set(receipts.map(r => r.id));
  const validAllocations = allocations.filter(a => validReceiptIds.has(a.receiptId));
  const paidAllocated = validAllocations.reduce((sum, a) => sum + a.amountMinor, 0);

  // Advance = total posted receipt amounts - allocated amounts
  const allPostedReceipts = await db.receipts.where('studentId').equals(studentId).filter(r => r.status === 'posted').toArray();
  const totalPaid = allPostedReceipts.reduce((sum, r) => sum + r.amountMinor, 0);
  
  // Total allocated globally for this student
  const allStudentReceiptIds = allPostedReceipts.map(r => r.id);
  const allStudentAllocations = await db.receiptAllocations.where('receiptId').anyOf(allStudentReceiptIds).toArray();
  const totalAllocatedGlobally = allStudentAllocations.reduce((sum, a) => sum + a.amountMinor, 0);
  
  const advance = totalPaid - totalAllocatedGlobally;
  
  const balance = billed - totalAllocatedGlobally; // Does not subtract advance from overall balance, usually balance due is positive

  return { billed, paid: totalAllocatedGlobally, advance, balance };
}
