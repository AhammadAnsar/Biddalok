import React from 'react';
import { ScholarshipRecord, Student, Institution } from '../../../types';
import { toBengaliNumber } from '../../../utils/bengaliUtils';
import { useAppStore } from '../../../store/useAppStore';
import {
  ScholarshipFormSettings,
  ScholarshipPageLayoutMode,
  getSavedScholarshipSettings,
} from '../types/scholarshipSettings';
import { ScholarshipLogoRenderer } from './ScholarshipLogoRenderer';

interface RevenueScholarshipFormDocumentProps {
  record: ScholarshipRecord;
  student?: Student;
  institution: Institution;
  headmasterSignatureUrl?: string;
  settings?: ScholarshipFormSettings;
  layoutMode?: ScholarshipPageLayoutMode; // Explicit override ('single' | 'two_page')
  onOpenLogoSettings?: () => void;
}

/**
 * Standard Revenue Scholarship Information & Verification Document
 * (রাজস্ব খাতভুক্ত বৃত্তিপ্রাপ্ত শিক্ষার্থীর তথ্য বিবরণী ও যাচাই ফরম).
 * 
 * Merged with Official Ministry / DSHE Portal Form ("শিক্ষার্থীর বৃত্তান্ত").
 * 
 * Supports 2 Master Modes:
 * 1. 'single' (এক পাতায়):
 *    - Strict standard single A4 Portrait: 210mm x 297mm (794px x 1123px).
 *    - Sections 1-8 + compact declaration/checklist + all 5 signatures cleanly fit within 1123px.
 * 
 * 2. 'two_page' (দুই পাতায়):
 *    - Strict standard two-page A4 Portrait (794px x 1123px each):
 *    - Page 1: Official Header + Summary + Sections 1-5 + Section 7 (Bank & Payment) + Student & Guardian Pledge & Signatures.
 *    - Page 2: Minimal Aesthetic Header + Section 6 (Guardian Permanent Address) + Section 8 (Verification & Gazette) + Checklist + Headmaster Certification + 3 Administrative Signatures & Seal.
 */
