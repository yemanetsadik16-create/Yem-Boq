import React, { useState } from 'react';
import { CalculatedCostSummary, MarkupSettings } from '../types/boq';
import { formatNumber } from '../utils/formatters';
import { ChevronUp, ChevronDown, Calculator, FileDown, FileSpreadsheet } from 'lucide-react';

interface CostSummaryCardProps {
  summary: CalculatedCostSummary;
  markup: MarkupSettings;
  currency: string;
  onMarkupChange: (updated: Partial<MarkupSettings>) => void;
  sectionTitles: Record<string, string>;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  isExportingPDF?: boolean;
}

export const CostSummaryCard: React.FC<CostSummaryCardProps> = ({
  summary,
  markup,
  currency,
  onMarkupChange,
  sectionTitles,
  onExportPDF,
  onExportExcel,
  isExportingPDF,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const renderSummaryRows = (isMobile = false) => (
    <div className={`text-xs ${isMobile ? 'text-slate-200' : 'text-[#455467]'}`}>
      {/* Sections breakdown */}
      {Object.entries(sectionTitles).map(([secId, title]) => {
        const val = summary.sectionTotals[secId] || 0;
        return (
          <div
            key={secId}
            className={`flex justify-between items-center py-2 border-b ${
              isMobile ? 'border-[#1F3F5C]' : 'border-[#D7E1EA]'
            }`}
          >
            <span className="truncate pr-2">{title}</span>
            <b className={`font-mono-num font-semibold shrink-0 ${isMobile ? 'text-white' : 'text-[#0F1B24]'}`}>
              {formatNumber(val)}
            </b>
          </div>
        );
      })}

      {/* Ancillary */}
      <div
        className={`flex justify-between items-center py-2 border-b ${
          isMobile ? 'border-[#1F3F5C]' : 'border-[#D7E1EA]'
        }`}
      >
        <span className="truncate pr-2">C — Ancillary Structures</span>
        <b className={`font-mono-num font-semibold shrink-0 ${isMobile ? 'text-white' : 'text-[#0F1B24]'}`}>
          {formatNumber(summary.ancillaryTotal)}
        </b>
      </div>

      {/* Sub-total */}
      <div
        className={`flex justify-between items-center py-2 font-semibold border-b ${
          isMobile ? 'border-[#1F3F5C] text-amber-200' : 'border-[#D7E1EA] text-[#0F2C4C]'
        }`}
      >
        <span>Sub-Total Items</span>
        <b className="font-mono-num text-sm">
          {formatNumber(summary.subTotal)}
        </b>
      </div>

      {/* Profit % */}
      <div
        className={`flex justify-between items-center py-2 border-b ${
          isMobile ? 'border-[#1F3F5C]' : 'border-[#D7E1EA]'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span>Profit</span>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={markup.profitPct}
            onChange={(e) => onMarkupChange({ profitPct: parseFloat(e.target.value) || 0 })}
            className={`w-12 px-1 py-0.5 text-right font-mono-num rounded text-xs border ${
              isMobile
                ? 'bg-[#0F2740] border-[#2A4A66] text-white'
                : 'bg-white border-[#B9C7D3] text-[#0F1B24]'
            }`}
          />
          <span>%</span>
        </div>
        <b className={`font-mono-num font-medium ${isMobile ? 'text-white' : 'text-[#0F1B24]'}`}>
          {formatNumber(summary.profitAmount)}
        </b>
      </div>

      {/* Overhead % */}
      <div
        className={`flex justify-between items-center py-2 border-b ${
          isMobile ? 'border-[#1F3F5C]' : 'border-[#D7E1EA]'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span>Overhead</span>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={markup.overheadPct}
            onChange={(e) => onMarkupChange({ overheadPct: parseFloat(e.target.value) || 0 })}
            className={`w-12 px-1 py-0.5 text-right font-mono-num rounded text-xs border ${
              isMobile
                ? 'bg-[#0F2740] border-[#2A4A66] text-white'
                : 'bg-white border-[#B9C7D3] text-[#0F1B24]'
            }`}
          />
          <span>%</span>
        </div>
        <b className={`font-mono-num font-medium ${isMobile ? 'text-white' : 'text-[#0F1B24]'}`}>
          {formatNumber(summary.overheadAmount)}
        </b>
      </div>

      {/* Pre-VAT Total */}
      <div
        className={`flex justify-between items-center py-2 border-b ${
          isMobile ? 'border-[#1F3F5C]' : 'border-[#D7E1EA]'
        }`}
      >
        <span>Total Before VAT</span>
        <b className={`font-mono-num font-medium ${isMobile ? 'text-white' : 'text-[#0F1B24]'}`}>
          {formatNumber(summary.totalBeforeVat)}
        </b>
      </div>

      {/* VAT % */}
      <div
        className={`flex justify-between items-center py-2 border-b ${
          isMobile ? 'border-[#1F3F5C]' : 'border-[#D7E1EA]'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span>VAT</span>
          <input
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={markup.vatPct}
            onChange={(e) => onMarkupChange({ vatPct: parseFloat(e.target.value) || 0 })}
            className={`w-12 px-1 py-0.5 text-right font-mono-num rounded text-xs border ${
              isMobile
                ? 'bg-[#0F2740] border-[#2A4A66] text-white'
                : 'bg-white border-[#B9C7D3] text-[#0F1B24]'
            }`}
          />
          <span>%</span>
        </div>
        <b className={`font-mono-num font-medium ${isMobile ? 'text-white' : 'text-[#0F1B24]'}`}>
          {formatNumber(summary.vatAmount)}
        </b>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Summary Card */}
      <div className="hidden lg:block bg-white border border-[#B9C7D3] border-t-4 border-t-[#E3A008] rounded shadow-[0_1px_2px_rgba(15,28,36,0.06)] overflow-hidden sticky top-20">
        <div className="p-3 bg-[#F8FAFC] border-b border-[#D7E1EA] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-[#0F2C4C]" />
            <h4 className="m-0 text-xs uppercase tracking-wider font-bold text-[#0A2038]">
              Cost Summary
            </h4>
          </div>
          <span className="text-[11px] font-mono-num font-semibold text-slate-500 bg-white px-2 py-0.5 border border-[#D7E1EA] rounded">
            {currency}
          </span>
        </div>

        <div className="p-3.5 space-y-1">
          {renderSummaryRows(false)}
        </div>

        {/* Grand Total Footer */}
        <div className="bg-[#0A2038] text-white p-4 border-t-2 border-[#E3A008]">
          <span className="text-[11px] uppercase tracking-wider text-[#A9BCCD] font-semibold block">
            Grand Total Estimate ({currency})
          </span>
          <div className="font-mono-num text-2xl font-bold text-[#E3A008] mt-1 break-all">
            {formatNumber(summary.grandTotal)}
          </div>

          {/* Quick PDF & Excel Buttons */}
          {(onExportPDF || onExportExcel) && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#234566]">
              {onExportPDF && (
                <button
                  type="button"
                  onClick={onExportPDF}
                  disabled={isExportingPDF}
                  className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-[#B3432B] hover:bg-red-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  title="Export print-ready PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExportingPDF ? 'PDF...' : 'Export PDF'}</span>
                </button>
              )}
              {onExportExcel && (
                <button
                  type="button"
                  onClick={onExportExcel}
                  className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-[#173A5E] hover:bg-[#1E4B7A] text-white border border-[#2E5882] rounded text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Export Excel spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#E3A008]" />
                  <span>Excel</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Fixed Bottom Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A2038] text-white border-t-4 border-t-[#E3A008] shadow-2xl transition-all">
        <div
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        >
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#9FB6C8] font-semibold block">
              Grand Total ({currency})
            </span>
            <span className="font-mono-num text-lg font-bold text-[#E3A008]">
              {formatNumber(summary.grandTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#9FB6C8]">
            <span>{mobileExpanded ? 'Hide breakdown' : 'View breakdown'}</span>
            {mobileExpanded ? (
              <ChevronDown className="w-4 h-4 text-[#E3A008]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#E3A008]" />
            )}
          </div>
        </div>

        {mobileExpanded && (
          <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto border-t border-[#1F3F5C] pt-2 space-y-3">
            {renderSummaryRows(true)}

            {onExportPDF && (
              <button
                type="button"
                onClick={onExportPDF}
                disabled={isExportingPDF}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#B3432B] text-white rounded text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                <span>{isExportingPDF ? 'Generating PDF Document...' : 'Export Print-Ready PDF'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
