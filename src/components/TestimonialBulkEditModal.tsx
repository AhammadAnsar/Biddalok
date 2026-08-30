import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Filter } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ExamResult } from '../types';

interface TestimonialBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestimonialBulkEditModal: React.FC<TestimonialBulkEditModalProps> = ({ isOpen, onClose }) => {
  const { language, examResults, bulkUpdateExamResults, academicClasses, academicGroups, academicSections } = useAppStore();
  const isBn = language === 'bn';
  
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [search, setSearch] = useState('');
  
  const [editingResults, setEditingResults] = useState<ExamResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 35;

  const exams = Array.from(new Set((examResults || []).map(r => r.examName))).filter(Boolean);
  const groups = Array.from(new Set((examResults || []).map(r => r.group))).filter(Boolean);
  const sessions = Array.from(new Set((examResults || []).map(r => r.session))).filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      setEditingResults((examResults || []).map(r => ({ ...r })));
      setCurrentPage(1);
    } else {
      setEditingResults([]);
      setCurrentPage(1);
    }
  }, [isOpen, examResults]);

  const handleFieldChange = (id: string, field: keyof ExamResult, value: string) => {
    setEditingResults(prev => 
      prev.map(r => r.id === id ? { ...r, [field]: value } : r)
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      bulkUpdateExamResults(editingResults);
      setIsSaving(false);
      onClose();
    }, 300);
  };

  // Filter editingResults
  const filteredResults = editingResults.filter(r => {
    const matchExam = selectedExam === 'all' || r.examName === selectedExam;
    const matchGroup = selectedGroup === 'all' || r.group === selectedGroup;
    const matchSession = selectedSession === 'all' || r.session === selectedSession;
    const matchSearch = !search.trim() || 
      (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.nameBn && r.nameBn.includes(search)) ||
      (r.boardRollNo && r.boardRollNo.includes(search)) ||
      (r.studentId && r.studentId.toLowerCase().includes(search.toLowerCase()));
    return matchExam && matchGroup && matchSession && matchSearch;
  });

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isBn ? 'বাল্ক এডিট (প্রশংসাপত্র শিক্ষার্থী ডাটা)' : 'Bulk Edit Student Records'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn ? 'শিক্ষার্থীদের নাম, রোল, রেজি, বিভাগ ও ফলাফল এক সাথে সম্পাদনা করুন' : 'Edit names, rolls, registration, group & GPAs in batch'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Exam Filter */}
            <select
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value); setCurrentPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white font-semibold"
            >
              <option value="all">{isBn ? 'সকল পরীক্ষা' : 'All Exams'}</option>
              {exams.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            {/* Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => { setSelectedGroup(e.target.value); setCurrentPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white font-semibold"
            >
              <option value="all">{isBn ? 'সকল বিভাগ' : 'All Groups'}</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {/* Session Filter */}
            <select
              value={selectedSession}
              onChange={(e) => { setSelectedSession(e.target.value); setCurrentPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none bg-white font-semibold"
            >
              <option value="all">{isBn ? 'সকল সেশন' : 'All Sessions'}</option>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Search */}
            <input 
              type="text" 
              placeholder={isBn ? 'নাম বা রোল দিয়ে খুঁজুন...' : 'Search name or roll...'} 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none bg-white w-48 font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            {isBn ? `মোট রেকর্ড: ${filteredResults.length} টি` : `Total: ${filteredResults.length}`}
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto p-4">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              {isBn ? 'কোন তথ্য পাওয়া যায়নি।' : 'No records found.'}
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 uppercase tracking-wider border-b border-slate-200 font-bold">
                    <th className="p-2.5 min-w-[130px]">{isBn ? 'নাম (ইংরেজি)' : 'Name (Eng)'}</th>
                    <th className="p-2.5 min-w-[130px]">{isBn ? 'নাম (বাংলা)' : 'Name (Bn)'}</th>
                    <th className="p-2.5 min-w-[120px]">{isBn ? 'পিতার নাম' : 'Father'}</th>
                    <th className="p-2.5 min-w-[120px]">{isBn ? 'মাতার নাম' : 'Mother'}</th>
                    <th className="p-2.5 min-w-[85px]">{isBn ? 'বোর্ড রোল' : 'Board Roll'}</th>
                    <th className="p-2.5 min-w-[95px]">{isBn ? 'রেজি নং' : 'Reg No'}</th>
                    <th className="p-2.5 min-w-[85px]">{isBn ? 'সেশন' : 'Session'}</th>
                    <th className="p-2.5 min-w-[95px]">{isBn ? 'বিভাগ' : 'Group'}</th>
                    <th className="p-2.5 min-w-[70px]">{isBn ? 'জিপিএ' : 'GPA'}</th>
                    <th className="p-2.5 min-w-[85px]">{isBn ? 'বোর্ড' : 'Board'}</th>
                    <th className="p-2.5 min-w-[95px]">{isBn ? 'পরীক্ষা' : 'Exam'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedResults.map(result => (
                    <tr key={result.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-1.5"><input type="text" value={result.name || ''} onChange={(e) => handleFieldChange(result.id, 'name', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.nameBn || ''} onChange={(e) => handleFieldChange(result.id, 'nameBn', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.fatherName || ''} onChange={(e) => handleFieldChange(result.id, 'fatherName', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.motherName || ''} onChange={(e) => handleFieldChange(result.id, 'motherName', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.boardRollNo || ''} onChange={(e) => handleFieldChange(result.id, 'boardRollNo', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-center" /></td>
                      <td className="p-1.5"><input type="text" value={result.registrationNo || ''} onChange={(e) => handleFieldChange(result.id, 'registrationNo', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.session || ''} onChange={(e) => handleFieldChange(result.id, 'session', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none text-center font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.group || ''} onChange={(e) => handleFieldChange(result.id, 'group', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.gpa || ''} onChange={(e) => handleFieldChange(result.id, 'gpa', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-center text-indigo-700" /></td>
                      <td className="p-1.5"><input type="text" value={result.board || ''} onChange={(e) => handleFieldChange(result.id, 'board', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium" /></td>
                      <td className="p-1.5"><input type="text" value={result.examName || ''} onChange={(e) => handleFieldChange(result.id, 'examName', e.target.value)} className="w-full border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-slate-700" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {totalPages > 1 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                {isBn ? 'পূর্ববর্তী' : 'Prev'}
              </button>
              <span className="text-xs font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                {isBn ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-xs font-bold transition-colors">
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button onClick={handleSave} disabled={isSaving || editingResults.length === 0} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold shadow-xs transition-colors">
              <Save className="w-4 h-4" />
              {isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save Changes')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
