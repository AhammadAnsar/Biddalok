import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';

export const FinanceDashboardWidget: React.FC = () => {
  // Query actual ledger balances
  const balances = useLiveQuery(async () => {
    const lines = await db.journalLines.toArray();
    const accounts = await db.accounts.toArray();
    const accountsMap = new Map(accounts.map(a => [a.id, a]));

    let totalCashBank = 0;
    let totalReceivables = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    for (const line of lines) {
      const account = accountsMap.get(line.accountId);
      if (!account) continue;

      const balanceMinor = (line.debitMinor || 0) - (line.creditMinor || 0);
      const isDebitNormal = account.type === 'asset' || account.type === 'expense';
      const actualBalance = isDebitNormal ? balanceMinor : -balanceMinor;

      if (account.id === 'acc_cash' || account.id === 'acc_bank' || account.isBank) {
        totalCashBank += actualBalance;
      } else if (account.id === 'acc_ar') {
        totalReceivables += actualBalance;
      } else if (account.type === 'income') {
        totalIncome += actualBalance;
      } else if (account.type === 'expense') {
        totalExpense += actualBalance;
      }
    }

    return {
      cashBank: totalCashBank / 100, // convert back to major units
      receivables: totalReceivables / 100,
      income: totalIncome / 100,
      expense: totalExpense / 100
    };
  }, [], { cashBank: 0, receivables: 0, income: 0, expense: 0 });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
        <div className="text-emerald-700 text-xs font-bold mb-1">Cash & Bank</div>
        <div className="text-xl font-black text-emerald-900">৳ {balances.cashBank.toLocaleString()}</div>
      </div>
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
        <div className="text-amber-700 text-xs font-bold mb-1">Accounts Receivable</div>
        <div className="text-xl font-black text-amber-900">৳ {balances.receivables.toLocaleString()}</div>
      </div>
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
        <div className="text-indigo-700 text-xs font-bold mb-1">Total Income</div>
        <div className="text-xl font-black text-indigo-900">৳ {balances.income.toLocaleString()}</div>
      </div>
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
        <div className="text-rose-700 text-xs font-bold mb-1">Total Expense</div>
        <div className="text-xl font-black text-rose-900">৳ {balances.expense.toLocaleString()}</div>
      </div>
    </div>
  );
};
