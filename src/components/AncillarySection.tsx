import React from 'react';
import { AncillaryItem } from '../types/boq';
import { formatNumber } from '../utils/formatters';
import { Plus, Trash2, Building2 } from 'lucide-react';

interface AncillarySectionProps {
  items: AncillaryItem[];
  currency: string;
  onUpdateItem: (id: string, updated: Partial<AncillaryItem>) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
}

export const AncillarySection: React.FC<AncillarySectionProps> = ({
  items,
  currency,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
}) => {
  const total = items.reduce((acc, curr) => {
    const val = typeof curr.amount === 'number' ? curr.amount : 0;
    return acc + val;
  }, 0);

  return (
    <div id="sec-ANC" className="mb-8 scroll-mt-20">
      <div className="flex items-baseline justify-between gap-3 pb-2 border-b-2 border-[#0F2C4C] mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#0F2C4C]" />
          <h3 className="m-0 text-lg font-bold text-[#0A2038]">
            C — Ancillary Structures &amp; Site Works
          </h3>
        </div>
        <span className="font-mono-num text-sm sm:text-base font-bold text-[#0F2C4C]">
          {formatNumber(total)} <span className="text-xs text-slate-500 font-normal">{currency}</span>
        </span>
      </div>

      <div className="bg-white border border-[#B9C7D3] rounded shadow-[0_1px_2px_rgba(15,28,36,0.06)] overflow-hidden">
        <div className="px-4 py-3 bg-[#F9FBFC] border-b border-[#D7E1EA]">
          <h4 className="text-xs uppercase font-bold text-[#4C5C6E] tracking-wider">
            Lump-Sum Site &amp; Auxiliary Elements (e.g. Septic Tank, Boundary Fence, Guard House)
          </h4>
          <p className="text-xs text-[#7A8A9B] mt-0.5">
            Enter lump-sum cost allowances or values taken from external civil take-off schedules.
          </p>
        </div>

        <div className="divide-y divide-[#D7E1EA]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 sm:px-4 sm:py-2.5 hover:bg-[#FAFBFD]"
            >
              <input
                type="text"
                placeholder="Description (e.g. Septic tank & manholes complete with soakaway)"
                value={item.description}
                onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                className="flex-1 bg-white border border-[#B9C7D3] rounded px-3 py-1.5 text-xs sm:text-sm text-[#0F1B24] focus:outline-none focus:border-[#A9740A]"
              />

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Amount"
                    value={item.amount === '' ? '' : item.amount}
                    onChange={(e) => {
                      const v = e.target.value === '' ? '' : parseFloat(e.target.value);
                      onUpdateItem(item.id, { amount: isNaN(v as number) ? '' : (v as number) });
                    }}
                    className="w-36 px-2.5 py-1.5 border border-[#B9C7D3] rounded text-xs sm:text-sm font-mono-num text-right bg-white text-[#0F1B24] focus:outline-none focus:border-[#A9740A]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  title="Remove item"
                  className="p-1.5 text-[#B3432B] hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#F7F9FA] border-t border-[#D7E1EA] flex justify-between items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4C5C6E] hover:text-[#0F2C4C] border border-dashed border-[#B9C7D3] hover:border-[#0F2C4C] rounded bg-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add ancillary line</span>
          </button>
          <span className="text-xs text-[#7A8A9B]">
            Section C Subtotal: <b className="font-mono-num text-[#0F2C4C]">{formatNumber(total)}</b> {currency}
          </span>
        </div>
      </div>
    </div>
  );
};
