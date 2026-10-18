import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StaffDesignationItem, StaffSubjectItem, StaffCategoryType, StaffSubjectType } from '../../types';
import { STAFF_CATEGORY_LABELS } from '../../data/defaultStaffMaster';
import { 
  X, Plus, Edit2, Trash2, ShieldCheck, 
  RotateCcw, Search, BookOpen, Award, 
  Briefcase, CheckCircle2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'designations' | 'subjects';
}

export const StaffDesignationSubjectSettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'designations'
}) => {
  const { 
    staff,
    staffDesignations, 
    addStaffDesignation, 
    updateStaffDesignation, 
    deleteStaffDesignation, 
    resetStaffDesignations,
    staffSubjects, 
    addStaffSubject, 
    updateStaffSubject, 
    deleteStaffSubject, 
    resetStaffSubjects 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'designations' | 'subjects'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubjectType, setSelectedSubjectType] = useState<string>('all');

  // Designation Add/Edit form state
  const [isDesignationFormOpen, setIsDesignationFormOpen] = useState(false);
  const [editingDesignationId, setEditingDesignationId] = useState<string | null>(null);
  const [desFormData, setDesFormData] = useState<Partial<StaffDesignationItem>>({
    id: '',
    name: '',
    nameBn: '',
    category: 'administrative',
    sanctionedPosts: 1,
    staffType: 'teaching',
    payGrade: 'Grade 10',
    description: ''
  });

  // Subject Add/Edit form state
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subFormData, setSubFormData] = useState<Partial<StaffSubjectItem>>({
    id: '',
    name: '',
    nameBn: '',
    code: '',
    type: 'general',
    description: ''
  });

  if (!isOpen) return null;

  const designationsList = staffDesignations || [];
  const subjectsList = staffSubjects || [];
  const staffList = staff || [];

  // Working posts per designation
  const getWorkingCount = (desId: string, desName: string, desNameBn: string) => {
    return staffList.filter(s => 
      s.designationId === desId || 
      (s.designation && s.designation.toLowerCase() === desName.toLowerCase()) ||
      (s.designationBn && s.designationBn === desNameBn)
    ).length;
  };

  // Filtered Designations
  const filteredDesignations = designationsList.filter(d => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.nameBn.includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.payGrade && d.payGrade.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered Subjects
  const filteredSubjects = subjectsList.filter(s => {
    if (selectedSubjectType !== 'all' && s.type !== selectedSubjectType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.nameBn.includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Open Designation Form
  const handleOpenAddDesignation = () => {
    const autoId = `des_${Date.now().toString().slice(-6)}`;
    setEditingDesignationId(null);
    setDesFormData({
      id: autoId,
      name: '',
      nameBn: '',
      category: 'subject_based',
      sanctionedPosts: 1,
      staffType: 'teaching',
      payGrade: 'Grade 10',
      description: ''
    });
    setIsDesignationFormOpen(true);
  };

  const handleOpenEditDesignation = (des: StaffDesignationItem) => {
    setEditingDesignationId(des.id);
    setDesFormData({ ...des });
    setIsDesignationFormOpen(true);
  };

  const handleSaveDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desFormData.name || !desFormData.nameBn || !desFormData.id) {
      toast.error('পদবির আইডি, বাংলা এবং ইংরেজি নাম আবশ্যক।');
      return;
    }

    if (editingDesignationId) {
      updateStaffDesignation(editingDesignationId, desFormData);
      toast.success('পদবি সফলভাবে আপডেট হয়েছে');
    } else {
      addStaffDesignation(desFormData as StaffDesignationItem);
      toast.success('নতুন পদবি সফলভাবে যুক্ত হয়েছে');
    }
    setIsDesignationFormOpen(false);
  };

  const handleDeleteDesignation = (id: string, nameBn: string) => {
    const assignedCount = staffList.filter(s => s.designationId === id).length;
    if (assignedCount > 0) {
      toast.error(`সতর্কতা: এই পদবিতে বর্তমানে ${assignedCount} জন শিক্ষক/কর্মচারী কর্মরত রয়েছেন। পদবিটি মুছে ফেলার পূর্বে তাদের পদবি পরিবর্তন করুন।`);
      return;
    }

    if (confirm(`আপনি কি নিশ্চিতভাবে "${nameBn}" পদবি মুছে ফেলতে চান?`)) {
      deleteStaffDesignation(id);
      toast.success(`"${nameBn}" পদবি মুছে ফেলা হয়েছে`);
    }
  };

  // Open Subject Form
  const handleOpenAddSubject = () => {
    const autoId = `sub_${Date.now().toString().slice(-6)}`;
    setEditingSubjectId(null);
    setSubFormData({
      id: autoId,
      name: '',
      nameBn: '',
      code: '',
      type: 'general',
      description: ''
    });
    setIsSubjectFormOpen(true);
  };

  const handleOpenEditSubject = (sub: StaffSubjectItem) => {
    setEditingSubjectId(sub.id);
    setSubFormData({ ...sub });
    setIsSubjectFormOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name || !subFormData.nameBn || !subFormData.id) {
      toast.error('বিষয়ের আইডি, বাংলা এবং ইংরেজি নাম আবশ্যক।');
      return;
    }

    if (editingSubjectId) {
      updateStaffSubject(editingSubjectId, subFormData);
      toast.success('বিষয় সফলভাবে আপডেট হয়েছে');
    } else {
      addStaffSubject(subFormData as StaffSubjectItem);
      toast.success('নতুন বিষয় সফলভাবে যুক্ত হয়েছে');
    }
    setIsSubjectFormOpen(false);
  };

  const handleDeleteSubject = (id: string, nameBn: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${nameBn}" বিষয়টি মুছে ফেলতে চান?`)) {
      deleteStaffSubject(id);
      toast.success(`"${nameBn}" বিষয়টি মুছে ফেলা হয়েছে`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>মাস্টার কনফিগারেশন ও আইডি-ভিত্তিক রিলেশনাল ডাটা</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              পদবি ও বিষয় সেটিংস (Designation & Subject Master)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              অনুমোদিত পদ সংখ্যা, প্রশাসনিক ও ভোকেশনাল ক্যাটেগরি এবং পাঠ্য বিষয়সমূহের আইডি ভিত্তিক ডিরেক্টরি।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('আপনি কি পদবি ও বিষয়ের তালিকা ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
                  if (activeTab === 'designations') {
                    resetStaffDesignations();
                    toast.success('পদবির তালিকা ডিফল্ট অবস্থায় পুনরুদ্ধার করা হয়েছে');
                  } else {
                    resetStaffSubjects();
                    toast.success('বিষয়ের তালিকা ডিফল্ট অবস্থায় পুনরুদ্ধার করা হয়েছে');
                  }
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
              title="ডিফল্ট মাস্টার ডাটা রিস্টোর করুন"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>রিসেট ডিফল্ট</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('designations'); setSearchQuery(''); }}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'designations'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>পদবি সেটিংস ({designationsList.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('subjects'); setSearchQuery(''); }}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>বিষয় সেটিংস ({subjectsList.length})</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'designations' ? 'পদবি বা আইডি খুঁজুন...' : 'বিষয় বা কোড খুঁজুন...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {activeTab === 'designations' ? (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
              >
                <option value="all">সকল ক্যাটেগরি</option>
                <option value="administrative">প্রশাসনিক</option>
                <option value="subject_based">বিষয়ভিত্তিক</option>
                <option value="vocational_trade">ভোকেশনাল ট্রেড</option>
                <option value="science_computer">বিজ্ঞান ও কম্পিউটার</option>
                <option value="support_staff">সহায়ক স্টাফ</option>
              </select>
            ) : (
              <select
                value={selectedSubjectType}
                onChange={(e) => setSelectedSubjectType(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
              >
                <option value="all">সকল বিষয় ধরণ</option>
                <option value="general">সাধারণ বিষয় (১৫টি)</option>
                <option value="vocational">ভোকেশনাল ট্রেড বিষয় (১২টি)</option>
              </select>
            )}

            <button
              onClick={activeTab === 'designations' ? handleOpenAddDesignation : handleOpenAddSubject}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'designations' ? 'নতুন পদবি যুক্ত' : 'নতুন বিষয় যুক্ত'}</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'designations' ? (
            /* Designations Table */
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">পদবির নাম (বাংলা ও ইংরেজি)</th>
                    <th className="py-3 px-4">ইউনিক আইডি</th>
                    <th className="py-3 px-4">ক্যাটেগরি</th>
                    <th className="py-3 px-4 text-center">অনুমোদিত পদ</th>
                    <th className="py-3 px-4 text-center">কর্মরত</th>
                    <th className="py-3 px-4 text-center">শূন্যপদ</th>
                    <th className="py-3 px-4">বেতন গ্রেড</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredDesignations.map((des) => {
                    const working = getWorkingCount(des.id, des.name, des.nameBn);
                    const vacant = Math.max(0, des.sanctionedPosts - working);
                    const catMeta = STAFF_CATEGORY_LABELS[des.category] || STAFF_CATEGORY_LABELS.support_staff;

                    return (
                      <tr key={des.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{des.nameBn}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{des.name}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-700">
                          {des.id}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catMeta.badgeColor}`}>
                            {catMeta.bn}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {des.sanctionedPosts}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-emerald-600">{working}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${vacant > 0 ? 'text-rose-600 font-black' : 'text-slate-400'}`}>
                            {vacant}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {des.payGrade || '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditDesignation(des)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="সম্পাদনা করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDesignation(des.id, des.nameBn)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Subjects Table */
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">বিষয়ের নাম (বাংলা ও ইংরেজি)</th>
                    <th className="py-3 px-4">ইউনিক আইডি</th>
                    <th className="py-3 px-4">বিষয় কোড</th>
                    <th className="py-3 px-4">ধরণ</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredSubjects.map((sub) => {
                    const isVoc = sub.type === 'vocational';
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{sub.nameBn}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{sub.name}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-700">
                          {sub.id}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {sub.code || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isVoc 
                              ? 'bg-amber-50 text-amber-800 border-amber-200' 
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {isVoc ? 'ভোকেশনাল ট্রেড' : 'সাধারণ বিষয়'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditSubject(sub)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="সম্পাদনা করুন"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(sub.id, sub.nameBn)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {activeTab === 'designations' ? (
              <span>মোট পদবি: <strong className="text-slate-800">{designationsList.length}</strong> টি | মোট অনুমোদিত পদ: <strong className="text-slate-800">{designationsList.reduce((a, b) => a + (b.sanctionedPosts || 0), 0)}</strong> টি</span>
            ) : (
              <span>মোট বিষয়: <strong className="text-slate-800">{subjectsList.length}</strong> টি (সাধারণ: {subjectsList.filter(s => s.type === 'general').length} টি, ভোকেশনাল: {subjectsList.filter(s => s.type === 'vocational').length} টি)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>

      {/* Designation Add/Edit Sub-Modal */}
      {isDesignationFormOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingDesignationId ? 'পদবি তথ্য সম্পাদন করুন' : 'নতুন পদবি যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setIsDesignationFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDesignation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পদবি আইডি (Unique ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingDesignationId}
                  value={desFormData.id || ''}
                  onChange={(e) => setDesFormData(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  placeholder="e.g. des_senior_teacher"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    পদবির নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={desFormData.nameBn || ''}
                    onChange={(e) => setDesFormData(prev => ({ ...prev, nameBn: e.target.value }))}
                    placeholder="e.g. সিনিয়র শিক্ষক"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    পদবির নাম (ইংরেজি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={desFormData.name || ''}
                    onChange={(e) => setDesFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Senior Teacher"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ক্যাটেগরি <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={desFormData.category || 'subject_based'}
                    onChange={(e: any) => setDesFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="administrative">প্রশাসনিক (Administrative)</option>
                    <option value="subject_based">বিষয়ভিত্তিক (Subject-Based)</option>
                    <option value="vocational_trade">ভোকেশনাল ট্রেড ভিত্তিক (Vocational Trade)</option>
                    <option value="science_computer">বিজ্ঞান ও কম্পিউটার (Science & Computer)</option>
                    <option value="support_staff">সহায়ক স্টাফ (Support Staff)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    অনুমোদিত পদ সংখ্যা <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={desFormData.sanctionedPosts || 1}
                    onChange={(e) => setDesFormData(prev => ({ ...prev, sanctionedPosts: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ধরণ
                  </label>
                  <select
                    value={desFormData.staffType || 'teaching'}
                    onChange={(e: any) => setDesFormData(prev => ({ ...prev, staffType: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="teaching">শিক্ষক (Teaching)</option>
                    <option value="non_teaching">কর্মচারী (Non-Teaching)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বেতন স্কেল / গ্রেড
                  </label>
                  <input
                    type="text"
                    value={desFormData.payGrade || ''}
                    onChange={(e) => setDesFormData(prev => ({ ...prev, payGrade: e.target.value }))}
                    placeholder="e.g. Grade 9 (22,000)"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDesignationFormOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Add/Edit Sub-Modal */}
      {isSubjectFormOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingSubjectId ? 'বিষয় তথ্য সম্পাদন করুন' : 'নতুন বিষয় যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setIsSubjectFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিষয় আইডি (Unique ID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingSubjectId}
                  value={subFormData.id || ''}
                  onChange={(e) => setSubFormData(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  placeholder="e.g. sub_physics"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিষয়ের নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subFormData.nameBn || ''}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, nameBn: e.target.value }))}
                    placeholder="e.g. পদার্থবিজ্ঞান"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিষয়ের নাম (ইংরেজি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subFormData.name || ''}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Physics"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিষয়ের ধরণ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={subFormData.type || 'general'}
                    onChange={(e: any) => setSubFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="general">সাধারণ বিষয় (General)</option>
                    <option value="vocational">ভোকেশনাল ট্রেড (Vocational Trade)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিষয় কোড (Subject Code)
                  </label>
                  <input
                    type="text"
                    value={subFormData.code || ''}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g. 136 বা VOC-63"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubjectFormOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
