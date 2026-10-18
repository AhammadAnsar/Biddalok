import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

/**
 * Triggers safe browser download of a generated jsPDF object
 * with prompt for save location if File System Access API is available.
 */
export async function savePdfWithFilePicker(pdf: jsPDF, filename: string): Promise<boolean> {
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = pdf.output('blob');

  // 1. Try File System Access API (Prompts user for save location & folder)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: cleanFilename,
        types: [{
          description: 'PDF Document (*.pdf)',
          accept: { 'application/pdf': ['.pdf'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User voluntarily cancelled the picker
        return false;
      }
      console.warn('showSaveFilePicker failed or restricted in environment, falling back to download:', err);
    }
  }

  // 2. Fallback to standard anchor download
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
    return true;
  } catch (downloadError) {
    console.warn('Anchor download failed, trying pdf.save:', downloadError);
    pdf.save(cleanFilename);
    return true;
  }
}

function triggerPdfDownload(pdf: jsPDF, filename: string): void {
  savePdfWithFilePicker(pdf, filename).catch(() => {
    pdf.save(filename);
  });
}

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generates and triggers download of a single student certificate PDF.
 * Uses html-to-image which natively supports all modern CSS color models
 * including OKLCH, Display-P3, and custom properties.
 */
export async function downloadCertificatePDF(
  element: HTMLElement, 
  filename: string = 'Certificate.pdf',
  options?: PdfExportOptions
): Promise<void> {
  if (!element) {
    throw new Error('Element to capture was not provided.');
  }

  const isLandscape = options?.orientation === 'landscape';
  const targetW = isLandscape ? 1123 : 794;
  const targetH = isLandscape ? 794 : 1123;
  const pageW_mm = isLandscape ? 297 : 210;
  const pageH_mm = isLandscape ? 210 : 297;

  // 1. Wait for web fonts to load
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check timed out:', e);
    }
  }

  // 2. Create an isolated staging container for clean capture
  const staging = document.createElement('div');
  staging.id = 'pdf-staging-sandbox-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.top = '0px';
  staging.style.left = '0px';
  staging.style.width = `${targetW}px`;
  staging.style.minHeight = `${targetH}px`;
  staging.style.zIndex = '-99999';
  staging.style.opacity = '0.01';
  staging.style.pointerEvents = 'none';
  staging.style.overflow = 'hidden';
  staging.style.background = '#ffffff';
  document.body.appendChild(staging);

  try {
    // Clone and reset transforms
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'top left';
    clone.style.margin = '0';
    clone.style.position = 'relative';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = `${targetW}px`;
    clone.style.minHeight = `${targetH}px`;
    clone.style.boxSizing = 'border-box';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';

    staging.appendChild(clone);
    await new Promise((r) => setTimeout(r, 60));

    // Render using html-to-image (supports OKLCH, web fonts, and modern CSS)
    const imgData = await toJpeg(clone, {
      quality: 0.98,
      pixelRatio: 2.0, // High-definition 300 DPI equivalent
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
      fontEmbedCSS: '',
      width: targetW,
      height: targetH,
    });

    // Generate A4 PDF
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, pageW_mm, pageH_mm, undefined, 'FAST');
    triggerPdfDownload(pdf, filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (staging && staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}

/**
 * Generates a combined multi-page PDF for multiple student certificates.
 */
export async function downloadBulkCertificatesPDF(
  elements: HTMLElement[],
  combinedFilename: string = 'Bulk_Certificates.pdf',
  onProgress?: (current: number, total: number) => void,
  options?: PdfExportOptions
): Promise<void> {
  if (!elements || elements.length === 0) {
    throw new Error('No certificate elements provided for bulk export.');
  }

  const isLandscape = options?.orientation === 'landscape';
  const targetW = isLandscape ? 1123 : 794;
  const targetH = isLandscape ? 794 : 1123;
  const pageW_mm = isLandscape ? 297 : 210;
  const pageH_mm = isLandscape ? 210 : 297;

  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check timed out:', e);
    }
  }

  const staging = document.createElement('div');
  staging.id = 'bulk-pdf-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.top = '0px';
  staging.style.left = '0px';
  staging.style.width = `${targetW}px`;
  staging.style.minHeight = `${targetH}px`;
  staging.style.zIndex = '-99999';
  staging.style.opacity = '0.01';
  staging.style.pointerEvents = 'none';
  staging.style.overflow = 'hidden';
  staging.style.background = '#ffffff';
  document.body.appendChild(staging);

  try {
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < elements.length; i++) {
      if (i > 0) {
        pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      }
      if (onProgress) {
        onProgress(i + 1, elements.length);
      }

      staging.innerHTML = '';
      const originalEl = elements[i];
      const clone = originalEl.cloneNode(true) as HTMLElement;
      
      clone.style.transform = 'none';
      clone.style.transformOrigin = 'top left';
      clone.style.margin = '0';
      clone.style.position = 'relative';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = `${targetW}px`;
      clone.style.minHeight = `${targetH}px`;
      clone.style.boxSizing = 'border-box';
      clone.style.visibility = 'visible';
      clone.style.opacity = '1';

      staging.appendChild(clone);
      await new Promise((r) => setTimeout(r, 40));

      const imgData = await toJpeg(clone, {
        quality: 0.95,
        pixelRatio: 1.8,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
        width: targetW,
        height: targetH,
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pageW_mm, pageH_mm, undefined, 'FAST');
    }

    triggerPdfDownload(pdf, combinedFilename);
  } catch (error) {
    console.error('Error generating bulk PDF:', error);
    throw error;
  } finally {
    if (staging && staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}

export interface MultiPageExportOptions {
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'legal';
  onProgress?: (current: number, total: number) => void;
}

/**
 * Generates a high-resolution multi-page PDF where each page element is captured cleanly.
 * Supports A4 and Legal in both Portrait and Landscape orientations,
 * guaranteeing repeating headers across all pages and prompting user for save location.
 */
export async function downloadMultiPageDocumentPDF(
  pageElements: HTMLElement[],
  filename: string = 'Document.pdf',
  options?: MultiPageExportOptions
): Promise<boolean> {
  if (!pageElements || pageElements.length === 0) {
    throw new Error('No page elements provided for multi-page export.');
  }

  const isLandscape = options?.orientation !== 'portrait';
  const format = options?.format || 'a4';

  // Exact page dimensions in mm
  const pageW_mm = format === 'legal' ? (isLandscape ? 355.6 : 215.9) : (isLandscape ? 297 : 210);
  const pageH_mm = format === 'legal' ? (isLandscape ? 215.9 : 355.6) : (isLandscape ? 210 : 297);

  // High precision staging dimensions in px (scale based on 96dpi base ~ 3.7795 px/mm)
  const targetW = Math.round(pageW_mm * 3.7795);
  const targetH = Math.round(pageH_mm * 3.7795);

  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check timed out:', e);
    }
  }

  const staging = document.createElement('div');
  staging.id = 'multipage-pdf-staging-' + Date.now();
  staging.style.position = 'fixed';
  staging.style.top = '0px';
  staging.style.left = '0px';
  staging.style.width = `${targetW}px`;
  staging.style.height = `${targetH}px`;
  staging.style.zIndex = '-99999';
  staging.style.opacity = '0.01';
  staging.style.pointerEvents = 'none';
  staging.style.overflow = 'hidden';
  staging.style.background = '#ffffff';
  document.body.appendChild(staging);

  try {
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: format,
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) {
        pdf.addPage(format, isLandscape ? 'landscape' : 'portrait');
      }
      if (options?.onProgress) {
        options.onProgress(i + 1, pageElements.length);
      }

      staging.innerHTML = '';
      const originalEl = pageElements[i];
      const clone = originalEl.cloneNode(true) as HTMLElement;

      clone.style.transform = 'none';
      clone.style.transformOrigin = 'top left';
      clone.style.margin = '0';
      clone.style.position = 'relative';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = `${targetW}px`;
      clone.style.height = `${targetH}px`;
      clone.style.boxSizing = 'border-box';
      clone.style.visibility = 'visible';
      clone.style.opacity = '1';

      staging.appendChild(clone);
      await new Promise((r) => setTimeout(r, 50));

      const imgData = await toJpeg(clone, {
        quality: 0.96,
        pixelRatio: 1.8,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
        width: targetW,
        height: targetH,
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pageW_mm, pageH_mm, undefined, 'FAST');
    }

    return await savePdfWithFilePicker(pdf, filename);
  } catch (error) {
    console.error('Error generating multi-page document PDF:', error);
    throw error;
  } finally {
    if (staging && staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}
