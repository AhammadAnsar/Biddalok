import React, { useState } from 'react';
import { StaffMember } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { 
  X, Printer, User, Phone, Mail, MapPin, Building2, 
  GraduationCap, Briefcase, DollarSign, Award, FileText, 
  CheckCircle, Calendar, Shield, CreditCard, Sparkles, Edit3, Lock
} from 'lucide-react';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onEdit: (staff: StaffMember) => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose,
  staff,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'education' | 'employment' | 'documents'>('overview');
  const { institution, whiteLabel } = useAppStore();

  if (!isOpen || !staff) return null;

  const appName = whiteLabel?.enabled && whiteLabel.appName ? whiteLabel.appName : (institution?.name || 'Biddalok');
  const completion = staff.profileCompletion || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                শিক্ষক ও কর্মচারীর পূর্ণাঙ্গ প্রোফাইল ডাটাবেজ
              </h3>
              <p className="text-xs text-slate-400">
                আইডি: <span className="font-mono text-indigo-300 font-medium">{staff.customStaffId}</span>
                {staff.pdsId && <span> (PDS: {staff.pdsId})</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>সিভি / প্রোফাইল প্রিন্ট</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(staff);
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>সম্পাদনা</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Card with Profile Overview */}
        <div className="bg-slate-900 text-white p-6 shrink-0 relative overflow-hidden border-b border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none flex items-center pr-10">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="relative">
              {staff.photo ? (
                <img
                  src={staff.photo}
                  alt={staff.name}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl bg-slate-800"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {staff.name.charAt(0)}
                </div>
              )}
              <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold border-2 border-slate-900 ${
                staff.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-900'
              }`}>
                {staff.status === 'active' ? 'সক্রিয়' : 'ছুটি/অন্যান্য'}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {staff.staffType === 'teaching' ? 'শিক্ষক (Teaching)' : 'কর্মচারী (Non-Teaching)'}
                </span>
                {staff.employmentType && (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {staff.employmentType === 'mpo' ? 'এমপিওভুক্ত (MPO)' : staff.employmentType === 'non_mpo' ? 'নন-এমপিও' : 'চুক্তিভিত্তিক'}
                  </span>
                )}
                {staff.payCode && (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {staff.payCode}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                {staff.nameBn || staff.name}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {staff.name}
              </p>
              
              <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <strong className="text-white">{staff.designationBn || staff.designation}</strong>
                  {staff.subject && <span className="text-slate-400">({staff.subject})</span>}
                </span>
                {staff.mobile && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    {staff.mobile}
                  </span>
                )}
                {staff.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    {staff.email}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Progress Box */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-center min-w-[140px] shrink-0">
              <div className="text-2xl font-black text-white">
                {completion}%
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">প্রোফাইল সম্পন্নতা</p>
              <div className="w-full h-2 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-700">
                <div
                  className={`h-full ${
                    completion >= 100 ? 'bg-emerald-400' : completion >= 70 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>১. ব্যক্তিগত ও পরিচিতি</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'finance'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>২. আর্থিক ও পে-রোল</span>
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'education'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>৩. শিক্ষাগত ও প্রশিক্ষণ</span>
          </button>
          <button
            onClick={() => setActiveTab('employment')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'employment'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>৪. নিয়োগ ও এমপিও</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'documents'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>৫. নথিপত্র ও সংযুক্তি</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: OVERVIEW & PERSONAL */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Basic Demographics */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>ব্যক্তিগত পরিচিতি ও পরিবার</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">জাতীয় পরিচয়পত্র (NID):</span>
                    <span className="font-mono font-semibold text-slate-800">{staff.nid || 'তথ্য প্রদান করা হয়নি'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">জন্মতারিখ:</span>
                    <span className="font-medium text-slate-800">{staff.dateOfBirth || 'তথ্য নেই'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">পিতার নাম:</span>
                    <span className="font-medium text-slate-800">{staff.fatherNameBn || staff.fatherName || 'তথ্য নেই'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">মাতার নাম:</span>
                    <span className="font-medium text-slate-800">{staff.motherNameBn || staff.motherName || 'তথ্য নেই'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">স্বামী/স্ত্রীর নাম:</span>
                    <span className="font-medium text-slate-800">{staff.spouseNameBn || staff.spouseName || 'প্রযোজ্য নয়'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">লিঙ্গ:</span>
                    <span className="font-medium text-slate-800">{staff.gender === 'Female' ? 'মহিলা' : 'পুরুষ'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ধর্ম:</span>
                    <span className="font-medium text-slate-800">{staff.religion || 'ইসলাম'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">রক্তের গ্রুপ:</span>
                    <span className="font-bold text-rose-600">{staff.bloodGroup || 'তথ্য নেই'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">বৈবাহিক অবস্থা:</span>
                    <span className="font-medium text-slate-800">{staff.maritalStatus || 'বিবাহিত'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">জাতীয়তা:</span>
                    <span className="font-medium text-slate-800">{staff.nationality || 'বাংলাদেশী'}</span>
                  </div>
                </div>
              </div>

              {/* Address & Emergency Contact */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>ঠিকানা ও জরুরি যোগাযোগ</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold block">স্থায়ী ঠিকানা:</span>
                      {staff.isAddressSame && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          বর্তমান ও স্থায়ী একই
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">
                      {[staff.houseNo, staff.para, staff.village, staff.union, staff.postOffice, staff.upazila, staff.district].filter(Boolean).join(', ') || 'ঠিকানা এন্ট্রি করা হয়নি'}
                    </p>
                  </div>

                  {(!staff.isAddressSame && (staff.presentVillage || staff.presentDistrict || staff.presentUpazila)) && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 font-semibold block">বর্তমান ঠিকানা:</span>
                      <p className="font-medium text-slate-800 mt-0.5 leading-relaxed">
                        {[staff.presentHouseNo, staff.presentPara, staff.presentVillage, staff.presentUnion, staff.presentPostOffice, staff.presentUpazila, staff.presentDistrict].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">জরুরি যোগাযোগ ব্যক্তি</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block">নাম:</span>
                        <span className="font-semibold text-slate-800">{staff.emergencyContactName || 'তথ্য নেই'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">সম্পর্ক:</span>
                        <span className="font-medium text-slate-800">{staff.emergencyContactRelation || 'তথ্য নেই'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block">জরুরি মোবাইল নম্বর:</span>
                        <span className="font-mono font-medium text-slate-800">{staff.emergencyContactPhone || 'তথ্য নেই'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL & PAYROLL */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">মূল বেতন (Basic Salary)</span>
                  <div className="text-2xl font-bold text-slate-800 mt-1">
                    ৳{Number(staff.basicSalary || 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-indigo-600 font-semibold">{staff.payCode || 'জাতীয় বেতন স্কেল'}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">মোট মাসিক ভাতা (Allowances)</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    ৳{(Number(staff.houseRent || 1000) + Number(staff.medicalAllowance || 500) + Number(staff.specialAllowance || 0)).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">বাড়ি ভাড়া + চিকিৎসা + বিশেষ</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-400 font-medium">মাসিক মোট কর্তন (Deductions)</span>
                  <div className="text-2xl font-bold text-rose-600 mt-1">
                    ৳{(Number(staff.gpfDeduction || 0) + Number(staff.welfareDeduction || 0) + Number(staff.otherDeductions || 0)).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">জিপিএফ + কল্যাণ ও অবসর তহবিল</span>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>ব্যাংক হিসাব ও ইএফটি (EFT) তথ্য</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">ব্যাংক একাউন্ট নাম:</span>
                    <span className="font-semibold text-slate-800 text-sm">{staff.bankAccountName || staff.name}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">হিসাব নম্বর (Account No):</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{staff.bankAccountNumber || 'এন্ট্রি করা হয়নি'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">ব্যাংকের নাম ও শাখা:</span>
                    <span className="font-semibold text-slate-800">{staff.bankName || 'সোনালী ব্যাংক'} ({staff.bankBranch || 'মূল শাখা'})</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">রাউটিং নম্বর (Routing No):</span>
                    <span className="font-mono font-medium text-slate-800">{staff.routingNumber || 'তথ্য নেই'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">টিআইএন নম্বর (TIN):</span>
                    <span className="font-mono font-medium text-slate-800">{staff.tinNumber || 'তথ্য নেই'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">মোবাইল ব্যাংকিং (বিকাশ/নগদ):</span>
                    <span className="font-mono font-medium text-slate-800">{staff.mobileBankingNumber || 'তথ্য নেই'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDUCATION & TRAININGS */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {/* Academic Educations */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>শিক্ষাগত যোগ্যতা (Academic Degrees)</span>
                </h4>

                {staff.educations && staff.educations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">ডিগ্রি / পরীক্ষার নাম</th>
                          <th className="p-2.5">পঠিত বিষয়</th>
                          <th className="p-2.5">বোর্ড / বিশ্ববিদ্যালয়</th>
                          <th className="p-2.5">পাশের সাল</th>
                          <th className="p-2.5">ফলাফল / জিপিএ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staff.educations.map((edu, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-2.5 font-bold text-slate-800">{edu.degree}</td>
                            <td className="p-2.5 text-slate-600">{edu.major || '-'}</td>
                            <td className="p-2.5 text-slate-700">{edu.boardUniversity}</td>
                            <td className="p-2.5 font-mono text-slate-600">{edu.passingYear}</td>
                            <td className="p-2.5 font-semibold text-emerald-600">{edu.result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">কোন শিক্ষাগত যোগ্যতার তথ্য পাওয়া যায়নি।</p>
                )}
              </div>

              {/* Professional Degrees & Trainings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>পেশাগত ডিগ্রি (B.Ed / M.Ed ইত্যাদি)</span>
                  </h4>
                  {staff.professionalDegrees && staff.professionalDegrees.length > 0 ? (
                    <ul className="divide-y divide-slate-100 text-xs">
                      {staff.professionalDegrees.map((p, i) => (
                        <li key={i} className="py-2.5 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800">{p.degreeName}</span>
                            <span className="text-[11px] text-slate-500 block">{p.institution}</span>
                          </div>
                          <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700">{p.passingYear}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">কোন পেশাগত ডিগ্রি যুক্ত নেই।</p>
                  )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>প্রশিক্ষণসমূহ (Trainings)</span>
                  </h4>
                  {staff.trainings && staff.trainings.length > 0 ? (
                    <ul className="divide-y divide-slate-100 text-xs">
                      {staff.trainings.map((t, i) => (
                        <li key={i} className="py-2.5 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800">{t.title}</span>
                            <span className="text-[11px] text-slate-500 block">{t.institute} ({t.duration})</span>
                          </div>
                          <span className="font-mono text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-semibold">{t.year}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">কোন প্রশিক্ষণের বিবরণ নেই।</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMPLOYMENT & MPO */}
          {activeTab === 'employment' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>নিয়োগ, এমপিও ও এনটিআরসিএ বিবরণ</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">চাকরির ধরণ:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {staff.employmentType === 'mpo' ? 'সরকারি এমপিওভুক্ত (MPO)' : staff.employmentType === 'non_mpo' ? 'নন-এমপিও' : 'চুক্তিভিত্তিক'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">এমপিও ইনডেক্স নম্বর:</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{staff.mpoIndexNo || staff.pdsId || 'প্রযোজ্য নয়'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">বর্তমান প্রতিষ্ঠানে যোগদানের তারিখ:</span>
                  <span className="font-semibold text-slate-800 text-sm">{staff.joiningDate || 'তথ্য নেই'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">প্রথম শিক্ষকতা যোগদানের তারিখ:</span>
                  <span className="font-medium text-slate-800">{staff.firstJoiningDate || staff.joiningDate || 'তথ্য নেই'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">এমপিওভুক্তির তারিখ:</span>
                  <span className="font-medium text-slate-800">{staff.mpoEnlistedDate || 'তথ্য নেই'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">SMC / GB রেজুলেশন নম্বর:</span>
                  <span className="font-medium text-slate-800">{staff.smcResolutionNo || 'তথ্য নেই'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">NTRCA নিবন্ধন স্ট্যাটাস:</span>
                  <span className="font-medium text-slate-800">{staff.isNtrcaRegistered ? 'হ্যাঁ (নিবন্ধিত)' : 'না / পূর্ববর্তী নিয়োগ'}</span>
                </div>
                {staff.isNtrcaRegistered && (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block">NTRCA রোল নম্বর:</span>
                      <span className="font-mono font-medium text-slate-800">{staff.ntrcaRoll || '-'}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block">NTRCA ব্যাচ / সাল:</span>
                      <span className="font-medium text-slate-800">{staff.ntrcaBatch || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS & ATTACHMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>সংযুক্ত নথিপত্র ও সনদের কপি</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">পাসপোর্ট সাইজ ছবি</span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      {staff.photo ? 'সংযুক্ত রয়েছে' : 'সংযুক্ত নেই'}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">এনআইডি (NID) স্ক্যান</span>
                    <span className="text-[11px] text-slate-500">
                      {staff.nidAttachment ? 'সংযুক্ত রয়েছে' : 'সংযুক্ত নেই'}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">নিয়োগ ও যোগদানপত্র</span>
                    <span className="text-[11px] text-slate-500">
                      {staff.joiningLetterAttachment ? 'সংযুক্ত রয়েছে' : 'সংযুক্ত নেই'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            প্রতিষ্ঠান: <strong className="text-slate-700">{appName}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
