import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { TestimonialRosterItem, TestimonialExam } from '../../types/testimonial';
import { toBengaliNumber } from '../../utils/bengaliUtils';

interface RosterTableViewProps {
  rosterItems: TestimonialRosterItem[];
  activeExam: TestimonialExam;
  selectedStudentIds: Set<string>;
  onToggleSelectStudent: (studentId: string) => void;
  onSelectAllStudents: () => void;
  onPreviewStudent: (studentId: string) => void;
  onEditStudent: (studentId: string) => void;
  onRemoveStudentFromExam: (studentIds: string[]) => void;
  onOpenBulkEditor: () => void;
  onOpenStudentImport: () => void;
}

export const RosterTableView: React.FC<RosterTableViewProps> = ({
  rosterItems,
  activeExam,
  selectedStudentIds,
  onToggleSelectStudent,
  onSelectAllStudents,
  onPreviewStudent,
  onEditStudent,
  onRemoveStudentFromExam,
  onOpenBulkEditor,
  onOpenStudentImport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleteness, setFilterCompleteness] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [confirmRemovalModal, setConfirmRemovalModal] = useState<{
    isOpen: boolean;
    studentIds: string[];
    title: string;
  }>({
    isOpen: false,
    studentIds: [],
    title: '',
  });

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return rosterItems.filter(item => {
      // Completeness filter
      if (filterCompleteness === 'complete' && item.missingFieldsEn?.length) return false;
      if (filterCompleteness === 'incomplete' && (!item.missingFieldsEn || item.missingFieldsEn.length === 0)) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (item.name || '').toLowerCase().includes(q) || (item.nameBn || '').includes(q);
        const matchesRoll = (item.boardRollNo || '').includes(q);
        const matchesReg = (item.registrationNo || '').includes(q);
        const matchesStudentId = (item.studentId || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesReg && !matchesStudentId) return false;
      }

      return true;
    });
  }, [rosterItems, filterCompleteness, searchQuery]);

  const isAllSelected = filteredRoster.length > 0 && selectedStudentIds.size === filteredRoster.length;

  const handleOpenSingleRemoval = (item: TestimonialRosterItem) => {
    setConfirmRemovalModal({
      isOpen: true,
      studentIds: [item.studentId],
      title: `${item.nameBn || item.name} (রোল: ${item.boardRollNo}) কে এই পরীক্ষা থেকে সরান`,
    });
  };

  const handleOpenBulkRemoval = () => {
    if (selectedStudentIds.size === 0) return;
    setConfirmRemovalModal({
      isOpen: true,
      studentIds: Array.from(selectedStudentIds),
      title: `নির্বাচিত ${selectedStudentIds.size} জন শিক্ষার্থীকে এই পরীক্ষা থেকে সরান`,
    });
  };

  const handleConfirmRemoval = () => {
    onRemoveStudentFromExam(confirmRemovalModal.studentIds);
    setConfirmRemovalModal({ isOpen: false, studentIds: [], title: '' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Control & Search Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শিক্ষার্থীর নাম, বোর্ড রোল, রেজি..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Completeness Filter */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 text-xs font-medium text-slate-700">
            <button
              onClick={() => setFilterCompleteness('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterCompleteness === 'all' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              সব ({rosterItems.length})
            </button>
            <button
              onClick={() => setFilterCompleteness('complete')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterCompleteness === 'complete' ? 'bg-emerald-700 text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              সম্পূর্ণ
            </button>
            <button
              onClick={() => setFilterCompleteness('incomplete')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterCompleteness === 'incomplete' ? 'bg-amber-600 text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              অসম্পূর্ণ
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedStudentIds.size > 0 && (
            <button
              type="button"
              onClick={handleOpenBulkRemoval}
              className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>রোস্টার থেকে সরান ({selectedStudentIds.size})</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenBulkEditor}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>বাল্ক এডিটর</span>
          </button>

          <button
            type="button"
            onClick={onOpenStudentImport}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+ শিক্ষার্থী যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">
            <tr>
              <th className="py-3 px-3 w-10 text-center">
                <button
                  type="button"
                  onClick={onSelectAllStudents}
                  className="flex items-center justify-center text-slate-500 hover:text-emerald-700"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3 w-16">বোর্ড রোল</th>
              <th className="py-3 px-3">শিক্ষার্থীর নাম</th>
              <th className="py-3 px-3">পিতা ও মাতার নাম</th>
              <th className="py-3 px-3">রেজি: নং ও সেশন</th>
              <th className="py-3 px-3">বিভাগ ও জিপিএ</th>
              <th className="py-3 px-3 text-center">তথ্য পূর্ণতা</th>
              <th className="py-3 px-3 text-center">ইস্যু অবস্থা</th>
              <th className="py-3 px-3 text-center">বিতরণ</th>
              <th className="py-3 px-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRoster.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                  {rosterItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p>এই পরীক্ষায় এখনো কোনো শিক্ষার্থী যুক্ত করা হয়নি।</p>
                      <button
                        onClick={onOpenStudentImport}
                        className="mt-1 px-4 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
                      >
                        শিক্ষার্থী ইমপোর্ট করুন
                      </button>
                    </div>
                  ) : (
                    'অনুসন্ধানে কোনো শিক্ষার্থী মেলেনি।'
                  )}
                </td>
              </tr>
            ) : (
              filteredRoster.map((item) => {
                const isSelected = selectedStudentIds.has(item.studentId);
                const missingList = item.activeMissing || item.missingFieldsEn || [];
                const hasMissing = missingList.length > 0;

                return (
                  <tr
                    key={item.studentId}
                    className={`transition-colors ${
                      isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectStudent(item.studentId)}
                        className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                    </td>

                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {toBengaliNumber(item.boardRollNo || '—')}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">
                        {item.nameBn || item.name}
                      </div>
                      {item.name && item.nameBn && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.name}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="text-slate-800 font-medium">
                        পিতা: {item.fatherNameBn || item.fatherName || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        মাতা: {item.motherNameBn || item.motherName || '—'}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono text-slate-800 font-semibold">
                        {item.registrationNo || '—'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        সেশন: {toBengaliNumber(item.session || '—')}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">
                        {item.group || '—'}
                      </div>
                      <div className="font-bold text-emerald-700">
                        জিপিএ: {item.gpa ? toBengaliNumber(item.gpa) : '—'}
                      </div>
                    </td>

                    {/* Data Completeness */}
                    <td className="py-2.5 px-3 text-center">
                      {hasMissing ? (
                        <span
                          title={`অনুপস্থিত: ${missingList.join(', ')}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 cursor-help"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          অসম্পূর্ণ ({missingList.length})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          সম্পূর্ণ
                        </span>
                      )}
                    </td>

                    {/* Issuance Status */}
                    <td className="py-2.5 px-3 text-center">
                      {item.isIssued ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          ইস্যুকৃত ({item.issuedSerialNo})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          খসড়া
                        </span>
                      )}
                    </td>

                    {/* Distribution Status */}
                    <td className="py-2.5 px-3 text-center">
                      {item.distributionStatus === 'distributed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          বিতরণ সম্পন্ন
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          বিতরণ বাকি
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onPreviewStudent(item.studentId)}
                          title="প্রশংসাপত্র প্রিভিউ"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditStudent(item.studentId)}
                          title="তথ্য এডিট"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSingleRemoval(item)}
                          title="এই পরীক্ষা থেকে সরান"
                          className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Confirmation Modal for Removal */}
      {confirmRemovalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-base">
                  {confirmRemovalModal.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  এটি মূল শিক্ষার্থী প্রোফাইল বা প্রাতিষ্ঠানিক ডেটাবেজ মুছে ফেলবে না। শুধুমাত্র <strong className="text-slate-800">{activeExam.displayNameBn}</strong> পরীক্ষার রোস্টার থেকে এই শিক্ষার্থীকে সরানো হবে।
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmRemovalModal({ isOpen: false, studentIds: [], title: '' })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoval}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                হ্যাঁ, রোস্টার থেকে সরান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
