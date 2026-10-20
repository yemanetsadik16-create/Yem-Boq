import React from 'react';
import { BOQItem, TakeoffLine } from '../types/boq';
import { formatNumber } from '../utils/formatters';
import { TakeoffPanel } from './TakeoffPanel';
import { Trash2 } from 'lucide-react';

interface ItemRowProps {
  item: BOQItem;
  currency: string;
  onUpdateItem: (updated: Partial<BOQItem>) => void;
  onDeleteItem?: () => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  currency: _currency,
  onUpdateItem,
  onDeleteItem,
}) => {
  if (item.isNote) {
    return (
      <div className="bg-[#FBFCFD] text-[#455467] text-[12.5px] italic px-4 py-2 sm:pl-10 border-b border-[#D7E1EA]">
        {item.description}
      </div>
    );
  }

  const isCustom = !!item.isCustom;
  const isTakeoffLinked = item.takeoffLines && item.takeoffLines.length > 0;
  const isBar = item.takeoffType === 'bar';

  const handleQtyChange = (valStr: string) => {
    if (valStr === '') {
      onUpdateItem({ quantity: '', amount: 0 });
      return;
    }
    const val = parseFloat(valStr);
    const qty = isNaN(val) ? '' : val;
    const rate = typeof item.unitRate === 'number' ? item.unitRate : 0;
    const amount = typeof qty === 'number' ? qty * rate : 0;
    onUpdateItem({ quantity: qty, amount });
  };

  const handleRateChange = (valStr: string) => {
    if (valStr === '') {
      onUpdateItem({ unitRate: '', amount: 0 });
      return;
    }
    const val = parseFloat(valStr);
    const rate = isNaN(val) ? '' : val;
    const qty = typeof item.quantity === 'number' ? item.quantity : 0;
    const amount = typeof rate === 'number' ? qty * rate : 0;
    onUpdateItem({ unitRate: rate, amount });
  };

  const handleToggleTakeoff = () => {
    const nextState = !item.isTakeoffOpen;
    // If opening and no lines exist, seed one line
    if (nextState && (!item.takeoffLines || item.takeoffLines.length === 0)) {
      const initialLine: TakeoffLine = isBar
        ? {
            id: `to-${Date.now()}`,
            note: '',
            dims: [],
            barLen: '',
            barCount: '',
            memberCount: 1,
            kgPerM: item.detectedDia ? (item.detectedDia * item.detectedDia) / 162 : '',
            result: 0,
          }
        : {
            id: `to-${Date.now()}`,
            note: '',
            dims: [''],
            result: 0,
          };
      onUpdateItem({ isTakeoffOpen: true, takeoffLines: [initialLine] });
      return;
    }
    onUpdateItem({ isTakeoffOpen: nextState });
  };

  const handleTakeoffLinesChange = (newLines: TakeoffLine[]) => {
    const totalQty = newLines.reduce((acc, l) => acc + (l.result || 0), 0);
    const rate = typeof item.unitRate === 'number' ? item.unitRate : 0;
    const roundedQty = Math.round(totalQty * 1000) / 1000;
    onUpdateItem({
      takeoffLines: newLines,
      quantity: newLines.length > 0 ? roundedQty : item.quantity,
      amount: newLines.length > 0 ? roundedQty * rate : (typeof item.quantity === 'number' ? item.quantity * rate : 0),
    });
  };

  const handleClearTakeoff = () => {
    onUpdateItem({
      takeoffLines: [],
      isTakeoffOpen: false,
    });
  };

  return (
    <div
      className={`border-b border-[#D7E1EA] last:border-b-0 transition-colors ${
        isCustom ? 'bg-[#FFFBF0]' : 'hover:bg-[#F9FBFC]'
      }`}
    >
      {/* Desktop / Tablet Grid Row */}
      <div className="hidden sm:grid sm:grid-cols-[54px_1fr_64px_96px_110px_34px_120px] gap-2 items-center px-4 py-2.5">
        {/* Item No */}
        <div className="font-mono-num text-xs text-[#7A8A9B]">
          {item.itemNo || '+'}
        </div>

        {/* Description */}
        <div className="text-[13.3px] text-[#0F1B24] pr-2 leading-snug">
          {isCustom ? (
            <input
              type="text"
              placeholder="Describe the custom item..."
              value={item.description}
              onChange={(e) => onUpdateItem({ description: e.target.value })}
              className="w-full bg-white border border-[#B9C7D3] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#A9740A]"
            />
          ) : (
            <span>{item.description}</span>
          )}
        </div>

        {/* Unit */}
        <div>
          {isCustom ? (
            <input
              type="text"
              placeholder="Unit"
              value={item.unit}
              onChange={(e) => onUpdateItem({ unit: e.target.value })}
              className="w-full bg-white border border-[#B9C7D3] rounded px-1 py-1 text-center text-xs font-mono-num focus:outline-none focus:border-[#A9740A]"
            />
          ) : (
            <div className="text-[11.5px] text-[#4C5C6E] bg-[#EEF2F5] px-1.5 py-1 text-center border border-[#D7E1EA] rounded">
              {item.unit}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Qty"
            value={item.quantity === '' ? '' : item.quantity}
            onChange={(e) => handleQtyChange(e.target.value)}
            readOnly={isTakeoffLinked}
            title={
              isTakeoffLinked
                ? 'Quantity is linked to measurement take-off sheet below'
                : 'Enter quantity'
            }
            className={`w-full px-2 py-1.5 border rounded text-xs font-mono-num text-right transition-all ${
              isTakeoffLinked
                ? 'bg-[#E8F3EE] border-[#2F7D5B] text-[#2F7D5B] font-semibold cursor-pointer'
                : 'bg-white border-[#B9C7D3] text-[#0F1B24] focus:outline-none focus:border-[#A9740A] focus:ring-1 focus:ring-[#A9740A]/20'
            }`}
          />
        </div>

        {/* Rate */}
        <div>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Rate"
            value={item.unitRate === '' ? '' : item.unitRate}
            onChange={(e) => handleRateChange(e.target.value)}
            className="w-full px-2 py-1.5 border border-[#B9C7D3] rounded text-xs font-mono-num text-right bg-white text-[#0F1B24] focus:outline-none focus:border-[#A9740A] focus:ring-1 focus:ring-[#A9740A]/20"
          />
        </div>

        {/* Take-off / Bar Schedule Trigger */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleToggleTakeoff}
            title={
              isBar
                ? 'Build weight from reinforcement bar schedule'
                : 'Build quantity from dimensions (Take-Off)'
            }
            className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-semibold transition-all ${
              item.isTakeoffOpen || isTakeoffLinked
                ? 'bg-[#0F2C4C] border-[#0F2C4C] text-white shadow-sm'
                : 'bg-white border-[#B9C7D3] text-[#4C5C6E] hover:border-[#A9740A] hover:text-[#A9740A]'
            }`}
          >
            {isBar ? 'Ø' : '📐'}
          </button>
        </div>

        {/* Amount & Actions */}
        <div className="flex items-center justify-end gap-1.5 text-right">
          <span className="font-mono-num text-[13.5px] font-semibold text-[#0F2C4C]">
            {formatNumber(item.amount)}
          </span>
          {isCustom && onDeleteItem && (
            <button
              type="button"
              onClick={onDeleteItem}
              title="Delete custom item"
              className="text-[#B3432B] hover:text-red-700 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Stacked Layout */}
      <div className="sm:hidden px-3.5 py-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono-num text-xs font-semibold text-[#7A8A9B]">
              {item.itemNo || '+'}
            </span>
            <span className="text-[11px] text-[#4C5C6E] bg-[#EEF2F5] px-1.5 py-0.5 border border-[#D7E1EA] rounded">
              {item.unit}
            </span>
          </div>
          {isCustom && onDeleteItem && (
            <button
              type="button"
              onClick={onDeleteItem}
              className="text-[#B3432B] hover:text-red-700 p-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-[13px] text-[#0F1B24] leading-snug">
          {isCustom ? (
            <input
              type="text"
              placeholder="Describe item..."
              value={item.description}
              onChange={(e) => onUpdateItem({ description: e.target.value })}
              className="w-full bg-white border border-[#B9C7D3] rounded px-2.5 py-1 text-xs"
            />
          ) : (
            item.description
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
              Qty {isTakeoffLinked && '(Linked)'}
            </label>
            <div className="flex gap-1.5 items-center">
              <input
                type="number"
                step="any"
                placeholder="Qty"
                value={item.quantity === '' ? '' : item.quantity}
                onChange={(e) => handleQtyChange(e.target.value)}
                readOnly={isTakeoffLinked}
                className={`w-full px-2 py-1.5 border rounded text-xs font-mono-num text-right ${
                  isTakeoffLinked
                    ? 'bg-[#E8F3EE] border-[#2F7D5B] text-[#2F7D5B] font-semibold'
                    : 'bg-white border-[#B9C7D3]'
                }`}
              />
              <button
                type="button"
                onClick={handleToggleTakeoff}
                className={`w-8 h-8 flex items-center justify-center rounded border text-xs ${
                  item.isTakeoffOpen || isTakeoffLinked
                    ? 'bg-[#0F2C4C] text-white'
                    : 'bg-white border-[#B9C7D3] text-[#4C5C6E]'
                }`}
              >
                {isBar ? 'Ø' : '📐'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-0.5">
              Unit Rate
            </label>
            <input
              type="number"
              step="any"
              placeholder="Rate"
              value={item.unitRate === '' ? '' : item.unitRate}
              onChange={(e) => handleRateChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-[#B9C7D3] rounded text-xs font-mono-num text-right bg-white"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#D7E1EA]">
          <span className="text-xs text-slate-500">Item Total:</span>
          <span className="font-mono-num font-bold text-sm text-[#0F2C4C]">
            {formatNumber(item.amount)}
          </span>
        </div>
      </div>

      {/* Embedded Takeoff Sheet Panel */}
      {item.isTakeoffOpen && (
        <TakeoffPanel
          itemId={item.id}
          unit={item.unit}
          takeoffType={item.takeoffType}
          detectedDia={item.detectedDia}
          lines={item.takeoffLines || []}
          onChangeLines={handleTakeoffLinesChange}
          onClearTakeoff={handleClearTakeoff}
        />
      )}
    </div>
  );
};
