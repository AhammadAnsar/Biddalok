import React, { useState } from 'react';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { getModulesByCategory } from '../data/capabilityRegistry';
import { FinancialTransactionsLedger } from '../components/finance/FinancialTransactionsLedger';
import { FinanceDashboardWidget } from '../components/finance/FinanceDashboardWidget';
import { FileText, LayoutGrid, DollarSign, Zap } from 'lucide-react';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'modules'>('ledger');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                অর্থ ও হিসাব ব্যবস্থাপনা (Finance & Accounts)
              </h1>
              <p className="text-xs text-slate-500">
                ফি কালেকশন, দৈনিক আয়-ব্যয়, ডিজিটাল ভাউচার খতিয়ান এবং আর্থিক প্রতিবেদন।
              </p>
            </div>
          </div>
        </div>

        <FinanceDashboardWidget />
        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>লেনদেন ও ভাউচার লেজার</span>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold border border-emerald-200">
              <Zap className="w-2.5 h-2.5 fill-emerald-600" />
              <span>ভার্চুয়াল</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'modules'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>সকল সাব-মডিউল ({getModulesByCategory('finance').length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'ledger' ? (
        <FinancialTransactionsLedger />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <SubModuleGrid
            titleEn="Finance & Accounts Modules"
            titleBn="অর্থ ও হিসাব মডিউলসমূহ"
            descriptionEn="Select a sub-module to manage specific financial activities."
            descriptionBn="নির্দিষ্ট আর্থিক কার্যক্রম পরিচালনা করতে নিচের সাব-মডিউল নির্বাচন করুন।"
            modules={getModulesByCategory('finance')}
          />
        </div>
      )}
    </div>
  );
};

export default Finance;
