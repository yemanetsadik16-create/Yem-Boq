import React from 'react';
import { BOQSection, AncillaryItem, CalculatedCostSummary, MarkupSettings } from '../types/boq';
import { formatNumber } from '../utils/formatters';
import { X, PieChart, BarChart3, CheckCircle2 } from 'lucide-react';

interface CostBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: BOQSection[];
  ancillary: AncillaryItem[];
  summary: CalculatedCostSummary;
  markup: MarkupSettings;
  currency: string;
}

export const CostBreakdownModal: React.FC<CostBreakdownModalProps> = ({
  isOpen,
  onClose,
  sections,
  ancillary: _ancillary,
  summary,
  markup,
  currency,
}) => {
  if (!isOpen) return null;

  const total = summary.grandTotal || 1;
  const subTotal = summary.subTotal || 1;

  // Breakdown by Major Trade
  const tradeTotals: Record<string, number> = {
    'Concrete & Reinforcement': 0,
    'Excavation & Earthwork': 0,
    'Masonry & Blockwork': 0,
    'Finishes & Plastering': 0,
    'Metalwork, Carpentry & Roofing': 0,
    'Sanitary & Plumbing': 0,
    'Electrical Installation': 0,
    'Ancillary & External Works': summary.ancillaryTotal,
  };

  let totalItemsCount = 0;
  let itemsWithRatesCount = 0;
  let itemsWithTakeoffCount = 0;

  sections.forEach((sec) => {
    sec.groups.forEach((grp) => {
      const gTitle = grp.title.toLowerCase();
      grp.items.forEach((item) => {
        if (!item.isNote) {
          totalItemsCount++;
          if (item.amount && item.amount > 0) itemsWithRatesCount++;
          if (item.takeoffLines && item.takeoffLines.length > 0) itemsWithTakeoffCount++;

          const amt = item.amount || 0;
          if (gTitle.includes('concrete')) {
            tradeTotals['Concrete & Reinforcement'] += amt;
          } else if (gTitle.includes('excavation') || gTitle.includes('earthwork')) {
            tradeTotals['Excavation & Earthwork'] += amt;
          } else if (gTitle.includes('masonry') || gTitle.includes('block')) {
            tradeTotals['Masonry & Blockwork'] += amt;
          } else if (gTitle.includes('finish') || gTitle.includes('painting') || gTitle.includes('glazing')) {
            tradeTotals['Finishes & Plastering'] += amt;
          } else if (gTitle.includes('metal') || gTitle.includes('roof') || gTitle.includes('carpentry')) {
            tradeTotals['Metalwork, Carpentry & Roofing'] += amt;
          } else if (gTitle.includes('sanitary')) {
            tradeTotals['Sanitary & Plumbing'] += amt;
          } else if (gTitle.includes('electrical')) {
            tradeTotals['Electrical Installation'] += amt;
          }
        }
      });
    });
  });

  const sortedTrades = Object.entries(tradeTotals)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl border border-[#B9C7D3] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D7E1EA] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#0F2C4C]" />
            <h3 className="m-0 text-base sm:text-lg font-bold text-[#0A2038]">
              Cost Breakdown &amp; Trade Analytics
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-[#0F2C4C] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#EEF2F5] p-3 rounded border border-[#D7E1EA]">
              <span className="text-[10.5px] uppercase font-semibold text-slate-500 block">
                Total Items
              </span>
              <span className="text-lg font-bold font-mono-num text-[#0F2C4C]">
                {totalItemsCount}
              </span>
            </div>
            <div className="bg-[#E8F3EE] p-3 rounded border border-[#2F7D5B]/30">
              <span className="text-[10.5px] uppercase font-semibold text-emerald-800 block">
                Priced Items
              </span>
              <span className="text-lg font-bold font-mono-num text-[#2F7D5B]">
                {itemsWithRatesCount}
              </span>
            </div>
            <div className="bg-[#FFFBF0] p-3 rounded border border-[#E3A008]/40">
              <span className="text-[10.5px] uppercase font-semibold text-amber-800 block">
                Take-Off Linked
              </span>
              <span className="text-lg font-bold font-mono-num text-[#A9740A]">
                {itemsWithTakeoffCount}
              </span>
            </div>
            <div className="bg-[#0F2C4C] text-white p-3 rounded">
              <span className="text-[10.5px] uppercase font-semibold text-[#A9BCCD] block">
                Grand Total
              </span>
              <span className="text-sm font-bold font-mono-num text-[#E3A008] truncate block">
                {formatNumber(summary.grandTotal)}
              </span>
            </div>
          </div>

          {/* Section Distribution */}
          <div>
            <h4 className="text-xs uppercase font-bold text-[#4C5C6E] tracking-wider mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#0F2C4C]" />
              <span>Section Allocation</span>
            </h4>
            <div className="space-y-2">
              {sections.map((sec) => {
                const sTotal = summary.sectionTotals[sec.id] || 0;
                const pct = subTotal > 0 ? (sTotal / subTotal) * 100 : 0;
                return (
                  <div key={sec.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-[#0F1B24]">{sec.title}</span>
                      <span className="font-mono-num font-semibold text-[#0F2C4C]">
                        {formatNumber(sTotal)} {currency} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EEF2F5] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0F2C4C] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-[#0F1B24]">C — Ancillary Structures</span>
                  <span className="font-mono-num font-semibold text-[#0F2C4C]">
                    {formatNumber(summary.ancillaryTotal)} {currency} (
                    {subTotal > 0 ? ((summary.ancillaryTotal / subTotal) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-[#EEF2F5] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#173A5E] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${subTotal > 0 ? Math.min((summary.ancillaryTotal / subTotal) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trade Category Breakdown */}
          {sortedTrades.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold text-[#4C5C6E] tracking-wider mb-2.5">
                Trade Category Breakdown (Highest to Lowest)
              </h4>
              <div className="space-y-2">
                {sortedTrades.map(([trade, amt]) => {
                  const pct = subTotal > 0 ? (amt / subTotal) * 100 : 0;
                  return (
                    <div key={trade} className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#455467]">{trade}</span>
                        <span className="font-mono-num font-medium text-[#0F2C4C]">
                          {formatNumber(amt)} {currency} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#EEF2F5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#E3A008] h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tax & Markup Composition */}
          <div className="bg-[#FAFBFD] p-3.5 rounded border border-[#D7E1EA] text-xs space-y-1.5">
            <h4 className="text-[11px] uppercase font-bold text-[#0F2C4C] tracking-wider mb-2">
              Markups &amp; Taxes Applied
            </h4>
            <div className="flex justify-between text-slate-600">
              <span>Contractor Profit ({markup.profitPct}%):</span>
              <span className="font-mono-num font-semibold text-[#0F1B24]">
                {formatNumber(summary.profitAmount)} {currency}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Overhead &amp; Site Administration ({markup.overheadPct}%):</span>
              <span className="font-mono-num font-semibold text-[#0F1B24]">
                {formatNumber(summary.overheadAmount)} {currency}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Value Added Tax (VAT {markup.vatPct}%):</span>
              <span className="font-mono-num font-semibold text-[#0F1B24]">
                {formatNumber(summary.vatAmount)} {currency}
              </span>
            </div>
            <div className="pt-2 border-t border-[#D7E1EA] flex justify-between font-bold text-sm text-[#0F2C4C]">
              <span>Grand Total:</span>
              <span className="font-mono-num text-[#E3A008] text-base">
                {formatNumber(summary.grandTotal)} {currency}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#F8FAFC] border-t border-[#D7E1EA] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#0F2C4C] hover:bg-[#173A5E] text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Close Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};
