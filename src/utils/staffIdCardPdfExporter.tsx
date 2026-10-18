import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { StaffMember, Institution, StaffIdCardSettings } from '../types';
import { StaffIdCardItem } from '../components/hr/StaffIdCardItem';
import { savePdfWithFilePicker } from './pdfGenerator';

/**
 * Bulk Multi-Page PDF Exporter for Full Sheet Print (A4).
 * Layouts cards neatly onto A4 paper.
 */
export async function downloadBulkStaffIdCardsPdf(
  staffMembers: StaffMember[],
  institution: Institution,
  settings: StaffIdCardSettings,
  cardSide: 'front' | 'back' | 'both' = 'both',
  principalSignatureUrl: string = '',
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  if (!staffMembers || staffMembers.length === 0) {
    throw new Error('No staff provided for ID card generation.');
  }

  const pageFormat = 'a4';
  const paperW_mm = 210;
  const paperH_mm = 297;

  // Capacity per page
  // Both sides: 3 staff (6 cards) on A4 (vertical stack of pairs)
  // Single side: 9 cards (3x3) on A4
  const cardsPerPage = cardSide === 'both' ? 3 : 9;

  const pages: StaffMember[][] = [];
  for (let i = 0; i < staffMembers.length; i += cardsPerPage) {
    pages.push(staffMembers.slice(i, i + cardsPerPage));
  }

  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  const staging = document.createElement('div');
  staging.id = 'bulk-staff-id-card-staging-' + Date.now();
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

      const pageStaff = pages[pageIdx];

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
            {cardSide === 'both' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5mm',
                  width: '100%',
                }}
              >
                {pageStaff.map(s => (
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
                    <StaffIdCardItem
                      staff={s}
                      institution={institution}
                      settings={settings}
                      side="both"
                      principalSignatureUrl={principalSignatureUrl}
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
                {pageStaff.map(s => (
                  <StaffIdCardItem
                    key={s.id}
                    staff={s}
                    institution={institution}
                    settings={settings}
                    side={cardSide}
                    principalSignatureUrl={principalSignatureUrl}
                  />
                ))}
              </div>
            )}
          </div>
        );
        // Wait for images to load, fonts to render
        setTimeout(resolve, 300);
      });

      const pageImg = await toPng(staging, {
        pixelRatio: 2.2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      pdf.addImage(pageImg, 'PNG', 0, 0, paperW_mm, paperH_mm, undefined, 'FAST');
    }

    const filename = staffMembers.length === 1
      ? `Staff_ID_${(staffMembers[0].nameBn || staffMembers[0].name || 'Teacher').replace(/\s+/g, '_')}_${staffMembers[0].customStaffId || staffMembers[0].pdsId || 'Card'}.pdf`
      : `Staff_ID_Cards_${(institution.name || 'Institution').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    return await savePdfWithFilePicker(pdf, filename);
  } catch (err) {
    console.error('Failed to export staff ID cards PDF:', err);
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
 * Download a single teacher/staff member ID card directly as PDF
 */
export async function downloadSingleStaffIdCardPdf(
  staff: StaffMember,
  institution: Institution,
  settings: StaffIdCardSettings,
  cardSide: 'front' | 'back' | 'both' = 'both',
  principalSignatureUrl: string = ''
): Promise<boolean> {
  return downloadBulkStaffIdCardsPdf([staff], institution, settings, cardSide, principalSignatureUrl);
}
