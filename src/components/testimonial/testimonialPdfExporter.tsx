import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { Institution, StaffMember, TestimonialSettings } from '../../types';
import { TestimonialRosterItem, TestimonialExam } from '../../types/testimonial';
import { BoardTestimonialRenderer } from './BoardTestimonialRenderer';
import { savePdfWithFilePicker } from '../../utils/pdfGenerator';
import { 
  validateOfficialTestimonialReadiness, 
  generateCanonicalVerificationToken 
} from '../../services/testimonialService';

export interface TestimonialPdfExportOptions {
  onProgress?: (current: number, total: number) => void;
  onStudentIssued?: (item: TestimonialRosterItem, serialNo: string) => Promise<void> | void;
}

/**
 * Creates an unscaled, isolated offscreen DOM container for capturing
 * crisp A4 landscape certificate graphics (1123px x 794px at standard 96 CSS DPI).
 * With pixelRatio 2.0, this achieves ~200 effective DPI raster rendering.
 */
function createOffscreenStaging(): { staging: HTMLDivElement; cleanup: () => void } {
  const staging = document.createElement('div');
  staging.id = 'testimonial-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.left = '0px';
  staging.style.top = '0px';
  staging.style.width = '1123px';
  staging.style.height = '794px';
  staging.style.zIndex = '-99999';
  staging.style.opacity = '1';
  staging.style.pointerEvents = 'none';
  staging.style.backgroundColor = '#ffffff';
  staging.style.overflow = 'hidden';
  staging.style.transform = 'none';
  document.body.appendChild(staging);

  const cleanup = () => {
    if (staging && staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  };

  return { staging, cleanup };
}

/**
 * Ensures web fonts are ready before capturing.
 */
async function waitForFontsReady(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }
}

/**
 * Generates and downloads a single high-definition A4 landscape Testimonial PDF.
 * Strict readiness gate: blocks export if official fields are missing.
 * Strict issuance semantics: commits issue ONLY if file save succeeds.
 */
