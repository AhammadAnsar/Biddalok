import React, { useState } from 'react';
import { ManagingCommitteeMember } from '../../types';
import { 
  X, Check, Camera, Upload, User, Phone, Mail, 
  MapPin, ShieldAlert, Award, AlertCircle, FileText 
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { useAppStore } from '../../store/useAppStore';

interface CommitteeMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ManagingCommitteeMember> | null;
  onSave: (member: ManagingCommitteeMember) => void;
}

const COMMITTEE_ROLES = [
  { role: 'president', roleTitleBn: 'সভাপতি', roleTitleEn: 'President' },
  { role: 'vice_president', roleTitleBn: 'সহ-সভাপতি', roleTitleEn: 'Vice President' },
  { role: 'member_secretary', roleTitleBn: 'সদস্য সচিব (প্রধান শিক্ষক)', roleTitleEn: 'Member Secretary' },
  { role: 'teacher_representative', roleTitleBn: 'শিক্ষক প্রতিনিধি', roleTitleEn: 'Teacher Representative' },
  { role: 'teacher_representative_female', roleTitleBn: 'শিক্ষক প্রতিনিধি (সংরক্ষিত মহিলা)', roleTitleEn: 'Teacher Representative (Reserved Female)' },
  { role: 'guardian_representative', roleTitleBn: 'অভিভাবক প্রতিনিধি', roleTitleEn: 'Guardian Representative' },
  { role: 'guardian_representative_female', roleTitleBn: 'অভিভাবক প্রতিনিধি (সংরক্ষিত মহিলা)', roleTitleEn: 'Guardian Representative (Reserved Female)' },
  { role: 'donor_member', roleTitleBn: 'দাতা সদস্য', roleTitleEn: 'Donor Member' },
  { role: 'founder_member', roleTitleBn: 'প্রতিষ্ঠাতা সদস্য', roleTitleEn: 'Founder Member' },
  { role: 'education_enthusiast', roleTitleBn: 'শিক্ষা অনুরাগী সদস্য', roleTitleEn: 'Education Enthusiast Member' },
  { role: 'patron_member', roleTitleBn: 'পৃষ্ঠপোষক সদস্য', roleTitleEn: 'Patron Member' },
  { role: 'general_member', roleTitleBn: 'সাধারণ সদস্য', roleTitleEn: 'General Member' }
];

