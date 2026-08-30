import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Layers, 
  GitFork, 
  BookmarkCheck, 
  Calendar, 
  GraduationCap, 
  Users, 
  Sparkles,
  Check,
  X,
  Languages
} from 'lucide-react';
import { AcademicClass, AcademicGroup, AcademicSection } from '../types';

export const ClassAndSection: React.FC = () => {
  const { 
    language,
    academicClasses, 
    addAcademicClass, 
    updateAcademicClass, 
    deleteAcademicClass, 
    setDefaultClass,
    academicGroups,
    addAcademicGroup,
    updateAcademicGroup,
    deleteAcademicGroup,
    setDefaultGroup,
    academicSections,
    addAcademicSection,
    updateAcademicSection,
    deleteAcademicSection,
    setDefaultSection,
    students
  } = useAppStore();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'classes' | 'groups' | 'sections'>('classes');

  // Class state
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassNameEn, setNewClassNameEn] = useState('');
  const [newClassNameBn, setNewClassNameBn] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassNameEn, setEditingClassNameEn] = useState('');
  const [editingClassNameBn, setEditingClassNameBn] = useState('');

  // Group state
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupNameEn, setNewGroupNameEn] = useState('');
  const [newGroupNameBn, setNewGroupNameBn] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupNameEn, setEditingGroupNameEn] = useState('');
  const [editingGroupNameBn, setEditingGroupNameBn] = useState('');

  // Section state
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionNameEn, setNewSectionNameEn] = useState('');
  const [newSectionNameBn, setNewSectionNameBn] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionNameEn, setEditingSectionNameEn] = useState('');
  const [editingSectionNameBn, setEditingSectionNameBn] = useState('');

  // --- Handlers for Class ---
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const nameEn = newClassNameEn.trim();
    const nameBn = newClassNameBn.trim();
    if (!nameEn && !nameBn) return;

    addAcademicClass({
      id: Date.now().toString(),
      name: nameEn || nameBn,
      nameBn: nameBn || nameEn,
      isDefault: (academicClasses || []).length === 0,
    });
    setNewClassNameEn('');
    setNewClassNameBn('');
    setShowAddClass(false);
  };

  const handleStartEditClass = (cls: AcademicClass) => {
    setEditingClassId(cls.id);
    setEditingClassNameEn(cls.name || '');
    setEditingClassNameBn(cls.nameBn || '');
  };

  const handleSaveEditClass = (id: string) => {
    const nameEn = editingClassNameEn.trim();
    const nameBn = editingClassNameBn.trim();
    if (!nameEn && !nameBn) return;
    updateAcademicClass(id, { 
      name: nameEn || nameBn,
      nameBn: nameBn || nameEn
    });
    setEditingClassId(null);
  };

  const handleDeleteClass = (id: string) => {
    const cls = (academicClasses || []).find(c => c.id === id);
    if (!cls) return;
    const studentCount = (students || []).filter(s => s.class === cls.name || (cls.nameBn && s.class === cls.nameBn)).length;
    const displayName = cls.nameBn ? `${cls.name} (${cls.nameBn})` : cls.name;
    const confirmMsg = isBn
      ? `আপনি কি নিশ্চিতভাবে "${displayName}" শ্রেণি মুছে ফেলতে চান?${studentCount > 0 ? ` (এই শ্রেণিতে ${studentCount} জন শিক্ষার্থী রয়েছে)` : ''}`
      : `Are you sure you want to delete "${displayName}"?${studentCount > 0 ? ` (${studentCount} students enrolled)` : ''}`;
    if (window.confirm(confirmMsg)) {
      deleteAcademicClass(id);
    }
  };

  // --- Handlers for Group ---
  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const nameEn = newGroupNameEn.trim();
    const nameBn = newGroupNameBn.trim();
    if (!nameEn && !nameBn) return;

    addAcademicGroup({
      id: `grp_${Date.now()}`,
      name: nameEn || nameBn,
      nameBn: nameBn || nameEn,
      isDefault: (academicGroups || []).length === 0,
    });
    setNewGroupNameEn('');
    setNewGroupNameBn('');
    setShowAddGroup(false);
  };

  const handleStartEditGroup = (grp: AcademicGroup) => {
    setEditingGroupId(grp.id);
    setEditingGroupNameEn(grp.name || '');
    setEditingGroupNameBn(grp.nameBn || '');
  };

  const handleSaveEditGroup = (id: string) => {
    const nameEn = editingGroupNameEn.trim();
    const nameBn = editingGroupNameBn.trim();
    if (!nameEn && !nameBn) return;
    updateAcademicGroup(id, { 
      name: nameEn || nameBn,
      nameBn: nameBn || nameEn
    });
    setEditingGroupId(null);
  };

  const handleDeleteGroup = (id: string) => {
    const grp = (academicGroups || []).find(g => g.id === id);
    if (!grp) return;
    const studentCount = (students || []).filter(s => s.group === grp.name || (grp.nameBn && s.group === grp.nameBn)).length;
    const displayName = grp.nameBn ? `${grp.name} (${grp.nameBn})` : grp.name;
    const confirmMsg = isBn
      ? `আপনি কি নিশ্চিতভাবে "${displayName}" বিভাগ মুছে ফেলতে চান?${studentCount > 0 ? ` (${studentCount} জন শিক্ষার্থী এই বিভাগে রয়েছে)` : ''}`
      : `Are you sure you want to delete group "${displayName}"?${studentCount > 0 ? ` (${studentCount} students in this group)` : ''}`;
    if (window.confirm(confirmMsg)) {
      deleteAcademicGroup(id);
    }
  };

  // --- Handlers for Section ---
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    const nameEn = newSectionNameEn.trim();
    const nameBn = newSectionNameBn.trim();
    if (!nameEn && !nameBn) return;

    addAcademicSection({
      id: `sec_${Date.now()}`,
      name: nameEn || nameBn,
      nameBn: nameBn || nameEn,
      isDefault: (academicSections || []).length === 0,
    });
    setNewSectionNameEn('');
    setNewSectionNameBn('');
    setShowAddSection(false);
  };

  const handleStartEditSection = (sec: AcademicSection) => {
    setEditingSectionId(sec.id);
    setEditingSectionNameEn(sec.name || '');
    setEditingSectionNameBn(sec.nameBn || '');
  };

  const handleSaveEditSection = (id: string) => {
    const nameEn = editingSectionNameEn.trim();
    const nameBn = editingSectionNameBn.trim();
    if (!nameEn && !nameBn) return;
    updateAcademicSection(id, { 
      name: nameEn || nameBn,
      nameBn: nameBn || nameEn
    });
    setEditingSectionId(null);
  };

  const handleDeleteSection = (id: string) => {
    const sec = (academicSections || []).find(s => s.id === id);
    if (!sec) return;
    const studentCount = (students || []).filter(s => s.section === sec.name || (sec.nameBn && s.section === sec.nameBn)).length;
    const displayName = sec.nameBn ? `${sec.name} (${sec.nameBn})` : sec.name;
    const confirmMsg = isBn
      ? `আপনি কি নিশ্চিতভাবে "${displayName}" শাখা মুছে ফেলতে চান?${studentCount > 0 ? ` (${studentCount} জন শিক্ষার্থী এই শাখায় রয়েছে)` : ''}`
      : `Are you sure you want to delete section "${displayName}"?${studentCount > 0 ? ` (${studentCount} students in this section)` : ''}`;
    if (window.confirm(confirmMsg)) {
      deleteAcademicSection(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>{isBn ? 'একাডেমিক কাঠামো কনফিগারেশন' : 'Academic Structure'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <span>{isBn ? 'শ্রেণি, বিভাগ ও শাখা ব্যবস্থাপনা' : 'Class, Group & Section Settings'}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              <Languages className="w-3.5 h-3.5" />
              <span>{isBn ? 'দ্বি-ভাষিক (বাংলা ও ইংরেজি)' : 'Bilingual (BN & EN)'}</span>
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isBn
              ? 'শ্রেণি, বিভাগ ও শাখার ইংরেজি ও বাংলা উভয় নাম সংরক্ষণ ও সম্পাদনা করুন। এটি শিক্ষার্থী ভর্তি, সার্টিফিকেট ও এক্সপোর্ট সর্বত্র ব্যবহৃত হবে।'
              : 'Configure English and Bengali versions for classes, groups, and sections used across student profiles, admissions, and certificates.'}
          </p>
        </div>

        {/* Action Button for Active Tab */}
        <div>
          {activeTab === 'classes' && (
            <button
              onClick={() => setShowAddClass(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন শ্রেণি যুক্ত করুন' : 'Add New Class'}</span>
            </button>
          )}
          {activeTab === 'groups' && (
            <button
              onClick={() => setShowAddGroup(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন বিভাগ যুক্ত করুন' : 'Add New Group'}</span>
            </button>
          )}
          {activeTab === 'sections' && (
            <button
              onClick={() => setShowAddSection(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন শাখা যুক্ত করুন' : 'Add New Section'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Academic Hierarchy Flow Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-900/50">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{isBn ? 'স্টুডেন্ট ডাটা হায়ারার্কি আর্কিটেকচার (বাংলা ও ইংরেজি সাপোর্ট)' : 'Student Data Hierarchy (Dual Language)'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">1</div>
              <div>
                <p className="text-xs text-slate-300">{isBn ? 'ধাপ ১' : 'Level 1'}</p>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-300" />
                  {isBn ? 'শিক্ষাবর্ষ' : 'Academic Session'}
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300">{isBn ? 'যেমন: ২০২৬, ২০২৫-২০২৬' : 'e.g. 2026, 2025-2026'}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">2</div>
              <div>
                <p className="text-xs text-slate-300">{isBn ? 'ধাপ ২' : 'Level 2'}</p>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-300" />
                  {isBn ? 'শ্রেণি (Class)' : 'Class'}
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              {isBn ? `মোট ${(academicClasses || []).length} টি শ্রেণি সংরক্ষিত` : `${(academicClasses || []).length} Classes configured`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">3</div>
              <div>
                <p className="text-xs text-slate-300">{isBn ? 'ধাপ ৩' : 'Level 3'}</p>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <GitFork className="w-4 h-4 text-purple-300" />
                  {isBn ? 'বিভাগ (Group)' : 'Group / Dept'}
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              {isBn ? `মোট ${(academicGroups || []).length} টি বিভাগ সংরক্ষিত` : `${(academicGroups || []).length} Groups configured`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">4</div>
              <div>
                <p className="text-xs text-slate-300">{isBn ? 'ধাপ ৪' : 'Level 4'}</p>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-amber-300" />
                  {isBn ? 'শাখা (Section)' : 'Section'}
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              {isBn ? `মোট ${(academicSections || []).length} টি শাখা সংরক্ষিত` : `${(academicSections || []).length} Sections configured`}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 bg-slate-50 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'classes'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{isBn ? 'শ্রেণি ব্যবস্থাপনা' : 'Classes'}</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 font-bold">
            {(academicClasses || []).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'groups'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>{isBn ? 'বিভাগ ব্যবস্থাপনা' : 'Groups / Departments'}</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-600 font-bold">
            {(academicGroups || []).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sections'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>{isBn ? 'শাখা ব্যবস্থাপনা' : 'Sections'}</span>
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 font-bold">
            {(academicSections || []).length}
          </span>
        </button>
      </div>

      {/* --- TAB 1: CLASSES --- */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {showAddClass && (
            <form onSubmit={handleAddClass} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'নতুন শ্রেণি যুক্ত করার ফরম' : 'Add New Class Form'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'শ্রেণির নাম (ইংরেজি)' : 'Class Name (English)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassNameEn}
                    onChange={(e) => setNewClassNameEn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm"
                    placeholder="e.g. Class 11"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'শ্রেণির নাম (বাংলা)' : 'Class Name (Bangla)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newClassNameBn}
                    onChange={(e) => setNewClassNameBn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm"
                    placeholder="যেমন: একাদশ শ্রেণি"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddClass(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors text-sm shadow-xs">
                  <Check className="w-4 h-4" />
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Class'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4 pl-6">{isBn ? 'ইংরেজি নাম' : 'Name (English)'}</th>
                    <th className="p-4">{isBn ? 'বাংলা নাম' : 'Name (Bangla)'}</th>
                    <th className="p-4 text-center">{isBn ? 'ডিফল্ট শ্রেণি' : 'Default'}</th>
                    <th className="p-4 text-center">{isBn ? 'মোট শিক্ষার্থী' : 'Enrolled'}</th>
                    <th className="p-4 pr-6 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(academicClasses || []).map((cls) => {
                    const studentCount = (students || []).filter(s => s.class === cls.name || (cls.nameBn && s.class === cls.nameBn)).length;
                    const isEditing = editingClassId === cls.id;

                    return (
                      <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 text-slate-800 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingClassNameEn}
                              onChange={(e) => setEditingClassNameEn(e.target.value)}
                              className="w-full px-3 py-1.5 border border-indigo-400 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="English name"
                              autoFocus
                            />
                          ) : (
                            <span className="font-semibold text-slate-800 text-base">{cls.name}</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingClassNameBn}
                                onChange={(e) => setEditingClassNameBn(e.target.value)}
                                className="w-full px-3 py-1.5 border border-indigo-400 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="বাংলা নাম"
                              />
                              <button
                                onClick={() => handleSaveEditClass(cls.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg shrink-0"
                                title={isBn ? 'সংরক্ষণ' : 'Save'}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingClassId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                                title={isBn ? 'বাতিল' : 'Cancel'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-xs border border-indigo-100">
                              {cls.nameBn || cls.name}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setDefaultClass(cls.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              cls.isDefault 
                                ? 'bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {cls.isDefault ? (isBn ? 'ডিফল্ট শ্রেণি' : 'Default') : (isBn ? 'ডিফল্ট নির্ধারণ করুন' : 'Set Default')}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {studentCount} {isBn ? 'জন' : ''}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEditClass(cls)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={isBn ? 'এডিট' : 'Edit'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(academicClasses || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        {isBn ? 'কোনো শ্রেণি পাওয়া যায়নি। নতুন শ্রেণি যুক্ত করুন।' : 'No classes found. Please add one.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: GROUPS / DEPARTMENTS --- */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {showAddGroup && (
            <form onSubmit={handleAddGroup} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'নতুন বিভাগ যুক্ত করার ফরম' : 'Add New Group Form'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বিভাগের নাম (ইংরেজি)' : 'Group Name (English)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupNameEn}
                    onChange={(e) => setNewGroupNameEn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm"
                    placeholder="e.g. Science, Humanities, Business Studies"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বিভাগের নাম (বাংলা)' : 'Group Name (Bangla)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupNameBn}
                    onChange={(e) => setNewGroupNameBn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm"
                    placeholder="যেমন: বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddGroup(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors text-sm shadow-xs">
                  <Check className="w-4 h-4" />
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Group'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4 pl-6">{isBn ? 'ইংরেজি নাম' : 'Name (English)'}</th>
                    <th className="p-4">{isBn ? 'বাংলা নাম' : 'Name (Bangla)'}</th>
                    <th className="p-4 text-center">{isBn ? 'ডিফল্ট বিভাগ' : 'Default'}</th>
                    <th className="p-4 text-center">{isBn ? 'মোট শিক্ষার্থী' : 'Enrolled'}</th>
                    <th className="p-4 pr-6 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(academicGroups || []).map((grp) => {
                    const studentCount = (students || []).filter(s => s.group === grp.name || (grp.nameBn && s.group === grp.nameBn)).length;
                    const isEditing = editingGroupId === grp.id;

                    return (
                      <tr key={grp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 text-slate-800 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingGroupNameEn}
                              onChange={(e) => setEditingGroupNameEn(e.target.value)}
                              className="w-full px-3 py-1.5 border border-indigo-400 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="English name"
                              autoFocus
                            />
                          ) : (
                            <span className="font-semibold text-slate-800 text-base">{grp.name}</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingGroupNameBn}
                                onChange={(e) => setEditingGroupNameBn(e.target.value)}
                                className="w-full px-3 py-1.5 border border-indigo-400 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="বাংলা নাম"
                              />
                              <button
                                onClick={() => handleSaveEditGroup(grp.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg shrink-0"
                                title={isBn ? 'সংরক্ষণ' : 'Save'}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingGroupId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                                title={isBn ? 'বাতিল' : 'Cancel'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium text-xs border border-purple-100">
                              {grp.nameBn || grp.name}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setDefaultGroup(grp.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              grp.isDefault 
                                ? 'bg-purple-100 text-purple-700 shadow-sm border border-purple-200' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {grp.isDefault ? (isBn ? 'ডিফল্ট বিভাগ' : 'Default') : (isBn ? 'ডিফল্ট নির্ধারণ করুন' : 'Set Default')}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {studentCount} {isBn ? 'জন' : ''}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEditGroup(grp)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={isBn ? 'এডিট' : 'Edit'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(grp.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(academicGroups || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        {isBn ? 'কোনো বিভাগ পাওয়া যায়নি। নতুন বিভাগ যুক্ত করুন।' : 'No groups found. Please add one.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: SECTIONS --- */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {showAddSection && (
            <form onSubmit={handleAddSection} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-1">
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'নতুন শাখা যুক্ত করার ফরম' : 'Add New Section Form'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'শাখার নাম (ইংরেজি)' : 'Section Name (English)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSectionNameEn}
                    onChange={(e) => setNewSectionNameEn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm"
                    placeholder="e.g. Section A, Padma, Meghna"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'শাখার নাম (বাংলা)' : 'Section Name (Bangla)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSectionNameBn}
                    onChange={(e) => setNewSectionNameBn(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm"
                    placeholder="যেমন: ক শাখা, পদ্মা, মেঘনা"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddSection(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors">
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors text-sm shadow-xs">
                  <Check className="w-4 h-4" />
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Section'}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-4 pl-6">{isBn ? 'ইংরেজি নাম' : 'Name (English)'}</th>
                    <th className="p-4">{isBn ? 'বাংলা নাম' : 'Name (Bangla)'}</th>
                    <th className="p-4 text-center">{isBn ? 'ডিফল্ট শাখা' : 'Default'}</th>
                    <th className="p-4 text-center">{isBn ? 'মোট শিক্ষার্থী' : 'Enrolled'}</th>
                    <th className="p-4 pr-6 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {(academicSections || []).map((sec) => {
                    const studentCount = (students || []).filter(s => s.section === sec.name || (sec.nameBn && s.section === sec.nameBn)).length;
                    const isEditing = editingSectionId === sec.id;

                    return (
                      <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 text-slate-800 font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingSectionNameEn}
                              onChange={(e) => setEditingSectionNameEn(e.target.value)}
                              className="w-full px-3 py-1.5 border border-indigo-400 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="English name"
                              autoFocus
                            />
                          ) : (
                            <span className="font-semibold text-slate-800 text-base">{sec.name}</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-700">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingSectionNameBn}
                                onChange={(e) => setEditingSectionNameBn(e.target.value)}
                                className="w-full px-3 py-1.5 border border-indigo-400 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="বাংলা নাম"
                              />
                              <button
                                onClick={() => handleSaveEditSection(sec.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg shrink-0"
                                title={isBn ? 'সংরক্ষণ' : 'Save'}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingSectionId(null)}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                                title={isBn ? 'বাতিল' : 'Cancel'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium text-xs border border-amber-100">
                              {sec.nameBn || sec.name}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setDefaultSection(sec.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              sec.isDefault 
                                ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {sec.isDefault ? (isBn ? 'ডিফল্ট শাখা' : 'Default') : (isBn ? 'ডিফল্ট নির্ধারণ করুন' : 'Set Default')}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {studentCount} {isBn ? 'জন' : ''}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleStartEditSection(sec)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={isBn ? 'এডিট' : 'Edit'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(academicSections || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        {isBn ? 'কোনো শাখা পাওয়া যায়নি। নতুন শাখা যুক্ত করুন।' : 'No sections found. Please add one.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAndSection;
