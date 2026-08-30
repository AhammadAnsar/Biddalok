import React from 'react';
import QRCode from 'react-qr-code';
import { Student, Institution, TestimonialSettings, ExamResult } from '../types';
import { Shield, Phone, Mail, Globe } from 'lucide-react';
import { toBengaliNumber, getBengaliGroup, getEnglishGroup, getBengaliBoard, getEnglishBoard } from '../utils/bengaliUtils';
import { useAppStore } from '../store/useAppStore';
import { getLetterGrade } from '../utils/gradeUtils';

interface CertificateTemplateProps {
  student: Student | ExamResult;
  institution: Institution;
  settings: TestimonialSettings;
  id?: string;
}

export const getFontFamily = (fontName?: string, isBengali?: boolean): string => {
  if (isBengali) {
    if (fontName === 'Noto Serif Bengali') return "'Noto Serif Bengali', serif";
    if (fontName === 'Hind Siliguri') return "'Hind Siliguri', sans-serif";
    return "'Tiro Bangla', serif";
  }
  switch (fontName) {
    case 'Dancing Script': return "'Dancing Script', cursive";
    case 'Great Vibes': return "'Great Vibes', cursive";
    case 'Alex Brush': return "'Alex Brush', cursive";
    case 'Playfair Display': return "'Playfair Display', serif";
    case 'Cinzel': return "'Cinzel', serif";
    case 'EB Garamond': return "'EB Garamond', serif";
    case 'Times New Roman': return "'Times New Roman', serif";
    case 'Arial': return "Arial, sans-serif";
    case 'Caveat': return "'Caveat', cursive";
    case 'Edwardian Script ITC':
    default:
      return "'Alex Brush', 'Great Vibes', cursive, serif";
  }
};

