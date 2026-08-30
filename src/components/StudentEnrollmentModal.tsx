import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Upload, Save, AlertCircle, Search, UserCheck } from 'lucide-react';
import { Student } from '../types';
import { useAppStore } from '../store/useAppStore';
import { LocationSelect } from './LocationSelect';
import { CreatableSelect } from './CreatableSelect';
import { compressImageBase64 } from '../utils/imageUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Partial<Student>) => void;
  student?: Student | null;
  generateId: (className: string) => string;
}

export const StudentEnrollmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  student,
  generateId
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [formError, setFormError] = useState<string | null>(null);
  
  const academicClasses = useAppStore(state => state.academicClasses);
  const academicGroups = useAppStore(state => state.academicGroups);
  const academicSections = useAppStore(state => state.academicSections);
  const language = useAppStore(state => state.language);
  const learnedLocations = useAppStore(state => state.learnedLocations);
  const learnLocation = useAppStore(state => state.learnLocation);

  // Dynamic dropdown lists & action creators from store
  const savedProfessions = useAppStore(state => state.savedProfessions);
  const addProfession = useAppStore(state => state.addProfession);
  const savedInstitutions = useAppStore(state => state.savedInstitutions);
  const addInstitution = useAppStore(state => state.addInstitution);
  const savedClasses = useAppStore(state => state.savedClasses);
  const addClassOption = useAppStore(state => state.addClassOption);
  const savedPassingYears = useAppStore(state => state.savedPassingYears);
  const addPassingYear = useAppStore(state => state.addPassingYear);
  const savedBoards = useAppStore(state => state.savedBoards);
  const addBoardOption = useAppStore(state => state.addBoardOption);
  const savedGuardianRelations = useAppStore(state => state.savedGuardianRelations);
  const addGuardianRelation = useAppStore(state => state.addGuardianRelation);
  const students = useAppStore(state => state.students);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (student) {
        setFormData({ ...student });
      } else {
        const defaultClass = (academicClasses || []).find(c => c.isDefault)?.name || (academicClasses || [])[0]?.name || 'Class 6';
        const defaultGroup = (academicGroups || []).find(g => g.isDefault)?.name || (academicGroups || [])[0]?.name || 'প্রযোজ্য নয়';
        const defaultSection = (academicSections || []).find(s => s.isDefault)?.name || (academicSections || [])[0]?.name || 'প্রযোজ্য নয়';
        setFormData({
          studentId: generateId(defaultClass),
          class: defaultClass,
          group: defaultGroup,
          section: defaultSection,
          session: new Date().getFullYear().toString(),
          prevPassingYear: (new Date().getFullYear() - 1).toString(),
          applicationDate: new Date().toISOString().split('T')[0],
          gender: 'Male',
          parentsStatus: 'দুজনেই জীবিত',
        });
      }
    }
  }, [isOpen, student?.id]);

  // Memoized fast lookup maps for locations
  const { locMap, districtsList, upazilasMap, unionsMap, postOfficesMap, villagesMap } = useMemo(() => {
    const locs = learnedLocations || [];
    const map = new Map<string, typeof locs[0]>();
    const dists: typeof locs = [];
    const upzByParent = new Map<string, typeof locs>();
    const uniByParent = new Map<string, typeof locs>();
    const poByParent = new Map<string, typeof locs>();
    const villByParent = new Map<string, typeof locs>();

    locs.forEach(l => {
      if (l.id) map.set(l.id, l);
      if (l.name) map.set(l.name.toLowerCase(), l);
      if (l.nameBn) map.set(l.nameBn, l);

      if (l.id.startsWith('dist_')) {
        dists.push(l);
      } else if (l.id.startsWith('upz_')) {
        const pid = l.parentId || '';
        if (!upzByParent.has(pid)) upzByParent.set(pid, []);
        upzByParent.get(pid)!.push(l);
      } else if (l.id.startsWith('uni_')) {
        const pid = l.parentId || '';
        if (!uniByParent.has(pid)) uniByParent.set(pid, []);
        uniByParent.get(pid)!.push(l);
      } else if (l.id.startsWith('po_')) {
        const pid = l.parentId || '';
        if (!poByParent.has(pid)) poByParent.set(pid, []);
        poByParent.get(pid)!.push(l);
      } else if (l.id.startsWith('vill_')) {
        const pid = l.parentId || '';
        if (!villByParent.has(pid)) villByParent.set(pid, []);
        villByParent.get(pid)!.push(l);
      }
    });

    return {
      locMap: map,
      districtsList: dists,
      upazilasMap: upzByParent,
      unionsMap: uniByParent,
      postOfficesMap: poByParent,
      villagesMap: villByParent
    };
  }, [learnedLocations]);

  const getLocId = useCallback((name: string | undefined, typePrefix?: string, parentId?: string) => {
    if (!name) return '';
    const loc = locMap.get(name) || locMap.get(name.toLowerCase());
    if (loc) {
      if ((!typePrefix || loc.id.startsWith(typePrefix)) && (!parentId || loc.parentId === parentId)) {
        return loc.id;
      }
    }
    const locs = learnedLocations || [];
    const found = locs.find(l => 
      (l.name === name || l.nameBn === name || l.id === name) && 
      (!typePrefix || l.id.startsWith(typePrefix)) &&
      (!parentId || l.parentId === parentId)
    );
    if (found) return found.id;
    const fallback = locs.find(l => 
      (l.name === name || l.nameBn === name || l.id === name) && 
      (!typePrefix || l.id.startsWith(typePrefix))
    );
    return fallback?.id || '';
  }, [locMap, learnedLocations]);

  const permDistId = getLocId(formData.district, 'dist_');
  const permUpzId = getLocId(formData.upazila, 'upz_', permDistId);
  const permUniId = getLocId(formData.union, 'uni_', permUpzId);
  const permPoId = getLocId(formData.postOffice, 'po_', permUpzId) || getLocId(formData.postOffice, 'uni_', permUpzId);

  const presDistId = getLocId(formData.presentDistrict, 'dist_');
  const presUpzId = getLocId(formData.presentUpazila, 'upz_', presDistId);
  const presUniId = getLocId(formData.presentUnion, 'uni_', presUpzId);
  const presPoId = getLocId(formData.presentPostOffice, 'po_', presUpzId) || getLocId(formData.presentPostOffice, 'uni_', presUpzId);

  const getDistricts = useCallback(() => districtsList, [districtsList]);
  
  const getUpazilas = useCallback((distId: string) => {
    if (!distId) return (learnedLocations || []).filter(l => l.id.startsWith('upz_'));
    const matched = upazilasMap.get(distId);
    if (matched && matched.length > 0) return matched;
    return (learnedLocations || []).filter(l => l.id.startsWith('upz_'));
  }, [upazilasMap, learnedLocations]);

  const getUnions = useCallback((upzId: string) => {
    if (!upzId) return (learnedLocations || []).filter(l => l.id.startsWith('uni_'));
    const matched = unionsMap.get(upzId);
    if (matched && matched.length > 0) return matched;
    return (learnedLocations || []).filter(l => l.id.startsWith('uni_'));
  }, [unionsMap, learnedLocations]);

  const getPostOffices = useCallback((upzId: string) => {
    if (!upzId) return (learnedLocations || []).filter(l => l.id.startsWith('po_') || l.id.startsWith('uni_'));
    const matched = postOfficesMap.get(upzId);
    if (matched && matched.length > 0) return matched;
    return (learnedLocations || []).filter(l => l.id.startsWith('po_') || l.id.startsWith('uni_'));
  }, [postOfficesMap, learnedLocations]);

  const getVillages = useCallback((poId: string) => {
    if (!poId) return (learnedLocations || []).filter(l => l.id.startsWith('vill_'));
    const matched = villagesMap.get(poId);
    if (matched && matched.length > 0) return matched;
    return (learnedLocations || []).filter(l => l.id.startsWith('vill_'));
  }, [villagesMap, learnedLocations]);

  const handleLocChange = (field: keyof Student, id: string, nameBnOrEn?: string) => {
    if (nameBnOrEn) {
      setFormData(p => ({ ...p, [field]: nameBnOrEn }));
      return;
    }
    const loc = (learnedLocations || []).find(l => l.id === id);
    if (loc) {
      setFormData(p => ({ ...p, [field]: loc.nameBn || loc.name }));
    }
  };

  const handleLocAdd = (field: keyof Student, prefix: string, parentId: string, name: string, nameBn: string) => {
    const newId = `${prefix}_${Date.now()}`;
    learnLocation({ id: newId, name, nameBn, parentId: parentId || 'dist_cumilla' });
    setFormData(p => ({ ...p, [field]: nameBn || name }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'class' && !student) {
      setFormData(prev => ({ ...prev, studentId: generateId(value) }));
    }
  };

  // Guardian relationship change with smart auto-fill
  const handleGuardianRelationChange = (rel: string) => {
    setFormData(prev => {
      const updated: Partial<Student> = { ...prev, guardianRelation: rel };
      if (rel === 'পিতা' || rel === 'Father') {
        updated.guardianName = prev.fatherNameBn || prev.fatherName || '';
        updated.guardianNameEn = prev.fatherName || '';
        updated.guardianNid = prev.fatherNid || '';
        updated.guardianDob = prev.fatherDob || '';
        updated.guardianProfession = prev.fatherProfession || '';
        updated.guardianIncome = prev.fatherIncome || '';
        updated.guardianMobile = prev.fatherMobile || '';
      } else if (rel === 'মাতা' || rel === 'Mother') {
        updated.guardianName = prev.motherNameBn || prev.motherName || '';
        updated.guardianNameEn = prev.motherName || '';
        updated.guardianNid = prev.motherNid || '';
        updated.guardianDob = prev.motherDob || '';
        updated.guardianProfession = prev.motherProfession || '';
        updated.guardianIncome = prev.motherIncome || '';
        updated.guardianMobile = prev.motherMobile || '';
      }
      return updated;
    });
  };

  // Sibling lookup & auto-fill
  const handleSiblingLookup = (cls?: string, sec?: string, roll?: string) => {
    const targetClass = cls !== undefined ? cls : formData.siblingClass;
    const targetSection = sec !== undefined ? sec : formData.siblingSection;
    const targetRoll = roll !== undefined ? roll : formData.siblingRoll;

    if (targetClass && targetRoll) {
      const match = (students || []).find(s => 
        s.class === targetClass && 
        (!targetSection || targetSection === 'প্রযোজ্য নয়' || s.section === targetSection) &&
        (String(s.roll) === String(targetRoll) || s.studentId === targetRoll)
      );

      if (match) {
        setFormData(prev => ({
          ...prev,
          siblingName: match.nameBn || match.name,
          siblingId: match.id,
        }));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof Student) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageBase64(file, 400, 400, 0.85);
        setFormData(prev => ({ ...prev, [fieldName]: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name && !formData.nameBn) {
      setActiveTab('basic');
      setFormError(language === 'bn' ? 'অনুগ্রহ করে শিক্ষার্থীর নাম (বাংলা বা ইংরেজি) লিখুন।' : 'Please enter student name (English or Bengali).');
      return;
    }
    setFormError(null);
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: language === 'bn' ? 'মৌলিক তথ্য' : 'Basic Info' },
    { id: 'demographics', label: language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Demographics' },
    { id: 'address', label: language === 'bn' ? 'ঠিকানা' : 'Address' },
    { id: 'parents', label: language === 'bn' ? 'পিতা-মাতার তথ্য' : 'Parents Info' },
    { id: 'guardian', label: language === 'bn' ? 'অভিভাবক ও সহোদর' : 'Guardian & Sibling' },
    { id: 'previous', label: language === 'bn' ? 'পূর্ববর্তী শিক্ষা' : 'Previous Education' },
    { id: 'payment', label: language === 'bn' ? 'পেমেন্ট' : 'Payment' },
    { id: 'documents', label: language === 'bn' ? 'ডকুমেন্টস' : 'Documents' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-slate-800">
            {student ? (language === 'bn' ? 'শিক্ষার্থী সম্পাদনা' : 'Edit Student') : (language === 'bn' ? 'অনলাইন ভর্তি ফরম' : 'Online Admission Form')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto flex-nowrap border-b border-slate-200 bg-white px-2 py-1 sm:px-4 sm:gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <form id="enrollment-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Basic Info */}
            <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'শিক্ষাবর্ষ (Session) *' : 'Academic Session *'}
                  </label>
                  <input 
                    type="text" 
                    name="session" 
                    value={formData.session || ''} 
                    onChange={handleChange} 
                    placeholder="e.g. 2026"
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'ভর্তিচ্ছু শ্রেণি (Class) *' : 'Admission Class *'}
                  </label>
                  <select 
                    name="class" 
                    value={formData.class || ''} 
                    onChange={handleChange} 
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {(academicClasses || []).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'বিভাগ (Group / Department) *' : 'Group / Department *'}
                  </label>
                  <select 
                    name="group" 
                    value={formData.group || 'প্রযোজ্য নয়'} 
                    onChange={handleChange} 
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {(academicGroups || []).map(g => (
                      <option key={g.id} value={g.name}>
                        {g.name} {g.isDefault ? `(${language === 'bn' ? 'ডিফল্ট' : 'Default'})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'শাখা (Section) *' : 'Section *'}
                  </label>
                  <select 
                    name="section" 
                    value={formData.section || 'প্রযোজ্য নয়'} 
                    onChange={handleChange} 
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {(academicSections || []).map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.isDefault ? `(${language === 'bn' ? 'ডিফল্ট' : 'Default'})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'শ্রেণি রোল (Roll No)' : 'Class Roll No'}
                  </label>
                  <input 
                    type="text" 
                    name="roll" 
                    value={formData.roll || ''} 
                    onChange={handleChange} 
                    placeholder="e.g. 1"
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'স্টুডেন্ট আইডি (Auto / Custom)' : 'Student ID (Auto)'}
                  </label>
                  <input 
                    type="text" 
                    name="studentId" 
                    value={formData.studentId || ''} 
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 bg-slate-100/80 shadow-sm px-3 py-2 text-slate-700 font-mono text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'শিক্ষার্থীর নাম (বাংলা) *' : 'Student Name (Bangla) *'}
                  </label>
                  <input 
                    type="text" 
                    name="nameBn" 
                    value={formData.nameBn || ''} 
                    onChange={handleChange} 
                    placeholder="যেমন: নুসরাত জাহান"
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'শিক্ষার্থীর নাম (ইংরেজি) *' : 'Student Name (English) *'}
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    placeholder="e.g. NUSRAT JAHAN"
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'আবেদনের তারিখ' : 'Application Date'}
                  </label>
                  <input 
                    type="date" 
                    name="applicationDate" 
                    value={formData.applicationDate || ''} 
                    onChange={handleChange} 
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {language === 'bn' ? 'ভর্তি ফরম নং / সিরিয়াল নম্বর' : 'Admission Form / Serial No'}
                  </label>
                  <input 
                    type="text" 
                    name="formNo" 
                    value={formData.formNo || ''} 
                    onChange={handleChange} 
                    placeholder="e.g. 1001"
                    className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
              </div>
            </div>

            {/* 2. Demographics */}
            <div className={activeTab === 'demographics' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">অনলাইন জন্ম নিবন্ধন নম্বর</label>
                  <input type="text" name="birthRegistrationNo" value={formData.birthRegistrationNo || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">জন্ম তারিখ</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">লিঙ্গ</label>
                  <select name="gender" value={formData.gender || 'Male'} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="Male">ছেলে (Male)</option>
                    <option value="Female">মেয়ে (Female)</option>
                    <option value="Other">অন্যান্য (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ধর্ম</label>
                  <select name="religion" value={formData.religion || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">নির্বাচন করুন</option>
                    <option value="Islam">ইসলাম</option>
                    <option value="Hinduism">হিন্দু</option>
                    <option value="Christianity">খ্রিস্টান</option>
                    <option value="Buddhism">বৌদ্ধ</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">জাতীয়তা</label>
                  <input type="text" name="nationality" value={formData.nationality || 'বাংলাদেশি'} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">বৈবাহিক অবস্থা</label>
                  <select name="maritalStatus" value={formData.maritalStatus || 'অবিবাহিত'} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="অবিবাহিত">অবিবাহিত</option>
                    <option value="বিবাহিত">বিবাহিত</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">প্রতিবন্ধিতা (Disability)</label>
                  <select name="disability" value={formData.disability || '০- কোনো সমস্যা নাই'} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="০- কোনো সমস্যা নাই">০- কোনো সমস্যা নাই</option>
                    <option value="১- দৃষ্টি প্রতিবন্ধী">১- দৃষ্টি প্রতিবন্ধী</option>
                    <option value="২- শারীরিক প্রতিবন্ধী">২- শারীরিক প্রতিবন্ধী</option>
                    <option value="৩- শ্রবণ প্রতিবন্ধী">৩- শ্রবণ প্রতিবন্ধী</option>
                    <option value="৪- বাক প্রতিবন্ধী">৪- বাক প্রতিবন্ধী</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">রক্তের গ্রুপ</label>
                  <select name="bloodGroup" value={formData.bloodGroup || 'পরীক্ষা করা হয় নাই'} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="পরীক্ষা করা হয় নাই">পরীক্ষা করা হয় নাই</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Address */}
            <div className={activeTab === 'address' ? 'block' : 'hidden'}>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">স্থায়ী ঠিকানা</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 1. জেলা */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">জেলা</label>
                      <LocationSelect
                        language={language}
                        placeholder="জেলা নির্বাচন করুন"
                        options={getDistricts()}
                        value={permDistId}
                        currentTextValue={formData.district}
                        onChange={(id, text) => handleLocChange('district', id, text)}
                        onAdd={(name, nameBn) => handleLocAdd('district', 'dist', 'div_chittagong', name, nameBn)}
                      />
                    </div>
                    {/* 2. উপজেলা */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">উপজেলা</label>
                      <LocationSelect
                        language={language}
                        placeholder="উপজেলা নির্বাচন করুন"
                        options={getUpazilas(permDistId)}
                        value={permUpzId}
                        currentTextValue={formData.upazila}
                        onChange={(id, text) => handleLocChange('upazila', id, text)}
                        onAdd={(name, nameBn) => handleLocAdd('upazila', 'upz', permDistId, name, nameBn)}
                      />
                    </div>
                    {/* 3. ইউনিয়ন */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ইউনিয়ন</label>
                      <LocationSelect
                        language={language}
                        placeholder="ইউনিয়ন নির্বাচন করুন"
                        options={getUnions(permUpzId)}
                        value={permUniId}
                        currentTextValue={formData.union}
                        onChange={(id, text) => handleLocChange('union', id, text)}
                        onAdd={(name, nameBn) => handleLocAdd('union', 'uni', permUpzId, name, nameBn)}
                      />
                    </div>
                    {/* 4. ডাকঘর */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ডাকঘর</label>
                      <LocationSelect
                        language={language}
                        placeholder="ডাকঘর নির্বাচন করুন"
                        options={getPostOffices(permUpzId)}
                        value={permPoId}
                        currentTextValue={formData.postOffice}
                        onChange={(id, text) => handleLocChange('postOffice', id, text)}
                        onAdd={(name, nameBn) => handleLocAdd('postOffice', 'po', permUpzId, name, nameBn)}
                      />
                    </div>
                    {/* 5. গ্রাম */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">গ্রাম</label>
                      <LocationSelect
                        language={language}
                        placeholder="গ্রাম নির্বাচন করুন"
                        options={getVillages(permPoId)}
                        value={getLocId(formData.village, 'vill_', permPoId)}
                        currentTextValue={formData.village}
                        onChange={(id, text) => handleLocChange('village', id, text)}
                        onAdd={(name, nameBn) => handleLocAdd('village', 'vill', permPoId, name, nameBn)}
                      />
                    </div>
                    {/* 6. পাড়া / মহল্লা / রাস্তা */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পাড়া / মহল্লা / রাস্তা</label>
                      <input type="text" name="para" value={formData.para || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {/* 7. বাড়ীর নাম / হোল্ডিং নম্বর */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">বাড়ীর নাম / হোল্ডিং নম্বর</label>
                      <input type="text" name="houseNo" value={formData.houseNo || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h3 className="text-lg font-medium text-slate-800">বর্তমান ঠিকানা</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="isAddressSame" checked={formData.isAddressSame || false} onChange={handleChange} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">স্থায়ী ও বর্তমান ঠিকানা একই</span>
                    </label>
                  </div>
                  {!formData.isAddressSame && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 1. জেলা */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">জেলা</label>
                        <LocationSelect
                          language={language}
                          placeholder="জেলা নির্বাচন করুন"
                          options={getDistricts()}
                          value={presDistId}
                          currentTextValue={formData.presentDistrict}
                          onChange={(id, text) => handleLocChange('presentDistrict', id, text)}
                          onAdd={(name, nameBn) => handleLocAdd('presentDistrict', 'dist', 'div_chittagong', name, nameBn)}
                        />
                      </div>
                      {/* 2. উপজেলা */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">উপজেলা</label>
                        <LocationSelect
                          language={language}
                          placeholder="উপজেলা নির্বাচন করুন"
                          options={getUpazilas(presDistId)}
                          value={presUpzId}
                          currentTextValue={formData.presentUpazila}
                          onChange={(id, text) => handleLocChange('presentUpazila', id, text)}
                          onAdd={(name, nameBn) => handleLocAdd('presentUpazila', 'upz', presDistId, name, nameBn)}
                        />
                      </div>
                      {/* 3. ইউনিয়ন */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ইউনিয়ন</label>
                        <LocationSelect
                          language={language}
                          placeholder="ইউনিয়ন নির্বাচন করুন"
                          options={getUnions(presUpzId)}
                          value={presUniId}
                          currentTextValue={formData.presentUnion}
                          onChange={(id, text) => handleLocChange('presentUnion', id, text)}
                          onAdd={(name, nameBn) => handleLocAdd('presentUnion', 'uni', presUpzId, name, nameBn)}
                        />
                      </div>
                      {/* 4. ডাকঘর */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ডাকঘর</label>
                        <LocationSelect
                          language={language}
                          placeholder="ডাকঘর নির্বাচন করুন"
                          options={getPostOffices(presUpzId)}
                          value={presPoId}
                          currentTextValue={formData.presentPostOffice}
                          onChange={(id, text) => handleLocChange('presentPostOffice', id, text)}
                          onAdd={(name, nameBn) => handleLocAdd('presentPostOffice', 'po', presUpzId, name, nameBn)}
                        />
                      </div>
                      {/* 5. গ্রাম */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">গ্রাম</label>
                        <LocationSelect
                          language={language}
                          placeholder="গ্রাম নির্বাচন করুন"
                          options={getVillages(presPoId)}
                          value={getLocId(formData.presentVillage, 'vill_', presPoId)}
                          currentTextValue={formData.presentVillage}
                          onChange={(id, text) => handleLocChange('presentVillage', id, text)}
                          onAdd={(name, nameBn) => handleLocAdd('presentVillage', 'vill', presPoId, name, nameBn)}
                        />
                      </div>
                      {/* 6. পাড়া / মহল্লা / রাস্তা */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">পাড়া / মহল্লা / রাস্তা</label>
                        <input type="text" name="presentPara" value={formData.presentPara || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                      {/* 7. বাড়ীর নাম / হোল্ডিং নম্বর */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">বাড়ীর নাম / হোল্ডিং নম্বর</label>
                        <input type="text" name="presentHouseNo" value={formData.presentHouseNo || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Parents Info */}
            <div className={activeTab === 'parents' ? 'block' : 'hidden'}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">পিতা-মাতা জীবিত বা মৃত সংক্রান্ত তথ্য</label>
                <select name="parentsStatus" value={formData.parentsStatus || 'দুজনেই জীবিত'} onChange={handleChange} className="w-full max-w-md rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="দুজনেই জীবিত">দুজনেই জীবিত</option>
                  <option value="পিতা মৃত">পিতা মৃত</option>
                  <option value="মাতা মৃত">মাতা মৃত</option>
                  <option value="দুজনেই মৃত">দুজনেই মৃত</option>
                </select>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4 flex justify-between items-center">
                    পিতার তথ্য
                    {(formData.parentsStatus === 'পিতা মৃত' || formData.parentsStatus === 'দুজনেই মৃত') && (
                      <span className="text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">মৃত</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পিতার নাম (বাংলা)</label>
                      <input type="text" name="fatherNameBn" value={formData.fatherNameBn || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পিতার নাম (ইংরেজি)</label>
                      <input type="text" name="fatherName" value={formData.fatherName || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পিতার জাতীয় পরিচয়পত্র</label>
                      <input type="text" name="fatherNid" value={formData.fatherNid || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পিতার জন্ম তারিখ</label>
                      <input type="date" name="fatherDob" value={formData.fatherDob || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পিতার মোবাইল নম্বর</label>
                      <input type="text" name="fatherMobile" value={formData.fatherMobile || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পিতার পেশা</label>
                      <CreatableSelect
                        options={savedProfessions}
                        value={formData.fatherProfession || ''}
                        onChange={(val) => setFormData(p => ({ ...p, fatherProfession: val }))}
                        onAddNew={addProfession}
                        placeholder="পেশা নির্বাচন বা লিখুন..."
                      />
                    </div>
                    {(formData.parentsStatus === 'দুজনেই জীবিত' || formData.parentsStatus === 'মাতা মৃত') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">পিতার মাসিক এভারেজ আয়</label>
                        <input type="number" name="fatherIncome" value={formData.fatherIncome || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                    )}
                    {(formData.parentsStatus === 'পিতা মৃত' || formData.parentsStatus === 'দুজনেই মৃত') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">পিতার মৃত্যুর সাল</label>
                          <input type="text" name="fatherDeathYear" value={formData.fatherDeathYear || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">পিতার মৃত্যুর কারণ</label>
                          <select name="fatherDeathCause" value={formData.fatherDeathCause || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">নির্বাচন করুন</option>
                            <option value="স্বাভাবিক মৃত্যু">স্বাভাবিক মৃত্যু</option>
                            <option value="দুর্ঘটনায় মৃত্যু">দুর্ঘটনায় মৃত্যু</option>
                            <option value="প্রযোজ্য নয়">প্রযোজ্য নয়</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4 flex justify-between items-center">
                    মাতার তথ্য
                    {(formData.parentsStatus === 'মাতা মৃত' || formData.parentsStatus === 'দুজনেই মৃত') && (
                      <span className="text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">মৃত</span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মাতার নাম (বাংলা)</label>
                      <input type="text" name="motherNameBn" value={formData.motherNameBn || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মাতার নাম (ইংরেজি)</label>
                      <input type="text" name="motherName" value={formData.motherName || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মাতার জাতীয় পরিচয়পত্র</label>
                      <input type="text" name="motherNid" value={formData.motherNid || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মাতার জন্ম তারিখ</label>
                      <input type="date" name="motherDob" value={formData.motherDob || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মাতার মোবাইল নম্বর</label>
                      <input type="text" name="motherMobile" value={formData.motherMobile || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মাতার পেশা</label>
                      <CreatableSelect
                        options={savedProfessions}
                        value={formData.motherProfession || ''}
                        onChange={(val) => setFormData(p => ({ ...p, motherProfession: val }))}
                        onAddNew={addProfession}
                        placeholder="পেশা নির্বাচন বা লিখুন..."
                      />
                    </div>
                    {(formData.parentsStatus === 'দুজনেই জীবিত' || formData.parentsStatus === 'পিতা মৃত') && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">মাতার মাসিক এভারেজ আয় (না থাকলে '০')</label>
                        <input type="number" name="motherIncome" value={formData.motherIncome || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                      </div>
                    )}
                    {(formData.parentsStatus === 'মাতা মৃত' || formData.parentsStatus === 'দুজনেই মৃত') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">মাতার মৃত্যুর সাল</label>
                          <input type="text" name="motherDeathYear" value={formData.motherDeathYear || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">মাতার মৃত্যুর কারণ</label>
                          <select name="motherDeathCause" value={formData.motherDeathCause || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">নির্বাচন করুন</option>
                            <option value="স্বাভাবিক মৃত্যু">স্বাভাবিক মৃত্যু</option>
                            <option value="দুর্ঘটনায় মৃত্যু">দুর্ঘটনায় মৃত্যু</option>
                            <option value="প্রযোজ্য নয়">প্রযোজ্য নয়</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Guardian & Siblings */}
            <div className={activeTab === 'guardian' ? 'block' : 'hidden'}>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">
                    অভিভাবকের তথ্য
                    <span className="text-xs font-normal text-slate-500 ml-2">
                      (পিতা বা মাতা সিলেক্ট করলে তাঁদের তথ্য স্বয়ংক্রিয়ভাবে পূরণ হবে)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">অভিভাবকের সাথে সম্পর্ক</label>
                      <CreatableSelect
                        options={savedGuardianRelations}
                        value={formData.guardianRelation || ''}
                        onChange={handleGuardianRelationChange}
                        onAddNew={addGuardianRelation}
                        placeholder="সম্পর্ক নির্বাচন বা লিখুন..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">অভিভাবকের নাম (বাংলা)</label>
                      <input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">অভিভাবকের নাম (ইংরেজি)</label>
                      <input type="text" name="guardianNameEn" value={formData.guardianNameEn || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">জাতীয় পরিচয়পত্র</label>
                      <input type="text" name="guardianNid" value={formData.guardianNid || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">জন্ম তারিখ</label>
                      <input type="date" name="guardianDob" value={formData.guardianDob || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">পেশা</label>
                      <CreatableSelect
                        options={savedProfessions}
                        value={formData.guardianProfession || ''}
                        onChange={(val) => setFormData(p => ({ ...p, guardianProfession: val }))}
                        onAddNew={addProfession}
                        placeholder="পেশা নির্বাচন বা লিখুন..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মাসিক এভারেজ আয়</label>
                      <input type="number" name="guardianIncome" value={formData.guardianIncome || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">মোবাইল নম্বর</label>
                      <input type="text" name="guardianMobile" value={formData.guardianMobile || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">সহোদর সংক্রান্ত তথ্য</h3>
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="hasSibling" checked={formData.hasSibling || false} onChange={handleChange} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">অত্র বিদ্যালয়ে শিক্ষার্থীর কোনো ভাই বা বোন আছে</span>
                    </label>
                  </div>
                  {formData.hasSibling && (
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">সহোদরের শ্রেণি</label>
                          <select 
                            name="siblingClass" 
                            value={formData.siblingClass || ''} 
                            onChange={(e) => {
                              handleChange(e);
                              handleSiblingLookup(e.target.value, undefined, undefined);
                            }} 
                            className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">নির্বাচন করুন</option>
                            {(academicClasses || []).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">সহোদরের শাখা</label>
                          <select 
                            name="siblingSection" 
                            value={formData.siblingSection || ''} 
                            onChange={(e) => {
                              handleChange(e);
                              handleSiblingLookup(undefined, e.target.value, undefined);
                            }} 
                            className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">সকল / প্রযোজ্য নয়</option>
                            {(academicSections || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">সহোদরের রোল / আইডি</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              name="siblingRoll" 
                              value={formData.siblingRoll || ''} 
                              onChange={(e) => {
                                handleChange(e);
                                handleSiblingLookup(undefined, undefined, e.target.value);
                              }} 
                              placeholder="রোল লিখুন"
                              className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">সহোদরের নাম</label>
                          <input 
                            type="text" 
                            name="siblingName" 
                            value={formData.siblingName || ''} 
                            onChange={handleChange} 
                            placeholder="ডাটাবেজে না থাকলে নাম লিখুন"
                            className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" 
                          />
                        </div>
                      </div>

                      {formData.siblingId && (
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <UserCheck className="w-4 h-4" />
                          <span>ডাটাবেজে ম্যাচ পাওয়া গেছে: {formData.siblingName} (আইডি: {formData.siblingId})</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Previous Education */}
            <div className={activeTab === 'previous' ? 'block' : 'hidden'}>
              <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">পূর্ববর্তী শিক্ষা সংক্রান্ত তথ্য</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">পূর্ববর্তী শিক্ষা প্রতিষ্ঠানের নাম</label>
                  <CreatableSelect
                    options={savedInstitutions}
                    value={formData.prevSchoolName || ''}
                    onChange={(val) => setFormData(p => ({ ...p, prevSchoolName: val }))}
                    onAddNew={addInstitution}
                    placeholder="প্রতিষ্ঠানের নাম নির্বাচন বা লিখুন..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পূর্ববর্তী শ্রেণি</label>
                  <CreatableSelect
                    options={savedClasses}
                    value={formData.prevClass || ''}
                    onChange={(val) => setFormData(p => ({ ...p, prevClass: val }))}
                    onAddNew={addClassOption}
                    placeholder="শ্রেণি নির্বাচন বা লিখুন..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পাশের সাল</label>
                  <CreatableSelect
                    options={savedPassingYears}
                    value={formData.prevPassingYear || ''}
                    onChange={(val) => setFormData(p => ({ ...p, prevPassingYear: val }))}
                    onAddNew={addPassingYear}
                    placeholder="পাশের সাল নির্বাচন বা লিখুন..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পরীক্ষার রোল</label>
                  <input type="text" name="prevRoll" value={formData.prevRoll || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">রেজিস্ট্রেশন নম্বর</label>
                  <input type="text" name="prevRegistrationNo" value={formData.prevRegistrationNo || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পাশের বোর্ড / মাধ্যম</label>
                  <CreatableSelect
                    options={savedBoards}
                    value={formData.prevBoard || ''}
                    onChange={(val) => setFormData(p => ({ ...p, prevBoard: val }))}
                    onAddNew={addBoardOption}
                    placeholder="বোর্ড / মাধ্যম নির্বাচন বা লিখুন..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">টিসি বা ছাড়পত্র নম্বর</label>
                  <input type="text" name="prevTcNo" value={formData.prevTcNo || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
            </div>

            {/* 7. Payment */}
            <div className={activeTab === 'payment' ? 'block' : 'hidden'}>
              <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">ফি পরিশোধ এবং অধিকার</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ভর্তির সময় পরিশোধিত টাকার পরিমাণ *</label>
                  <input type="number" name="admissionPayment" value={formData.admissionPayment || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">পরিশোধের মাধ্যম</label>
                  <select name="paymentMethod" value={formData.paymentMethod || 'নগদ / ক্যাশ'} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="নগদ / ক্যাশ">নগদ / ক্যাশ</option>
                    <option value="বিকাশ">বিকাশ</option>
                    <option value="নগদ">নগদ</option>
                    <option value="রকেট">রকেট</option>
                    <option value="ব্যাংক">ব্যাংক</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">রশিদ নম্বর বা Transaction নম্বর</label>
                  <input type="text" name="transactionNo" value={formData.transactionNo || ''} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">কোন বিশেষ সুবিধার জন্য আবেদন করতে চান?</label>
                  <select name="specialFacility" value={formData.specialFacility || 'প্রয়োজন নেই'} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="প্রয়োজন নেই">প্রয়োজন নেই</option>
                    <option value="উপবৃত্তি">উপবৃত্তি</option>
                    <option value="বিনা বেতন">বিনা বেতন</option>
                    <option value="অর্ধ-বেতন">অর্ধ-বেতন</option>
                    <option value="দরিদ্র তহবিল ভাতা">দরিদ্র তহবিল ভাতা</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 8. Documents */}
            <div className={activeTab === 'documents' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Photo */}
                <div className="col-span-1 md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">শিক্ষার্থীর ছবি</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {formData.photo ? (
                        <div className="relative inline-block">
                          <img src={formData.photo} alt="Preview" className="h-32 w-32 object-cover rounded-lg mx-auto" />
                          <button type="button" onClick={() => setFormData(p => ({ ...p, photo: undefined }))} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="flex text-sm text-slate-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Upload a file</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                            </label>
                          </div>
                          <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Other Documents */}
                {[
                  { id: 'documentBirthCertificate' as keyof Student, label: 'অনলাইন জন্ম নিবন্ধন' },
                  { id: 'documentFatherNid' as keyof Student, label: 'পিতার এনআইডি' },
                  { id: 'documentMotherNid' as keyof Student, label: 'মাতার এনআইডি' },
                  { id: 'documentRegistrationCard' as keyof Student, label: 'রেজিস্ট্রেশন কার্ড' },
                  { id: 'documentTc' as keyof Student, label: 'ছাড়পত্র (TC)' },
                ].map(doc => (
                  <div key={doc.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{doc.label}</label>
                    <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 relative overflow-hidden">
                      {formData[doc.id] ? (
                        <div className="w-full text-center">
                          <img src={formData[doc.id] as string} alt={doc.label} className="h-20 w-auto object-cover rounded mx-auto mb-2 opacity-60" />
                          <button type="button" onClick={() => setFormData(p => ({ ...p, [doc.id]: undefined }))} className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200">
                            <X className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-green-600 font-medium">Uploaded</span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center w-full">
                          <Upload className="mx-auto h-6 w-6 text-slate-400" />
                          <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 block text-xs mt-2">
                            <span>Upload Document</span>
                            <input type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, doc.id)} />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex flex-col-reverse sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="text-sm text-slate-500">
            {language === 'bn' ? 'অপরিহার্য তথ্যগুলো (*) দিয়ে চিহ্নিত করা আছে।' : 'Fields marked with (*) are required.'}
          </div>
          <div className="flex w-full sm:w-auto justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="enrollment-form"
              className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-5 h-5" />
              {student ? 'Update' : 'Enroll Student'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
