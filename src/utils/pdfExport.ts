import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import {
  BOQSection,
  AncillaryItem,
  ProjectInfo,
  CalculatedCostSummary,
  MarkupSettings,
} from '../types/boq';
import { formatNumber } from './formatters';

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export async function exportBOQToPDF(
  projectInfo: ProjectInfo,
  sections: BOQSection[],
  ancillary: AncillaryItem[],
  summary: CalculatedCostSummary,
  markup: MarkupSettings
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as jsPDFWithAutoTable;

  const cur = projectInfo.currency || 'ETB';
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Strict RGB tuples required by jspdf-autotable Color type
  const NAVY: [number, number, number] = [15, 44, 76];
  const NAVY_LIGHT: [number, number, number] = [23, 58, 94];
  const AMBER: [number, number, number] = [227, 160, 8];
  const SLATE: [number, number, number] = [76, 92, 110];
  const INK: [number, number, number] = [15, 27, 36];
  const WHITE: [number, number, number] = [255, 255, 255];
  const GROUP_BG: [number, number, number] = [231, 236, 239];
  const ZEBRA_BG: [number, number, number] = [248, 250, 252];
  const NOTE_BG: [number, number, number] = [251, 252, 253];
  const BORDER: [number, number, number] = [215, 225, 234];

  let currentY = 14;

  // 1. Top Decorative Brand Banner
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Gold accent bar below header
  doc.setFillColor(...AMBER);
  doc.rect(0, 24, pageWidth, 2.5, 'F');

  // Top Banner Text
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BILL OF QUANTITIES', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 210, 225);
  doc.text(
    'UNIVERSAL BUILDING CONSTRUCTION COST ESTIMATOR & SCHEDULE OF RATES',
    14,
    18
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text(`DATE: ${projectInfo.sheetDate || new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 12, {
    align: 'right',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`CURRENCY: ${cur}`, pageWidth - 14, 18, { align: 'right' });

  currentY = 32;

  // 2. Project Information Block Table
  const projectInfoBody: any[] = [
    [
      { content: 'PROJECT:', styles: { fontStyle: 'bold', textColor: SLATE } },
      { content: projectInfo.projectName || '—', styles: { fontStyle: 'bold', textColor: INK } },
      { content: 'CLIENT:', styles: { fontStyle: 'bold', textColor: SLATE } },
      { content: projectInfo.client || '—' },
    ],
    [
      { content: 'LOCATION:', styles: { fontStyle: 'bold', textColor: SLATE } },
      { content: projectInfo.location || '—' },
      { content: 'CONTRACTOR:', styles: { fontStyle: 'bold', textColor: SLATE } },
      { content: projectInfo.contractor || '—' },
    ],
    [
      { content: 'CONSULTANT:', styles: { fontStyle: 'bold', textColor: SLATE } },
      { content: projectInfo.consultant || '—' },
      { content: 'DOC REF / SHEET:', styles: { fontStyle: 'bold', textColor: SLATE } },
      { content: `BOQ-EST-${Date.now().toString().slice(-6)}` },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: projectInfoBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      lineColor: BORDER,
      lineWidth: 0.2,
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 26, fillColor: ZEBRA_BG },
      1: { cellWidth: 65 },
      2: { cellWidth: 26, fillColor: ZEBRA_BG },
      3: { cellWidth: 65 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc.lastAutoTable?.finalY || currentY) + 5;

  // 3. Executive Cost Summary Card
  const summaryRows = [
    ...(sections.map((s) => [s.title, `${formatNumber(summary.sectionTotals[s.id] || 0)} ${cur}`])),
    ['C — Ancillary Structures & Site Works', `${formatNumber(summary.ancillaryTotal)} ${cur}`],
    ['Sub-Total Direct Works', `${formatNumber(summary.subTotal)} ${cur}`],
    [`Contractor Profit (${markup.profitPct}%)`, `${formatNumber(summary.profitAmount)} ${cur}`],
    [`Contractor Overhead (${markup.overheadPct}%)`, `${formatNumber(summary.overheadAmount)} ${cur}`],
    ['Total Cost Before VAT', `${formatNumber(summary.totalBeforeVat)} ${cur}`],
    [`Value Added Tax (VAT ${markup.vatPct}%)`, `${formatNumber(summary.vatAmount)} ${cur}`],
    [`GRAND TOTAL ESTIMATE (${cur})`, `${formatNumber(summary.grandTotal)} ${cur}`],
  ];

  const summaryBody: any[] = summaryRows.map(([label, val], idx) => {
    const isGrand = idx === summaryRows.length - 1;
    const isSub = label.startsWith('Sub-Total Direct Works') || label.startsWith('Total Cost Before VAT');
    return [
      {
        content: label,
        styles: {
          fontStyle: isGrand || isSub ? 'bold' : 'normal',
          fontSize: isGrand ? 10 : 8.5,
          textColor: isGrand ? WHITE : INK,
          fillColor: isGrand ? NAVY : undefined,
        },
      },
      {
        content: val,
        styles: {
          halign: 'right',
          fontStyle: isGrand || isSub ? 'bold' : 'normal',
          fontSize: isGrand ? 10.5 : 8.5,
          textColor: isGrand ? AMBER : INK,
          fillColor: isGrand ? NAVY : undefined,
        },
      },
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        {
          content: 'EXECUTIVE COST SUMMARY',
          styles: {
            fillColor: NAVY_LIGHT,
            textColor: WHITE,
            fontStyle: 'bold',
            fontSize: 9,
          },
        },
        {
          content: `AMOUNT (${cur})`,
          styles: {
            fillColor: NAVY_LIGHT,
            textColor: WHITE,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'right',
          },
        },
      ],
    ],
    body: summaryBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 1.8,
      lineColor: BORDER,
      lineWidth: 0.2,
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 125 },
      1: { cellWidth: 57 },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc.lastAutoTable?.finalY || currentY) + 7;

  // Check if we need a page break before the main table
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 16;
  }

  // 4. Detailed Schedule of Bill of Quantities Table
  const tableRows: any[] = [];

  sections.forEach((sec) => {
    const sTotal = summary.sectionTotals[sec.id] || 0;
    tableRows.push([
      {
        content: sec.title.toUpperCase(),
        colSpan: 5,
        styles: {
          fillColor: NAVY,
          textColor: WHITE,
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 2.5,
        },
      },
      {
        content: `${formatNumber(sTotal)}`,
        styles: {
          fillColor: NAVY,
          textColor: AMBER,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'right',
          cellPadding: 2.5,
        },
      },
    ]);

    sec.groups.forEach((grp) => {
      const gTotal = grp.items.reduce((acc, it) => acc + (it.amount || 0), 0);
      tableRows.push([
        {
          content: `   ${grp.title}`,
          colSpan: 5,
          styles: {
            fillColor: GROUP_BG,
            textColor: INK,
            fontStyle: 'bold',
            fontSize: 8.5,
            cellPadding: 2,
          },
        },
        {
          content: `${formatNumber(gTotal)}`,
          styles: {
            fillColor: GROUP_BG,
            textColor: NAVY,
            fontStyle: 'bold',
            fontSize: 8.5,
            halign: 'right',
            cellPadding: 2,
          },
        },
      ]);

      let zebra = false;
      grp.items.forEach((item) => {
        if (item.isNote) {
          tableRows.push([
            {
              content: `       ${item.description}`,
              colSpan: 6,
              styles: {
                fillColor: NOTE_BG,
                textColor: SLATE,
                fontStyle: 'italic',
                fontSize: 7.5,
                cellPadding: 1.5,
              },
            },
          ]);
        } else {
          const qty = typeof item.quantity === 'number' ? formatNumber(item.quantity) : '0.00';
          const rate = typeof item.unitRate === 'number' ? formatNumber(item.unitRate) : '0.00';
          const amt = formatNumber(item.amount || 0);

          tableRows.push([
            {
              content: item.itemNo || '+',
              styles: {
                halign: 'center',
                fontStyle: 'bold',
                fillColor: zebra ? ZEBRA_BG : WHITE,
              },
            },
            {
              content: item.description,
              styles: {
                fillColor: zebra ? ZEBRA_BG : WHITE,
                cellPadding: 1.8,
              },
            },
            {
              content: item.unit,
              styles: {
                halign: 'center',
                textColor: SLATE,
                fillColor: zebra ? ZEBRA_BG : WHITE,
              },
            },
            {
              content: qty,
              styles: {
                halign: 'right',
                fillColor: zebra ? ZEBRA_BG : WHITE,
              },
            },
            {
              content: rate,
              styles: {
                halign: 'right',
                fillColor: zebra ? ZEBRA_BG : WHITE,
              },
            },
            {
              content: amt,
              styles: {
                halign: 'right',
                fontStyle: 'bold',
                textColor: NAVY,
                fillColor: zebra ? ZEBRA_BG : WHITE,
              },
            },
          ]);
          zebra = !zebra;
        }
      });
    });
  });

  // Ancillary Section in the table
  tableRows.push([
    {
      content: 'C — ANCILLARY STRUCTURES & SITE WORKS',
      colSpan: 5,
      styles: {
        fillColor: NAVY,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 2.5,
      },
    },
    {
      content: `${formatNumber(summary.ancillaryTotal)}`,
      styles: {
        fillColor: NAVY,
        textColor: AMBER,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'right',
        cellPadding: 2.5,
      },
    },
  ]);

  ancillary.forEach((anc, aIdx) => {
    const amt = typeof anc.amount === 'number' ? formatNumber(anc.amount) : '0.00';
    tableRows.push([
      { content: `C.${aIdx + 1}`, styles: { halign: 'center', fontStyle: 'bold' } },
      { content: anc.description || 'Ancillary element' },
      { content: 'lump', styles: { halign: 'center', textColor: SLATE } },
      { content: '1.00', styles: { halign: 'right' } },
      { content: amt, styles: { halign: 'right' } },
      { content: amt, styles: { halign: 'right', fontStyle: 'bold', textColor: NAVY } },
    ]);
  });

  // Main table options
  const tableOptions: UserOptions = {
    startY: currentY,
    head: [
      [
        { content: 'NO', styles: { halign: 'center', cellWidth: 12 } },
        { content: 'DESCRIPTION OF ITEM', styles: { cellWidth: 84 } },
        { content: 'UNIT', styles: { halign: 'center', cellWidth: 14 } },
        { content: 'QUANTITY', styles: { halign: 'right', cellWidth: 22 } },
        { content: 'RATE', styles: { halign: 'right', cellWidth: 22 } },
        { content: `AMOUNT (${cur})`, styles: { halign: 'right', cellWidth: 28 } },
      ],
    ],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      lineColor: BORDER,
      lineWidth: 0.15,
      font: 'helvetica',
    },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: () => {
      const pageNum = doc.getNumberOfPages();
      if (pageNum > 1) {
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, pageWidth, 10, 'F');
        doc.setFillColor(...AMBER);
        doc.rect(0, 10, pageWidth, 1, 'F');

        doc.setTextColor(...WHITE);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`BILL OF QUANTITIES — ${projectInfo.projectName || 'BUILDING ESTIMATE'}`, 14, 6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`CURRENCY: ${cur}`, pageWidth - 14, 6.5, { align: 'right' });
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE);
      doc.text(
        `Generated by Universal Building Cost Estimator | SMM7 / Standard Specification Format`,
        14,
        pageHeight - 8
      );
    },
  };

  autoTable(doc, tableOptions);

  // Total pages pass to put "Page X of Y"
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.setFillColor(...WHITE);
    doc.rect(pageWidth - 32, pageHeight - 11, 22, 5, 'F');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, {
      align: 'right',
    });
  }

  // Save the PDF file
  const safeTitle = (projectInfo.projectName || 'BOQ_Estimate').replace(/[^a-z0-9]+/gi, '_');
  doc.save(`${safeTitle}_BOQ.pdf`);
}
