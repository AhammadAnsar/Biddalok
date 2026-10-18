import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Square,
  Printer,
  ChevronDown
} from 'lucide-react';
import { TestimonialExam, DistributionRegisterEntry } from '../../types/testimonial';
import { Institution } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DistributionRegisterViewProps {
  activeExam: TestimonialExam;
  entries: DistributionRegisterEntry[];
  institution?: Institution | null;
  onMarkDistributed: (
    entryIds: string[], 
    distributionData: { 
      receivedBy: string; 
      receiverRelation: string; 
      distributedAt: string; 
      remarks?: string;
    }
  ) => void;
  onRedownloadTestimonial: (entry: DistributionRegisterEntry) => void;
}

export const DistributionRegisterView: React.FC<DistributionRegisterViewProps> = ({
  activeExam,
  entries,
  institution,
  onMarkDistributed,
  onRedownloadTestimonial,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'distributed'>('all');
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());

  // Mark as distributed modal state
  const [distributionModal, setDistributionModal] = useState<{
    isOpen: boolean;
    entryIds: string[];
    defaultReceiver: string;
    relation: string;
    date: string;
    remarks: string;
  }>({
    isOpen: false,
    entryIds: [],
    defaultReceiver: 'শিক্ষার্থী নিজে',
    relation: 'শিক্ষার্থী',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (statusFilter === 'pending' && e.distributionStatus !== 'pending') return false;
      if (statusFilter === 'distributed' && e.distributionStatus !== 'distributed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (e.studentName || '').toLowerCase().includes(q) || (e.studentNameBn || '').includes(q);
        const matchesRoll = (e.boardRollNo || '').includes(q);
        const matchesReg = (e.registrationNo || '').includes(q);
        const matchesSerial = (e.serialNo || '').toLowerCase().includes(q);
        const matchesReceiver = (e.receivedBy || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesReg && !matchesSerial && !matchesReceiver) return false;
      }

      return true;
    });
  }, [entries, statusFilter, searchQuery]);

  // Summary Metrics
  const totalIssued = entries.length;
  const totalDistributed = entries.filter(e => e.distributionStatus === 'distributed').length;
  const totalPending = entries.filter(e => e.distributionStatus === 'pending').length;

  const isAllSelected = filteredEntries.length > 0 && selectedEntryIds.size === filteredEntries.length;

  const handleToggleSelect = (id: string) => {
    const updated = new Set(selectedEntryIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedEntryIds(updated);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEntryIds(new Set());
    } else {
      setSelectedEntryIds(new Set(filteredEntries.map(e => e.id)));
    }
  };

  const handleOpenSingleMarkModal = (entry: DistributionRegisterEntry) => {
    setDistributionModal({
      isOpen: true,
      entryIds: [entry.id],
      defaultReceiver: entry.studentNameBn || entry.studentName || 'শিক্ষার্থী নিজে',
      relation: 'শিক্ষার্থী',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    });
  };

  const handleOpenBulkMarkModal = () => {
    if (selectedEntryIds.size === 0) return;
    setDistributionModal({
      isOpen: true,
      entryIds: Array.from(selectedEntryIds),
      defaultReceiver: 'শিক্ষার্থী নিজে',
      relation: 'শিক্ষার্থী',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    });
  };

  const handleConfirmDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    onMarkDistributed(distributionModal.entryIds, {
      receivedBy: distributionModal.defaultReceiver.trim(),
      receiverRelation: distributionModal.relation,
      distributedAt: distributionModal.date,
      remarks: distributionModal.remarks.trim(),
    });
    setSelectedEntryIds(new Set());
    setDistributionModal({
      isOpen: false,
      entryIds: [],
      defaultReceiver: '',
      relation: '',
      date: '',
      remarks: '',
    });
  };

  // Generate Official Printable Distribution Register PDF
  const handleDownloadRegisterPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const instName = institution?.name || 'INSTITUTION NAME';
    const instAddress = [institution?.upazila, institution?.district].filter(Boolean).join(', ');
    const examTitle = `${activeExam.displayName} (${activeExam.displayNameBn})`;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(21, 128, 61); // Emerald green
    doc.text(instName, 148.5, 14, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(instAddress, 148.5, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38); // Crimson
    doc.text(`TESTIMONIAL DISTRIBUTION REGISTER - ${examTitle}`, 148.5, 27, { align: 'center' });

    // Table Data
    const tableRows = entries.map((entry, idx) => [
      idx + 1,
      entry.serialNo || `2026/${idx + 1}`,
      entry.studentNameBn ? `${entry.studentNameBn} (${entry.studentName})` : entry.studentName,
      entry.boardRollNo || '—',
      entry.registrationNo || '—',
      entry.issueDate || '—',
      entry.distributionStatus === 'distributed' ? `Distributed (${entry.distributedAt || ''})` : 'Pending',
      entry.receivedBy ? `${entry.receivedBy} (${entry.receiverRelation || ''})` : '',
      '________________', // Space for receiver signature
    ]);

    autoTable(doc, {
      startY: 32,
      head: [[
        'Sl',
        'Serial No',
        'Student Name',
        'Board Roll',
        'Reg No',
        'Issue Date',
        'Status',
        'Received By',
        'Receiver Signature',
      ]],
      body: tableRows,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [21, 128, 61],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 10, right: 10 },
    });

    // Signatory footer
    const finalY = (doc as any).lastAutoTable?.finalY || 180;
    if (finalY < 185) {
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Prepared by: ____________________', 25, finalY + 14);
      doc.text('Checked by: ____________________', 130, finalY + 14);
      doc.text('Headmaster / Principal: ____________________', 215, finalY + 14);
    }

    doc.save(`Testimonial_Distribution_Register_${activeExam.examType}_${activeExam.year}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              মোট ইস্যুকৃত প্রশংসাপত্র
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {toBengaliNumber(totalIssued)} <span className="text-xs font-semibold text-slate-400">টি</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              বিতরণ সম্পন্ন
            </span>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              {toBengaliNumber(totalDistributed)} <span className="text-xs font-semibold text-emerald-500">টি</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              বিতরণ বাকি
            </span>
            <h3 className="text-2xl font-black text-amber-700 mt-1">
              {toBengaliNumber(totalPending)} <span className="text-xs font-semibold text-amber-500">টি</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Register Table Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিক্ষার্থী, রোল, রেজি, ক্রমিক নং..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-xs font-medium text-slate-700">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'all' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
                }`}
              >
                সব ({entries.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'pending' ? 'bg-amber-600 text-white font-bold' : 'hover:bg-slate-100'
                }`}
              >
                বাকি ({totalPending})
              </button>
              <button
                onClick={() => setStatusFilter('distributed')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'distributed' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
                }`}
              >
                সম্পন্ন ({totalDistributed})
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedEntryIds.size > 0 && (
              <button
                type="button"
                onClick={handleOpenBulkMarkModal}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>বিতরণ সম্পন্ন করুন ({selectedEntryIds.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadRegisterPdf}
              disabled={entries.length === 0}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>রেজিস্টার PDF ডাউনলোড</span>
            </button>
          </div>
        </div>

        {/* Register Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="flex items-center justify-center text-slate-500 hover:text-emerald-700"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">ক্রমিক নং (Serial)</th>
                <th className="py-3 px-3">শিক্ষার্থীর নাম</th>
                <th className="py-3 px-3">বোর্ড রোল</th>
                <th className="py-3 px-3">রেজিস্ট্রেশন নং</th>
                <th className="py-3 px-3">ইস্যু তারিখ</th>
                <th className="py-3 px-3 text-center">বিতরণ অবস্থা</th>
                <th className="py-3 px-3">গ্রহণকারী ও সম্পর্ক</th>
                <th className="py-3 px-3">বিতরণের তারিখ</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                    {entries.length === 0
                      ? 'এই পরীক্ষায় এখনো কোনো প্রশংসাপত্র ইস্যু করা হয়নি। লাইভ প্রিভিউ ট্যাব থেকে পিডিএফ জেনারেট করলেই স্বয়ংক্রিয়ভাবে রেজিস্টারে এন্ট্রি হবে।'
                      : 'অনুসন্ধানে কোনো রেকর্ড পাওয়া যায়নি।'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isSelected = selectedEntryIds.has(entry.id);
                  const isDistributed = entry.distributionStatus === 'distributed';

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(entry.id)}
                          className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {entry.serialNo}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">
                          {entry.studentNameBn || entry.studentName}
                        </div>
                        {entry.studentName && entry.studentNameBn && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {entry.studentName}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {toBengaliNumber(entry.boardRollNo || '—')}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {entry.registrationNo || '—'}
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        {entry.issueDate}
                      </td>

                      {/* Distribution Status Badge */}
                      <td className="py-2.5 px-3 text-center">
                        {isDistributed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            বিতরণ সম্পন্ন
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            বিতরণ বাকি
                          </span>
                        )}
                      </td>

                      {/* Receiver */}
                      <td className="py-2.5 px-3 text-slate-800">
                        {entry.receivedBy ? (
                          <div>
                            <span className="font-semibold">{entry.receivedBy}</span>
                            {entry.receiverRelation && (
                              <span className="text-[11px] text-slate-500 ml-1">
                                ({entry.receiverRelation})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Distributed Date */}
                      <td className="py-2.5 px-3 text-slate-700">
                        {entry.distributedAt || '—'}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenSingleMarkModal(entry)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                              isDistributed
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}
                          >
                            {isDistributed ? 'আপডেট' : 'বিতরণ করুন'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRedownloadTestimonial(entry)}
                            title="প্রশংসাপত্র ডাউনলোড"
                            className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Distributed Modal */}
      {distributionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5" />
                <h4 className="font-bold text-base">প্রশংসাপত্র বিতরণ নিশ্চিত করুন</h4>
              </div>
            </div>

            <form onSubmit={handleConfirmDistribution} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিতরণের তারিখ
                </label>
                <input
                  type="date"
                  value={distributionModal.date}
                  onChange={(e) => setDistributionModal(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কার নিকট হস্তান্তর করা হয়েছে (Receiver Name)
                </label>
                <input
                  type="text"
                  value={distributionModal.defaultReceiver}
                  onChange={(e) => setDistributionModal(prev => ({ ...prev, defaultReceiver: e.target.value }))}
                  placeholder="যেমন: শিক্ষার্থী নিজে / পিতার নাম..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সম্পর্ক (Relationship)
                </label>
                <select
                  value={distributionModal.relation}
                  onChange={(e) => setDistributionModal(prev => ({ ...prev, relation: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="শিক্ষার্থী">শিক্ষার্থী (নিজে)</option>
                  <option value="পিতা">পিতা</option>
                  <option value="মাতা">মাতা</option>
                  <option value="অভিভাবক">আইনি অভিভাবক</option>
                  <option value="অন্যান্য">অন্যান্য প্রতিনিধি</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মন্তব্য (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={distributionModal.remarks}
                  onChange={(e) => setDistributionModal(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="মন্তব্য থাকলে লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDistributionModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                >
                  বিতরণ সম্পন্ন মার্ক করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
