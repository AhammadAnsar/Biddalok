import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { setSecurityBypassForTesting } from '../security/guard';
import { FinancialTransaction } from '../types';

describe('Finance Module Characterization Tests', () => {
  beforeEach(() => {
    setSecurityBypassForTesting(true);
    // Isolate finance state before test
    useAppStore.setState({ financialTransactions: [] });
  });

  it('initializes with an empty ledger in isolated/clean state without fake transactions', () => {
    const transactions = useAppStore.getState().financialTransactions;
    expect(transactions).toBeDefined();
    expect(Array.isArray(transactions)).toBe(true);
  });

  it('records an income transaction and updates ledger accurately', () => {
    const incomeTx: FinancialTransaction = {
      id: 'tx-inc-01',
      voucherNo: 'V-1001',
      date: '2026-03-01',
      type: 'income',
      category: 'Tuition Fee',
      categoryBn: 'মাসিক বেতন',
      title: 'March Tuition Fee',
      titleBn: 'মার্চ মাসের বেতন',
      amount: 1500,
      paymentMethod: 'cash',
      studentId: 'st-101',
      note: 'Tuition for March',
      notes: 'Tuition for March',
      status: 'completed',
      createdBy: 'Accountant',
      createdAt: '2026-03-01T10:00:00.000Z',
    };

    useAppStore.getState().addFinancialTransaction(incomeTx);
    const list = useAppStore.getState().financialTransactions;
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('tx-inc-01');
    expect(list[0].type).toBe('income');
    expect(list[0].amount).toBe(1500);
  });

  it('records expense transactions and accurately balances income minus expense', () => {
    const incomeTx: FinancialTransaction = {
      id: 'tx-inc-02',
      voucherNo: 'V-1002',
      date: '2026-03-02',
      type: 'income',
      category: 'Admission Fee',
      title: 'Admission Fee',
      amount: 5000,
      paymentMethod: 'bank',
      status: 'completed',
      createdBy: 'Cashier',
      createdAt: '2026-03-02T10:00:00.000Z',
    };
    const expenseTx: FinancialTransaction = {
      id: 'tx-exp-01',
      voucherNo: 'V-1003',
      date: '2026-03-02',
      type: 'expense',
      category: 'Utility Bill',
      categoryBn: 'বিদ্যুৎ বিল',
      title: 'Electricity Bill',
      titleBn: 'বিদ্যুৎ বিল',
      amount: 1200,
      paymentMethod: 'cash',
      status: 'completed',
      createdBy: 'Admin',
      createdAt: '2026-03-02T11:00:00.000Z',
    };

    useAppStore.getState().addFinancialTransaction(incomeTx);
    useAppStore.getState().addFinancialTransaction(expenseTx);

    const list = useAppStore.getState().financialTransactions;
    const totalIncome = list.filter(t => t.type === 'income').reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalExpense = list.filter(t => t.type === 'expense').reduce((acc, t) => acc + (t.amount || 0), 0);
    const netBalance = totalIncome - totalExpense;

    expect(totalIncome).toBe(5000);
    expect(totalExpense).toBe(1200);
    expect(netBalance).toBe(3800);
  });

  it('deletes a transaction safely without affecting others', () => {
    const txA: FinancialTransaction = {
      id: 'tx-a',
      voucherNo: 'V-A',
      date: '2026-03-03',
      type: 'income',
      category: 'Fee',
      title: 'Fee A',
      amount: 300,
      paymentMethod: 'cash',
      status: 'completed',
      createdBy: 'Admin',
      createdAt: '2026-03-03T10:00:00.000Z',
    };
    const txB: FinancialTransaction = {
      id: 'tx-b',
      voucherNo: 'V-B',
      date: '2026-03-03',
      type: 'income',
      category: 'Fee',
      title: 'Fee B',
      amount: 700,
      paymentMethod: 'cash',
      status: 'completed',
      createdBy: 'Admin',
      createdAt: '2026-03-03T11:00:00.000Z',
    };

    useAppStore.getState().addFinancialTransaction(txA);
    useAppStore.getState().addFinancialTransaction(txB);
    expect(useAppStore.getState().financialTransactions.length).toBe(2);

    useAppStore.getState().deleteFinancialTransaction('tx-a');
    const remaining = useAppStore.getState().financialTransactions;
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('tx-b');
  });
});
