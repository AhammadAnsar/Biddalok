import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { ScholarshipRecord, Student, Institution } from '../../../types';
import { RevenueScholarshipFormDocument } from '../components/RevenueScholarshipFormDocument';
import { RevenueScholarshipRegisterDocument } from '../components/RevenueScholarshipRegisterDocument';
import { ScholarshipFormSettings, getSavedScholarshipSettings } from '../types/scholarshipSettings';

/**
 * Universal safe PDF downloader.
 * Uses standard Blob URL + hidden anchor click, which is 100% reliable
 * in all browsers, desktop, mobile, and sandboxed cross-origin iframes.
 */
export async function savePdfSafely(pdf: jsPDF, filename: string): Promise<boolean> {
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    downloadLink.href = blobUrl;
    downloadLink.download = cleanFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (downloadLink.parentNode) {
        downloadLink.parentNode.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2500);

    return true;
  } catch (blobErr) {
    console.warn('Blob URL anchor download failed, attempting direct pdf.save():', blobErr);
    try {
      pdf.save(cleanFilename);
      return true;
    } catch (saveErr) {
      console.error('pdf.save failed:', saveErr);
      throw new Error('পিডিএফ ফাইল সেভ করতে ব্যর্থ হয়েছে। ব্রাউজারের প্রিন্ট অপশন থেকে Save as PDF ব্যবহার করুন।');
    }
  }
}

/**
 * Ensures all images inside a DOM element are completely loaded
 * before capturing to canvas/image.
 */
async function waitForElementImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't hang on broken image
        // Timeout safeguard
        setTimeout(resolve, 800);
      });
    })
  );
}

/**
 * High-definition, resilient element capture engine.
 * Dual-engine: tries html2canvas first (bypasses cross-origin stylesheet font fetching),
 * with seamless fallback to html-to-image (with fontEmbedCSS disabled).
 */
async function captureElementToImageData(
  element: HTMLElement,
  width: number,
  height: number
): Promise<string> {
  // Wait for fonts if available
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading timeout
    }
  }

  await waitForElementImages(element);

  // Engine 1: html2canvas
  try {
    const canvas = await html2canvas(element, {
      scale: 2.2, // ~300 DPI high resolution
      width: width,
      height: height,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    return canvas.toDataURL('image/jpeg', 0.98);
  } catch (canvasErr) {
    console.warn('html2canvas capture had an issue, attempting html-to-image fallback:', canvasErr);
  }

  // Engine 2: html-to-image fallback with safe options
  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2.0,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
      width: width,
      height: height,
    });
    return dataUrl;
  } catch (toImageErr) {
    console.error('html-to-image fallback also failed:', toImageErr);
    throw new Error('ডকুমেন্ট রেন্ডার করতে সমস্যা হয়েছে। দয়া করে ব্রাউজারের প্রিন্ট অপশন ব্যবহার করুন।');
  }
}

/**
 * Downloads a single filled Revenue Scholarship Entry Form as an A4 Portrait PDF.
 * Strict standard A4 Portrait: 210mm x 297mm.
 * Only the document content is exported; zero software UI.
 */
