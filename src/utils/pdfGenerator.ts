import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

/**
 * Triggers safe browser download of a generated jsPDF object
 * with fallback support for iframe and restricted environments.
 */
function triggerPdfDownload(pdf: jsPDF, filename: string): void {
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  try {
    // Primary jsPDF save
    pdf.save(cleanFilename);
  } catch (saveError) {
    console.warn('pdf.save failed, trying blob download fallback:', saveError);
    const blob = pdf.output('blob');
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
    }, 3000);
  }
}

/**
 * Generates and triggers download of a single student certificate PDF.
 * Uses html-to-image which natively supports all modern CSS color models
 * including OKLCH, Display-P3, and custom properties.
 */
export async function downloadCertificatePDF(
  element: HTMLElement, 
  filename: string = 'Certificate.pdf'
): Promise<void> {
  if (!element) {
    throw new Error('Element to capture was not provided.');
  }

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
  staging.style.width = '794px';
  staging.style.minHeight = '1123px';
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
    clone.style.width = '794px';
    clone.style.minHeight = '1123px';
    clone.style.boxSizing = 'border-box';
    clone.style.display = 'block';
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
      width: 794,
      height: 1123,
    });

    // Generate A4 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
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
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (!elements || elements.length === 0) {
    throw new Error('No certificate elements provided for bulk export.');
  }

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
  staging.style.width = '794px';
  staging.style.minHeight = '1123px';
  staging.style.zIndex = '-99999';
  staging.style.opacity = '0.01';
  staging.style.pointerEvents = 'none';
  staging.style.overflow = 'hidden';
  staging.style.background = '#ffffff';
  document.body.appendChild(staging);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < elements.length; i++) {
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
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
      clone.style.width = '794px';
      clone.style.minHeight = '1123px';
      clone.style.boxSizing = 'border-box';
      clone.style.display = 'block';
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
        width: 794,
        height: 1123,
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
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
