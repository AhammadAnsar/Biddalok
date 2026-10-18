import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Check, 
  User, 
  MapPin, 
  GraduationCap 
} from 'lucide-react';
import { TestimonialRosterItem, TestimonialExam } from '../../types/testimonial';
import { BANGLADESH_EDUCATION_BOARDS } from '../../types/testimonial';

interface BulkEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: TestimonialExam;
  rosterItems: TestimonialRosterItem[];
  onSaveBulkChanges: (updatedItems: TestimonialRosterItem[]) => void;
}

export const BulkEditorModal: React.FC<BulkEditorModalProps> = ({
  isOpen,
  onClose,
  activeExam,
  rosterItems,
  onSaveBulkChanges,
}) => {
  // Local editable draft state
  const [draftItems, setDraftItems] = useState<TestimonialRosterItem[]>(() => 
    JSON.parse(JSON.stringify(rosterItems || []))
  );

  // Sync draft whenever modal is opened or rosterItems are updated
  useEffect(() => {
    if (isOpen && rosterItems) {
      setDraftItems(JSON.parse(JSON.stringify(rosterItems)));
    }
  }, [isOpen, rosterItems]);

  // Active section tab: 'personal' | 'address' | 'result'
  const [activeTab, setActiveTab] = useState<'personal' | 'address' | 'result'>('personal');

  // Quick batch fill state
  const [batchField, setBatchField] = useState<string>('upazila');
  const [batchValue, setBatchValue] = useState<string>('');

  // Confirmation dialog before saving
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Map of original items for dirty checking
  const originalMap = useMemo(() => {
    const map = new Map<string, TestimonialRosterItem>();
    rosterItems.forEach(item => map.set(item.studentId, item));
    return map;
  }, [rosterItems]);

  // Track changed fields per studentId
  const dirtyChanges = useMemo(() => {
    const changes: { studentId: string; studentName: string; fields: string[] }[] = [];
    draftItems.forEach(draft => {
      const orig = originalMap.get(draft.studentId);
      if (!orig) return;
      const modifiedFields: string[] = [];
      const keys = Object.keys(draft) as (keyof TestimonialRosterItem)[];
      keys.forEach(k => {
        if (draft[k] !== orig[k]) {
          modifiedFields.push(String(k));
        }
      });
      if (modifiedFields.length > 0) {
        changes.push({
          studentId: draft.studentId,
          studentName: draft.nameBn || draft.name,
          fields: modifiedFields,
        });
      }
    });
    return changes;
  }, [draftItems, originalMap]);

  if (!isOpen) return null;

  const handleCellChange = (studentId: string, field: keyof TestimonialRosterItem, value: any) => {
    setDraftItems(prev => 
      prev.map(item => {
        if (item.studentId === studentId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleApplyBatchFill = () => {
    if (!batchValue.trim()) return;
    setDraftItems(prev => 
      prev.map(item => ({
        ...item,
        [batchField]: batchValue.trim(),
      }))
    );
    setBatchValue('');
  };

  const handleResetChanges = () => {
    setDraftItems(JSON.parse(JSON.stringify(rosterItems)));
    setShowReviewDialog(false);
  };

  const handleFinalSave = () => {
    onSaveBulkChanges(draftItems);
    setShowReviewDialog(false);
    onClose();
  };

  const isFieldDirty = (studentId: string, field: keyof TestimonialRosterItem) => {
    const orig = originalMap.get(studentId);
    if (!orig) return false;
    const current = draftItems.find(i => i.studentId === studentId);
    if (!current) return false;
    return orig[field] !== current[field];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">বাল্ক ডেটা এডিটর</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-100 text-[11px] font-bold">
                  {activeExam.displayNameBn}
                </span>
              </div>
              <p className="text-emerald-100 text-xs mt-0.5">
                স্প্রেডশিটের ন্যায় দ্রুত তথ্য এন্ট্রি, ব্যাচ ফিল ও লাইভ ভ্যালিডেশন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dirtyChanges.length > 0 && (
              <span className="px-3 py-1 bg-amber-400 text-amber-950 font-bold text-xs rounded-full animate-pulse">
                {dirtyChanges.length} জন শিক্ষার্থীর তথ্য পরিবর্তিত
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Batch Fill Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Group Tabs */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'personal'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ব্যক্তিগত তথ্য</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('address')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'address'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>ঠিকানা ও অবস্থান</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('result')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'result'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>ফলাফল ও রোল/রেজি</span>
              </button>
            </div>

            {/* Quick Batch Fill */}
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 ml-1.5 shrink-0" />
              <span className="font-bold text-slate-700">দ্রুত ব্যাচ ফিল:</span>
              <select
                value={batchField}
                onChange={(e) => setBatchField(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-hidden"
              >
                <option value="upazila">উপজেলা (English)</option>
                <option value="upazilaBn">উপজেলা (বাংলা)</option>
                <option value="district">জেলা (English)</option>
                <option value="districtBn">জেলা (বাংলা)</option>
                <option value="postOffice">ডাকঘর (English)</option>
                <option value="postOfficeBn">ডাকঘর (বাংলা)</option>
                <option value="examCenter">কেন্দ্র (English)</option>
                <option value="examCenterBn">কেন্দ্র (বাংলা)</option>
                <option value="session">সেশন / শিক্ষাবর্ষ</option>
                <option value="board">বোর্ড (English)</option>
                <option value="group">বিভাগ / গ্রুপ</option>
              </select>
              <input
                type="text"
                value={batchValue}
                onChange={(e) => setBatchValue(e.target.value)}
                placeholder="মান লিখুন..."
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium w-28 outline-hidden"
              />
              <button
                type="button"
                onClick={handleApplyBatchFill}
                disabled={!batchValue.trim()}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold rounded-lg transition-colors"
              >
                সবার জন্য প্রয়োগ
              </button>
            </div>
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto bg-slate-100 p-3">
          <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-200 text-slate-800 sticky top-0 z-20 font-bold border-b border-slate-300 select-none">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">#</th>
                  <th className="py-2.5 px-3 w-20 border-r border-slate-300">বোর্ড রোল</th>
                  
                  {activeTab === 'personal' && (
                    <>
                      <th className="py-2.5 px-3 min-w-[160px] border-r border-slate-300">নাম (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[170px] border-r border-slate-300">Name (English)</th>
                      <th className="py-2.5 px-3 min-w-[160px] border-r border-slate-300">পিতার নাম (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[170px] border-r border-slate-300">Father's Name (EN)</th>
                      <th className="py-2.5 px-3 min-w-[160px] border-r border-slate-300">মাতার নাম (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[170px] border-r border-slate-300">Mother's Name (EN)</th>
                      <th className="py-2.5 px-3 min-w-[130px]">জন্মতারিখ (DD/MM/YYYY)</th>
                    </>
                  )}

                  {activeTab === 'address' && (
                    <>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">গ্রাম (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">Village (EN)</th>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">ডাকঘর (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">Post Office (EN)</th>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">উপজেলা (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">Upazila (EN)</th>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">জেলা (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[140px]">District (EN)</th>
                    </>
                  )}

                  {activeTab === 'result' && (
                    <>
                      <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-300">রেজিস্ট্রেশন নং</th>
                      <th className="py-2.5 px-3 min-w-[110px] border-r border-slate-300">সেশন / শিক্ষাবর্ষ</th>
                      <th className="py-2.5 px-3 min-w-[140px] border-r border-slate-300">বিভাগ / গ্রুপ</th>
                      <th className="py-2.5 px-3 min-w-[100px] border-r border-slate-300">প্রাপ্ত GPA</th>
                      <th className="py-2.5 px-3 min-w-[120px] border-r border-slate-300">শিক্ষা বোর্ড</th>
                      <th className="py-2.5 px-3 min-w-[130px] border-r border-slate-300">পরীক্ষার কেন্দ্র (বাংলা)</th>
                      <th className="py-2.5 px-3 min-w-[130px]">Center (EN)</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-medium">
                {draftItems.map((item, idx) => (
                  <tr key={item.studentId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1.5 px-3 text-center font-bold text-slate-500 bg-slate-50 border-r border-slate-200">
                      {idx + 1}
                    </td>

                    {/* Board Roll */}
                    <td className="py-1 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={item.boardRollNo || ''}
                        onChange={(e) => handleCellChange(item.studentId, 'boardRollNo', e.target.value)}
                        className={`w-full px-2 py-1 rounded-md text-xs font-bold outline-hidden transition-colors ${
                          isFieldDirty(item.studentId, 'boardRollNo') ? 'bg-amber-100 font-black text-amber-900' : 'bg-transparent focus:bg-emerald-50'
                        }`}
                      />
                    </td>

                    {/* PERSONAL INFO TAB */}
                    {activeTab === 'personal' && (
                      <>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.nameBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'nameBn', e.target.value)}
                            placeholder="বাংলা নাম"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'nameBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.name || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'name', e.target.value)}
                            placeholder="English Name"
                            className={`w-full px-2 py-1 rounded-md text-xs uppercase outline-hidden ${
                              isFieldDirty(item.studentId, 'name') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.fatherNameBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'fatherNameBn', e.target.value)}
                            placeholder="পিতার নাম (বাংলা)"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'fatherNameBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.fatherName || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'fatherName', e.target.value)}
                            placeholder="Father's Name"
                            className={`w-full px-2 py-1 rounded-md text-xs uppercase outline-hidden ${
                              isFieldDirty(item.studentId, 'fatherName') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.motherNameBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'motherNameBn', e.target.value)}
                            placeholder="মাতার নাম (বাংলা)"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'motherNameBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.motherName || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'motherName', e.target.value)}
                            placeholder="Mother's Name"
                            className={`w-full px-2 py-1 rounded-md text-xs uppercase outline-hidden ${
                              isFieldDirty(item.studentId, 'motherName') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            type="text"
                            value={item.dateOfBirth || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'dateOfBirth', e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'dateOfBirth') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                      </>
                    )}

                    {/* ADDRESS TAB */}
                    {activeTab === 'address' && (
                      <>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.villageBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'villageBn', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'villageBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.village || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'village', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'village') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.postOfficeBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'postOfficeBn', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'postOfficeBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.postOffice || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'postOffice', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'postOffice') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.upazilaBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'upazilaBn', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'upazilaBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.upazila || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'upazila', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'upazila') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.districtBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'districtBn', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'districtBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            type="text"
                            value={item.district || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'district', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'district') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                      </>
                    )}

                    {/* RESULTS TAB */}
                    {activeTab === 'result' && (
                      <>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.registrationNo || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'registrationNo', e.target.value)}
                            className={`w-full px-2 py-1 rounded-md text-xs font-mono outline-hidden ${
                              isFieldDirty(item.studentId, 'registrationNo') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.session || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'session', e.target.value)}
                            placeholder="e.g. 2024-25"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'session') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.group || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'group', e.target.value)}
                            placeholder="e.g. Business Studies"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'group') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.gpa || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'gpa', e.target.value)}
                            placeholder="5.00"
                            className={`w-full px-2 py-1 rounded-md text-xs font-bold text-emerald-800 outline-hidden ${
                              isFieldDirty(item.studentId, 'gpa') ? 'bg-amber-100 font-black' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <select
                            value={item.board || 'Cumilla'}
                            onChange={(e) => handleCellChange(item.studentId, 'board', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent rounded-md text-xs font-medium outline-hidden"
                          >
                            {BANGLADESH_EDUCATION_BOARDS.map(b => (
                              <option key={b.id} value={b.id}>{b.id}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.examCenterBn || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'examCenterBn', e.target.value)}
                            placeholder="যেমন: নাঙ্গলকোট-১"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden font-bangla ${
                              isFieldDirty(item.studentId, 'examCenterBn') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                        <td className="py-1 px-2">
                          <input
                            type="text"
                            value={item.examCenter || ''}
                            onChange={(e) => handleCellChange(item.studentId, 'examCenter', e.target.value)}
                            placeholder="e.g. Nangalkot-1"
                            className={`w-full px-2 py-1 rounded-md text-xs outline-hidden ${
                              isFieldDirty(item.studentId, 'examCenter') ? 'bg-amber-100 font-bold' : 'bg-transparent focus:bg-emerald-50'
                            }`}
                          />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetChanges}
              disabled={dirtyChanges.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>পরিবর্তন বাতিল</span>
            </button>
            <span className="text-slate-400">|</span>
            <span className="text-xs text-slate-600">
              মোট শিক্ষার্থী: <strong className="text-slate-900">{draftItems.length}</strong> জন
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              disabled={dirtyChanges.length === 0}
              onClick={() => setShowReviewDialog(true)}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>পর্যালোচনা ও সংরক্ষণ ({dirtyChanges.length})</span>
            </button>
          </div>
        </div>

        {/* Review & Save Confirmation Dialog */}
        {showReviewDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">পরিবর্তন পর্যালোচনা</h4>
                    <p className="text-xs text-slate-500">
                      {dirtyChanges.length} জন শিক্ষার্থীর তথ্য আপডেট করা হবে
                    </p>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-xl p-3 border border-slate-200 divide-y divide-slate-100 text-xs">
                  {dirtyChanges.map(change => (
                    <div key={change.studentId} className="py-1.5 flex justify-between items-center">
                      <span className="font-bold text-slate-800">{change.studentName}</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        {change.fields.length}টি ফিল্ড পরিবর্তিত
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  এই পরিবর্তনগুলি প্রাতিষ্ঠানিক শিক্ষার্থী প্রোফাইল ও পরীক্ষার ফলাফলে একযোগে কার্যকর করা হবে।
                </p>
              </div>

              <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReviewDialog(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  ফিরে যান
                </button>
                <button
                  type="button"
                  onClick={handleFinalSave}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                >
                  নিশ্চিত সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