export async function downloadRevenueScholarshipFormPdf(
  record: ScholarshipRecord,
  student: Student | undefined,
  institution: Institution,
  headmasterSignatureUrl?: string,
  customSettings?: ScholarshipFormSettings
): Promise<boolean> {
  const settings = customSettings || getSavedScholarshipSettings();

  // 1. Check if document pages are already mounted in active DOM
  const page1 = document.getElementById('revenue-scholarship-form-doc-page-1');
  const page2 = document.getElementById('revenue-scholarship-form-doc-page-2');

  const isTwoPageRequested = settings.pageLayoutMode === 'two_page';

  if (isTwoPageRequested && page1 && page2) {
    try {
      const imgData1 = await captureElementToImageData(page1 as HTMLElement, 794, 1123);
      const imgData2 = await captureElementToImageData(page2 as HTMLElement, 794, 1123);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Page 1: মৌলিক ও প্রাতিষ্ঠানিক তথ্য + শিক্ষার্থী ও অভিভাবক স্বাক্ষর
      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Page 2: ব্যাংক, যাচাই, প্রমাণক ও ৩টি প্রশাসনিক স্বাক্ষর
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const cleanName = (student?.nameBn || student?.name || record.studentId).replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
      const filename = `রাজস্ব_বৃত্তি_ফরম_${cleanName}_${record.financialYear || '২০২৪'}.pdf`;

      return await savePdfSafely(pdf, filename);
    } catch (existingCaptureErr) {
      console.warn('Active DOM 2-page capture encountered an issue, proceeding to isolated sandbox:', existingCaptureErr);
    }
  } else if (!isTwoPageRequested && page1) {
    // Single page mode from active DOM
    try {
      const imgData = await captureElementToImageData(page1 as HTMLElement, 794, 1123);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const cleanName = (student?.nameBn || student?.name || record.studentId).replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
      const filename = `রাজস্ব_বৃত্তি_ফরম_${cleanName}_${record.financialYear || '২০২৪'}.pdf`;

      return await savePdfSafely(pdf, filename);
    } catch (existingCaptureErr) {
      console.warn('Active DOM single capture failed, proceeding to sandbox:', existingCaptureErr);
    }
  }

  // 2. Render in isolated staging sandbox (supports both single and two-page render)
  const staging = document.createElement('div');
  staging.id = 'scholarship-form-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.left = '0';
  staging.style.top = '0';
  staging.style.width = '794px';
  staging.style.minHeight = isTwoPageRequested ? '2350px' : '1123px';
  staging.style.height = 'auto';
  staging.style.zIndex = '-99999';
  staging.style.opacity = '1';
  staging.style.pointerEvents = 'none';
  staging.style.backgroundColor = '#ffffff';
  staging.style.overflow = 'hidden';
  staging.style.boxSizing = 'border-box';
  document.body.appendChild(staging);

  const root = createRoot(staging);

  try {
    await new Promise<void>((resolve) => {
      root.render(
        <RevenueScholarshipFormDocument
          record={record}
          student={student}
          institution={institution}
          headmasterSignatureUrl={headmasterSignatureUrl}
          settings={settings}
          layoutMode={settings.pageLayoutMode}
        />
      );
      setTimeout(resolve, 400);
    });

    const stagingPage1 = staging.querySelector('#revenue-scholarship-form-doc-page-1') as HTMLElement;
    const stagingPage2 = staging.querySelector('#revenue-scholarship-form-doc-page-2') as HTMLElement;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    if (isTwoPageRequested && stagingPage1 && stagingPage2) {
      const imgData1 = await captureElementToImageData(stagingPage1, 794, 1123);
      const imgData2 = await captureElementToImageData(stagingPage2, 794, 1123);

      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    } else {
      const targetDoc = stagingPage1 || (staging.querySelector('#revenue-scholarship-form-doc') as HTMLElement) || staging;
      const imgData = await captureElementToImageData(targetDoc, 794, 1123);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    const cleanName = (student?.nameBn || student?.name || record.studentId).replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
    const filename = `রাজস্ব_বৃত্তি_ফরম_${cleanName}_${record.financialYear || '২০২৪'}.pdf`;

    return await savePdfSafely(pdf, filename);
  } catch (err: any) {
    console.error('Error generating filled scholarship form PDF:', err);
    throw new Error(err.message || 'পিডিএফ তৈরি করতে ব্যর্থ হয়েছে');
  } finally {
    try {
      root.unmount();
    } catch {}
    if (staging && staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}

export interface RegisterExportOptions {
  financialYear?: string;
  headmasterSignatureUrl?: string;
  customSettings?: ScholarshipFormSettings;
  onProgress?: (currentPage: number, totalPages: number) => void;
}

/**
 * Downloads the Revenue Scholarship Register as an A4 Landscape PDF.
 * Strict standard A4 Landscape: 297mm x 210mm.
 * Supports multi-page pagination (5 records per page) with repeated institutional headers.
 */
export async function downloadRevenueScholarshipRegisterPdf(
  records: ScholarshipRecord[],
  students: Student[],
  institution: Institution,
  options?: RegisterExportOptions
): Promise<boolean> {
  const settings = options?.customSettings || getSavedScholarshipSettings();
  const recordsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(records.length / recordsPerPage));

  // Check if register pages are already rendered in the DOM
  const existingPage0 = document.getElementById('revenue-scholarship-register-doc-page-0');

  const staging = document.createElement('div');
  staging.id = 'scholarship-register-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.left = '0';
  staging.style.top = '0';
  staging.style.width = '1123px';
  staging.style.minHeight = '794px';
  staging.style.height = '794px';
  staging.style.zIndex = '-99999';
  staging.style.opacity = '1';
  staging.style.pointerEvents = 'none';
  staging.style.backgroundColor = '#ffffff';
  staging.style.overflow = 'hidden';
  staging.style.boxSizing = 'border-box';
  document.body.appendChild(staging);

  const root = createRoot(staging);

  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      if (options?.onProgress) {
        options.onProgress(pageIdx + 1, totalPages);
      }

      if (pageIdx > 0) {
        pdf.addPage('a4', 'landscape');
      }

      // If already on-screen, check if that specific page element exists
      const onScreenPage = document.getElementById(`revenue-scholarship-register-doc-page-${pageIdx}`);
      if (onScreenPage) {
        const imgData = await captureElementToImageData(onScreenPage, 1123, 794);
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
        continue;
      }

      // Otherwise render into isolated staging
      const pageRecords = records.slice(pageIdx * recordsPerPage, (pageIdx + 1) * recordsPerPage);

      await new Promise<void>((resolve) => {
        root.render(
          <RevenueScholarshipRegisterDocument
            records={pageRecords}
            allRecordsCount={records.length}
            startIndex={pageIdx * recordsPerPage}
            students={students}
            institution={institution}
            pageIndex={pageIdx}
            totalPages={totalPages}
            financialYear={options?.financialYear}
            headmasterSignatureUrl={options?.headmasterSignatureUrl}
            settings={settings}
          />
        );
        setTimeout(resolve, 350);
      });

      const targetPageEl = staging.querySelector(`[id^="revenue-scholarship-register-doc-page-"]`) as HTMLElement || staging;
      const imgData = await captureElementToImageData(targetPageEl, 1123, 794);
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
    }

    const year = options?.financialYear || records[0]?.financialYear || '২০২৪';
    const filename = `রাজস্ব_বৃত্তি_রেজিস্টার_${year}.pdf`;

    return await savePdfSafely(pdf, filename);
  } catch (err: any) {
    console.error('Error generating revenue scholarship register PDF:', err);
    throw new Error(err.message || 'রেজিস্টার পিডিএফ তৈরি করতে ব্যর্থ হয়েছে');
  } finally {
    try {
      root.unmount();
    } catch {}
    if (staging && staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}
