import React from 'react';
import { formatNumber } from '../utils/formatters';
import { ChevronsDownUp, ChevronsUpDown, Layers, RotateCcw } from 'lucide-react';

interface SectionNavProps {
  sections: { id: string; title: string; total: number }[];
  ancillaryTotal: number;
  currency: string;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onLoadBlankTemplate?: () => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  sections,
  ancillaryTotal,
  currency: _currency,
  onExpandAll,
  onCollapseAll,
  onLoadBlankTemplate,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white border border-[#B9C7D3] rounded shadow-[0_1px_2px_rgba(15,28,36,0.06)] overflow-hidden">
      <div className="p-3 bg-[#F8FAFC] border-b border-[#D7E1EA] flex items-center gap-1.5">
        <Layers className="w-4 h-4 text-[#0F2C4C]" />
        <h4 className="m-0 text-xs uppercase tracking-wider font-bold text-[#0A2038]">
          Project Navigation
        </h4>
      </div>

      <div className="divide-y divide-[#D7E1EA]">
        {sections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => scrollTo(`sec-${sec.id}`)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-[#455467] hover:bg-[#F5F8FA] hover:text-[#0F2C4C] transition-colors cursor-pointer"
          >
            <span className="truncate pr-2 font-semibold">{sec.title}</span>
            <span className="font-mono-num text-[11.5px] text-[#0F2C4C] font-semibold shrink-0">
              {formatNumber(sec.total)}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => scrollTo('sec-ANC')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-[#455467] hover:bg-[#F5F8FA] hover:text-[#0F2C4C] transition-colors cursor-pointer"
        >
          <span className="truncate pr-2 font-semibold">C — Ancillary Works</span>
          <span className="font-mono-num text-[11.5px] text-[#0F2C4C] font-semibold shrink-0">
            {formatNumber(ancillaryTotal)}
          </span>
        </button>
      </div>

      <div className="p-2.5 bg-[#F8FAFC] border-t border-[#D7E1EA] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onExpandAll}
          className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-[#4C5C6E] hover:text-[#0F2C4C] border border-[#B9C7D3] rounded bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          <span>Expand all trades</span>
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-[#4C5C6E] hover:text-[#0F2C4C] border border-[#B9C7D3] rounded bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronsDownUp className="w-3.5 h-3.5" />
          <span>Collapse all trades</span>
        </button>
        {onLoadBlankTemplate && (
          <button
            type="button"
            onClick={onLoadBlankTemplate}
            className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs text-[#0F2C4C] hover:text-[#0A2038] border border-amber-300 hover:border-amber-400 rounded bg-amber-50 hover:bg-amber-100 font-semibold transition-colors cursor-pointer mt-1 shadow-2xs"
            title="Reset all quantities, rates, and take-offs to a clean blank template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Load Blank Template</span>
          </button>
        )}
      </div>
    </div>
  );
};