export const RevenueScholarshipFormDocument: React.FC<RevenueScholarshipFormDocumentProps> = ({
  record,
  student,
  institution,
  headmasterSignatureUrl,
  settings: propSettings,
  layoutMode: propLayoutMode,
  onOpenLogoSettings,
}) => {
  const settings = propSettings || getSavedScholarshipSettings();
  const { staff } = useAppStore();

  const activeLayoutMode: ScholarshipPageLayoutMode =
    propLayoutMode || settings.pageLayoutMode || 'two_page';

  const preparerStaff = (staff || []).find((s) => s.id === record.preparerStaffId);
  const reviewerStaff = (staff || []).find((s) => s.id === record.reviewerStaffId);

  const fontFamily = settings.fontFamily || 'Kalpurush';
  const isDraft = record.isDraft || record.verificationStatus === 'Draft' || record.status === 'Draft';

  const getExamTitleBn = (exam?: string) => {
    switch (exam) {
      case 'PEC': return 'পিইসি / পিএসসি (PEC)';
      case 'Ebtedaee': return 'ইবতেদায়ী সমাপনী (Ebtedaee)';
      case 'JSC': return 'জেএসসি (JSC)';
      case 'JDC': return 'জেডিসি (JDC)';
      case 'SSC': return 'এসএসসি (SSC)';
      case 'Dakhil': return 'দাখিল (Dakhil)';
      case 'HSC': return 'এইচএসসি (HSC)';
      case 'Alim': return 'আলিম (Alim)';
      default: return exam || '-';
    }
  };

  // Relationally resolve guardian names/details
  const guardianRelBn =
    record.guardianRelation === 'Father'
      ? 'পিতা'
      : record.guardianRelation === 'Mother'
      ? 'মাতা'
      : record.guardianRelation === 'Brother'
      ? 'ভাই'
      : record.guardianRelation === 'Sister'
      ? 'বোন'
      : 'অভিভাবক';

  const guardianNameBn =
    record.guardianNameBn ||
    (record.guardianRelation === 'Mother' ? student?.motherNameBn : student?.fatherNameBn) ||
    '-';

  const guardianNameEn =
    record.guardianNameEn ||
    (record.guardianRelation === 'Mother' ? student?.motherName : student?.fatherName) ||
    '-';

  const guardianNid =
    record.guardianNid ||
    (record.guardianRelation === 'Mother' ? student?.motherNid : student?.fatherNid) ||
    '';

  const guardianMobile =
    record.guardianMobile ||
    (record.guardianRelation === 'Mother' ? student?.motherMobile : student?.fatherMobile) ||
    student?.mobile ||
    '';

  const guardianDob =
    record.guardianDateOfBirth ||
    (record.guardianRelation === 'Mother' ? student?.motherDob : student?.fatherDob) ||
    '';

  const guardianBrn =
    record.guardianBirthRegistrationNo || student?.guardianBirthRegistrationNo || '';

  const guardianEmail = record.guardianEmail || student?.guardianEmail || '';

  // Relationally resolve guardian permanent address
  const guardianDivision =
    record.guardianDivision ||
    student?.division ||
    institution.division ||
    institution.defaultDivision ||
    'চট্টগ্রাম';

  const guardianDistrict =
    record.guardianDistrict ||
    student?.districtBn ||
    student?.district ||
    institution.districtBn ||
    institution.district ||
    'কুমিল্লা';

  const guardianUpazila =
    record.guardianUpazila ||
    student?.upazilaBn ||
    student?.upazila ||
    institution.upazilaBn ||
    institution.upazila ||
    'নাঙ্গলকোট';

  const guardianPourashava =
    record.guardianPourashava ||
    student?.pourashavaBn ||
    student?.pourashava ||
    institution.pourashava ||
    '';

  const guardianUnion =
    record.guardianUnion ||
    student?.unionBn ||
    student?.union ||
    institution.unionBn ||
    institution.union ||
    '';

  const guardianWardNo = record.guardianWardNo || student?.wardNo || '';
  const guardianPostCode = record.guardianPostCode || student?.postCode || '';
  const guardianAddress = record.guardianAddress || student?.village || student?.permanentAddress || '';

  // Student permanent address resolution
  const studentDivision =
    student?.division || institution.division || institution.defaultDivision || 'চট্টগ্রাম';
  const studentDistrict =
    student?.districtBn || student?.district || institution.districtBn || institution.district || 'কুমিল্লা';
  const studentUpazila =
    student?.upazilaBn || student?.upazila || institution.upazilaBn || institution.upazila || 'নাঙ্গলকোট';
  const studentPourashava = student?.pourashavaBn || student?.pourashava || '';
  const studentUnion = student?.unionBn || student?.union || '';
  const studentWardNo = student?.wardNo || '';
  const studentPostCode = student?.postCode || '';
  const studentAddress = student?.village || student?.permanentAddress || '';

  // Previous educational resolution
  const prevDivision = record.prevDivision || studentDivision;
  const prevDistrict = record.prevDistrict || studentDistrict;
  const prevUpazila = record.prevUpazila || studentUpazila;
  const prevPourashava = record.prevPourashava || '';
  const prevSchool = record.prevInstituteName || student?.prevSchoolName || '-';
  const prevBoard = record.prevBoard || student?.prevBoard || '-';
  const prevClass = record.prevClass || 'পঞ্চম / অষ্টম / দশম';
  const prevExam = record.prevExamName || getExamTitleBn(record.examType);
  const prevRollReg = record.prevRegistrationNo || '';
  const prevGpa = record.prevGpa || student?.gpa || '';
  const prevYear = record.prevPassingYear || '';

  // Current institution info resolution
  const currentInstName = institution.nameBn || institution.name;
  const currentInstDivision = institution.division || institution.defaultDivision || 'চট্টগ্রাম';
  const currentInstDistrict = institution.districtBn || institution.district || 'কুমিল্লা';
  const currentInstUpazila = institution.upazilaBn || institution.upazila || 'নাঙ্গলকোট';
  const currentInstPourashava = institution.pourashava || '';
  const currentClass = student?.class || '-';
  const currentSection = student?.section || '';
  const currentGroup = student?.group || '';
  const currentRoll = student?.roll || '';
  const studentUid = student?.studentId || record.studentId;

  // Payment resolution
  const paymentModeText = record.paymentMode === 'MobileBanking' ? 'মোবাইল ব্যাংকিং' : 'ব্যাংকিং';
  const accountTypeText = record.accountType === 'Savings' ? 'সঞ্চয়ী হিসাব' : 'চলতি হিসাব';
  const accountOwnerText = record.accountOwnership === 'Joint' ? 'যৌথ হিসাব' : 'একক হিসাব';

  // =========================================================================
  // 1. SINGLE-PAGE MODE RENDERER (এক পাতায় — কমপ্যাক্ট, মার্জড ও শতভাগ ফিট)
  // =========================================================================
  if (activeLayoutMode === 'single') {
    // Dynamic single-page scaling so settings apply smoothly
    const baseTableFont = settings.tableFontSize || 9.5;
    const tableFontSize = Math.min(baseTableFont, 9.2); // Guardrail to guarantee 1-page fit
    const baseRowPadding = settings.rowPaddingY !== undefined ? settings.rowPaddingY : 3.0;
    const rowPaddingY = Math.max(1.8, Math.min(baseRowPadding * 0.7, 2.6));
    const baseNoticeFont = settings.noticeFontSize || 9.5;
    const noticeFontSize = Math.min(baseNoticeFont, 8.8);

    const cellStyle: React.CSSProperties = {
      paddingTop: `${rowPaddingY}px`,
      paddingBottom: `${rowPaddingY}px`,
      paddingLeft: '6px',
      paddingRight: '6px',
    };

    const headerBarStyle: React.CSSProperties = {
      fontSize: `${Math.max(8.8, tableFontSize)}px`,
      paddingTop: '2px',
      paddingBottom: '2px',
    };

    const tableStyle: React.CSSProperties = {
      fontSize: `${tableFontSize}px`,
    };

    return (
      <div id="revenue-scholarship-form-doc" className="revenue-scholarship-form-container">
        <div
          id="revenue-scholarship-form-doc-page-1"
          className="revenue-scholarship-page bg-white text-black box-border select-none relative shadow-xl print:shadow-none"
          style={{
            width: '794px',
            height: '1123px',
            minHeight: '1123px',
            maxHeight: '1123px',
            padding: '22px 34px 18px 34px',
            margin: '0 auto',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            color: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            fontFamily: `'${fontFamily}', 'SolaimanLipi', 'Hind Siliguri', sans-serif`,
          }}
        >
          {/* Draft Watermark Badge */}
          {isDraft && (
            <div className="absolute top-2 right-4 z-10">
              <span className="inline-block border border-dashed border-amber-600 bg-amber-50 text-amber-900 px-2.5 py-0.5 text-[9px] font-bold rounded-xs tracking-wide">
                খসড়া কপি (অপ্রমাণিত)
              </span>
            </div>
          )}

          {/* Main Content Area: All Merged Sections */}
          <div className="space-y-1">
            
            {/* Header Section */}
            <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-1 relative shrink-0">
              {/* Left Logo */}
              <div className="w-16 flex items-center justify-start shrink-0">
                <ScholarshipLogoRenderer
                  type={settings.leftLogoType}
                  customUrl={settings.leftCustomLogo}
                  institution={institution}
                  height={settings.logoHeight ? Math.min(settings.logoHeight, 40) : 38}
                  isEditable={!!onOpenLogoSettings}
                  onClick={onOpenLogoSettings}
                  tooltip="বাম পাশের লোগো পরিবর্তন করতে ক্লিক করুন"
                />
              </div>

              {/* Center Title and Institutional Details */}
              <div className="text-center flex-1 px-1">
                <h3 className="text-[11px] font-bold text-black tracking-wide leading-tight">
                  {settings.headerGovtTitle || 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
                </h3>
                <h4 className="text-[10px] font-semibold text-slate-800 leading-tight mt-0.5">
                  {settings.headerDirectorateTitle || 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর, বাংলাদেশ, ঢাকা'}
                </h4>

                {settings.showInstitutionInHeader && (
                  <div className="mt-0.5">
                    <h2 className="text-[13px] font-black text-black leading-tight tracking-wide">
                      {institution.nameBn || institution.name}
                    </h2>
                    <p className="text-[9px] font-medium text-slate-700 leading-tight">
                      {institution.addressBn || institution.address || ''}
                      {institution.eiin && (
                        <span className="ml-1.5 font-bold font-mono">
                          (ইআইআইএন: {toBengaliNumber(institution.eiin)})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div className="mt-0.5">
                  <span className="inline-block border border-black bg-slate-100 text-black px-3 py-0.5 text-[10px] font-black rounded-xs tracking-wide">
                    {settings.headerFormTitle || 'রাজস্ব খাতভুক্ত বৃত্তিপ্রাপ্ত শিক্ষার্থীর তথ্য বিবরণী ও যাচাই ফরম'}
                  </span>
                </div>
              </div>

              {/* Right Logo & Passport Photo Box */}
              <div className="w-20 flex items-center justify-end gap-1.5 shrink-0">
                <ScholarshipLogoRenderer
                  type={settings.rightLogoType}
                  customUrl={settings.rightCustomLogo}
                  institution={institution}
                  height={settings.logoHeight ? Math.min(settings.logoHeight, 40) : 38}
                  isEditable={!!onOpenLogoSettings}
                  onClick={onOpenLogoSettings}
                  tooltip="ডান পাশের লোগো পরিবর্তন করতে ক্লিক করুন"
                />
                {settings.showStudentPhoto && (
                  <div
                    style={{ width: '52px', height: '60px' }}
                    className="border border-black bg-slate-50 flex flex-col items-center justify-center p-0.5 text-center overflow-hidden shrink-0"
                  >
                    {(student?.photo || student?.photoUrl) ? (
                      <img
                        src={student?.photo || student?.photoUrl}
                        alt="Student"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[7px] font-bold text-slate-500 leading-tight">
                        <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-400 mb-0.5 flex items-center justify-center text-[6px]">
                          👤
                        </div>
                        পাসপোর্ট ছবি
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Top 4-Column Summary Row */}
            <div className="grid grid-cols-4 border border-black bg-slate-100/90 text-center font-bold text-[9px] py-0.5 leading-tight">
              <div>
                ভর্তির শিক্ষাবর্ষ: <span className="font-mono text-slate-950 font-black">{toBengaliNumber(record.enrollmentYear || student?.year || '') || '-'}</span>
              </div>
              <div className="border-l border-black">
                অর্থবছর: <span className="font-mono text-slate-950 font-black">{toBengaliNumber(record.financialYear || '') || '-'}</span>
              </div>
              <div className="border-l border-black">
                বৃত্তির পরীক্ষা: <span className="text-slate-950 font-black">{getExamTitleBn(record.examType)}</span>
              </div>
              <div className="border-l border-black">
                বৃত্তির ধরণ: <span className="text-slate-950 font-black">{record.scholarshipCategory === 'Merit' ? 'মেধাবৃত্তি' : 'সাধারণ'}</span>
              </div>
            </div>

            {/* ১. শিক্ষার্থীর তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-2 py-0.5 flex items-center justify-between" style={headerBarStyle}>
                <span>১. শিক্ষার্থীর তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">নাম (বাংলা)*</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-bold align-middle">{student?.nameBn || student?.name || '-'}</td>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">নাম (ইংরেজি)*</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-bold uppercase font-mono align-middle">{student?.name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পিতার নাম (বাংলা)*</td>
                    <td style={cellStyle} className="border border-black font-bold align-middle">{student?.fatherNameBn || student?.fatherName || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পিতার নাম (ইংরেজি)</td>
                    <td style={cellStyle} className="border border-black font-mono uppercase text-[8.5px] align-middle">{student?.fatherName || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পিতার এনআইডি ও জন্ম তাং</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      {toBengaliNumber(student?.fatherNid || '') || '-'} {student?.fatherDob ? `| ${toBengaliNumber(student.fatherDob)}` : ''}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">মাতার এনআইডি ও জন্ম তাং</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      {toBengaliNumber(student?.motherNid || '') || '-'} {student?.motherDob ? `| ${toBengaliNumber(student.motherDob)}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">মাতার নাম (বাংলা)*</td>
                    <td style={cellStyle} className="border border-black font-bold align-middle">{student?.motherNameBn || student?.motherName || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">মাতার নাম (ইংরেজি)</td>
                    <td style={cellStyle} className="border border-black font-mono uppercase text-[8.5px] align-middle">{student?.motherName || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">অনলাইন জন্ম নিবন্ধন*</td>
                    <td style={cellStyle} className="border border-black font-mono font-bold tracking-wider align-middle">{toBengaliNumber(student?.birthRegistrationNo || '') || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">জন্ম তারিখ ও লিঙ্গ</td>
                    <td style={cellStyle} className="border border-black align-middle">
                      <span className="font-mono">{toBengaliNumber(student?.dateOfBirth || '') || '-'}</span> |{' '}
                      <span className="font-semibold">{student?.gender === 'Female' ? 'মহিলা' : student?.gender === 'Male' ? 'পুরুষ' : student?.gender || '-'}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ২. স্থায়ী ঠিকানা (শিক্ষার্থী) */}
            <div>
              <div className="bg-black text-white font-bold px-2 py-0.5 flex items-center justify-between" style={headerBarStyle}>
                <span>২. শিক্ষার্থীর স্থায়ী ঠিকানা</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">বিভাগ ও জেলা</td>
                    <td style={cellStyle} className="border border-black w-[33%] align-middle">
                      {studentDivision}, {studentDistrict}
                    </td>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">উপজেলা ও পৌর/ইউপি</td>
                    <td style={cellStyle} className="border border-black w-[33%] align-middle">
                      {studentUpazila} {studentPourashava ? `• পৌর: ${studentPourashava}` : studentUnion ? `• ইউপি: ${studentUnion}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ওয়ার্ড ও পোস্ট কোড</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      ওয়ার্ড: {toBengaliNumber(studentWardNo) || '-'} | কোড: {toBengaliNumber(studentPostCode) || '-'}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ঠিকানা (গ্রাম/রোড)*</td>
                    <td style={cellStyle} className="border border-black font-semibold align-middle truncate max-w-[200px]">
                      {studentAddress || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ৩. পূর্ববর্তী শিক্ষাগত তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-2 py-0.5 flex items-center justify-between" style={headerBarStyle}>
                <span>৩. পূর্ববর্তী শিক্ষাগত তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">প্রতিষ্ঠান ও অবস্থান</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-bold align-middle truncate max-w-[200px]">
                      {prevSchool} {prevDistrict ? `(${prevDistrict})` : ''}
                    </td>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">বোর্ড ও পরীক্ষা</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-semibold align-middle">
                      {prevBoard} • {prevExam}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পূর্ববর্তী শ্রেণি ও রেজি.</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      শ্রেণি: {prevClass} | রেজি: <strong className="font-bold">{toBengaliNumber(prevRollReg) || '-'}</strong>
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">জিপিএ ও পাসের সন*</td>
                    <td style={cellStyle} className="border border-black font-mono font-bold align-middle">
                      জিপিএ: {toBengaliNumber(prevGpa) || '-'} | সন: {toBengaliNumber(prevYear) || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ৪. বর্তমান শিক্ষাগত তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-2 py-0.5 flex items-center justify-between" style={headerBarStyle}>
                <span>৪. বর্তমান প্রাতিষ্ঠানিক তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">বর্তমান প্রতিষ্ঠান*</td>
                    <td style={cellStyle} colSpan={3} className="border border-black font-bold align-middle">
                      {currentInstName}
                      {institution.eiin && <span className="ml-2 font-mono font-normal text-[8.5px]">(ইআইআইএন: {toBengaliNumber(institution.eiin)})</span>}
                      <span className="ml-2 font-normal text-slate-600 text-[8.5px]">[{currentInstUpazila}, {currentInstDistrict}]</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">শ্রেণি, শাখা ও রোল</td>
                    <td style={cellStyle} className="border border-black font-bold align-middle">
                      {currentClass} {currentSection ? `(${currentSection})` : ''} | রোল: <span className="font-mono">{toBengaliNumber(currentRoll) || '-'}</span>
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">শিক্ষার্থী ইউআইডি</td>
                    <td style={cellStyle} className="border border-black font-mono font-black align-middle">
                      {studentUid}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ৫. অভিভাবকের তথ্য ও স্থায়ী ঠিকানা (কমপ্যাক্ট ইন্টিগ্রেটেড) */}
            <div>
              <div className="bg-black text-white font-bold px-2 py-0.5 flex items-center justify-between" style={headerBarStyle}>
                <span>৫. অভিভাবকের তথ্য ও স্থায়ী ঠিকানা</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">সম্পর্ক ও নাম*</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-bold align-middle">
                      [{guardianRelBn}] {guardianNameBn}
                    </td>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">ইংরেজি নাম ও পেশা</td>
                    <td style={cellStyle} className="border border-black w-[33%] align-middle">
                      <span className="font-mono uppercase text-[8.5px] font-semibold">{guardianNameEn}</span> {record.guardianProfession ? `• ${record.guardianProfession}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">এনআইডি ও মোবাইল*</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      {toBengaliNumber(guardianNid) || '-'} {guardianMobile ? `| ${toBengaliNumber(guardianMobile)}` : ''}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">অভিভাবকের ঠিকানা</td>
                    <td style={cellStyle} className="border border-black truncate max-w-[200px] align-middle">
                      {guardianAddress || studentAddress || '-'}, {guardianUpazila}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ৬. ব্যাংক ও পেমেন্ট হিসাবের তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-2 py-0.5 flex items-center justify-between" style={headerBarStyle}>
                <span>৬. ব্যাংক ও পেমেন্ট হিসাবের তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">পদ্ধতি ও ব্যাংকের নাম*</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-bold align-middle">
                      [{paymentModeText}] {record.bankName || '-'}
                    </td>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">শাখা ও রাউটিং*</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-mono align-middle">
                      <span className="font-sans font-bold">{record.branchName || '-'}</span> | রাউটিং: <strong className="font-bold">{toBengaliNumber(record.routingNumber || '') || '-'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">হিসাবধারীর নাম*</td>
                    <td style={cellStyle} className="border border-black font-mono font-bold uppercase text-[9px] align-middle">
                      {record.accountHolderName || '-'}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">হিসাবের ধরণ ও মালিকানা</td>
                    <td style={cellStyle} className="border border-black align-middle">
                      {accountTypeText} • <span className="font-semibold">{accountOwnerText}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">হিসাব নম্বর (১৩-১৭)*</td>
                    <td style={cellStyle} colSpan={3} className="border border-black font-mono font-black tracking-widest text-[10px] align-middle">
                      {toBengaliNumber(record.accountNumber || '') || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ৭. প্রতিষ্ঠান পর্যায়ের যাচাই ও গেজেট তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-2 py-0.5 flex items-center justify-between" style={headerBarStyle}>
                <span>৭. প্রতিষ্ঠান পর্যায়ের যাচাই ও গেজেট তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">গেজেটে শিক্ষার্থীর নাম</td>
                    <td style={cellStyle} className="border border-black w-[33%] font-mono font-bold uppercase align-middle">{record.gazetteStudentNameEn || student?.name || '-'}</td>
                    <td style={cellStyle} className="border border-black w-[17%] font-medium bg-slate-50 align-middle">নামের মিল ও স্ট্যাটাস</td>
                    <td style={cellStyle} className="border border-black w-[33%] align-middle">
                      {record.nameMatchDiscrepancy ? (
                        <span className="font-bold text-amber-700">⚠️ অমিল</span>
                      ) : (
                        <span className="font-bold text-emerald-700">✓ নামের মিল আছে</span>
                      )}{' '}
                      | <span className="font-semibold text-slate-800">{record.verificationStatus === 'LocallyVerified' ? 'যাচাইকৃত' : 'খসড়া'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">দায়িত্বপ্রাপ্ত শিক্ষকবৃন্দ*</td>
                    <td style={cellStyle} colSpan={3} className="border border-black align-middle text-[8.5px]">
                      প্রস্তুতকারী: <strong className="font-semibold text-slate-950">{preparerStaff?.nameBn || preparerStaff?.name || 'শিক্ষক-১'}</strong> |{' '}
                      যাচাইকারী: <strong className="font-semibold text-slate-950">{reviewerStaff?.nameBn || reviewerStaff?.name || 'শিক্ষক-২'}</strong> |{' '}
                      মন্তব্য: <span className="italic text-slate-700">{record.discrepancyNote || 'সকল তথ্যাদি সঠিক পাওয়া গিয়াছে।'}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* কম্প্যাক্ট অঙ্গীকারনামা ও প্রত্যয়ন */}
            {settings.showDeclaration && (
              <div
                className="border border-slate-300 bg-slate-50/90 p-1 text-slate-800 rounded-xs leading-snug"
                style={{ fontSize: `${noticeFontSize * 0.88}pt` }}
              >
                <div>
                  <strong className="text-black">অঙ্গীকারনামা ও প্রত্যয়ন: </strong>
                  (১) <strong>শিক্ষার্থী ও অভিভাবক:</strong> উপরে প্রদত্ত তথ্য সত্য ও নির্ভুল। ভুল বা অসত্য তথ্যে বৃত্তি বাতিল হলে সমুদয় দায়ভার আমার।{' '}
                  (২) <strong>প্রতিষ্ঠান প্রধান:</strong> শিক্ষার্থী অত্র প্রতিষ্ঠানের নিয়মিত শিক্ষার্থী। নথিপত্র ও ব্যাংক হিসাব যাচাইপূর্বক রাজস্ব বৃত্তির সুপারিশ করা হলো।
                </div>
              </div>
            )}

            {/* কম্প্যাক্ট প্রমাণক নথিপত্র */}
            {settings.showChecklistNotice && (
              <div
                className="border border-dashed border-slate-400 p-0.5 px-1 text-slate-700 bg-amber-50/40 rounded-xs leading-tight"
                style={{ fontSize: `${noticeFontSize * 0.82}pt` }}
              >
                <span className="font-bold text-slate-900">সংযুক্ত প্রমাণক: </span>
                (১) অনলাইন জন্ম নিবন্ধন (BRN) ও পিতা-মাতার এনআইডি, (২) পূর্ববর্তী পরীক্ষার নম্বরপত্র/প্রবেশপত্র, (৩) এমআইসিআর চেক পাতা বা ব্যাংক স্টেটমেন্ট, (৪) গেজেটের পাতা।{' '}
                <span className="italic text-slate-600">* একক হিসাব শিক্ষার্থীর নামে অথবা ১৮ বছরের কম হলে পিতা/মাতার সাথে যৌথ হিসাব।</span>
              </div>
            )}

          </div>

          {/* ৫টি সুনির্দিষ্ট স্বাক্ষর অংশ (১ পাতা মোড) */}
          <div className="pt-1 border-t-2 border-slate-400 text-center text-[8.5px] shrink-0 mt-auto">
            <div className="grid grid-cols-5 gap-1.5">
              
              {/* 1. Student */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-7 flex items-end justify-center" />
                <div className="w-full border-t border-black pt-0.5 font-bold text-[8.5px]">
                  শিক্ষার্থীর স্বাক্ষর
                </div>
                <div className="text-[7px] text-slate-500 mt-0.5">তারিখ: ..............</div>
              </div>

              {/* 2. Guardian */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-7 flex items-end justify-center" />
                <div className="w-full border-t border-black pt-0.5 font-bold text-[8.5px]">
                  অভিভাবকের স্বাক্ষর
                </div>
                <div className="text-[7px] text-slate-500 mt-0.5">তারিখ: ..............</div>
              </div>

              {/* 3. Preparer */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-7 flex items-end justify-center text-[8px] font-medium text-slate-800 pb-0.5 truncate max-w-[120px]">
                  {preparerStaff?.nameBn || preparerStaff?.name || ''}
                </div>
                <div className="w-full border-t border-black pt-0.5 font-bold text-[8.5px]">
                  প্রস্তুতকারীর স্বাক্ষর
                </div>
                <div className="text-[7px] text-slate-500 mt-0.5">তারিখ: ..............</div>
              </div>

              {/* 4. Reviewer */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-7 flex items-end justify-center text-[8px] font-medium text-slate-800 pb-0.5 truncate max-w-[120px]">
                  {reviewerStaff?.nameBn || reviewerStaff?.name || ''}
                </div>
                <div className="w-full border-t border-black pt-0.5 font-bold text-[8.5px]">
                  যাচাইকারীর স্বাক্ষর
                </div>
                <div className="text-[7px] text-slate-500 mt-0.5">তারিখ: ..............</div>
              </div>

              {/* 5. Head of Institution */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-7 flex items-end justify-center pb-0.5">
                  {headmasterSignatureUrl ? (
                    <img
                      src={headmasterSignatureUrl}
                      alt="Headmaster Signature"
                      crossOrigin="anonymous"
                      className="max-h-6 max-w-[80px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="w-full border-t border-black pt-0.5 font-bold text-[8.5px]">
                  প্রধানের স্বাক্ষর ও সিল
                </div>
                <div className="text-[7px] text-slate-500 mt-0.5">তারিখ: ..............</div>
              </div>

            </div>

            {/* Single Page Footer */}
            <div className="pt-1 border-t border-slate-300 text-[8px] text-slate-600 flex items-center justify-between shrink-0 mt-1">
              <span className="font-semibold text-slate-700">ব্যবস্থাপনায়: Biddalok by NiceTrix | Developed by SoftDows</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                পাতা ১/১ (একক পৃষ্ঠা ফরম)
              </span>
              <span>মুদ্রণ তারিখ: {toBengaliNumber(new Date().toLocaleDateString('bn-BD'))} • বিদ্যালয় ডাটাবেজ দ্বারা যাচাইকৃত</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TWO-PAGE MODE RENDERER (দুই পাতায় — সুষম, মার্জড ও শতভাগ প্রফেশনাল বিন্যাস)
  // =========================================================================
  const tableFontSize = settings.tableFontSize || 10.2;
  const rowPaddingY = settings.rowPaddingY !== undefined ? settings.rowPaddingY : 3.4;
  const noticeFontSize = settings.noticeFontSize !== undefined ? settings.noticeFontSize : 10.2;

  const cellStyle: React.CSSProperties = {
    paddingTop: `${rowPaddingY}px`,
    paddingBottom: `${rowPaddingY}px`,
    paddingLeft: '8px',
    paddingRight: '8px',
  };

  const headerBarStyle: React.CSSProperties = {
    fontSize: `${Math.max(9.8, tableFontSize)}px`,
    paddingTop: '3px',
    paddingBottom: '3px',
  };

  const tableStyle: React.CSSProperties = {
    fontSize: `${tableFontSize}px`,
  };

  const pageContainerStyle: React.CSSProperties = {
    width: '794px',
    height: '1123px',
    minHeight: '1123px',
    maxHeight: '1123px',
    padding: '24px 38px 20px 38px',
    margin: '0 auto',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#000000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    fontFamily: `'${fontFamily}', 'SolaimanLipi', 'Hind Siliguri', sans-serif`,
  };

  return (
    <div id="revenue-scholarship-form-doc" className="revenue-scholarship-form-container space-y-8 print:space-y-0">
      
      {/* ------------------------------------------------------------------------- */}
      {/* PAGE 1: প্রাতিষ্ঠানিক হেডার, সারসংক্ষেপ, সেকশন ১-৫ ও ৭ (পেমেন্ট), অঙ্গীকার ও শিক্ষার্থী/অভিভাবক স্বাক্ষর */}
      {/* ------------------------------------------------------------------------- */}
      <div className="relative">
        {/* Screen Page Badge */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1 print:hidden mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
            পৃষ্ঠা ১: মৌলিক, শিক্ষাগত, অভিভাবক ও ব্যাংক হিসাবের তথ্য
          </span>
          <span className="bg-slate-200/90 text-slate-800 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold">
            পাতা ১/২
          </span>
        </div>

        <div
          id="revenue-scholarship-form-doc-page-1"
          className="revenue-scholarship-page bg-white text-black box-border select-none relative shadow-xl print:shadow-none"
          style={pageContainerStyle}
        >
          {/* Draft Watermark Badge */}
          {isDraft && (
            <div className="absolute top-3 right-4 z-10">
              <span className="inline-block border border-dashed border-amber-600 bg-amber-50 text-amber-900 px-3 py-0.5 text-[10px] font-bold rounded-xs tracking-wide shadow-2xs">
                খসড়া কপি (অপ্রমাণিত)
              </span>
            </div>
          )}

          {/* Main Content Area: Page 1 */}
          <div className="space-y-1.5">
            
            {/* Header Section */}
            <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-1 relative shrink-0">
              {/* Left Logo */}
              <div className="w-20 flex items-center justify-start shrink-0">
                <ScholarshipLogoRenderer
                  type={settings.leftLogoType}
                  customUrl={settings.leftCustomLogo}
                  institution={institution}
                  height={settings.logoHeight || 44}
                  isEditable={!!onOpenLogoSettings}
                  onClick={onOpenLogoSettings}
                  tooltip="বাম পাশের লোগো পরিবর্তন করতে ক্লিক করুন"
                />
              </div>

              {/* Center Title and Institutional Details */}
              <div className="text-center flex-1 px-2">
                <h3 className="text-xs font-bold text-black tracking-wide leading-tight">
                  {settings.headerGovtTitle || 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'}
                </h3>
                <h4 className="text-[11px] font-semibold text-slate-800 leading-tight mt-0.5">
                  {settings.headerDirectorateTitle || 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর, বাংলাদেশ, ঢাকা'}
                </h4>

                {settings.showInstitutionInHeader && (
                  <div className="mt-0.5">
                    <h2 className="text-[14.5px] font-black text-black leading-tight tracking-wide">
                      {institution.nameBn || institution.name}
                    </h2>
                    <p className="text-[10px] font-medium text-slate-700 leading-tight">
                      {institution.addressBn || institution.address || ''}
                      {institution.eiin && (
                        <span className="ml-2 font-bold font-mono">
                          (ইআইআইএন: {toBengaliNumber(institution.eiin)})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div className="mt-1">
                  <span className="inline-block border border-black bg-slate-100 text-black px-4 py-0.5 text-xs font-black rounded-xs tracking-wide">
                    {settings.headerFormTitle || 'রাজস্ব খাতভুক্ত বৃত্তিপ্রাপ্ত শিক্ষার্থীর তথ্য বিবরণী ও যাচাই ফরম'}
                  </span>
                </div>
              </div>

              {/* Right Logo & Passport Photo Box */}
              <div className="w-24 flex items-center justify-end gap-2 shrink-0">
                <ScholarshipLogoRenderer
                  type={settings.rightLogoType}
                  customUrl={settings.rightCustomLogo}
                  institution={institution}
                  height={settings.logoHeight || 44}
                  isEditable={!!onOpenLogoSettings}
                  onClick={onOpenLogoSettings}
                  tooltip="ডান পাশের লোগো পরিবর্তন করতে ক্লিক করুন"
                />
                {settings.showStudentPhoto && (
                  <div
                    style={{ width: '58px', height: '68px' }}
                    className="border border-black bg-slate-50 flex flex-col items-center justify-center p-0.5 text-center overflow-hidden shrink-0 shadow-xs"
                  >
                    {(student?.photo || student?.photoUrl) ? (
                      <img
                        src={student?.photo || student?.photoUrl}
                        alt="Student"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[8px] font-bold text-slate-500 leading-tight">
                        <div className="w-4 h-4 rounded-full border border-dashed border-slate-400 mb-0.5 flex items-center justify-center text-[7px]">
                          👤
                        </div>
                        পাসপোর্ট ছবি
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Top 4-Column Summary Row */}
            <div className="grid grid-cols-4 border border-black bg-slate-100/90 text-center font-bold text-[10px] py-1 leading-tight rounded-xs">
              <div>
                ভর্তির শিক্ষাবর্ষ: <span className="font-mono text-slate-950 font-black">{toBengaliNumber(record.enrollmentYear || student?.year || '') || '-'}</span>
              </div>
              <div className="border-l border-black">
                অর্থবছর: <span className="font-mono text-slate-950 font-black">{toBengaliNumber(record.financialYear || '') || '-'}</span>
              </div>
              <div className="border-l border-black">
                বৃত্তির পরীক্ষা: <span className="text-slate-950 font-black">{getExamTitleBn(record.examType)}</span>
              </div>
              <div className="border-l border-black">
                বৃত্তির ধরণ: <span className="text-slate-950 font-black">{record.scholarshipCategory === 'Merit' ? 'মেধাবৃত্তি / ট্যালেন্টপুল' : 'সাধারণ বৃত্তি'}</span>
              </div>
            </div>

            {/* সেকশন ১: শিক্ষার্থীর তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>১. শিক্ষার্থীর তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">নাম (বাংলা)*</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-bold align-middle">{student?.nameBn || student?.name || '-'}</td>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">নাম (ইংরেজি)*</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-bold uppercase font-mono align-middle">{student?.name || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পিতার নাম (বাংলা)*</td>
                    <td style={cellStyle} className="border border-black font-bold align-middle">{student?.fatherNameBn || student?.fatherName || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পিতার নাম (ইংরেজি)</td>
                    <td style={cellStyle} className="border border-black font-mono uppercase text-[9.5px] align-middle">{student?.fatherName || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পিতার এনআইডি ও জন্ম তাং</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      {toBengaliNumber(student?.fatherNid || '') || '-'} {student?.fatherDob ? `| ${toBengaliNumber(student.fatherDob)}` : ''}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">মাতার এনআইডি ও জন্ম তাং</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      {toBengaliNumber(student?.motherNid || '') || '-'} {student?.motherDob ? `| ${toBengaliNumber(student.motherDob)}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">মাতার নাম (বাংলা)*</td>
                    <td style={cellStyle} className="border border-black font-bold align-middle">{student?.motherNameBn || student?.motherName || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">মাতার নাম (ইংরেজি)</td>
                    <td style={cellStyle} className="border border-black font-mono uppercase text-[9.5px] align-middle">{student?.motherName || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">অনলাইন জন্ম নিবন্ধন (১৭)*</td>
                    <td style={cellStyle} className="border border-black font-mono font-bold tracking-wider align-middle">{toBengaliNumber(student?.birthRegistrationNo || '') || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">জন্ম তারিখ ও জেন্ডার</td>
                    <td style={cellStyle} className="border border-black align-middle">
                      <span className="font-mono font-semibold">{toBengaliNumber(student?.dateOfBirth || '') || '-'}</span> |{' '}
                      <span className="font-semibold">{student?.gender === 'Female' ? 'মহিলা' : student?.gender === 'Male' ? 'পুরুষ' : student?.gender || '-'}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* সেকশন ২: শিক্ষার্থীর স্থায়ী ঠিকানা */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>২. শিক্ষার্থীর স্থায়ী ঠিকানা</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">বিভাগ ও জেলা</td>
                    <td style={cellStyle} className="border border-black w-[32%] align-middle font-semibold">
                      {studentDivision}, {studentDistrict}
                    </td>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">উপজেলা ও পৌর/ইউপি</td>
                    <td style={cellStyle} className="border border-black w-[32%] align-middle">
                      {studentUpazila} {studentPourashava ? `• পৌর: ${studentPourashava}` : studentUnion ? `• ইউপি: ${studentUnion}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ওয়ার্ড নং ও পোস্ট কোড</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      ওয়ার্ড: {toBengaliNumber(studentWardNo) || '-'} | পোস্ট কোড: {toBengaliNumber(studentPostCode) || '-'}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">স্থায়ী ঠিকানা (গ্রাম/রোড)*</td>
                    <td style={cellStyle} className="border border-black font-semibold align-middle truncate max-w-[220px]">
                      {studentAddress || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* সেকশন ৩: পূর্ববর্তী শিক্ষাগত তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>৩. পূর্ববর্তী শিক্ষাগত তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">পূর্ববর্তী প্রতিষ্ঠান ও অবস্থান*</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-bold align-middle truncate max-w-[220px]">
                      {prevSchool} {prevDistrict ? `(${prevDistrict})` : ''}
                    </td>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">বোর্ড ও পরীক্ষার নাম*</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-semibold align-middle">
                      {prevBoard} • {prevExam}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পূর্ববর্তী শ্রেণি ও রেজি. নং</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      শ্রেণি: {prevClass} | রেজি: <strong className="font-bold">{toBengaliNumber(prevRollReg) || '-'}</strong>
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ফলাফল (জিপিএ) ও সন*</td>
                    <td style={cellStyle} className="border border-black font-mono font-bold align-middle">
                      জিপিএ: {toBengaliNumber(prevGpa) || '-'} | উত্তীর্ণ সন: {toBengaliNumber(prevYear) || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* সেকশন ৪: বর্তমান প্রাতিষ্ঠানিক তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>৪. বর্তমান প্রাতিষ্ঠানিক তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">বর্তমান প্রতিষ্ঠান*</td>
                    <td style={cellStyle} colSpan={3} className="border border-black font-bold align-middle">
                      {currentInstName}
                      {institution.eiin && <span className="ml-2 font-mono font-normal text-[9px]">(ইআইআইএন: {toBengaliNumber(institution.eiin)})</span>}
                      <span className="ml-2 font-normal text-slate-600 text-[9px]">[{currentInstUpazila}, {currentInstDistrict}]</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">শ্রেণি, শাখা ও বিভাগ</td>
                    <td style={cellStyle} className="border border-black font-bold align-middle">
                      {currentClass} {currentSection ? `(${currentSection})` : ''} {currentGroup ? `• বিভাগ: ${currentGroup}` : ''}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">শ্রেণি রোল ও শিক্ষার্থী ইউআইডি</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      রোল: <strong className="font-bold">{toBengaliNumber(currentRoll) || '-'}</strong> | ইউআইডি: <strong className="font-bold">{studentUid}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* সেকশন ৫: অভিভাবকের তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>৫. অভিভাবকের তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">সম্পর্ক ও নাম (বাংলা)*</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-bold align-middle">
                      [{guardianRelBn}] {guardianNameBn}
                    </td>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">নাম (ইংরেজি) ও পেশা</td>
                    <td style={cellStyle} className="border border-black w-[32%] align-middle">
                      <span className="font-mono uppercase text-[9px] font-semibold">{guardianNameEn}</span> {record.guardianProfession ? `• ${record.guardianProfession}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">এনআইডি ও জন্ম সনদ</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      এনআইডি: {toBengaliNumber(guardianNid) || '-'} {guardianBrn ? `| জন্ম সনদ: ${toBengaliNumber(guardianBrn)}` : ''}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">মোবাইল ও জন্ম তারিখ*</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">
                      মোবাইল: <strong className="font-bold">{toBengaliNumber(guardianMobile) || '-'}</strong> {guardianDob ? `| জন্ম: ${toBengaliNumber(guardianDob)}` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* সেকশন ৭: ব্যাংক ও পেমেন্ট হিসাবের তথ্য (১ম পাতায় স্থানান্তরিত — ইউজার স্পেসিফিকেশন) */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>৭. ব্যাংক ও পেমেন্ট হিসাবের তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">পদ্ধতি ও ব্যাংকের নাম*</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-bold align-middle">
                      [{paymentModeText}] {record.bankName || '-'}
                    </td>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">শাখা ও রাউটিংনাম্বার*</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-mono align-middle">
                      <span className="font-sans font-bold">{record.branchName || '-'}</span> | রাউটিং: <strong className="font-bold">{toBengaliNumber(record.routingNumber || '') || '-'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">হিসাবধারীর নাম*</td>
                    <td style={cellStyle} className="border border-black font-mono font-bold uppercase text-[10px] align-middle">
                      {record.accountHolderName || '-'}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">হিসাবের ধরণ ও মালিকানা</td>
                    <td style={cellStyle} className="border border-black align-middle">
                      {accountTypeText} • <span className="font-bold">{accountOwnerText}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ব্যাংক হিসাব নম্বর (১৩-১৭)*</td>
                    <td style={cellStyle} colSpan={3} className="border border-black font-mono font-black tracking-widest text-[11px] align-middle">
                      {toBengaliNumber(record.accountNumber || '') || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* শিক্ষার্থী ও অভিভাবকের অঙ্গীকারনামা (১ম পাতা) */}
            {settings.showDeclaration && (
              <div className="border border-slate-400 bg-slate-50/90 p-2 rounded-xs space-y-0.5 shadow-2xs">
                <div className="font-bold text-slate-950 border-b border-slate-300 pb-0.5 flex items-center justify-between text-[10px]">
                  <span>শিক্ষার্থী ও অভিভাবকের অঙ্গীকারনামা:</span>
                </div>
                <p className="text-justify leading-snug text-slate-900" style={{ fontSize: `${Math.max(9.0, noticeFontSize - 0.8)}pt`, lineHeight: 1.3 }}>
                  আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সত্য ও নির্ভুল। ভবিষ্যতে কোনো ভুল বা অসত্য তথ্যের কারণে বৃত্তি বাতিল বা সরকারি অর্থ ফেরত প্রদানের আদেশ জারি হলে তার সমুদয় দায়-দায়িত্ব আমার নিজের ওপর বর্তাবে। কোনো তথ্য অসত্য প্রমাণিত হলে প্রচলিত সরকারি বিধি অনুযায়ী গৃহীত যেকোনো প্রশাসনিক ব্যবস্থা মানিয়া নিতে বাধ্য থাকিব।
                </p>
              </div>
            )}

          </div>

          {/* প্রথম পাতায় শিক্ষার্থী ও অভিভাবকের স্বাক্ষর অংশ */}
          <div className="pt-1.5 border-t-2 border-slate-500 text-center shrink-0 mt-auto">
            <div className="grid grid-cols-2 gap-10 max-w-md mx-auto">
              
              {/* 1. Student Signature */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-9 flex items-end justify-center" />
                <div className="w-full border-t border-black pt-1 font-bold text-[10px]">
                  বৃত্তিপ্রাপ্ত শিক্ষার্থীর স্বাক্ষর
                </div>
                <div className="text-[8px] text-slate-600 mt-0.5">তারিখ: ..............</div>
              </div>

              {/* 2. Guardian Signature */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-9 flex items-end justify-center" />
                <div className="w-full border-t border-black pt-1 font-bold text-[10px]">
                  অভিভাবকের স্বাক্ষর
                </div>
                <div className="text-[8px] text-slate-600 mt-0.5">তারিখ: ..............</div>
              </div>

            </div>

            {/* Page 1 Official Footer */}
            <div className="pt-1.5 border-t border-slate-300 text-[8.5px] text-slate-600 flex items-center justify-between shrink-0 mt-1.5">
              <span className="font-semibold text-slate-700">ব্যবস্থাপনায়: Biddalok by NiceTrix | Developed by SoftDows</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-3 py-0.5 rounded-full border border-slate-300">
                পাতা ১/২ (চলমান... পরবর্তী পাতায় যাচাই ও প্রশাসনিক অনুমোদন)
              </span>
              <span>মুদ্রণ তারিখ: {toBengaliNumber(new Date().toLocaleDateString('bn-BD'))} • বিদ্যালয় ডাটাবেজ দ্বারা যাচাইকৃত</span>
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* PAGE 2: অভিভাবকের স্থায়ী ঠিকানা (৬), যাচাই (৮), প্রমাণক, প্রত্যয়ন ও প্রশাসনিক ৩টি স্বাক্ষর */}
      {/* ------------------------------------------------------------------------- */}
      <div className="relative">
        {/* Screen Page Badge */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1 print:hidden mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs" />
            পৃষ্ঠা ২: অভিভাবকের ঠিকানা, প্রতিষ্ঠান পর্যায়ের যাচাই, প্রত্যয়ন ও প্রশাসনিক অনুমোদন
          </span>
          <span className="bg-slate-200/90 text-slate-800 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold">
            পাতা ২/২
          </span>
        </div>

        <div
          id="revenue-scholarship-form-doc-page-2"
          className="revenue-scholarship-page bg-white text-black box-border select-none relative shadow-xl print:shadow-none"
          style={pageContainerStyle}
        >
          {/* Main Content Area: Page 2 */}
          <div className="space-y-3">
            
            {/* Minimal & Elegant Continuation Header (২য় পাতা) */}
            <div className="border-b-2 border-slate-900 pb-2 mb-1 shrink-0">
              <div className="flex items-center justify-between">
                
                {/* Left: Institution Branding & EIIN */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {institution.nameBn ? institution.nameBn.charAt(0) : 'বি'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 leading-tight">
                      {institution.nameBn || institution.name}
                    </h3>
                    <p className="text-[10px] text-slate-600 font-medium">
                      {institution.addressBn || institution.address || ''}
                      {institution.eiin && (
                        <span className="ml-1.5 font-bold font-mono text-slate-800">
                          • ইআইআইএন: {toBengaliNumber(institution.eiin)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Center: Minimal Document Title Pill */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 border border-slate-800 bg-slate-50 px-3 py-0.5 rounded-full shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span className="text-[11px] font-black text-slate-900 tracking-wide">
                      রাজস্ব বৃত্তি বিবরণী ও যাচাই ফরম
                    </span>
                  </div>
                  <div className="text-[9.5px] font-semibold text-slate-600 mt-0.5">
                    ২য় পাতা • অভিভাবকের স্থায়ী ঠিকানা, প্রাতিষ্ঠানিক যাচাই ও অনুমোদন
                  </div>
                </div>

                {/* Right: Clean Student Reference Card */}
                <div className="border border-slate-300 bg-slate-50/80 px-2.5 py-1 rounded-md text-right text-[9.5px] shadow-2xs min-w-[130px]">
                  <div className="font-bold text-slate-900 leading-tight">
                    {student?.nameBn || student?.name}
                  </div>
                  <div className="text-slate-600 font-mono text-[9px] mt-0.5">
                    আইডি: <strong className="text-slate-950 font-bold">{studentUid}</strong>
                    {currentRoll && <span className="ml-1 font-sans">• রোল: {toBengaliNumber(currentRoll)}</span>}
                  </div>
                </div>

              </div>
            </div>

            {/* সেকশন ৬: অভিভাবকের স্থায়ী ঠিকানা */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-1 mb-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>৬. অভিভাবকের স্থায়ী ঠিকানা</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">বিভাগ</td>
                    <td style={cellStyle} className="border border-black w-[32%] align-middle font-semibold">{guardianDivision}</td>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">জেলা</td>
                    <td style={cellStyle} className="border border-black w-[32%] align-middle font-semibold">{guardianDistrict}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">উপজেলা</td>
                    <td style={cellStyle} className="border border-black align-middle">{guardianUpazila}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পৌরসভা</td>
                    <td style={cellStyle} className="border border-black align-middle">{guardianPourashava || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ইউনিয়ন</td>
                    <td style={cellStyle} className="border border-black align-middle">{guardianUnion || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ওয়ার্ড নং</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">{toBengaliNumber(guardianWardNo) || '-'}</td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">পোস্ট কোড</td>
                    <td style={cellStyle} className="border border-black font-mono align-middle">{toBengaliNumber(guardianPostCode) || '-'}</td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">ঠিকানা (গ্রাম/রোড)*</td>
                    <td style={cellStyle} className="border border-black font-bold align-middle">{guardianAddress || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* সেকশন ৮: প্রতিষ্ঠান পর্যায়ের যাচাই ও গেজেট তথ্য */}
            <div>
              <div className="bg-black text-white font-bold px-3 py-1 mb-0.5 flex items-center justify-between rounded-xs" style={headerBarStyle}>
                <span>৮. প্রতিষ্ঠান পর্যায়ের যাচাই ও গেজেট তথ্য</span>
              </div>
              <table className="w-full border-collapse border border-black leading-tight" style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">গেজেটের ইংরেজি নাম</td>
                    <td style={cellStyle} className="border border-black w-[32%] font-mono font-bold uppercase align-middle">{record.gazetteStudentNameEn || student?.name || '-'}</td>
                    <td style={cellStyle} className="border border-black w-[18%] font-medium bg-slate-50 align-middle">নামের মিল যাচাই</td>
                    <td style={cellStyle} className="border border-black w-[32%] align-middle">
                      {record.nameMatchDiscrepancy ? (
                        <span className="font-bold text-amber-700">⚠️ তথ্যে অমিল রয়েছে</span>
                      ) : (
                        <span className="font-bold text-emerald-700">✓ প্রোফাইলের নামের সাথে মিল রয়েছে</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">তথ্য প্রস্তুতকারী শিক্ষক*</td>
                    <td style={cellStyle} className="border border-black px-3 font-semibold align-middle">
                      {preparerStaff ? `${preparerStaff.nameBn || preparerStaff.name} (${preparerStaff.designationBn || preparerStaff.designation || 'শিক্ষক'})` : 'দায়িত্বপ্রাপ্ত শিক্ষক-১'}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">যাচাইকারী শিক্ষক*</td>
                    <td style={cellStyle} className="border border-black px-3 font-semibold align-middle">
                      {reviewerStaff ? `${reviewerStaff.nameBn || reviewerStaff.name} (${reviewerStaff.designationBn || reviewerStaff.designation || 'শিক্ষক'})` : 'দায়িত্বপ্রাপ্ত শিক্ষক-২'}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">যাচাইয়ের স্ট্যাটাস</td>
                    <td style={cellStyle} className="border border-black px-3 font-bold align-middle">
                      {record.verificationStatus === 'LocallyVerified'
                        ? 'স্থানীয়ভাবে যাচাইকৃত'
                        : record.verificationStatus === 'Discrepancy'
                        ? 'তথ্যে অমিল রয়েছে'
                        : record.verificationStatus === 'Rejected'
                        ? 'বাতিল'
                        : 'খসড়া (Draft)'}
                    </td>
                    <td style={cellStyle} className="border border-black font-medium bg-slate-50 align-middle">যাচাই নোট / মন্তব্য</td>
                    <td style={cellStyle} className="border border-black px-3 align-middle">{record.discrepancyNote || 'সকল তথ্য নথিপত্র অনুসারে সঠিক পাওয়া গিয়াছে।'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* প্রমাণক নথিপত্রের তালিকা ও পরিপত্র নির্দেশনা */}
            {settings.showChecklistNotice && (
              <div className="border border-dashed border-slate-400 p-2.5 rounded-xs bg-amber-50/40 text-slate-900">
                <div className="leading-snug" style={{ fontSize: `${noticeFontSize}pt`, lineHeight: 1.35 }}>
                  <strong className="text-black font-bold">সংযুক্ত প্রমাণক নথিসমূহ: </strong>
                  (১) অনলাইন জন্ম নিবন্ধন সনদ (BRN) ও পিতা-মাতার এনআইডি ফটোকপি, (২) পূর্ববর্তী পাবলিক পরীক্ষার প্রবেশপত্র ও নম্বরপত্র, (৩) ব্যাংক হিসাবের এমআইসিআর চেক পাতা বা অনলাইন ব্যাংক স্টেটমেন্ট (যাতে ১৩-১৭ ডিজিটের হিসাব নম্বর ও রাউটিং নম্বর স্পষ্ট), (৪) সংশ্লিষ্ট শিক্ষা বোর্ডের রাজস্ব বৃত্তি গেজেটের পাতা।
                </div>
                <div
                  className="mt-1 text-slate-700 italic font-medium"
                  style={{ fontSize: `${Math.max(9.0, noticeFontSize - 0.5)}pt`, lineHeight: 1.3 }}
                >
                  * সরকারি পরিপত্র অনুযায়ী একক হিসাব হলে শিক্ষার্থীর নামে এবং ১৮ বছরের কম যৌথ হিসাব হলে কেবল পিতা/মাতা/আইনগত অভিভাবকের সাথে পরিচালিত হতে হবে।
                </div>
              </div>
            )}

            {/* প্রতিষ্ঠান প্রধানের প্রত্যয়ন ও সুপারিশ (২য় পাতা) */}
            {settings.showDeclaration && (
              <div className="border border-slate-400 bg-slate-50/80 p-3 text-slate-900 rounded-xs space-y-1 shadow-2xs">
                <div
                  className="font-bold text-black border-b border-slate-300 pb-0.5 flex items-center justify-between"
                  style={{ fontSize: `${Math.max(10.2, noticeFontSize + 0.2)}pt` }}
                >
                  <span>প্রতিষ্ঠান প্রধানের প্রত্যয়ন ও সুপারিশ:</span>
                </div>
                <p className="text-justify leading-relaxed" style={{ fontSize: `${noticeFontSize}pt`, lineHeight: 1.38 }}>
                  প্রত্যয়ন করা যাচ্ছে যে, উপরোক্ত শিক্ষার্থী অত্র প্রতিষ্ঠানের একজন নিয়মিত শিক্ষার্থী। তার দাখিলকৃত শিক্ষাগত সনদ, জন্ম নিবন্ধন ও ব্যাংক হিসাবের তথ্যাদি দায়িত্বপ্রাপ্ত শিক্ষকদের মাধ্যমে পুঙ্খানুপুঙ্খভাবে যাচাই করে সঠিক পাওয়া গিয়েছে এবং সরকারি বিধি মোতাবেক রাজস্ব বৃত্তির জন্য উপযুক্ত বিবেচনা করে অত্র প্রতিষ্ঠানে ভর্তি রেজিস্টার মোতাবেক চূড়ান্ত অনুমোদনের জন্য সুপারিশ করা হলো।
                </p>
              </div>
            )}

          </div>

          {/* দ্বিতীয় পাতায় ৩টি প্রশাসনিক স্বাক্ষর অংশ (প্রস্তুতকারী, যাচাইকারী ও প্রতিষ্ঠান প্রধানের সিল) */}
          <div className="pt-2 border-t-2 border-slate-500 text-center shrink-0 mt-auto">
            <div className="grid grid-cols-3 gap-6">
              
              {/* 1. Preparer Teacher */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-14 flex items-end justify-center text-[10px] font-mono font-medium text-slate-800 pb-0.5">
                  {preparerStaff ? `${preparerStaff.nameBn || preparerStaff.name} (${preparerStaff.designationBn || preparerStaff.designation || 'শিক্ষক'})` : ''}
                </div>
                <div className="w-full border-t border-black pt-1.5 font-bold text-xs">
                  তথ্য প্রস্তুতকারী শিক্ষকের স্বাক্ষর
                </div>
                <div className="text-[9px] text-slate-600 mt-0.5">তারিখ: ..............</div>
              </div>

              {/* 2. Reviewer Teacher */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-14 flex items-end justify-center text-[10px] font-mono font-medium text-slate-800 pb-0.5">
                  {reviewerStaff ? `${reviewerStaff.nameBn || reviewerStaff.name} (${reviewerStaff.designationBn || reviewerStaff.designation || 'শিক্ষক'})` : ''}
                </div>
                <div className="w-full border-t border-black pt-1.5 font-bold text-xs">
                  যাচাইকারী শিক্ষকের স্বাক্ষর
                </div>
                <div className="text-[9px] text-slate-600 mt-0.5">তারিখ: ..............</div>
              </div>

              {/* 3. Head of Institution with Official Seal */}
              <div className="flex flex-col items-center justify-end">
                <div className="h-14 flex items-end justify-center pb-0.5">
                  {headmasterSignatureUrl ? (
                    <img
                      src={headmasterSignatureUrl}
                      alt="Headmaster Signature"
                      crossOrigin="anonymous"
                      className="max-h-12 max-w-[120px] object-contain"
                    />
                  ) : null}
                </div>
                <div className="w-full border-t border-black pt-1.5 font-bold text-xs">
                  প্রতিষ্ঠান প্রধানের স্বাক্ষর ও অফিসিয়াল সিল
                </div>
                <div className="text-[9px] text-slate-600 mt-0.5">তারিখ: ..............</div>
              </div>

            </div>

            {/* Page 2 Official Footer */}
            <div className="pt-2 border-t border-slate-300 text-[9.5px] text-slate-600 flex items-center justify-between shrink-0 mt-2">
              <span className="font-semibold text-slate-700">ব্যবস্থাপনায়: Biddalok by NiceTrix | Developed by SoftDows</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-3 py-0.5 rounded-full border border-slate-300">
                পাতা ২/২ (সমাপ্ত)
              </span>
              <span>মুদ্রণ তারিখ: {toBengaliNumber(new Date().toLocaleDateString('bn-BD'))} • বিদ্যালয় ডাটাবেজ দ্বারা যাচাইকৃত</span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
