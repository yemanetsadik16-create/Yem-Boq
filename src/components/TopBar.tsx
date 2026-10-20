import React from 'react';
import {
  FileSpreadsheet,
  FileDown,
  Printer,
  RotateCcw,
  Sparkles,
  PieChart,
  Search,
  X,
  ChevronsUpDown,
  Compass,
} from 'lucide-react';

interface TopBarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onLoadBlankTemplate: () => void;
  onReset?: () => void;
  onOpenPresets: () => void;
  onOpenBreakdown: () => void;
  onOpenAiCad: () => void;
  isExportingExcel: boolean;
  isExportingPDF: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onExpandAll,
  onCollapseAll: _onCollapseAll,
  onPrint,
  onExportExcel,
  onExportPDF,
  onLoadBlankTemplate,
  onReset,
  onOpenPresets,
  onOpenBreakdown,
  onOpenAiCad,
  isExportingExcel,
  isExportingPDF,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A2038] text-white border-b-[3px] border-b-[#E3A008] shadow-md no-print">
      <div className="max-w-[1400px] mx-auto px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-[#E3A008] flex items-center justify-center font-mono-num font-bold text-xs sm:text-sm text-[#E3A008] rounded-xs select-none">
            BQ
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold tracking-tight m-0 truncate">
              Bill of Quantities — Universal Cost Estimator
            </h1>
            <span className="text-[11px] text-[#A9BCCD] hidden sm:block truncate">
              Standardized architectural &amp; civil engineering cost schedule with live take-off &amp; bar calculations
            </span>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
          {/* Quick Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-40 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items or codes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#122A42] border border-[#234566] focus:border-[#E3A008] rounded pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Prominent AI CAD / Drawing Take-Off Button */}
            <button
              type="button"
              onClick={onOpenAiCad}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A2038] rounded shadow-sm hover:shadow transition-all cursor-pointer ring-1 ring-amber-300/40"
              title="Extract measurements from CAD blueprint or drawing image using Gemini AI"
            >
              <Compass className="w-3.5 h-3.5 text-[#0A2038]" />
              <span className="font-bold hidden sm:inline">AI CAD Take-Off</span>
              <span className="font-bold sm:hidden">AI CAD</span>
            </button>

            {/* Prominent Load Blank Template Button */}
            <button
              type="button"
              onClick={onLoadBlankTemplate || onReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-slate-300/40 hover:border-[#E3A008] text-white hover:text-[#E3A008] rounded transition-all cursor-pointer shadow-xs"
              title="Reset all quantities, rates, and take-offs to a clean blank template"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#E3A008]" />
              <span>Load Blank Template</span>
            </button>

            <button
              type="button"
              onClick={onOpenPresets}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium border border-[#33526E] hover:border-[#E3A008] text-[#DBE6EE] hover:text-[#E3A008] rounded transition-colors bg-transparent cursor-pointer"
              title="Save or restore estimate project data (JSON backup file)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E3A008]" />
              <span className="hidden xl:inline">Backup</span>
            </button>

            <button
              type="button"
              onClick={onOpenBreakdown}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium border border-[#33526E] hover:border-[#E3A008] text-[#DBE6EE] hover:text-[#E3A008] rounded transition-colors bg-transparent cursor-pointer"
              title="View cost analytics & trade breakdown"
            >
              <PieChart className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Analytics</span>
            </button>

            <button
              type="button"
              onClick={onExpandAll}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium border border-[#33526E] hover:border-[#E3A008] text-[#DBE6EE] hover:text-[#E3A008] rounded transition-colors bg-transparent cursor-pointer"
              title="Expand all trade groups"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Expand</span>
            </button>

            {/* Export PDF (jsPDF print-ready document) */}
            <button
              type="button"
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-[#B3432B]/90 hover:bg-[#B3432B] border border-red-800 text-white rounded transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Export complete Bill of Quantities to a clean, print-ready PDF document"
            >
              <FileDown className="w-3.5 h-3.5 text-white" />
              <span>{isExportingPDF ? 'Generating…' : 'Export PDF'}</span>
            </button>

            {/* Export Excel (ExcelJS spreadsheet) */}
            <button
              type="button"
              onClick={onExportExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-[#173A5E] hover:bg-[#1E4B7A] border border-[#2E5882] hover:border-[#E3A008] text-white rounded transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Export complete Bill of Quantities to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#E3A008]" />
              <span className="hidden sm:inline">{isExportingExcel ? 'Building…' : 'Export Excel'}</span>
              <span className="sm:hidden">Excel</span>
            </button>

            {/* Print / PDF (Browser native print) */}
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium border border-[#33526E] hover:border-[#E3A008] text-[#DBE6EE] hover:text-[#E3A008] rounded transition-colors bg-transparent cursor-pointer"
              title="Open browser print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