export const getDesignBackground = (design?: string): string => {
  if (!design || design === 'none') return 'none';
  if (design === 'classic_blue') return "url('/designs/design-classic-blue.svg')";
  if (design === 'royal_gold') return "url('/designs/design-royal-gold.svg')";
  if (design === 'emerald') return "url('/designs/design-emerald.svg')";
  if (design === 'vintage') return "url('/designs/design-vintage-parchment.svg')";
  if (design === 'modern') return "url('/designs/design-modern-minimal.svg')";
  if (design.startsWith('data:') || design.startsWith('http') || design.startsWith('/')) {
    return `url('${design}')`;
  }
  return 'none';
};

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  student: s,
  institution,
  settings,
  id,
}) => {
  const { learnedLocations } = useAppStore();

  const getLocationName = (idOrName: string, isBengali: boolean) => {
    if (!idOrName) return '';
    const loc = learnedLocations?.find(l => l.id === idOrName);
    if (loc) {
      return isBengali && loc.nameBn ? loc.nameBn : loc.name;
    }
    if (idOrName.match(/^(vil|po|uni|upz|dist|div)_[0-9]+$/)) return ''; // Hide orphaned IDs
    return idOrName; // Fallback if it's just a regular string name
  };

  const isBengali = settings.format === 'bn_portrait';
  const dataFont = getFontFamily(settings.studentDataFont, isBengali);
  const baseBgImage = getDesignBackground(settings.certificateDesign);
  const textureSvg = `<svg width="250" height="150" xmlns="http://www.w3.org/2000/svg"><text x="10" y="75" font-family="Arial" font-size="12" fill="rgba(0,0,0,0.015)" transform="rotate(-30 10 75)">${institution.name || 'INSTITUTION'}</text></svg>`;
  const textureUrl = `url("data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(textureSvg)))}")`;
  const bgImage = baseBgImage !== 'none' ? `${baseBgImage}, ${textureUrl}` : textureUrl;

  // Dynamic Typography and Spacing
  const instNameFontSize = settings.instNameFontSize || 30;
  const titleFontSize = settings.titleFontSize || (isBengali ? 32 : 30);
  const titleTopSpace = settings.titleTopSpace !== undefined ? settings.titleTopSpace : 20;
  const titleBottomSpace = settings.titleBottomSpace !== undefined ? settings.titleBottomSpace : 18;
  const bodyFontSize = settings.bodyFontSize || (isBengali ? 16.5 : 16);
  const bodyLineHeight = settings.bodyLineHeight !== undefined ? settings.bodyLineHeight : (isBengali ? 1.55 : 1.4);
  const paragraphSpacing = settings.paragraphSpacing !== undefined ? settings.paragraphSpacing : 5;
  const closingTopSpace = settings.closingTopSpace !== undefined ? settings.closingTopSpace : 8;
  const closingFontSize = settings.closingFontSize || (isBengali ? 17.5 : 17);

  // Dynamic Margins
  const marginTop = settings.pageMarginTop !== undefined ? settings.pageMarginTop : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);
  const marginBottom = settings.pageMarginBottom !== undefined ? settings.pageMarginBottom : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);
  const marginLeft = settings.pageMarginLeft !== undefined ? settings.pageMarginLeft : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);
  const marginRight = settings.pageMarginRight !== undefined ? settings.pageMarginRight : (settings.pageMargin !== undefined ? settings.pageMargin : 0.4);
  
  // Use settings.examYear or fallback to student.passingYear or current year
  const examYear = settings.examYear || s.passingYear || new Date().getFullYear().toString();
  const boardRoll = ('boardRollNo' in s) ? s.boardRollNo : s.roll;
  const letterGrade = getLetterGrade(s.gpa);

  const gender = s.gender || 'Male';
  const heShe = gender === 'Female' ? 'She' : 'He';
  const heSheLower = gender === 'Female' ? 'she' : 'he';
  const hisHer = gender === 'Female' ? 'Her' : 'His';
  const hisHerLower = gender === 'Female' ? 'her' : 'his';
  const himHer = gender === 'Female' ? 'her' : 'him';
  const sonDaughter = gender === 'Female' ? 'daughter' : 'son';

  // Format Date strictly in correct language
  const issueDate = isBengali
    ? toBengaliNumber(new Date().toLocaleDateString('bn-BD', { month: 'long', day: 'numeric', year: 'numeric' }))
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Pure Bengali conversions
  const studentNameBn = s.nameBn || s.name;
  const fatherNameBn = s.fatherNameBn || s.fatherName;
  const motherNameBn = s.motherNameBn || s.motherName;
  const groupBn = getBengaliGroup(s.group);
  const boardBn = getBengaliBoard(s.board);
  const rollBn = toBengaliNumber(boardRoll);
  const regBn = toBengaliNumber(s.registrationNo);
  const sessionBn = toBengaliNumber(s.session);
  const yearBn = toBengaliNumber(examYear);
  const gpaBn = toBengaliNumber(s.gpa);
  
  const villageName = getLocationName(s.village, isBengali);
  const postOfficeName = getLocationName(s.postOffice, isBengali);
  const upazilaName = getLocationName(s.upazila, isBengali);
  const districtName = getLocationName(s.district, isBengali);

  const memoBn = `স্মারক নং: বব/${yearBn}/${rollBn || '০১'}`;
  const memoEn = `Memo No: ${institution.name?.substring(0, 4).toUpperCase() || 'INST'}/TEST/${examYear}/${boardRoll || '01'}`;

  // QR Code payload
  const qrDataText = isBengali
    ? `নাম: ${studentNameBn}\nরোল: ${rollBn}\nরেজি: ${regBn}\nসেশন: ${sessionBn}\nজিপিএ: ${gpaBn} (${letterGrade})`
    : `Name: ${s.name}\nRoll: ${boardRoll}\nReg: ${s.registrationNo}\nSession: ${s.session}\nGPA: ${s.gpa} (${letterGrade})`;

  return (
    <div
      id={id}
      className="certificate-page"
      style={{
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        margin: '0 auto',
        boxSizing: 'border-box',
        paddingTop: `${marginTop}in`,
        paddingBottom: `${marginBottom}in`,
        paddingLeft: `${marginLeft}in`,
        paddingRight: `${marginRight}in`,
        color: '#0f172a',
        fontFamily: isBengali ? "'Tiro Bangla', serif" : "'Arial', sans-serif",
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundImage: bgImage,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14mm 16mm',
        boxSizing: 'border-box',
      }}>
      {/* Watermark Logo */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.05,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: '60%'
      }}>
        {institution.logoUrl ? (
          <img src={institution.logoUrl} alt="Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <Shield style={{ width: '100%', height: '100%' }} />
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        {isBengali ? (
          /* 100% Pure Bengali Header */
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {institution.logoUrl ? (
                <img src={institution.logoUrl} alt="লোগো" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <Shield className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div style={{ flex: 1, textAlign: 'right', paddingLeft: '16px' }}>
              <h1 style={{ fontSize: `${instNameFontSize}px`, fontWeight: 800, color: '#1e3a8a', margin: 0, fontFamily: "'Tiro Bangla', serif" }}>
                {institution.nameBn || institution.name}
              </h1>
              <div style={{ fontSize: '17px', color: '#1e293b', marginTop: '3px', fontWeight: 600 }}>
                {institution.addressBn || institution.address}
              </div>
              <div style={{ fontSize: '13.5px', color: '#475569', marginTop: '2px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                {institution.established && <span>স্থাপিত: {toBengaliNumber(institution.established)} খ্রি.</span>}
                {institution.eiin && <span>ইআইআইএন: {toBengaliNumber(institution.eiin)}</span>}
              </div>
            </div>
          </div>
        ) : (
          /* 100% Pure English Header */
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {institution.logoUrl ? (
                <img src={institution.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <Shield className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div style={{ flex: 1, textAlign: 'center', paddingLeft: '10px' }}>
              <h1 style={{ fontSize: `${instNameFontSize}px`, fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>
                {institution.name || 'INSTITUTION NAME'}
              </h1>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {institution.address}
              </div>
              <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '2px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {institution.established && <span>Est. {institution.established}</span>}
                {institution.eiin && <span>EIIN: {institution.eiin}</span>}
                {institution.examCenter && <span>Exam Center: {institution.examCenter}</span>}
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {institution.mobile && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} /> {institution.mobile}</span>}
                {institution.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> {institution.email}</span>}
                {institution.website && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={11} /> {institution.website}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderBottom: '2px solid #1e3a8a', marginBottom: '3px' }}></div>
        <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: '6px' }}></div>

        {/* Sub-header info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155', marginBottom: '4px', fontWeight: 600 }}>
          <div>{isBengali ? memoBn : memoEn}</div>
          <div>{isBengali ? `তারিখ: ${issueDate}` : `Date: ${issueDate}`}</div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginTop: `${titleTopSpace}px`, marginBottom: `${titleBottomSpace}px` }}>
          <h2 style={{ 
            fontSize: `${titleFontSize}px`, 
            fontWeight: 800, 
            color: '#0f172a', 
            margin: 0, 
            textDecoration: 'underline', 
            textUnderlineOffset: '6px', 
            fontFamily: isBengali ? "'Tiro Bangla', serif" : "'Playfair Display', serif" 
          }}>
            {isBengali ? 'প্রশংসাপত্র' : 'TESTIMONIAL'}
          </h2>
          {!isBengali && (
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', letterSpacing: '1.2px', marginTop: '4px' }}>
              TO WHOM IT MAY CONCERN
            </div>
          )}
        </div>

        {/* Body Content */}
        {isBengali ? (
          /* 100% Pure Bengali Body */
          <div style={{ fontSize: `${bodyFontSize}px`, lineHeight: bodyLineHeight, color: '#0f172a', textAlign: 'justify', flex: 1, fontFamily: "'Tiro Bangla', serif" }}>
            <p style={{ margin: `0 0 ${paragraphSpacing}px 0`, textIndent: '28px' }}>
              এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{studentNameBn}</span>, 
              পিতা: <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{fatherNameBn}</span>, 
              মাতা: <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{motherNameBn}</span>, 
              গ্রাম: <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{villageName}</span>, 
              ডাকঘর: <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{postOfficeName}</span>, 
              উপজেলা: <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{upazilaName}</span>, 
              জেলা: <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{districtName}</span>, 
              {institution.nameBn || institution.name}-এর <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{groupBn}</span> বিভাগের একজন নিয়মিত শিক্ষার্থী ছিল।
            </p>
            <p style={{ margin: `0 0 ${paragraphSpacing}px 0`, textIndent: '28px' }}>
              সে <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{boardBn}</span> শিক্ষা বোর্ডের অধীনে <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{yearBn}</span> সালের 
              মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) পরীক্ষায় অংশগ্রহণ করে। তার বোর্ড রোল নং <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{rollBn}</span>, 
              রেজিস্ট্রেশন নং <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{regBn}</span>, সেশন <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{sessionBn}</span> এবং 
              সে ৫.০০ স্কেলে জিপিএ <span style={{ fontFamily: dataFont, fontWeight: 700, fontSize: '1.15em', color: '#0f172a' }}>{gpaBn}</span> পেয়ে উত্তীর্ণ হয়েছে।
            </p>
            <p style={{ margin: `0 0 ${paragraphSpacing}px 0`, textAlign: 'justify' }}>
              আমার জানামতে তার নৈতিক চরিত্র ভালো এবং এই প্রতিষ্ঠানে অধ্যয়নকালে সে কোনো প্রকার শৃঙ্খলাবিরোধী কার্যকলাপে জড়িত ছিল না।
            </p>
            <p style={{ margin: `${closingTopSpace}px 0 0 0`, textAlign: 'center', fontWeight: 700, fontSize: `${closingFontSize}px`, color: '#1e3a8a' }}>
              আমি তার ভবিষ্যৎ জীবনের সর্বাঙ্গীন উন্নতি ও সাফল্য কামনা করি।
            </p>
            
            {/* QR Code */}
            {settings.showQrCode !== false && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                <div style={{ width: '60px', height: '60px', padding: '3px', backgroundColor: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QRCode value={qrDataText} size={54} level="L" style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 100% Pure English Body */
          <div style={{ fontSize: `${bodyFontSize}px`, lineHeight: bodyLineHeight, color: '#0f172a', textAlign: 'justify', flex: 1, fontFamily: "'Arial', sans-serif" }}>
            <p style={{ margin: `0 0 ${paragraphSpacing}px 0` }}>
              This is to certify that <strong><span style={{ fontFamily: dataFont, fontSize: '1.15em', color: '#0f172a' }}>{s.name}</span></strong>, {sonDaughter} of <strong><span style={{ fontFamily: dataFont, fontSize: '1.1em', color: '#0f172a' }}>{s.fatherName}</span></strong> and <strong><span style={{ fontFamily: dataFont, fontSize: '1.1em', color: '#0f172a' }}>{s.motherName}</span></strong>, 
              from Village: <strong><span style={{ fontFamily: dataFont, fontSize: '1.05em' }}>{villageName}</span></strong>, Post Office: <strong><span style={{ fontFamily: dataFont, fontSize: '1.05em' }}>{postOfficeName}</span></strong>, Thana: <strong><span style={{ fontFamily: dataFont, fontSize: '1.05em' }}>{upazilaName}</span></strong>, District: <strong><span style={{ fontFamily: dataFont, fontSize: '1.05em' }}>{districtName}</span></strong>, Bangladesh, has been a bona fide student of {institution.name}.
            </p>
            <p style={{ margin: `0 0 ${paragraphSpacing}px 0` }}>
              <strong>{heShe}</strong> successfully passed the Secondary School Certificate (SSC) Examination in {examYear} from the <strong><span style={{ fontFamily: dataFont, fontSize: '1.05em' }}>{getEnglishGroup(s.group)}</span></strong> group under the Board of Intermediate and Secondary Education, <strong><span style={{ fontFamily: dataFont, fontSize: '1.05em' }}>{getEnglishBoard(s.board)}</span></strong>.
            </p>
            
            <p style={{ margin: `0 0 ${paragraphSpacing}px 0` }}>
              <span style={{ textDecoration: 'underline' }}><strong>{hisHer} academic credentials are as follows:</strong></span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 15px 1fr', rowGap: '0px', margin: '2px 0 6px 16px', fontSize: '14.5px' }}>
              <div><strong>Board Roll No.</strong></div><div>:</div><div><strong><span style={{ fontFamily: dataFont, fontSize: '1.1em' }}>{boardRoll}</span></strong></div>
              <div><strong>Registration No.</strong></div><div>:</div><div><strong><span style={{ fontFamily: dataFont, fontSize: '1.1em' }}>{s.registrationNo}</span></strong></div>
              <div><strong>Session</strong></div><div>:</div><div><strong><span style={{ fontFamily: dataFont, fontSize: '1.1em' }}>{s.session}</span></strong></div>
              <div><strong>Group</strong></div><div>:</div><div><strong><span style={{ fontFamily: dataFont, fontSize: '1.1em' }}>{getEnglishGroup(s.group)}</span></strong></div>
              <div><strong>Result</strong></div><div>:</div><div><strong>GPA <span style={{ fontFamily: dataFont, fontSize: '1.1em' }}>{s.gpa}</span> ({letterGrade})</strong></div>
            </div>

            <p style={{ margin: `0 0 ${paragraphSpacing}px 0` }}>
              According to the school records, {hisHerLower} date of birth is <strong><span style={{ fontFamily: dataFont, fontSize: '1.05em' }}>{s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span></strong>.
            </p>
            
            {/* Paragraph 1: Justified moral character */}
            <p style={{ margin: `0 0 ${paragraphSpacing}px 0`, textAlign: 'justify' }}>
              During {hisHerLower} time at our institute, <strong>{heSheLower}</strong> demonstrated excellent moral character and was never involved in any indisciplinary activities.
            </p>

            {/* Paragraph 2: Center aligned & slightly larger */}
            <p style={{ margin: `${closingTopSpace}px 0 0 0`, textAlign: 'center', fontWeight: 700, fontSize: `${closingFontSize}px`, color: '#1e3a8a' }}>
              I wish {himHer} all the best in {hisHerLower} future endeavors.
            </p>

            {/* QR Code placed directly below the text */}
            {settings.showQrCode !== false && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                <div style={{ width: '60px', height: '60px', padding: '3px', backgroundColor: 'white', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QRCode value={qrDataText} size={54} level="L" style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Signatures */}
      <div style={{ marginTop: '0px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13px' }}>
          
          {/* Preparer Signature */}
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
              {settings.preparerSignature && (
                <img src={settings.preparerSignature} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ borderTop: '1.5px solid #334155', paddingTop: '4px' }}>
              <div style={{ fontWeight: 700 }}>
                {settings.preparerName || ''}
              </div>
              <div style={{ fontSize: '12px', color: '#334155' }}>
                {isBengali ? (settings.preparerTitle || 'প্রস্তুতকারক') : (settings.preparerTitle || 'Prepared by')}
              </div>
            </div>
          </div>

          {/* Verifier Signature */}
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
              {settings.verifierSignature && (
                <img src={settings.verifierSignature} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ borderTop: '1.5px solid #334155', paddingTop: '4px' }}>
              <div style={{ fontWeight: 700 }}>
                {settings.verifierName || ''}
              </div>
              <div style={{ fontSize: '12px', color: '#334155' }}>
                {isBengali ? (settings.verifierTitle || 'যাচাইকারী') : (settings.verifierTitle || 'Verified by')}
              </div>
            </div>
          </div>

          {/* Headmaster Signature */}
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4px' }}>
              {settings.signatorySignature && (
                <img src={settings.signatorySignature} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ borderTop: '1.5px solid #334155', paddingTop: '4px' }}>
              <div style={{ fontWeight: 700 }}>
                {isBengali
                  ? (settings.signatoryName || institution.headmasterNameBn || institution.headmasterName || 'প্রধান শিক্ষক')
                  : (settings.signatoryName || institution.headmasterName || 'Headmaster')}
              </div>
              <div style={{ fontSize: '12px', color: '#334155' }}>
                {isBengali 
                  ? (settings.signatoryTitle || 'প্রধান শিক্ষক / অধ্যক্ষ') 
                  : (settings.signatoryTitle || 'Headmaster / Principal')}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Credit */}
        <div style={{ textAlign: 'center', fontSize: '9.5px', color: '#64748b', marginTop: '10px' }}>
          {isBengali ? 'বিদ্যালোক বাই সফটডাউস কর্তৃক প্রস্তুতকৃত।' : 'Generated by Biddalok by SoftDows.'}
        </div>
      </div>
      </div>
    </div>
  );
};
