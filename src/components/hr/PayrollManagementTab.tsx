import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StaffMember, PayrollRecordItem } from '../../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { createPayrollRun, approveAndAccruePayroll, disburseSalary } from '../../services/payrollService';
import { PayrollRun, PayrollSlip } from '../../types/payroll';
import { VirtualizedTable } from '../common/VirtualizedTable';
import { 
  DollarSign, Calendar, Printer, CheckCircle2, 
  FileSpreadsheet, Plus, Check, RefreshCw, Eye, 
  CreditCard, Search, ArrowRight, ShieldCheck, Download,
  Filter, CheckCircle, Clock, AlertCircle, X, ChevronRight, Zap
} from 'lucide-react';
import { toast } from '../../utils/toast';

export const PayrollManagementTab: React.FC = () => {
  const { staff, institution, whiteLabel, payrollMonthlySheets, updatePayrollSheet } = useAppStore();

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // Defaults to current YYYY-MM dynamically, removing 2026-02 hardcode
  const [activeSheet, setActiveSheet] = useState<any>(null);
  
  // Fetch active run for month
  const activeRun = useLiveQuery(async () => {
    return await db.payrollRuns.where('[month+runScope]').equals(selectedMonth + 'all').first() || null;
  }, [selectedMonth]);

  const activeSlips = useLiveQuery(async () => {
    if (!activeRun) return [];
    return await db.payrollSlips.where('runId').equals(activeRun.id).toArray();
  }, [activeRun]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const [viewingPayslip, setViewingPayslip] = useState<{
    item: PayrollRecordItem;
    sheet: any;
  } | null>(null);

  const appName = whiteLabel?.enabled && whiteLabel.appName ? whiteLabel.appName : (institution?.name || 'Biddalok ERP');

  // Generate or Fetch Sheet for selected month
  const handleGenerateSheet = async () => {
    try {
      // Create a default zero-allowance test policy if none exists
      let policy = await db.payPolicies.orderBy('effectiveDate').last();
      if (!policy) {
        policy = {
          id: 'policy_test_v1',
          effectiveDate: new Date().toISOString().split('T')[0],
          currencyRounding: 'none',
          allowances: [],
          deductions: []
        };
        await db.payPolicies.add(policy);
      }

      const activeStaffIds = (staff || []).map(s => s.id);
      
      await createPayrollRun(
        selectedMonth, 
        'all', 
        'fp_current', 
        policy.id,
        activeStaffIds
      );
      toast.success('বেতন শিট সফলভাবে তৈরি হয়েছে');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate payroll run');
    }
  };

  const handleApproveRun = async () => {
    if (confirm('Are you sure you want to approve this run? It will accrue balanced journals.')) {
      try {
        await approveAndAccruePayroll(activeRun!.id, 'admin');
        toast.success('Payroll approved and journals accrued.');
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const handleDisburseAll = async () => {
    if (confirm('আপনি কি এই মাসের সকল শিক্ষক ও কর্মচারীর বেতন পরিশোধিত (Paid) হিসেবে চিহ্নিত করতে চান?')) {
      try {
        for (const slip of activeSlips || []) {
           if (slip.state === 'payment_pending' || slip.state === 'partly_paid') {
             await disburseSalary(slip.id, slip.netSalaryMinor - slip.paidAmountMinor, 'cash', 'acc_cash', 'BULK', 'bulk_' + slip.id);
           }
        }
        toast.success('সকল শিক্ষক ও কর্মচারীর বেতন সফলভাবে পরিশোধিত হিসেবে চিহ্নিত হয়েছে');
      } catch (e: any) {
        toast.error(e.message);
      }
    }
  };

  const handleToggleIndividualPayment = (itemId: string) => {
    if (!currentSheet) return;
    const updatedItems = currentSheet.items.map(item => {
      if (item.id === itemId) {
        const isPaid = item.paymentStatus === 'paid';
        return {
          ...item,
          paymentStatus: isPaid ? ('pending' as const) : ('paid' as const),
          paymentDate: isPaid ? undefined : new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });

    const allPaid = updatedItems.every(i => i.paymentStatus === 'paid');
    const newStatus = allPaid ? 'paid' : 'pending';

    updatePayrollSheet(currentSheet.id, {
      status: newStatus,
      items: updatedItems
    });

    setActiveSheet({
      ...currentSheet,
      status: newStatus,
      items: updatedItems
    });
  };

  const currentSheet = activeSheet || (payrollMonthlySheets || []).find(s => s.month === selectedMonth) || (payrollMonthlySheets || [])[0];

  // Filtered items
  const filteredItems = (currentSheet?.items || []).filter(item => {
    if (statusFilter !== 'all' && item.paymentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.nameBn && item.nameBn.includes(q)) ||
        item.customStaffId.toLowerCase().includes(q) ||
        (item.designationBn && item.designationBn.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export Payroll to CSV
  const handleExportPayrollCSV = () => {
    if (!currentSheet) return;

    const headers = [
      'Staff ID',
      'Name',
      'Designation',
      'Pay Code',
      'Basic Salary',
      'House Rent',
      'Medical Allowance',
      'Gross Salary',
      'GPF (10%)',
      'Welfare (6%)',
      'Net Payable',
      'Bank Account',
      'Status'
    ];

    const rows = currentSheet.items.map(item => [
      `"${item.customStaffId || ''}"`,
      `"${item.nameBn || item.name}"`,
      `"${item.designationBn || item.designation}"`,
      `"${item.payCode || ''}"`,
      item.basicSalary,
      item.houseRent,
      item.medicalAllowance,
      item.grossSalary,
      item.gpfDeduction,
      item.welfareDeduction,
      item.netPayable,
      `"${item.bankAccountNumber || 'N/A'}"`,
      item.paymentStatus === 'paid' ? 'Paid' : 'Pending'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Salary_Sheet_${currentSheet.month}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Controls & Month Picker */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>মাসিক বেতন শিট ও পে-রোল (Monthly Payroll & Salary Sheet)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            শিক্ষক ও কর্মচারীদের মূল বেতন, বাড়িভাড়া, চিকিৎসা ভাতা, জিপিএফ ও কল্যাণ তহবিল কর্তনসহ মোট প্রদেয় বেতন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 font-medium">মাস:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleGenerateSheet}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>বেতন শিট তৈরি / রিফ্রেশ</span>
          </button>

          {currentSheet && (
            <>
              <button
                onClick={handleExportPayrollCSV}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                title="CSV এক্সপোর্ট"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>প্রিন্ট</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      {currentSheet && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block">মোট স্টাফ</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{currentSheet.totalStaff} জন</div>
            <span className="text-[10px] text-indigo-600 font-bold">{currentSheet.monthNameBn}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block">মোট মূল বেতন (Basic)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">৳{currentSheet.totalBasic.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-medium">জাতীয় পে-স্কেল অনুযায়ী</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block">মোট ভাতা (Allowances)</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">৳{currentSheet.totalAllowances.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-medium">বাড়িভাড়া + চিকিৎসা ভাতা</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 block">মোট কর্তন (Deductions)</span>
            <div className="text-2xl font-black text-rose-600 mt-1">৳{currentSheet.totalDeductions.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400 font-medium">জিপিএফ ও কল্যাণ তহবিল</span>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">মোট প্রদেয় বেতন (Net Payable)</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">৳{currentSheet.totalNetPayable.toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentSheet.state === 'paid' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950 font-black'
              }`}>
                {currentSheet.state === 'paid' ? '✓ পরিশোধিত' : 'অপেক্ষমাণ'}
              </span>
              {currentSheet.status !== 'paid' && (
                <button
                  onClick={() => handleDisburseAll()}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                >
                  সব পরিশোধ করুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Payroll Table */}
      {currentSheet ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          <div className="px-5 py-4 border-b border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>বেতন বিবরণী তালিকা — {currentSheet.monthNameBn}</span>
                <span className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md text-[10px] font-bold font-mono">
                  {filteredItems.length} জন
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                ইএফটি (EFT) ব্যাংক অ্যাকাউন্ট ট্রান্সফার ও প্রতিষ্ঠান বেতন শিট
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  সকল
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'paid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  পরিশোধিত
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  অপেক্ষমাণ
                </button>
              </div>

              <div className="relative flex-1 md:w-52">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {filteredItems.length > 10 && (
            <div className="flex items-center justify-between px-5 py-2 bg-slate-50/80 border-b border-slate-200/60 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <span>মোট পে-রোল রেকর্ড: <strong className="text-slate-900">{filteredItems.length}</strong> টি</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold">
                <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-pulse" />
                <span>ভার্চুয়ালাইজড পে-রোল গ্রিড (দ্রুত ব্রাউজিং)</span>
              </div>
            </div>
          )}

          <VirtualizedTable<PayrollRecordItem>
            items={filteredItems}
            colSpan={11}
            estimatedRowHeight={62}
            maxHeight="600px"
            virtualizationThreshold={12}
            header={
              <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-5">শিক্ষক/কর্মচারী</th>
                <th className="p-3.5">পদবি ও পে-কোড</th>
                <th className="p-3.5 text-right">মূল বেতন</th>
                <th className="p-3.5 text-right">বাড়িভাড়া</th>
                <th className="p-3.5 text-right">চিকিৎসা</th>
                <th className="p-3.5 text-right font-bold text-slate-800">মোট আয়</th>
                <th className="p-3.5 text-right text-rose-600">জিপিএফ (১০%)</th>
                <th className="p-3.5 text-right text-rose-600">কল্যাণ (৬%)</th>
                <th className="p-3.5 text-right font-black text-slate-900">নিট প্রদেয়</th>
                <th className="p-3.5 text-center">স্ট্যাটাস</th>
                <th className="p-3.5 pr-5 text-right">পদক্ষেপ</th>
              </tr>
            }
            renderRow={(item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 pl-5">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{item.nameBn || item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">আইডি: {item.customStaffId}</span>
                  </div>
                </td>
                <td className="p-3.5 text-slate-600">
                  <div>
                    <span className="font-medium text-slate-800">{item.designationBn || item.designation}</span>
                    <span className="text-[10px] text-indigo-600 font-bold block">{item.payCode}</span>
                  </div>
                </td>
                <td className="p-3.5 text-right font-mono font-medium text-slate-800">
                  ৳{item.basicSalary.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-slate-600">
                  ৳{item.houseRent.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-slate-600">
                  ৳{item.medicalAllowance.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                  ৳{item.grossSalary.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-rose-600 font-medium">
                  ৳{item.gpfDeduction.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-rose-600 font-medium">
                  ৳{item.welfareDeduction.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono font-black text-emerald-700 text-sm">
                  ৳{item.netPayable.toLocaleString()}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => handleToggleIndividualPayment(item.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      item.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                    title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                  >
                    {item.paymentStatus === 'paid' ? '✓ পরিশোধিত' : 'অপেক্ষমাণ'}
                  </button>
                </td>
                <td className="p-3.5 pr-5 text-right">
                  <button
                    onClick={() => setViewingPayslip({ item, sheet: currentSheet })}
                    className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1 transition-colors ml-auto border border-indigo-100 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>স্লিপ</span>
                  </button>
                </td>
              </tr>
            )}
            emptyState={
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="text-xs font-medium text-slate-500">কোনো পে-রোল ডাটা পাওয়া যায়নি।</p>
              </div>
            }
          />
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-400 space-y-3">
          <DollarSign className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <p className="text-sm font-bold text-slate-700">নির্বাচিত মাসের জন্য কোনো বেতন শিট তৈরি করা হয়নি।</p>
          <button
            onClick={handleGenerateSheet}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all inline-block"
          >
            + {selectedMonth} মাসের বেতন শিট তৈরি করুন
          </button>
        </div>
      )}

      {/* INDIVIDUAL PAYSLIP MODAL */}
      {viewingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">মাসিক বেতন স্লিপ (Payslip Voucher)</h3>
                <p className="text-xs text-slate-400">{viewingPayslip.sheet.monthNameBn}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট</span>
                </button>
                <button
                  onClick={() => setViewingPayslip(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Payslip Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Institute Branding */}
              <div className="text-center border-b pb-3">
                <h2 className="text-base font-black text-slate-900">{appName}</h2>
                <p className="text-[11px] text-slate-500 font-medium">বেতন ও ইএফটি রসিদ | {viewingPayslip.sheet.monthNameBn}</p>
              </div>

              {/* Staff Details Card */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">নাম:</span>
                  <span className="font-bold text-slate-900">{viewingPayslip.item.nameBn || viewingPayslip.item.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">স্টাফ আইডি:</span>
                  <span className="font-mono font-bold text-slate-900">{viewingPayslip.item.customStaffId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">পদবি:</span>
                  <span className="font-medium text-slate-700">{viewingPayslip.item.designationBn || viewingPayslip.item.designation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">ব্যাংক একাউন্ট:</span>
                  <span className="font-mono text-slate-800 font-medium">{viewingPayslip.item.bankAccountNumber || 'Sonali Bank'}</span>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Earnings */}
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-700 block border-b pb-1">আয়সমূহ (Earnings)</span>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">মূল বেতন:</span>
                    <span className="font-mono font-medium">৳{viewingPayslip.item.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">বাড়িভাড়া ভাতা:</span>
                    <span className="font-mono font-medium">৳{viewingPayslip.item.houseRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">চিকিৎসা ভাতা:</span>
                    <span className="font-mono font-medium">৳{viewingPayslip.item.medicalAllowance.toLocaleString()}</span>
                  </div>
                  {viewingPayslip.item.specialAllowance > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">বিশেষ ভাতা:</span>
                      <span className="font-mono font-medium">৳{viewingPayslip.item.specialAllowance.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-t font-bold text-slate-900">
                    <span>মোট আয়:</span>
                    <span className="font-mono">৳{viewingPayslip.item.grossSalary.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-1.5">
                  <span className="font-bold text-rose-700 block border-b pb-1">কর্তনসমূহ (Deductions)</span>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">জিপিএফ (১০%):</span>
                    <span className="font-mono text-rose-600 font-medium">৳{viewingPayslip.item.gpfDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-600">কল্যাণ ও অবসর (৬%):</span>
                    <span className="font-mono text-rose-600 font-medium">৳{viewingPayslip.item.welfareDeduction.toLocaleString()}</span>
                  </div>
                  {viewingPayslip.item.otherDeductions > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">অন্যান্য কর্তন:</span>
                      <span className="font-mono text-rose-600 font-medium">৳{viewingPayslip.item.otherDeductions.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-t font-bold text-rose-700">
                    <span>মোট কর্তন:</span>
                    <span className="font-mono">৳{viewingPayslip.item.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Net Payable Highlight */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">সর্বমোট প্রদেয় বেতন (Net Payable)</span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    স্ট্যাটাস: {viewingPayslip.item.paymentStatus === 'paid' ? 'পরিশোধিত' : 'অপেক্ষমাণ'}
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-800 font-mono">
                  ৳{viewingPayslip.item.netPayable.toLocaleString()}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 pt-6 text-center text-[10px] text-slate-500">
                <div>
                  <div className="border-t border-slate-300 w-32 mx-auto mb-1"></div>
                  <span className="font-medium">হিসাবরক্ষক</span>
                </div>
                <div>
                  <div className="border-t border-slate-300 w-32 mx-auto mb-1"></div>
                  <span className="font-medium">প্রধান শিক্ষক / অধ্যক্ষ</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setViewingPayslip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
