import React from 'react';
import QRCode from 'react-qr-code';
import { Student, Institution, AttestationSettings } from '../types';
import { toBengaliNumber, getBengaliGroup, getBengaliClassName, getBengaliFormattedDate, getInstitutionInitials } from '../utils/bengaliUtils';
import { useAppStore } from '../store/useAppStore';

interface AttestationTemplateProps {
  student: Student;
  institution: Institution;
  settings: AttestationSettings;
  id?: string;
}

export const AttestationTemplate: React.FC<AttestationTemplateProps> = ({
  student: s,
  institution,
  settings,
  id,
}) => {
  const { learnedLocations } = useAppStore();

  const getLocationName = (idOrName?: string) => {
    if (!idOrName) return '';
    const loc = learnedLocations?.find(l => l.id === idOrName);
    if (loc) return loc.nameBn || loc.name;
    if (idOrName.match(/^(vil|po|uni|upz|dist|div)_[0-9]+$/)) return '';
    return idOrName;
  };

  // Student variables
  const studentName = s.nameBn || s.name || 'নুসরাত জাহান';
  const fatherName = s.fatherNameBn || s.fatherName || 'মোহাম্মদ সোহেল';
  const motherName = s.motherNameBn || s.motherName || 'আসমা খাতুন';
  const village = getLocationName(s.village) || s.village || institution.defaultVillage || 'আজিয়ারা';
  const postOffice = getLocationName(s.postOffice) || s.postOffice || institution.defaultPostOffice || 'আজিয়ারা';
  const upazila = getLocationName(s.upazila) || s.upazila || institution.defaultUpazila || 'নাঙ্গলকোট';
  const district = getLocationName(s.district) || s.district || institution.defaultDistrict || 'কুমিল্লা';

  const rawClassName = s.class || 'Class 6';
  const className = getBengaliClassName(rawClassName);
  const rawGroup = s.group || 'সাধারণ';
  const groupName = getBengaliGroup(rawGroup);
  const sectionName = s.section ? (s.section === 'A' ? 'ক' : s.section === 'B' ? 'খ' : s.section) : 'ক';
  const rollNo = toBengaliNumber(s.roll || '০১');
  const sessionBn = toBengaliNumber(s.session || new Date().getFullYear().toString());
  const dob = getBengaliFormattedDate(s.dateOfBirth || '2012-04-12');
  const passYearBn = toBengaliNumber(s.passingYear || new Date().getFullYear().toString());

  // Institution variables
  const instName = institution.nameBn || institution.name || 'আজিয়ারা উচ্চ বিদ্যালয়';
  const instAddress = institution.addressBn || institution.address || `ডাকঘর: ${postOffice}, উপজেলা: ${upazila}, জেলা: ${district}`;
  const instEiin = toBengaliNumber(institution.eiin || '106103');
  const instMpo = toBengaliNumber(institution.mpoCode || '0802131403');
  const instSchoolCode = toBengaliNumber(institution.schoolCode || '8209');
  const instEst = toBengaliNumber(institution.established || '০১.০১.১৯৮৪');
  const instMobile = toBengaliNumber(institution.mobile || '01309106103, 01815598926');
  const instEmail = institution.email || 'azhs106103@gmail.com';
  const headmasterName = institution.headmasterNameBn || institution.headmasterName || 'মো: আবদুর রহমান';
  const headmasterTitle = institution.headmasterTitleBn || 'প্রধান শিক্ষক';

  // Dynamic Memo / Reference No
  const initials = getInstitutionInitials(instName);
  const currentYearBn = toBengaliNumber(new Date().getFullYear().toString());
  const autoMemoNo = settings.memoNo || `${initials}/স্টুডেন্ট/প্রত্যয়নপত্র/${className}/${currentYearBn}/${rollNo.padStart(2, '০')}`;
  const issueDate = settings.issueDate || getBengaliFormattedDate();

  // Simplified and clean QR Code payload
  const qrVerificationText = `প্রত্যয়নপত্র ভেরিফিকেশন
শিক্ষার্থী: ${studentName}
রোল: ${rollNo} | শ্রেণি: ${className} (${sectionName})
আইডি: ${s.studentId || s.id}
প্রতিষ্ঠান: ${instName}
তারিখ: ${issueDate}`;

  // Whether photo or right element should be displayed
  const shouldShowRightElement = settings.includePhoto && (settings.rightLogoType === 'student_photo' || settings.rightLogoType === 'manual_logo');

  // Dynamic Typography & Spacing Configs
  const instNameFontSize = settings.instNameFontSize || 25;
  const bodyFontSize = settings.bodyFontSize || 16;
  const bodyLineHeight = settings.bodyLineHeight || 2.25;
  const titleTopSpace = settings.titleTopSpace !== undefined ? settings.titleTopSpace : 28;
  const titleBottomSpace = settings.titleBottomSpace !== undefined ? settings.titleBottomSpace : 28;
  const paragraphSpacing = settings.paragraphSpacing !== undefined ? settings.paragraphSpacing : 14;
  const closingTopSpace = settings.closingTopSpace !== undefined ? settings.closingTopSpace : 8;
  const closingFontSize = settings.closingFontSize || 18;

  // Dynamic Margins (in inches)
  const marginTop = settings.pageMarginTop !== undefined ? settings.pageMarginTop : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);
  const marginBottom = settings.pageMarginBottom !== undefined ? settings.pageMarginBottom : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);
  const marginLeft = settings.pageMarginLeft !== undefined ? settings.pageMarginLeft : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);
  const marginRight = settings.pageMarginRight !== undefined ? settings.pageMarginRight : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);

  // Border & Frame Styling
  const getFrameClasses = () => {
    switch (settings.frameStyle) {
      case 'simple':
        return 'border-[2.5px] border-slate-900 p-7';
      case 'double':
        return 'border-4 border-double border-slate-900 p-7';
      case 'corner':
        return 'border-2 border-slate-900 p-7 relative before:absolute before:inset-1.5 before:border before:border-slate-500';
      case 'royal':
        return 'border-4 border-amber-800 p-7 relative before:absolute before:inset-1.5 before:border before:border-amber-600';
      case 'academic':
        return 'border-[3px] border-emerald-900 p-7 relative before:absolute before:inset-1.5 before:border before:border-emerald-700';
      case 'none':
      default:
        return 'p-4';
    }
  };

  const isCurrentStudent = settings.studentType !== 'previously_studied';

  return (
    <div
      id={id || `attestation-${s.id}`}
      className="attestation-a4-page bg-white text-slate-900 mx-auto select-none relative"
      style={{
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        paddingTop: `${marginTop}in`,
        paddingBottom: `${marginBottom}in`,
        paddingLeft: `${marginLeft}in`,
        paddingRight: `${marginRight}in`,
        fontFamily: "'Tiro Bangla', 'Noto Serif Bengali', 'SolaimanLipi', serif",
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Printable Inner Container */}
      <div 
        className={`h-full w-full flex flex-col justify-between rounded-sm ${getFrameClasses()}`}
        style={{ boxSizing: 'border-box', backgroundColor: '#ffffff', height: '100%' }}
      >
        
        {/* TOP SECTION: Header & Logos */}
        <div className="w-full">
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b-2 border-slate-900">
            {/* Left Logo */}
            <div 
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: '85px', height: '85px', minWidth: '85px', maxWidth: '85px' }}
            >
              {settings.showInstituteLogo ? (
                institution.logoUrl ? (
                  <img
                    src={institution.logoUrl}
                    alt="Logo"
                    style={{
                      maxWidth: '80px',
                      maxHeight: '80px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div 
                    className="rounded-full border-2 border-slate-900 flex items-center justify-center bg-slate-50 text-slate-900 font-bold text-center text-xs p-1"
                    style={{ width: '70px', height: '70px' }}
                  >
                    {initials}
                  </div>
                )
              ) : (
                <div style={{ width: '85px' }} />
              )}
            </div>

            {/* Center Institution Info */}
            <div className="flex-1 text-center px-1 space-y-0.5">
              <h1 
                className="font-black tracking-tight text-slate-950 leading-tight"
                style={{ fontSize: `${instNameFontSize}px` }}
              >
                {instName}
              </h1>
              <p className="text-xs font-semibold text-slate-800">
                {instAddress}
              </p>
              <p className="text-[11px] font-medium text-slate-700">
                স্থাপিত: {instEst}
              </p>
              <p className="text-[11px] font-semibold text-slate-800">
                EIIN: {instEiin} | MPO Code: {instMpo} | School Code: {instSchoolCode}
              </p>
              <p className="text-[10.5px] text-slate-700 font-medium">
                মোবাইল: {instMobile} | ইমেইল: {instEmail}
              </p>
            </div>

            {/* Right Logo / Student Photo */}
            <div 
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: '85px', height: '85px', minWidth: '85px', maxWidth: '85px' }}
            >
              {shouldShowRightElement ? (
                settings.rightLogoType === 'student_photo' ? (
                  s.photo ? (
                    <div 
                      className="border border-slate-400 bg-white flex items-center justify-center overflow-hidden rounded-xs p-0.5"
                      style={{ width: '75px', height: '85px' }}
                    >
                      <img 
                        src={s.photo} 
                        alt="Student" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  ) : (
                    <div 
                      className="border border-slate-400 bg-slate-50 flex items-center justify-center rounded-xs"
                      style={{ width: '75px', height: '85px' }}
                    >
                      <span className="text-[11px] font-semibold text-slate-500">ছবি</span>
                    </div>
                  )
                ) : settings.rightLogoType === 'manual_logo' && settings.manualRightLogoUrl ? (
                  <img
                    src={settings.manualRightLogoUrl}
                    alt="Right Logo"
                    style={{
                      maxWidth: '80px',
                      maxHeight: '80px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{ width: '85px' }} />
                )
              ) : (
                <div style={{ width: '85px' }} />
              )}
            </div>
          </div>

          {/* Reference No & Date Line */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-800 pt-2.5 pb-1 border-b border-slate-300">
            <div>
              <span>সূত্র/স্মারক নং- </span>
              <span className="font-bold text-slate-950">{autoMemoNo}</span>
            </div>
            <div>
              <span>তারিখ: </span>
              <span className="font-bold text-slate-950">{issueDate}</span>
            </div>
          </div>

          {/* Certificate Title Badge */}
          <div 
            className="text-center space-y-1"
            style={{ 
              marginTop: `${titleTopSpace}px`, 
              marginBottom: `${titleBottomSpace}px` 
            }}
          >
            <div className="inline-block relative">
              <h2 className="text-[25px] sm:text-[26px] font-black tracking-wide text-slate-950 px-8 py-0.5">
                ‘প্রত্যয়নপত্র’
              </h2>
            </div>
            <p className="text-[13px] italic font-medium text-slate-700">
              যাহার জন্য প্রযোজ্য
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: Certificate Body Text */}
        <div 
          className="flex-1 px-3 text-justify text-slate-900"
          style={{ 
            fontSize: `${bodyFontSize}px`, 
            lineHeight: bodyLineHeight 
          }}
        >
          {/* Paragraph 1 */}
          <p style={{ marginBottom: `${paragraphSpacing}px` }}>
            {settings.customBodyP1 ? (
              settings.customBodyP1
            ) : isCurrentStudent ? (
              <>
                এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <strong className="font-bold text-slate-950">{studentName}</strong> (পিতা: <strong className="font-semibold text-slate-950">{fatherName}</strong>, মাতা: <strong className="font-semibold text-slate-950">{motherName}</strong>), গ্রাম: <strong className="font-semibold text-slate-950">{village}</strong>, ডাকঘর: <strong className="font-semibold text-slate-950">{postOffice}</strong>, উপজেলা: <strong className="font-semibold text-slate-950">{upazila}</strong>, জেলা: <strong className="font-semibold text-slate-950">{district}</strong>-এর একজন স্থায়ী বাসিন্দা। সে অত্র বিদ্যালয়ের <strong className="font-semibold text-slate-950">{className}</strong> শ্রেণির {groupName !== 'সাধারণ' && groupName !== 'প্রযোজ্য নয়' ? <><strong className="font-semibold text-slate-950">{groupName}</strong> বিভাগের </> : ''}<strong className="font-semibold text-slate-950">{sectionName}</strong> শাখার একজন নিয়মিত ও সম্ভাবনাময় শিক্ষার্থী। বিদ্যালয়ের সংরক্ষিত রেকর্ড অনুযায়ী তার শ্রেণি রোল নম্বর <strong className="font-bold text-slate-950">{rollNo}</strong>, শিক্ষাবর্ষ <strong className="font-semibold text-slate-950">{sessionBn}</strong> এবং জন্মতারিখ <strong className="font-semibold text-slate-950">{dob}</strong>।
              </>
            ) : (
              <>
                এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <strong className="font-bold text-slate-950">{studentName}</strong> (পিতা: <strong className="font-semibold text-slate-950">{fatherName}</strong>, মাতা: <strong className="font-semibold text-slate-950">{motherName}</strong>), গ্রাম: <strong className="font-semibold text-slate-950">{village}</strong>, ডাকঘর: <strong className="font-semibold text-slate-950">{postOffice}</strong>, উপজেলা: <strong className="font-semibold text-slate-950">{upazila}</strong>, জেলা: <strong className="font-semibold text-slate-950">{district}</strong>-এর একজন স্থায়ী বাসিন্দা। সে অত্র বিদ্যালয়ের <strong className="font-semibold text-slate-950">{className}</strong> শ্রেণির {groupName !== 'সাধারণ' && groupName !== 'প্রযোজ্য নয়' ? <><strong className="font-semibold text-slate-950">{groupName}</strong> বিভাগের </> : ''}<strong className="font-semibold text-slate-950">{sectionName}</strong> শাখায় অধ্যয়নরত ছিল এবং <strong className="font-semibold text-slate-950">{passYearBn}</strong> সেশনে সফলতার সাথে উত্তীর্ণ হয়েছে। তার শ্রেণি রোল নম্বর ছিল <strong className="font-bold text-slate-950">{rollNo}</strong> এবং জন্মতারিখ <strong className="font-semibold text-slate-950">{dob}</strong>।
              </>
            )}
          </p>

          {/* Paragraph 2 */}
          <p style={{ marginBottom: `${closingTopSpace}px` }}>
            {settings.customBodyP2 ? (
              settings.customBodyP2
            ) : (
              'একাডেমিক অধ্যবসায়ের পাশাপাশি বিভিন্ন সহশিক্ষা কার্যক্রমেও তার স্বতঃস্ফূর্ত অংশগ্রহণ ও পারদর্শিতা প্রশংসনীয়। সে একজন বিনয়ী, সুশৃঙ্খল ও উত্তম চরিত্রের অধিকারী। আমার জানামতে, সে বিদ্যালয় কিংবা রাষ্ট্রবিরোধী কোনো ধরনের অনৈতিক কর্মকাণ্ডের সাথে কখনোই যুক্ত ছিল না।'
            )}
          </p>

          {/* Paragraph 3 */}
          <p 
            className="font-semibold text-center text-slate-950 tracking-wide"
            style={{ 
              fontSize: `${closingFontSize}px`,
              paddingTop: `${closingTopSpace}px`,
              paddingBottom: '2px',
              margin: '0',
            }}
          >
            {settings.customBodyP3 ? (
              settings.customBodyP3
            ) : (
              '‘আমি তার সর্বাঙ্গীণ সাফল্য, সুন্দর জীবন ও উজ্জ্বল ভবিষ্যৎ কামনা করছি।’'
            )}
          </p>
        </div>

        {/* BOTTOM SECTION: QR Code & Signatures */}
        <div className="w-full pt-3 mt-auto">
          <div className="flex items-end justify-between px-2">
            
            {/* Bottom Left: Clean QR Code */}
            <div className="flex flex-col items-center" style={{ width: '80px' }}>
              {settings.showQrCode ? (
                <div 
                  className="p-1 border border-slate-300 rounded bg-white"
                  style={{ width: '68px', height: '68px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                >
                  <QRCode
                    value={qrVerificationText}
                    size={52}
                    level="L"
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                  <span style={{ fontSize: '8px', textAlign: 'center', fontWeight: 600, color: '#475569', marginTop: '2px', display: 'block', lineHeight: 1 }}>
                    ডিজিটাল ভেরিফিকেশন
                  </span>
                </div>
              ) : (
                <div style={{ width: '80px' }} />
              )}
            </div>

            {/* Bottom Right: Headmaster Signature & Seal */}
            <div className="text-center min-w-[200px]" style={{ textAlign: 'center' }}>
              <div 
                className="flex items-center justify-center"
                style={{ height: '44px', minHeight: '44px', marginBottom: '2px' }}
              >
                {settings.showSignature && (institution.headmasterSignature || settings.headmasterSignature) ? (
                  <img
                    src={settings.headmasterSignature || institution.headmasterSignature}
                    alt="স্বাক্ষর"
                    style={{
                      maxHeight: '42px',
                      maxWidth: '140px',
                      objectFit: 'contain',
                      display: 'inline-block'
                    }}
                  />
                ) : (
                  <div style={{ height: '42px' }} />
                )}
              </div>

              <div className="border-t border-slate-900 pt-1">
                <p className="font-bold text-sm text-slate-950 leading-tight">
                  {headmasterName}
                </p>
                <p className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">
                  {headmasterTitle}
                </p>
                <p className="text-[11px] font-medium text-slate-700 leading-tight">
                  {instName}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
