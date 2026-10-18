import React from 'react';
import { ScholarshipRecord, Student, Institution } from '../../../types';
import { toBengaliNumber } from '../../../utils/bengaliUtils';
import { ScholarshipFormSettings, getSavedScholarshipSettings } from '../types/scholarshipSettings';
import { ScholarshipLogoRenderer } from './ScholarshipLogoRenderer';

interface RevenueScholarshipRegisterDocumentProps {
  records: ScholarshipRecord[];
  allRecordsCount?: number;
  startIndex?: number;
  students: Student[];
  institution: Institution;
  pageIndex?: number;
  totalPages?: number;
  financialYear?: string;
  headmasterSignatureUrl?: string;
  settings?: ScholarshipFormSettings;
  onOpenLogoSettings?: () => void;
}

/**
 * Official A4 Landscape Register Document for Bangladesh Revenue Scholarship.
 * Standard DSHE / Education Board register format.
 * Dimensions: A4 Landscape (297mm x 210mm / 1123px x 794px).
 * Clean, printable/downloadable official register with zero software UI.
 */
export const RevenueScholarshipRegisterDocument: React.FC<RevenueScholarshipRegisterDocumentProps> = ({
  records,
  allRecordsCount,
  startIndex = 0,
  students,
  institution,
  pageIndex = 0,
  totalPages = 1,
  financialYear,
  headmasterSignatureUrl,
  settings: propSettings,
  onOpenLogoSettings,
}) => {
  const settings = propSettings || getSavedScholarshipSettings();

  const studentMap = React.useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const displayFinancialYear = financialYear || records[0]?.financialYear || new Date().getFullYear().toString();
  const totalCount = allRecordsCount !== undefined ? allRecordsCount : records.length;

  return (
    <div
      id={`revenue-scholarship-register-doc-page-${pageIndex}`}
      className="bg-white text-black font-sans box-border select-none relative"
      style={{
        width: '1123px',
        minHeight: '794px',
        maxHeight: '794px',
        padding: '26px 36px 22px 36px',
        margin: '0 auto',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: `'${settings.fontFamily || 'Kalpurush'}', 'SolaimanLipi', 'Hind Siliguri', sans-serif`,
      }}
    >
      {/* 1. Header Section */}
      <div className="text-center border-b-2 border-black pb-2 mb-1.5 relative">
        <div className="flex items-center justify-between">
          {/* Left Logo */}
          <div className="w-24 flex items-center justify-start">
            <ScholarshipLogoRenderer
              type={settings.leftLogoType}
              customUrl={settings.leftCustomLogo}
              institution={institution}
              height={settings.logoHeight || 52}
              isEditable={!!onOpenLogoSettings}
              onClick={onOpenLogoSettings}
              tooltip="বাম পাশের লোগো পরিবর্তন করতে ক্লিক করুন"
            />
          </div>

          {/* Center: Institutional & Official Directorate Info */}
          <div className="flex-1 px-4">
            <div className="text-[11px] font-bold text-slate-900 leading-tight">
              {settings.headerGovtTitle || 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'} &bull; {settings.headerDirectorateTitle || 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর'}
            </div>
            <h1 className="text-lg font-black tracking-wide leading-tight mt-0.5">
              {institution.nameBn || institution.name}
            </h1>
            <p className="text-[11px] font-medium text-slate-800 leading-tight mt-0.5">
              {institution.addressBn || institution.address || 'বাংলাদেশ'}
            </p>
            <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-900 mt-0.5">
              {institution.eiin && <span>ইআইআইএন: <strong className="font-mono">{toBengaliNumber(institution.eiin)}</strong></span>}
              {institution.schoolCode && <span>প্রতিষ্ঠান কোড: <strong className="font-mono">{toBengaliNumber(institution.schoolCode)}</strong></span>}
              {institution.mobile && <span>মোবাইল: <strong className="font-mono">{toBengaliNumber(institution.mobile)}</strong></span>}
              {institution.email && <span>ইমেইল: <strong className="font-mono">{institution.email}</strong></span>}
            </div>

            <div className="mt-1">
              <span className="inline-block border-2 border-black bg-slate-100 text-black px-4 py-0.5 text-xs font-black rounded-full tracking-wide">
                রাজস্ব খাতভুক্ত বৃত্তিপ্রাপ্ত শিক্ষার্থীদের রেজিস্টার ও বিবরণী তালিকা
              </span>
            </div>
          </div>

          {/* Right Logo */}
          <div className="w-24 flex items-center justify-end">
            <ScholarshipLogoRenderer
              type={settings.rightLogoType}
              customUrl={settings.rightCustomLogo}
              institution={institution}
              height={settings.logoHeight || 52}
              isEditable={!!onOpenLogoSettings}
              onClick={onOpenLogoSettings}
              tooltip="ডান পাশের লোগো পরিবর্তন করতে ক্লিক করুন"
            />
          </div>
        </div>

        {/* Sub-header meta bar */}
        <div className="flex items-center justify-between text-[11px] font-bold mt-1.5 pt-1 border-t border-slate-300">
          <div>
            অর্থবছর: <span className="underline underline-offset-2">{toBengaliNumber(displayFinancialYear)}</span>
          </div>
          <div>
            মোট শিক্ষার্থী সংখ্যা: <span className="font-mono">{toBengaliNumber(totalCount)}</span> জন
          </div>
          <div>
            পৃষ্ঠা নম্বর: <span className="font-mono">{toBengaliNumber(pageIndex + 1)}</span> / <span className="font-mono">{toBengaliNumber(totalPages)}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Register Table */}
      <div className="w-full">
        <table className="w-full border-collapse border border-black text-[10px] leading-tight">
          <thead>
            <tr className="bg-slate-100 text-black font-bold border-b border-black text-center">
              <th className="border border-black py-1 px-1 w-8">ক্র.নং</th>
              <th className="border border-black py-1 px-2 text-left w-36">শিক্ষার্থীর নাম ও আইডি</th>
              <th className="border border-black py-1 px-1.5 w-24">শ্রেণি, বিভাগ ও শাখা</th>
              <th className="border border-black py-1 px-1.5 w-14">শ্রেণি রোল</th>
              <th className="border border-black py-1 px-2 w-28">বৃত্তির ধরণ ও পরীক্ষা</th>
              <th className="border border-black py-1 px-2 text-left">পূর্ববর্তী প্রতিষ্ঠান ও বোর্ড</th>
              <th className="border border-black py-1 px-1.5 w-20">রোল ও রেজিঃ</th>
              <th className="border border-black py-1 px-1.5 w-14">প্রাপ্ত জিপিএ</th>
              <th className="border border-black py-1 px-2 text-left w-36">অভিভাবকের নাম ও মোবাইল</th>
              <th className="border border-black py-1 px-2 text-left">ব্যাংক হিসাব ও পেমেন্ট বিবরণ</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((rec, idx) => {
                const s = studentMap.get(rec.studentId);
                const serialNo = startIndex + idx + 1;
                return (
                  <tr key={rec.id || idx} className="hover:bg-slate-50">
                    <td className="border border-black py-1 px-1 text-center font-bold font-mono">
                      {toBengaliNumber(serialNo)}
                    </td>
                    <td className="border border-black py-1 px-2 text-left">
                      <div className="font-bold text-[10.5px]">
                        {s?.nameBn || s?.name || '-'}
                      </div>
                      <div className="text-[9px] uppercase text-slate-700">
                        {s?.name || ''}
                      </div>
                      <div className="text-[8.5px] font-mono text-slate-800">
                        আইডি: {s?.studentId || rec.studentId}
                      </div>
                    </td>
                    <td className="border border-black py-1 px-1.5 text-center">
                      <div className="font-bold">{s?.class || '-'}</div>
                      <div className="text-[8.5px] text-slate-700">
                        {(s?.group || '-') + ' / ' + (s?.section || '-')}
                      </div>
                    </td>
                    <td className="border border-black py-1 px-1.5 text-center font-bold font-mono">
                      {toBengaliNumber(s?.roll || '') || '-'}
                    </td>
                    <td className="border border-black py-1 px-2 text-center">
                      <div className="font-bold">
                        {rec.scholarshipCategory === 'Merit' ? 'মেধাবৃত্তি' : 'সাধারণ বৃত্তি'}
                      </div>
                      <div className="text-[8.5px] font-semibold text-slate-800">
                        পরীক্ষা: {rec.examType || '-'}
                      </div>
                    </td>
                    <td className="border border-black py-1 px-2 text-left">
                      <div className="font-semibold text-[9.5px]">
                        {rec.prevInstituteName || '-'}
                      </div>
                      <div className="text-[8.5px] text-slate-700">
                        শিক্ষা বোর্ড: {rec.prevBoard || '-'}
                      </div>
                    </td>
                    <td className="border border-black py-1 px-1.5 text-center font-mono text-[9px]">
                      <div>{toBengaliNumber(rec.prevExamName || '') || '-'}</div>
                      <div>রেজিস্ট্রেশন: {toBengaliNumber(rec.prevRegistrationNo || '') || '-'}</div>
                    </td>
                    <td className="border border-black py-1 px-1.5 text-center font-bold font-mono text-[10.5px]">
                      {toBengaliNumber(rec.prevGpa || '') || '-'}
                    </td>
                    <td className="border border-black py-1 px-2 text-left">
                      <div className="font-semibold text-[9.5px]">
                        {rec.guardianNameBn || '-'}
                      </div>
                      <div className="text-[8.5px] font-mono font-bold text-slate-900">
                        {toBengaliNumber(rec.guardianMobile || '') || '-'}
                      </div>
                    </td>
                    <td className="border border-black py-1 px-2 text-left">
                      <div className="font-bold text-[9.5px] leading-tight">
                        {rec.bankName || '-'} ({rec.branchName || '-'})
                      </div>
                      <div className="text-[9px] font-mono font-bold tracking-wide">
                        হিসাব: {toBengaliNumber(rec.accountNumber || '') || '-'}
                      </div>
                      <div className="text-[8.5px] text-slate-700">
                        হিসাবধারী: {rec.accountHolderName || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="border border-black py-8 text-center text-slate-500 font-bold">
                  কোনো বৃত্তিপ্রাপ্ত শিক্ষার্থীর তথ্য পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Official Signature Blocks (3 Columns) */}
      <div className="grid grid-cols-3 gap-8 mt-10 pt-4 text-center text-[10.5px]">
        <div className="flex flex-col items-center justify-end">
          <div className="h-10 flex items-end justify-center" />
          <div className="w-48 border-t border-black pt-1 font-bold">
            প্রস্তুতকারী কর্মকর্তার স্বাক্ষর
          </div>
          <div className="text-[9px] text-slate-600">তারিখ: ............................</div>
        </div>

        <div className="flex flex-col items-center justify-end">
          <div className="h-10 flex items-end justify-center" />
          <div className="w-48 border-t border-black pt-1 font-bold">
            যাচাইকারী / আহ্বায়ক কমিটি
          </div>
          <div className="text-[9px] text-slate-600">তারিখ: ............................</div>
        </div>

        <div className="flex flex-col items-center justify-end min-h-[50px]">
          <div className="h-10 flex items-end justify-center mb-0.5">
            {headmasterSignatureUrl ? (
              <img
                src={headmasterSignatureUrl}
                alt="Headmaster Signature"
                className="max-h-9 max-w-[140px] object-contain"
              />
            ) : null}
          </div>
          <div className="w-48 border-t border-black pt-1 font-bold">
            প্রতিষ্ঠান প্রধানের স্বাক্ষর ও অফিশিয়াল সিল
          </div>
          <div className="text-[9px] text-slate-600">তারিখ: ............................</div>
        </div>
      </div>
    </div>
  );
};
