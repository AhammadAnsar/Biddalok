export interface Account {
  id: string;
  code: string;
  name: string;
  nameBn?: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  isBank?: boolean;
}

export interface FiscalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface FeeHead {
  id: string;
  name: string;
  nameBn?: string;
  defaultAmountMinor: number;
  accountId: string; // income account
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  date: string;
  dueDate: string;
  periodId: string;
  totalAmountMinor: number;
  status: 'draft' | 'posted' | 'canceled';
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  feeHeadId: string;
  amountMinor: number;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  studentId: string;
  date: string;
  amountMinor: number;
  paymentMethod: string;
  accountId: string; // cash/bank asset account
  status: 'draft' | 'posted' | 'reversed';
  reversedById?: string;
  reversalReason?: string;
}

export interface ReceiptAllocation {
  id: string;
  receiptId: string;
  invoiceId: string;
  amountMinor: number;
}

export interface Journal {
  id: string;
  voucherNo: string;
  date: string;
  periodId: string;
  description: string;
  type: 'invoice' | 'receipt' | 'reversal' | 'manual' | 'migration';
  referenceId?: string; // invoiceId or receiptId
  status: 'posted' | 'reversed';
}

export interface JournalLine {
  id: string;
  journalId: string;
  accountId: string;
  debitMinor: number;
  creditMinor: number;
}

export interface Concession {
  id: string;
  studentId: string;
  invoiceId: string;
  feeHeadId: string;
  amountMinor: number;
  reason: string;
  status: 'approved' | 'reversed';
  journalId?: string; // Links to the adjustment journal
}

export interface Refund {
  id: string;
  studentId: string;
  receiptId: string;
  amountMinor: number;
  reason: string;
  date: string;
  status: 'posted';
  journalId?: string;
}

// Student Financial Summary DTO
export interface StudentFinancialSummary {
  studentId: string;
  totalBilled: number; // minor units
  totalPaid: number;
  totalConcession: number;
  totalRefunded: number;
  balanceDue: number; // Positive means they owe, negative means advance
}
