import React, { useState } from 'react';
import { X, User, BookOpen, Award, FileText, Edit3, ArrowRightLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Student } from '../types';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (student: Student) => void;
  onTransfer?: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ 
  student, 
  isOpen, 
  onClose, 
  onEdit,
  onTransfer 
}) => {
  const { language, examResults } = useAppStore();
  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'exams' | 'documents'>('personal');

  if (!isOpen || !student) return null;

  const publicExams = (examResults || []).filter(er => er.studentDbId === student.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {isBn && student.nameBn ? student.nameBn : student.name}
              </h2>
              <p className="text-sm text-slate-500">
                {isBn ? 'আইডি:' : 'ID:'} {student.studentId} | {isBn ? 'রোল:' : 'Roll:'} {student.roll || '-'} | {isBn ? 'শ্রেণি:' : 'Class:'} {student.class || '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onTransfer && (
              <button
                onClick={() => {
                  onClose();
                  onTransfer(student);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-xl transition-colors border border-emerald-200"
                title={isBn ? 'আন্তঃ শ্রেণি/বিভাগ স্থানান্তর' : 'Transfer & Migrate'}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>{isBn ? 'স্থানান্তর / মাইগ্রেশন' : 'Transfer'}</span>
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(student);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold rounded-xl transition-colors border border-indigo-200"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isBn ? 'তথ্য সম্পাদনা' : 'Edit Student'}</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto flex-nowrap border-b border-slate-200 px-6 pt-4 gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button 
            onClick={() => setActiveTab('personal')} 
            className={`shrink-0 whitespace-nowrap pb-3 font-medium transition-colors ${activeTab === 'personal' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Info'}
          </button>
          <button 
            onClick={() => setActiveTab('academic')} 
            className={`shrink-0 whitespace-nowrap pb-3 font-medium transition-colors ${activeTab === 'academic' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {isBn ? 'একাডেমিক তথ্য' : 'Academic Info'}
          </button>
          <button 
            onClick={() => setActiveTab('exams')} 
            className={`shrink-0 whitespace-nowrap pb-3 font-medium transition-colors ${activeTab === 'exams' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {isBn ? 'পাবলিক পরীক্ষার ফলাফল' : 'Public Exam Results'}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  {isBn ? 'মৌলিক বিবরণ' : 'Basic Details'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'নাম (ইংরেজি):' : 'Name (English):'}</span>
                    <span className="col-span-2 font-medium">{student.name || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'নাম (বাংলা):' : 'Name (Bangla):'}</span>
                    <span className="col-span-2 font-medium">{student.nameBn || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'পিতার নাম:' : 'Father Name:'}</span>
                    <span className="col-span-2 font-medium">{student.fatherName || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'মাতার নাম:' : 'Mother Name:'}</span>
                    <span className="col-span-2 font-medium">{student.motherName || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'জন্ম তারিখ:' : 'Date of Birth:'}</span>
                    <span className="col-span-2 font-medium">{student.dateOfBirth || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'লিঙ্গ:' : 'Gender:'}</span>
                    <span className="col-span-2 font-medium">{student.gender || '-'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  {isBn ? 'ঠিকানা' : 'Address'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'গ্রাম/মহল্লা:' : 'Village:'}</span>
                    <span className="col-span-2 font-medium">{student.village || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'ডাকঘর:' : 'Post Office:'}</span>
                    <span className="col-span-2 font-medium">{student.postOffice || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'ইউনিয়ন/পৌরসভা:' : 'Union:'}</span>
                    <span className="col-span-2 font-medium">{student.union || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'উপজেলা:' : 'Upazila:'}</span>
                    <span className="col-span-2 font-medium">{student.upazila || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">{isBn ? 'জেলা:' : 'District:'}</span>
                    <span className="col-span-2 font-medium">{student.district || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {isBn ? 'বর্তমান একাডেমিক তথ্য' : 'Current Enrollment'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">{isBn ? 'শ্রেণি:' : 'Class:'}</span>
                  <span className="col-span-2 font-medium">{student.class}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">{isBn ? 'রোল নং:' : 'Roll No:'}</span>
                  <span className="col-span-2 font-medium">{student.roll}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">{isBn ? 'শিক্ষাবর্ষ:' : 'Session:'}</span>
                  <span className="col-span-2 font-medium">{student.session || '-'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">{isBn ? 'বিভাগ:' : 'Group:'}</span>
                  <span className="col-span-2 font-medium">{student.group || '-'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">{isBn ? 'শাখা:' : 'Section:'}</span>
                  <span className="col-span-2 font-medium">{student.section || '-'}</span>
                </div>
              </div>

              {onTransfer && (
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {isBn ? 'শিক্ষার্থীর শ্রেণি, বিভাগ বা শাখা পরিবর্তন করতে চান?' : 'Want to change this student class, group or section?'}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onTransfer(student);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{isBn ? 'স্থানান্তর / মাইগ্রেশন' : 'Transfer & Migrate'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">{isBn ? 'ডকুমেন্টস' : 'Documents'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'documentBirthCertificate' as keyof Student, label: isBn ? 'অনলাইন জন্ম নিবন্ধন' : 'Online Birth Certificate' },
                  { id: 'documentFatherNid' as keyof Student, label: isBn ? 'পিতার জাতীয় পরিচয়পত্র' : 'Father NID' },
                  { id: 'documentMotherNid' as keyof Student, label: isBn ? 'মাতার জাতীয় পরিচয়পত্র' : 'Mother NID' },
                  { id: 'documentRegistrationCard' as keyof Student, label: isBn ? 'রেজিস্ট্রেশন কার্ড' : 'Registration Card' },
                  { id: 'documentTc' as keyof Student, label: isBn ? 'ছাড়পত্র (টিসি)' : 'Transfer Certificate (TC)' },
                ].map(doc => (
                  <div key={doc.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h4 className="font-medium text-slate-700">{doc.label}</h4>
                    </div>
                    <div className="p-4 flex items-center justify-center min-h-[160px] bg-slate-50/50">
                      {student[doc.id] ? (
                        <img src={student[doc.id] as string} alt={doc.label} className="max-w-full max-h-40 object-contain rounded shadow-sm" />
                      ) : (
                        <div className="text-center text-slate-400">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">{isBn ? 'কোনো ডকুমেন্ট নেই' : 'No Document'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'exams' && (
            <div>
              {publicExams.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{isBn ? 'এই শিক্ষার্থীর কোনো পাবলিক পরীক্ষার ফলাফল পাওয়া যায়নি।' : 'No public exam results found for this student.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publicExams.map(exam => (
                    <div key={exam.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{exam.examName} - {exam.passingYear}</h3>
                        <p className="text-sm text-slate-500">
                          {isBn ? 'বোর্ড:' : 'Board:'} {exam.board || '-'} | {isBn ? 'বিভাগ:' : 'Group:'} {exam.group || '-'}
                        </p>
                      </div>
                      <div className="text-sm space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 min-w-[200px]">
                        <div className="flex justify-between"><span className="text-slate-500">{isBn ? 'রোল নং:' : 'Roll No:'}</span><span className="font-medium">{exam.boardRollNo || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">{isBn ? 'রেজিস্ট্রেশন নং:' : 'Reg No:'}</span><span className="font-medium">{exam.registrationNo || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">{isBn ? 'জিপিএ:' : 'GPA:'}</span><span className="font-bold text-indigo-600">{exam.gpa || '-'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