export const CommitteeMemberModal: React.FC<CommitteeMemberModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const isEditing = Boolean(initialData?.id);
  
  const { staff, students } = useAppStore();
  const [selectionMode, setSelectionMode] = useState<'manual' | 'system'>('manual');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');

  const [formData, setFormData] = useState<Partial<ManagingCommitteeMember>>({
    id: initialData?.id || `mcm_${Date.now().toString().slice(-6)}`,
    name: initialData?.name || '',
    nameBn: initialData?.nameBn || '',
    photo: initialData?.photo || '',
    role: initialData?.role || 'guardian_representative',
    roleTitleBn: initialData?.roleTitleBn || 'অভিভাবক প্রতিনিধি',
    roleTitleEn: initialData?.roleTitleEn || 'Guardian Representative',
    gender: initialData?.gender || 'Male',
    mobile: initialData?.mobile || '',
    phone: initialData?.phone || initialData?.mobile || '',
    email: initialData?.email || '',
    nid: initialData?.nid || '',
    educationalQualification: initialData?.educationalQualification || '',
    profession: initialData?.profession || '',
    joiningDate: initialData?.joiningDate || '',
    expiryDate: initialData?.expiryDate || '',
    trainingsCount: initialData?.trainingsCount ?? 0,
    isResigned: initialData?.isResigned ?? false,
    exitDate: initialData?.exitDate || '',
    resignationReason: initialData?.resignationReason || '',
    address: initialData?.address || '',
    status: initialData?.status || 'active'
  });

  if (!isOpen) return null;

  const handleRoleChange = (roleKey: string) => {
    const selected = COMMITTEE_ROLES.find(r => r.role === roleKey);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        role: selected.role,
        roleTitleBn: selected.roleTitleBn,
        roleTitleEn: selected.roleTitleEn
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('ছবি ২ মেগাবাইটের কম হতে হবে');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
    toast.success('ছবি সফলভাবে নির্বাচন করা হয়েছে');
  };

  const handleSystemSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedSystemId(id);
    
    if (!id) return;
    
    // For staff (Teacher Rep, Member Secretary)
    if (['member_secretary', 'teacher_representative', 'teacher_representative_female'].includes(formData.role || '')) {
      const selectedStaff = staff?.find(s => s.id === id);
      if (selectedStaff) {
        setFormData(prev => ({
          ...prev,
          name: selectedStaff.name || '',
          nameBn: selectedStaff.nameBn || selectedStaff.name || '',
          photo: selectedStaff.photo || prev.photo,
          gender: selectedStaff.gender || 'Male',
          mobile: selectedStaff.mobile || selectedStaff.contact || '',
          phone: selectedStaff.mobile || selectedStaff.contact || '',
          email: selectedStaff.email || '',
          nid: selectedStaff.nid || '',
          profession: 'শিক্ষকতা',
          educationalQualification: (selectedStaff as any).highestEducation || '', // Keeping as string if undefined
          address: (selectedStaff as any).presentAddress || '' // Keeping as string if undefined
        }));
        toast.success('শিক্ষকের প্রোফাইল থেকে তথ্য সংযুক্ত করা হয়েছে।');
      }
    } 
    // For guardian (Guardian Rep)
    else if (['guardian_representative', 'guardian_representative_female'].includes(formData.role || '')) {
      const selectedStudent = students?.find(s => s.id === id);
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          name: selectedStudent.fatherName || '',
          nameBn: selectedStudent.fatherNameBn || selectedStudent.fatherName || '',
          gender: 'Male', // Default to male for father, user can change if mother
          mobile: selectedStudent.fatherMobile || '',
          phone: selectedStudent.fatherMobile || '',
          profession: selectedStudent.fatherProfession || '',
          address: selectedStudent.presentAddress || selectedStudent.village || ''
        }));
        toast.success('শিক্ষার্থীর অভিভাবকের প্রোফাইল থেকে তথ্য সংযুক্ত করা হয়েছে।');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBn && !formData.name) {
      toast.error('সদস্যের নাম আবশ্যক');
      return;
    }

    // Force English name to UPPERCASE as required
    const sanitizedNameEn = (formData.name || '').toUpperCase().trim();

    const finalMember: ManagingCommitteeMember = {
      id: formData.id || `mcm_${Date.now()}`,
      name: sanitizedNameEn,
      nameBn: formData.nameBn?.trim() || sanitizedNameEn,
      photo: formData.photo,
      role: formData.role || 'guardian_representative',
      roleBn: formData.roleBn || formData.roleTitleBn || 'অভিভাবক প্রতিনিধি',
      roleTitleBn: formData.roleTitleBn || 'অভিভাবক প্রতিনিধি',
      roleTitleEn: formData.roleTitleEn || 'Guardian Representative',
      gender: formData.gender || 'Male',
      mobile: formData.mobile?.trim() || '',
      phone: formData.phone?.trim() || formData.mobile?.trim() || '',
      email: formData.email?.trim() || '',
      nid: formData.nid?.trim() || '',
      educationalQualification: formData.educationalQualification?.trim() || '',
      profession: formData.profession?.trim() || '',
      joiningDate: formData.joiningDate || '',
      expiryDate: formData.expiryDate || '',
      trainingsCount: Number(formData.trainingsCount) || 0,
      isResigned: Boolean(formData.isResigned),
      exitDate: formData.exitDate || '',
      resignationReason: formData.resignationReason || '',
      address: formData.address?.trim() || '',
      status: formData.isResigned ? 'resigned' : (formData.status || 'active')
    };

    onSave(finalMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div 
        id="committee-member-modal-container"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {isEditing ? 'কমিটি সদস্যের প্রোফাইল সম্পাদনা' : 'নতুন পরিচালনা পরিষদ সদস্য নিবন্ধন'}
              </h3>
              <p className="text-xs text-slate-300 font-medium">বিদ্যালয় ব্যবস্থাপনা কমিটি / এসএমসি সদস্য বিবরণ</p>
            </div>
          </div>
          <button
            id="btn-close-member-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
          
          {/* Photo and Core Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shadow-inner">
                {formData.photo ? (
                  <img 
                    src={formData.photo} 
                    alt="Member preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <User className="w-8 h-8 mx-auto stroke-1" />
                    <span className="text-[10px] block mt-1">ছবি আপলোড</span>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="text-xs font-bold text-slate-600">ছবি আপলোড সংক্রান্ত তথ্য:</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                সদস্যের পাসপোর্ট সাইজের সাম্প্রতিক ছবি নির্বাচন করুন (সর্বোচ্চ ২ MB)। রেজুলেশন কপি ও আইডি কার্ডে এই ছবি ব্যবহৃত হবে।
              </p>
            </div>
          </div>

          {/* Role / Designation in Committee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                কমিটিতে পদমর্যাদা (Role in Committee) <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-member-role"
                value={formData.role || ''}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                {COMMITTEE_ROLES.map(r => (
                  <option key={r.role} value={r.role}>
                    {r.roleTitleBn} ({r.roleTitleEn})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                কমিটি পদবি (কাস্টম টাইটেল)
              </label>
              <input
                id="input-member-custom-title-bn"
                type="text"
                value={formData.roleTitleBn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, roleTitleBn: e.target.value }))}
                placeholder="যেমন: সভাপতি"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Data Source Selection */}
          {!isEditing && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <label className="text-xs font-bold text-slate-700 shrink-0">তথ্য এন্ট্রি পদ্ধতি:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="selectionMode" 
                      value="manual"
                      checked={selectionMode === 'manual'}
                      onChange={() => setSelectionMode('manual')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>ম্যানুয়াল এন্ট্রি</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="selectionMode" 
                      value="system"
                      checked={selectionMode === 'system'}
                      onChange={() => setSelectionMode('system')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>সিস্টেম থেকে নির্বাচন</span>
                  </label>
                </div>
              </div>

              {selectionMode === 'system' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {['member_secretary', 'teacher_representative', 'teacher_representative_female'].includes(formData.role || '') 
                      ? 'শিক্ষক / স্টাফ নির্বাচন করুন' 
                      : ['guardian_representative', 'guardian_representative_female'].includes(formData.role || '')
                      ? 'শিক্ষার্থী নির্বাচন করুন (অভিভাবকের তথ্য যুক্ত হবে)'
                      : 'এই পদের জন্য সিস্টেম সিলেকশন প্রযোজ্য নয়। দয়া করে ম্যানুয়াল এন্ট্রি ব্যবহার করুন।'}
                  </label>
                  
                  {['member_secretary', 'teacher_representative', 'teacher_representative_female'].includes(formData.role || '') && (
                    <select
                      value={selectedSystemId}
                      onChange={handleSystemSelection}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="">-- স্টাফ নির্বাচন করুন --</option>
                      {staff?.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nameBn || s.name} ({s.designationBn || s.designation})
                        </option>
                      ))}
                    </select>
                  )}

                  {['guardian_representative', 'guardian_representative_female'].includes(formData.role || '') && (
                    <select
                      value={selectedSystemId}
                      onChange={handleSystemSelection}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                    >
                      <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                      {students?.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nameBn || s.name} (পিতা: {s.fatherNameBn || s.fatherName}) - শ্রেণি: {s.class}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Names: English (Capital Letters) & Bengali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                সদস্যের নাম (বাংলায়) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-member-name-bn"
                type="text"
                value={formData.nameBn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nameBn: e.target.value }))}
                placeholder="যেমন: আলহাজ্ব মো: রফিকুল ইসলাম"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>সদস্যের নাম (ইংরেজিতে বড় হাতের অক্ষর)</span>
                <span className="text-[10px] text-amber-600 uppercase font-mono">CAPITAL LETTERS</span>
              </label>
              <input
                id="input-member-name-en"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                placeholder="ALHAJ MD. RAFIQUL ISLAM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Gender & NID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                লিঙ্গ (Gender)
              </label>
              <select
                id="select-member-gender"
                value={formData.gender || 'Male'}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              >
                <option value="Male">পুরুষ (Male)</option>
                <option value="Female">মহিলা (Female)</option>
                <option value="Other">অন্যান্য (Other)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                জাতীয় পরিচয়পত্র (NID) নম্বর
              </label>
              <input
                id="input-member-nid"
                type="text"
                value={formData.nid || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nid: e.target.value }))}
                placeholder="যেমন: 19802692510000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Contacts: Mobile & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-member-mobile"
                type="tel"
                value={formData.mobile || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value, phone: e.target.value }))}
                placeholder="017XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                ইমেইল এড্রেস
              </label>
              <input
                id="input-member-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="member@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Qualification & Profession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                শিক্ষাগত যোগ্যতা
              </label>
              <input
                id="input-member-qualification"
                type="text"
                value={formData.educationalQualification || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, educationalQualification: e.target.value }))}
                placeholder="যেমন: স্নাতকোত্তর / বিএ / পিএইচডি"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                পেশা / বর্তমান কর্মস্থল
              </label>
              <input
                id="input-member-profession"
                type="text"
                value={formData.profession || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="যেমন: অবসরপ্রাপ্ত সরকারি কর্মকর্তা / ব্যবসায়ী"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Joining Date, Expiry Date & Trainings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                যোগদানের তারিখ
              </label>
              <input
                id="input-member-joining-date"
                type="date"
                value={formData.joiningDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                মেয়াদ উত্তীর্ণের তারিখ
              </label>
              <input
                id="input-member-expiry-date"
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                প্রশিক্ষণের সংখ্যা (Training)
              </label>
              <input
                id="input-member-trainings-count"
                type="number"
                min="0"
                value={formData.trainingsCount ?? 0}
                onChange={(e) => setFormData(prev => ({ ...prev, trainingsCount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Resignation Status Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">পদত্যাগ সংক্রান্ত তথ্য (Resignation):</span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isResigned || false}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isResigned: e.target.checked,
                    status: e.target.checked ? 'resigned' : 'active'
                  }))}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>সদস্য পদত্যাগ করেছেন?</span>
              </label>
            </div>

            {formData.isResigned && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">পদত্যাগের তারিখ</label>
                  <input
                    type="date"
                    value={formData.exitDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, exitDate: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">পদত্যাগের কারণ</label>
                  <input
                    type="text"
                    value={formData.resignationReason || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, resignationReason: e.target.value }))}
                    placeholder="যেমন: ব্যক্তিগত কারণ / কর্মস্থল পরিবর্তন"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">স্থায়ী / বর্তমান ঠিকানা</label>
            <input
              id="input-member-address"
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              বাতিল
            </button>
            <button
              id="btn-save-member"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'তথ্য আপডেট করুন' : 'সদস্য সংরক্ষণ করুন'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
