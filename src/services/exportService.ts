import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, PageOrientation } from 'docx';
import { NotoSansBengaliBase64 } from '../utils/pdfFonts';

export type ExportFormat = 'pdf' | 'xlsx' | 'docx';

export interface ReportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ReportConfig {
  title: string;
  columns: ReportColumn[];
  data: any[];
  filename: string;
  orientation?: 'portrait' | 'landscape';
}

function neutralizeFormula(val: any): any {
  if (typeof val === 'string') {
    const trimmed = val.trimStart();
    if (['=', '+', '-', '@'].includes(trimmed[0])) {
      return `'${val}`;
    }
  }
  return val;
}

export async function generateReport(config: ReportConfig, format: ExportFormat): Promise<void> {
  if (format === 'pdf') {
    await generatePDF(config);
  } else if (format === 'xlsx') {
    await generateXLSX(config);
  } else if (format === 'docx') {
    await generateDOCX(config);
  } else {
    throw new Error('Unsupported format');
  }
}

async function generatePDF(config: ReportConfig): Promise<void> {
  const doc = new jsPDF({
    orientation: config.orientation || 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.addFileToVFS('NotoSansBengali.ttf', NotoSansBengaliBase64);
  doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');
  doc.setFont('NotoSansBengali');

  doc.setFontSize(16);
  doc.text(config.title, 14, 15);

  const head = [config.columns.map(c => c.header)];
  const body = config.data.map(row => config.columns.map(c => String(row[c.key] || '')));

  (doc as any).autoTable({
    head: head,
    body: body,
    startY: 20,
    styles: { font: 'NotoSansBengali', fontStyle: 'normal' },
    headStyles: { fillColor: [79, 70, 229] },
    theme: 'grid'
  });

  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${config.filename}.pdf`,
        types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(doc.output('blob'));
      await writable.close();
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        doc.save(`${config.filename}.pdf`);
      }
    }
  } else {
    doc.save(`${config.filename}.pdf`);
  }
}

async function generateXLSX(config: ReportConfig): Promise<void> {
  const safeData = config.data.map(row => {
    const safeRow: any = {};
    config.columns.forEach(col => {
      safeRow[col.header] = neutralizeFormula(row[col.key]);
    });
    return safeRow;
  });

  const ws = XLSX.utils.json_to_sheet(safeData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${config.filename}.xlsx`,
        types: [{ description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (e: any) {
      if (e.name !== 'AbortError') saveAsFallback(blob, `${config.filename}.xlsx`);
    }
  } else {
    saveAsFallback(blob, `${config.filename}.xlsx`);
  }
}

async function generateDOCX(config: ReportConfig): Promise<void> {
  const tableRows = [];
  
  tableRows.push(
    new TableRow({
      children: config.columns.map(c => 
        new TableCell({
          children: [new Paragraph({ text: c.header, alignment: AlignmentType.CENTER })],
          shading: { fill: "4f46e5" }
        })
      )
    })
  );

  config.data.forEach(row => {
    tableRows.push(
      new TableRow({
        children: config.columns.map(c => 
          new TableCell({
            children: [new Paragraph({ text: String(row[c.key] || '') })]
          })
        )
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { size: { orientation: config.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT } }
      },
      children: [
        new Paragraph({
          text: config.title,
          heading: "Heading1",
          alignment: AlignmentType.CENTER
        }),
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE }
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${config.filename}.docx`,
        types: [{ description: 'Word Document', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (e: any) {
      if (e.name !== 'AbortError') saveAsFallback(blob, `${config.filename}.docx`);
    }
  } else {
    saveAsFallback(blob, `${config.filename}.docx`);
  }
}

function saveAsFallback(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
