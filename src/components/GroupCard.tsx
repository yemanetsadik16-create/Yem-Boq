import React from 'react';
import { BOQGroup, BOQItem } from '../types/boq';
import { formatNumber } from '../utils/formatters';
import { ItemRow } from './ItemRow';
import { ChevronDown, Plus } from 'lucide-react';

interface GroupCardProps {
  group: BOQGroup;
  currency: string;
  onToggleOpen: () => void;
  onUpdateItem: (itemId: string, updated: Partial<BOQItem>) => void;
  onAddCustomItem: () => void;
  onDeleteCustomItem: (itemId: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  currency,
  onToggleOpen,
  onUpdateItem,
  onAddCustomItem,
  onDeleteCustomItem,
}) => {
  const groupTotal = group.items.reduce((acc, item) => acc + (item.amount || 0), 0);

  return (
    <div className="bg-white border border-[#B9C7D3] rounded shadow-[0_1px_2px_rgba(15,28,36,0.06)] mb-3 overflow-hidden">
      {/* Group Header */}
      <div
        onClick={onToggleOpen}
        className="flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer select-none border-l-4 border-[#7A8A9B] hover:border-[#E3A008] bg-white transition-colors"
      >
        <h4 className="m-0 text-[13.5px] font-semibold text-[#0F1B24] tracking-tight">
          {group.title}
        </h4>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono-num text-[13px] font-semibold text-[#4C5C6E]">
            {formatNumber(groupTotal)} <span className="text-[11px] font-normal text-slate-400">{currency}</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#7A8A9B] transition-transform duration-200 ${
              group.isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Group Body */}
      {group.isOpen && (
        <div className="border-t border-[#D7E1EA]">
          <div className="divide-y divide-[#D7E1EA]">
            {group.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                currency={currency}
                onUpdateItem={(updated) => onUpdateItem(item.id, updated)}
                onDeleteItem={() => onDeleteCustomItem(item.id)}
              />
            ))}
          </div>

          {/* Group Footer Controls */}
          <div className="p-3 bg-[#F7F9FA] border-t border-[#D7E1EA] flex justify-between items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onAddCustomItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#4C5C6E] hover:text-[#0F2C4C] border border-dashed border-[#B9C7D3] hover:border-[#0F2C4C] rounded bg-white transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add custom item to this trade</span>
            </button>
            <div className="text-xs text-[#7A8A9B] hidden sm:block">
              Group subtotal: <b className="font-mono-num text-[#0F2C4C]">{formatNumber(groupTotal)}</b> {currency}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