export async function downloadSingleTestimonialPdf(
  item: TestimonialRosterItem,
  institution: Institution,
  settings: TestimonialSettings,
  staffList: StaffMember[],
  activeExam: TestimonialExam,
  options?: TestimonialPdfExportOptions
): Promise<boolean> {
  // 1. Official Readiness Gate Verification
  const readiness = validateOfficialTestimonialReadiness(item, institution, settings.language || 'bn');
  if (!readiness.isReady) {
    throw new Error(
      `অফিসিয়াল তথ্য অসম্পূর্ণ থাকায় পিডিএফ তৈরি সম্ভব নয়: ${readiness.missingFieldLabelsBn.join(', ')}`
    );
  }

  await waitForFontsReady();
  const { staging, cleanup } = createOffscreenStaging();
  const root = createRoot(staging);

  try {
    const serialNo = item.issuedSerialNo || `${activeExam.year}/${item.boardRollNo || '01'}`;
    const issueDate = item.issuedDate || new Date().toLocaleDateString('en-GB');
    const verificationToken = item.verificationToken || generateCanonicalVerificationToken(item.studentId, activeExam.year);

    await new Promise<void>((resolve) => {
      root.render(
        <div style={{ width: '1123px', height: '794px', transform: 'none' }}>
          <BoardTestimonialRenderer
            item={item}
            institution={institution}
            settings={settings}
            staffList={staffList}
            serialNo={serialNo}
            issueDate={issueDate}
            verificationToken={verificationToken}
            isPrint={true}
          />
        </div>
      );
      // Allow DOM repaint
      setTimeout(resolve, 120);
    });

    const imgData = await toJpeg(staging, {
      quality: 0.98,
      pixelRatio: 2.0, // Crisp 200 DPI effective print fidelity
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: 1123,
      height: 794,
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');

    const cleanName = (item.name || item.nameBn || 'Student').replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
    const filename = `Testimonial_${item.boardRollNo || 'Roll'}_${cleanName}.pdf`;

    // 1. Artifact is generated. Commit the issue FIRST before asking user to save to disk.
    // "A later download failure does not silently erase an already committed issue"
    if (options?.onStudentIssued) {
      await options.onStudentIssued(item, serialNo);
    }

    // 2. Prompt user for download.
    const saved = await savePdfWithFilePicker(pdf, filename);
    return saved;
  } catch (error) {
    console.error('Error generating single testimonial PDF:', error);
    throw error;
  } finally {
    root.unmount();
    cleanup();
  }
}

/**
 * Generates and downloads a combined multi-page high-definition A4 landscape Testimonial PDF
 * for multiple students.
 * Strict readiness gate: blocks export if any student has missing official data.
 * Strict issuance semantics: issues batch ONLY after entire PDF file save is confirmed.
 */
export async function downloadBulkTestimonialsPdf(
  items: TestimonialRosterItem[],
  institution: Institution,
  settings: TestimonialSettings,
  staffList: StaffMember[],
  activeExam: TestimonialExam,
  options?: TestimonialPdfExportOptions
): Promise<boolean> {
  if (items.length === 0) return false;

  // 1. Official Readiness Gate Verification for all items
  const unreadyItems = items.filter(
    item => !validateOfficialTestimonialReadiness(item, institution, settings.language || 'bn').isReady
  );
  if (unreadyItems.length > 0) {
    throw new Error(
      `${unreadyItems.length} জন শিক্ষার্থীর অফিসিয়াল তথ্য অসম্পূর্ণ থাকায় বাল্ক পিডিএফ তৈরি ব্লক করা হয়েছে। অনুগ্রহ করে তথ্য পূরণ করুন।`
    );
  }

  await waitForFontsReady();
  const { staging, cleanup } = createOffscreenStaging();
  const root = createRoot(staging);

  // Queue of items to issue upon successful file save
  const pendingIssueBatch: Array<{ item: TestimonialRosterItem; serialNo: string }> = [];

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (options?.onProgress) {
        options.onProgress(i + 1, items.length);
      }

      const serialNo = item.issuedSerialNo || `${activeExam.year}/${item.boardRollNo || (i + 1).toString().padStart(2, '0')}`;
      const issueDate = item.issuedDate || new Date().toLocaleDateString('en-GB');
      const verificationToken = item.verificationToken || generateCanonicalVerificationToken(item.studentId, activeExam.year);

      pendingIssueBatch.push({ item, serialNo });

      await new Promise<void>((resolve) => {
        root.render(
          <div style={{ width: '1123px', height: '794px', transform: 'none' }}>
            <BoardTestimonialRenderer
              item={item}
              institution={institution}
              settings={settings}
              staffList={staffList}
              serialNo={serialNo}
              issueDate={issueDate}
              verificationToken={verificationToken}
              isPrint={true}
            />
          </div>
        );
        setTimeout(resolve, 90);
      });

      const imgData = await toJpeg(staging, {
        quality: 0.96,
        pixelRatio: 2.0,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: 1123,
        height: 794,
      });

      if (i > 0) {
        pdf.addPage('a4', 'landscape');
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
    }

    const filename = `Testimonials_${activeExam.examType || 'Exam'}_${activeExam.year || '2026'}.pdf`;
    
    // Commit issuance for all items FIRST before asking user to save to disk.
    if (options?.onStudentIssued) {
      for (const batchItem of pendingIssueBatch) {
        await options.onStudentIssued(batchItem.item, batchItem.serialNo);
      }
    }

    // Save file
    const saved = await savePdfWithFilePicker(pdf, filename);
    return saved;
  } catch (error) {
    console.error('Error generating bulk testimonials PDF:', error);
    throw error;
  } finally {
    root.unmount();
    cleanup();
  }
}

/**
 * Triggers standard browser print dialog for one or multiple certificates
 * using a sandboxed printable iframe.
 * NOTE: Opening or canceling the print dialog alone is NOT an official issuance event.
 */
export async function triggerDirectPrint(
  items: TestimonialRosterItem[],
  institution: Institution,
  settings: TestimonialSettings,
  staffList: StaffMember[],
  activeExam: TestimonialExam
): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error('Could not access print frame.');
  }

  // Clone head styles and fonts into iframe
  const headHtml = document.head.innerHTML;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        ${headHtml}
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: 'Kalpurush', 'SolaimanLipi', 'Tiro Bangla', sans-serif;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        </style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
    </html>
  `);
  doc.close();

  const printRoot = doc.getElementById('print-root');
  if (!printRoot) {
    document.body.removeChild(iframe);
    return;
  }

  const root = createRoot(printRoot);

  await new Promise<void>((resolve) => {
    root.render(
      <div>
        {items.map((item, idx) => {
          const serialNo = item.issuedSerialNo || `${activeExam.year}/${item.boardRollNo || (idx + 1).toString().padStart(2, '0')}`;
          const issueDate = item.issuedDate || new Date().toLocaleDateString('en-GB');
          const verificationToken = item.verificationToken || generateCanonicalVerificationToken(item.studentId, activeExam.year);

          return (
            <div key={item.studentId} className={idx < items.length - 1 ? 'page-break' : ''} style={{ width: '1123px', height: '794px' }}>
              <BoardTestimonialRenderer
                item={item}
                institution={institution}
                settings={settings}
                staffList={staffList}
                serialNo={serialNo}
                issueDate={issueDate}
                verificationToken={verificationToken}
                isPrint={true}
              />
            </div>
          );
        })}
      </div>
    );
    setTimeout(resolve, 250);
  });

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  setTimeout(() => {
    root.unmount();
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }, 2000);
}
