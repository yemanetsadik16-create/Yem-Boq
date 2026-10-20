import ExcelJS from 'exceljs';
import { BOQSection, AncillaryItem, ProjectInfo, CalculatedCostSummary, MarkupSettings } from '../types/boq';

export async function exportBOQToExcel(
  projectInfo: ProjectInfo,
  sections: BOQSection[],
  ancillary: AncillaryItem[],
  summary: CalculatedCostSummary,
  markup: MarkupSettings
): Promise<void> {
  const cur = projectInfo.currency || 'ETB';

  const NAVY = 'FF0F2C4C';
  const NAVY2 = 'FF17385A';
  const GROUPFILL = 'FFE7ECEF';
  const NOTEFILL = 'FFFBFCFD';
  const ZEBRA = 'FFF6F8FA';
  const AMBER = 'FFE3A008';
  const BORDER = 'FFD7E1EA';
  const WHITE = 'FFFFFFFF';
  const INK = 'FF101820';
  const SOFT = 'FF5B6B7C';

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Universal Building Cost Estimator (BOQ)';
  wb.created = new Date();

  const ws = wb.addWorksheet('Bill of Quantities', {
    pageSetup: {
      fitToWidth: 1,
      fitToHeight: 0,
      orientation: 'portrait',
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
    views: [{ showGridLines: false }],
  });

  ws.columns = [
    { key: 'no', width: 9 },
    { key: 'desc', width: 62 },
    { key: 'unit', width: 8 },
    { key: 'qty', width: 12 },
    { key: 'rate', width: 13 },
    { key: 'amt', width: 16 },
  ];

  const thinBorder: Partial<ExcelJS.Borders> = {
    bottom: { style: 'thin', color: { argb: BORDER } },
    top: { style: 'thin', color: { argb: BORDER } },
    left: { style: 'thin', color: { argb: BORDER } },
    right: { style: 'thin', color: { argb: BORDER } },
  };

  function paint(
    rowIdx: number,
    opts: {
      bold?: boolean;
      italic?: boolean;
      size?: number;
      color?: string;
      fill?: string;
      align?: Partial<ExcelJS.Alignment>;
      border?: boolean;
    } = {}
  ) {
    const row = ws.getRow(rowIdx);
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        name: 'Calibri',
        size: opts.size || 10.5,
        bold: !!opts.bold,
        italic: !!opts.italic,
        color: { argb: opts.color || INK },
      };
      cell.alignment = Object.assign(
        { vertical: 'middle', wrapText: true },
        opts.align || {}
      );
      if (opts.fill) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: opts.fill },
        };
      }
      cell.border = opts.border === false ? {} : thinBorder;
    });
  }

  function money(cell: ExcelJS.Cell, value: number) {
    cell.value = value;
    cell.numFmt = '#,##0.00';
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
  }

  let r = 1;

  // Title Banner
  ws.mergeCells(`A${r}:F${r}`);
  ws.getCell(`A${r}`).value = 'BILL OF QUANTITIES';
  paint(r, { bold: true, size: 16, color: WHITE, fill: NAVY });
  ws.getRow(r).height = 28;
  r++;

  ws.mergeCells(`A${r}:F${r}`);
  ws.getCell(`A${r}`).value = `Universal Building Cost Estimate — generated on ${projectInfo.sheetDate || new Date().toLocaleDateString('en-GB')}`;
  paint(r, { italic: true, size: 9.5, color: SOFT, border: false });
  r += 2;

  // Project Info Table
  const fields: [string, string][] = [
    ['Project', projectInfo.projectName || '—'],
    ['Location', projectInfo.location || '—'],
    ['Client', projectInfo.client || '—'],
    ['Contractor', projectInfo.contractor || '—'],
    ['Consultant', projectInfo.consultant || '—'],
    ['Currency', cur],
  ];

  fields.forEach(([label, value]) => {
    ws.mergeCells(`A${r}:B${r}`);
    const lc = ws.getCell(`A${r}`);
    lc.value = label;
    lc.font = { bold: true, size: 9.5, color: { argb: SOFT } };
    lc.border = thinBorder;

    ws.mergeCells(`C${r}:F${r}`);
    const vc = ws.getCell(`C${r}`);
    vc.value = value;
    vc.font = { size: 10.5, color: { argb: INK } };
    vc.border = thinBorder;
    r++;
  });
  r++;

  // Cost Summary Header
  ws.mergeCells(`A${r}:F${r}`);
  ws.getCell(`A${r}`).value = 'COST SUMMARY';
  paint(r, { bold: true, size: 11, color: WHITE, fill: NAVY2 });
  r++;

  const summaryLines: [string, number][] = [
    ...(sections.map((s) => [s.title, summary.sectionTotals[s.id] || 0] as [string, number])),
    ['C — Ancillary Structures', summary.ancillaryTotal],
    ['Sub-total', summary.subTotal],
    [`Profit (${markup.profitPct}%)`, summary.profitAmount],
    [`Overhead (${markup.overheadPct}%)`, summary.overheadAmount],
    ['Total before VAT', summary.totalBeforeVat],
    [`VAT (${markup.vatPct}%)`, summary.vatAmount],
  ];

  summaryLines.forEach(([label, amt]) => {
    ws.mergeCells(`A${r}:D${r}`);
    const cLabel = ws.getCell(`A${r}`);
    cLabel.value = label;
    cLabel.font = { size: 10.5, color: { argb: INK } };
    cLabel.border = thinBorder;

    ws.mergeCells(`E${r}:F${r}`);
    const cAmt = ws.getCell(`E${r}`);
    money(cAmt, amt);
    cAmt.border = thinBorder;
    r++;
  });

  // Grand Total in Summary
  ws.mergeCells(`A${r}:D${r}`);
  ws.getCell(`A${r}`).value = `GRAND TOTAL (${cur})`;
  ws.mergeCells(`E${r}:F${r}`);
  money(ws.getCell(`E${r}`), summary.grandTotal);
  paint(r, { bold: true, size: 13, color: WHITE, fill: NAVY });
  ws.getCell(`E${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  ws.getCell(`E${r}`).font = { bold: true, size: 13, color: { argb: AMBER } };
  ws.getRow(r).height = 24;
  r += 2;

  // Table Column Headers
  ws.getRow(r).values = ['Item No', 'Description', 'Unit', 'Qty', 'Rate', `Amount (${cur})`];
  paint(r, { bold: true, color: WHITE, fill: NAVY });
  ws.views = [{ showGridLines: false, state: 'frozen', ySplit: r }];
  r++;

  // Sections & Groups
  sections.forEach((sec) => {
    const sTotal = summary.sectionTotals[sec.id] || 0;
    ws.mergeCells(`A${r}:E${r}`);
    ws.getCell(`A${r}`).value = sec.title;
    money(ws.getCell(`F${r}`), sTotal);
    ws.getCell(`F${r}`).font = { bold: true, size: 11.5, color: { argb: WHITE } };
    paint(r, { bold: true, size: 11.5, color: WHITE, fill: NAVY2 });
    r++;

    sec.groups.forEach((grp) => {
      const gTotal = grp.items.reduce((acc, it) => acc + (it.amount || 0), 0);
      ws.mergeCells(`A${r}:E${r}`);
      ws.getCell(`A${r}`).value = '   ' + grp.title;
      money(ws.getCell(`F${r}`), gTotal);
      ws.getCell(`F${r}`).font = { bold: true, size: 10.5, color: { argb: INK } };
      paint(r, { bold: true, fill: GROUPFILL });
      r++;

      let zebra = false;
      grp.items.forEach((item) => {
        if (item.isNote) {
          ws.mergeCells(`A${r}:F${r}`);
          ws.getCell(`A${r}`).value = '   ' + item.description;
          paint(r, { italic: true, size: 9.5, color: SOFT, fill: NOTEFILL });
        } else {
          const qtyVal = typeof item.quantity === 'number' ? item.quantity : 0;
          const rateVal = typeof item.unitRate === 'number' ? item.unitRate : 0;
          const amtVal = item.amount || 0;

          ws.getRow(r).values = [
            item.itemNo || '+',
            item.description,
            item.unit,
            qtyVal,
            rateVal,
            amtVal,
          ];
          paint(r, { fill: zebra ? ZEBRA : undefined });
          ws.getCell(`C${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
          ws.getCell(`D${r}`).numFmt = '#,##0.00';
          ws.getCell(`D${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
          ws.getCell(`E${r}`).numFmt = '#,##0.00';
          ws.getCell(`E${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
          ws.getCell(`F${r}`).numFmt = '#,##0.00';
          ws.getCell(`F${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
          ws.getCell(`F${r}`).font = { bold: true, size: 10.5, color: { argb: NAVY } };
          zebra = !zebra;
        }
        r++;
      });
    });
  });

  // Ancillary Section
  ws.mergeCells(`A${r}:E${r}`);
  ws.getCell(`A${r}`).value = 'C — Ancillary Structures';
  money(ws.getCell(`F${r}`), summary.ancillaryTotal);
  ws.getCell(`F${r}`).font = { bold: true, size: 11.5, color: { argb: WHITE } };
  paint(r, { bold: true, size: 11.5, color: WHITE, fill: NAVY2 });
  r++;

  ancillary.forEach((anc) => {
    const amt = typeof anc.amount === 'number' ? anc.amount : 0;
    ws.mergeCells(`A${r}:E${r}`);
    ws.getCell(`A${r}`).value = '   ' + (anc.description || 'Ancillary item');
    money(ws.getCell(`F${r}`), amt);
    ws.getCell(`F${r}`).font = { size: 10.5, color: { argb: NAVY } };
    paint(r);
    r++;
  });

  // Generate buffer and trigger browser download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeProject = (projectInfo.projectName || 'BOQ_Estimate').replace(/[^a-z0-9]+/gi, '_');
  a.href = url;
  a.download = `${safeProject}_BOQ.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
