import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { Student, Institution, StudentIdCardSettings } from '../types';
import { Format1StudentCard } from '../components/idcard/Format1StudentCard';
import { savePdfWithFilePicker } from './pdfGenerator';

/**
 * High-definition export of a single Student ID Card as a CR80 printable PDF.
 * Physical Dimensions: 54mm x 85.6mm (Standard PVC / CR80 ID Card).
 * If cardSide is 'both': Page 1 = Front side, Page 2 = Back side.
 */
export async function downloadSingleIdCardPdf(
  student: Student,
  institution: Institution,
  settings: StudentIdCardSettings
): Promise<boolean> {
  const isBn = settings.language === 'bn';
  const cardSide = settings.cardSide || 'both';

  // Wait for web fonts (Hind Siliguri, etc.) to be ready
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // Staging offscreen container
  const staging = document.createElement('div');
  staging.id = 'id-card-single-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.left = '0';
  staging.style.top = '0';
  staging.style.width = '204px'; // ~54mm at 96dpi base
  staging.style.height = '324px'; // ~85.6mm at 96dpi base
  staging.style.zIndex = '-99999';
  staging.style.opacity = '1';
  staging.style.pointerEvents = 'none';
  staging.style.backgroundColor = '#ffffff';
  staging.style.overflow = 'hidden';
  document.body.appendChild(staging);

  const root = createRoot(staging);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 85.6],
      compress: true,
    });

    // Render & capture FRONT side
    if (cardSide === 'both' || cardSide === 'front') {
      await new Promise<void>((resolve) => {
        root.render(
          <Format1StudentCard
            student={student}
            institution={institution}
            settings={settings}
            side="front"
          />
        );
        setTimeout(resolve, 80);
      });

      const frontImg = await toPng(staging, {
        pixelRatio: 3.0,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      pdf.addImage(frontImg, 'PNG', 0, 0, 54, 85.6, undefined, 'FAST');
    }

    // Render & capture BACK side
    if (cardSide === 'both' || cardSide === 'back') {
      if (cardSide === 'both') {
        pdf.addPage([54, 85.6], 'portrait');
      }

      await new Promise<void>((resolve) => {
        root.render(
          <Format1StudentCard
            student={student}
            institution={institution}
            settings={settings}
            side="back"
          />
        );
        setTimeout(resolve, 80);
      });

      const backImg = await toPng(staging, {
        pixelRatio: 3.0,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      pdf.addImage(backImg, 'PNG', 0, 0, 54, 85.6, undefined, 'FAST');
    }

    const filename = `Student_ID_${student.studentId || student.roll || 'card'}_${(student.name || 'student').replace(/\s+/g, '_')}.pdf`;
    return await savePdfWithFilePicker(pdf, filename);
  } catch (err) {
    console.error('Failed to export single ID card PDF:', err);
    throw err;
  } finally {
    try {
      root.unmount();
    } catch {
      // ignore
    }
    if (staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}

/**
 * Export Single ID Card as High-Resolution PNG image(s).
 */
export async function downloadSingleIdCardPng(
  student: Student,
  institution: Institution,
  settings: StudentIdCardSettings,
  side: 'front' | 'back' = 'front'
): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  const staging = document.createElement('div');
  staging.id = 'id-card-png-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.left = '0';
  staging.style.top = '0';
  staging.style.width = '204px';
  staging.style.height = '324px';
  staging.style.zIndex = '-99999';
  staging.style.opacity = '1';
  staging.style.pointerEvents = 'none';
  staging.style.backgroundColor = '#ffffff';
  staging.style.overflow = 'hidden';
  document.body.appendChild(staging);

  const root = createRoot(staging);

  try {
    await new Promise<void>((resolve) => {
      root.render(
        <Format1StudentCard
          student={student}
          institution={institution}
          settings={settings}
          side={side}
        />
      );
      setTimeout(resolve, 80);
    });

    const dataUrl = await toPng(staging, {
      pixelRatio: 3.0,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Student_ID_${student.studentId || student.roll || 'card'}_${side}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 1000);
  } finally {
    try {
      root.unmount();
    } catch {
      // ignore
    }
    if (staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}

/**
 * Bulk Multi-Page PDF Exporter for Full Sheet Print (A4 / Legal).
 * Layouts cards neatly onto A4 or Legal paper with cutting marks.
 */
export async function downloadBulkIdCardsPdf(
  students: Student[],
  institution: Institution,
  settings: StudentIdCardSettings,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  if (!students || students.length === 0) {
    throw new Error('No students provided for ID card generation.');
  }

    const isLegal = settings.paperSize === 'legal';
  const pageFormat = isLegal ? 'legal' : 'a4';
  const paperW_mm = isLegal ? 215.9 : 210;
  const paperH_mm = isLegal ? 355.6 : 297;

  // PHASE 15: Compute ID-card page capacity from dimensions/margins
  const marginMm = 15; // standard printable margin
  const cardW_mm = 54;
  const cardH_mm = 85.6;

  // How many columns and rows can fit?
  const isLandscapePrint = settings.orientation === 'landscape';
  const availW = (isLandscapePrint ? paperH_mm : paperW_mm) - (marginMm * 2);
  const availH = (isLandscapePrint ? paperW_mm : paperH_mm) - (marginMm * 2);

  // If cardSide === 'both', we print front and back side-by-side per student
  const requiredCardCols = settings.cardSide === 'both' ? 2 : 1;
  const unitW = cardW_mm * requiredCardCols; 
  
  const cols = Math.max(1, Math.floor(availW / unitW));
  const rows = Math.max(1, Math.floor(availH / cardH_mm));

  const cardsPerPage = cols * rows;

  const pages: Student[][] = [];
  for (let i = 0; i < students.length; i += cardsPerPage) {
    pages.push(students.slice(i, i + cardsPerPage));
  }

  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  const staging = document.createElement('div');
  staging.id = 'bulk-id-card-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.left = '0';
  staging.style.top = '0';
  staging.style.width = `${paperW_mm}mm`;
  staging.style.minHeight = `${paperH_mm}mm`;
  staging.style.height = `${paperH_mm}mm`;
  staging.style.zIndex = '-99999';
  staging.style.opacity = '1';
  staging.style.pointerEvents = 'none';
  staging.style.backgroundColor = '#ffffff';
  staging.style.overflow = 'hidden';
  staging.style.boxSizing = 'border-box';
  staging.style.padding = '7mm 6mm';
  document.body.appendChild(staging);

  const root = createRoot(staging);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageFormat,
      compress: true,
    });

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      if (onProgress) {
        onProgress(pageIdx + 1, pages.length);
      }

      if (pageIdx > 0) {
        pdf.addPage(pageFormat, 'portrait');
      }

      const pageStudents = pages[pageIdx];

      await new Promise<void>((resolve) => {
        root.render(
          <div
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              backgroundColor: '#ffffff',
            }}
          >
            {settings.cardSide === 'both' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5mm',
                  width: '100%',
                }}
              >
                {pageStudents.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5mm',
                      padding: '1mm',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <Format1StudentCard
                      student={s}
                      institution={institution}
                      settings={settings}
                      side="front"
                    />
                    <Format1StudentCard
                      student={s}
                      institution={institution}
                      settings={settings}
                      side="back"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4mm',
                  width: '100%',
                  justifyItems: 'center',
                }}
              >
                {pageStudents.map((s) => (
                  <Format1StudentCard
                    key={s.id}
                    student={s}
                    institution={institution}
                    settings={settings}
                    side={settings.cardSide === 'back' ? 'back' : 'front'}
                  />
                ))}
              </div>
            )}
          </div>
        );
        setTimeout(resolve, 100);
      });

      const pageImg = await toPng(staging, {
        pixelRatio: 2.2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      pdf.addImage(pageImg, 'PNG', 0, 0, paperW_mm, paperH_mm, undefined, 'FAST');
    }

    const filename = `Student_ID_Cards_${(institution.name || 'Institution').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    return await savePdfWithFilePicker(pdf, filename);
  } catch (err) {
    console.error('Failed to export bulk ID cards PDF:', err);
    throw err;
  } finally {
    try {
      root.unmount();
    } catch {
      // ignore
    }
    if (staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}
