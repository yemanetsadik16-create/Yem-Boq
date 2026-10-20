import React from 'react';
import { TakeoffLine, TakeoffType } from '../types/boq';
import { formatNumber, getDimsLabelsForUnit, calculateBarUnitWeight } from '../utils/formatters';
import { Plus, Trash2, XCircle } from 'lucide-react';

interface TakeoffPanelProps {
  itemId: string;
  unit: string;
  takeoffType: TakeoffType;
  detectedDia?: number | null;
  lines: TakeoffLine[];
  onChangeLines: (lines: TakeoffLine[]) => void;
  onClearTakeoff: () => void;
}

export const TakeoffPanel: React.FC<TakeoffPanelProps> = ({
  unit,
  takeoffType,
  detectedDia,
  lines,
  onChangeLines,
  onClearTakeoff,
}) => {
  const isBar = takeoffType === 'bar';
  const dimLabels = getDimsLabelsForUnit(unit);

  const handleAddLine = () => {
    if (isBar) {
      const defaultKgM = detectedDia ? calculateBarUnitWeight(detectedDia) : '';
      const newLine: TakeoffLine = {
        id: `to-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        note: '',
        dims: [],
        barLen: '',
        barCount: '',
        memberCount: 1,
        kgPerM: defaultKgM,
        result: 0,
      };
      onChangeLines([...lines, newLine]);
    } else {
      const newLine: TakeoffLine = {
        id: `to-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        note: '',
        dims: dimLabels.map(() => ''),
        result: 0,
      };
      onChangeLines([...lines, newLine]);
    }
  };

  const handleRemoveLine = (idx: number) => {
    const updated = lines.filter((_, i) => i !== idx);
    onChangeLines(updated);
  };

  const handleUpdateBarLine = (
    idx: number,
    field: 'note' | 'barLen' | 'barCount' | 'memberCount' | 'kgPerM',
    val: string
  ) => {
    const updated = [...lines];
    const target = { ...updated[idx] };

    if (field === 'note') {
      target.note = val;
    } else {
      const parsed = val === '' ? '' : parseFloat(val);
      target[field] = isNaN(parsed as number) ? '' : (parsed as number);
    }

    const len = typeof target.barLen === 'number' ? target.barLen : 0;
    const bCount = typeof target.barCount === 'number' ? target.barCount : 0;
    const mCount = typeof target.memberCount === 'number' ? target.memberCount : 1;
    const kgM = typeof target.kgPerM === 'number'
      ? target.kgPerM
      : detectedDia
      ? calculateBarUnitWeight(detectedDia)
      : 0;

    target.result = len * bCount * mCount * kgM;
    updated[idx] = target;
    onChangeLines(updated);
  };

  const handleUpdateDimLine = (
    idx: number,
    field: 'note' | number,
    val: string
  ) => {
    const updated = [...lines];
    const target = { ...updated[idx] };

    if (field === 'note') {
      target.note = val;
    } else {
      const newDims = [...target.dims];
      const parsed = val === '' ? '' : parseFloat(val);
      newDims[field] = isNaN(parsed as number) ? '' : (parsed as number);
      target.dims = newDims;
    }

    // Multiply non-empty dims
    const activeValues = target.dims
      .map((d) => (typeof d === 'number' && !isNaN(d) ? d : null))
      .filter((v): v is number => v !== null);

    if (activeValues.length === 0) {
      target.result = 0;
    } else {
      target.result = activeValues.reduce((acc, curr) => acc * curr, 1);
    }

    updated[idx] = target;
    onChangeLines(updated);
  };

  const total = lines.reduce((acc, l) => acc + (l.result || 0), 0);

  return (
    <div className="bg-[#FCF8EC] border-t border-dashed border-[#B9C7D3] border-b border-[#D7E1EA] px-4 py-3 sm:pl-14 text-sm animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="text-[11.5px] font-bold text-[#A9740A] uppercase tracking-wider flex items-center gap-1.5">
          <span>{isBar ? 'Ø' : '📐'}</span>
          {isBar ? (
            detectedDia ? (
              <span>
                Bar Schedule — Ø{detectedDia}mm Deformed Bar (unit wt.{' '}
                {calculateBarUnitWeight(detectedDia).toFixed(3)} kg/m) × Length × No. Bars × Members
              </span>
            ) : (
              <span>Steel Section Weight Schedule — Unit Wt (kg/m) × Length × Pieces × Members</span>
            )
          ) : (
            <span>
              Measurement Take-Off — Build quantity from dimensions ({unit})
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {lines.map((line, idx) => (
          <div
            key={line.id || idx}
            className="flex flex-col sm:flex-row sm:items-center gap-2 pb-2 sm:pb-0 border-b sm:border-b-0 border-[#EBD9A8]"
          >
            <input
              type="text"
              placeholder="Note (e.g. Footing F1 / Axis 1-3)"
              value={line.note || ''}
              onChange={(e) =>
                isBar
                  ? handleUpdateBarLine(idx, 'note', e.target.value)
                  : handleUpdateDimLine(idx, 'note', e.target.value)
              }
              className="flex-1 min-w-[140px] bg-white border border-[#B9C7D3] rounded px-2.5 py-1 text-xs text-[#0F1B24] focus:outline-none focus:border-[#A9740A]"
            />

            {isBar ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  placeholder="L (m)"
                  value={line.barLen ?? ''}
                  onChange={(e) => handleUpdateBarLine(idx, 'barLen', e.target.value)}
                  className="w-16 bg-white border border-[#B9C7D3] rounded px-1.5 py-1 text-xs text-right font-mono-num focus:outline-none focus:border-[#A9740A]"
                  title="Length of one bar in meters"
                />
                <span className="text-slate-400 text-xs">×</span>
                <input
                  type="number"
                  step="any"
                  placeholder="No. bars"
                  value={line.barCount ?? ''}
                  onChange={(e) => handleUpdateBarLine(idx, 'barCount', e.target.value)}
                  className="w-16 bg-white border border-[#B9C7D3] rounded px-1.5 py-1 text-xs text-right font-mono-num focus:outline-none focus:border-[#A9740A]"
                  title="Number of bars per member"
                />
                <span className="text-slate-400 text-xs">×</span>
                <input
                  type="number"
                  step="any"
                  placeholder="Members"
                  value={line.memberCount ?? ''}
                  onChange={(e) => handleUpdateBarLine(idx, 'memberCount', e.target.value)}
                  className="w-16 bg-white border border-[#B9C7D3] rounded px-1.5 py-1 text-xs text-right font-mono-num focus:outline-none focus:border-[#A9740A]"
                  title="Number of structural members"
                />

                <span className="text-slate-400 text-xs">×</span>
                {detectedDia ? (
                  <span
                    className="bg-[#EEF2F5] border border-[#D7E1EA] px-2 py-1 text-[11px] font-mono-num text-[#4C5C6E] rounded"
                    title={`Standard unit weight: ${detectedDia}² / 162 = ${calculateBarUnitWeight(detectedDia).toFixed(3)} kg/m`}
                  >
                    Ø{detectedDia}mm · {calculateBarUnitWeight(detectedDia).toFixed(3)} kg/m
                  </span>
                ) : (
                  <input
                    type="number"
                    step="any"
                    placeholder="kg/m"
                    value={line.kgPerM ?? ''}
                    onChange={(e) => handleUpdateBarLine(idx, 'kgPerM', e.target.value)}
                    className="w-16 bg-white border border-[#B9C7D3] rounded px-1.5 py-1 text-xs text-right font-mono-num focus:outline-none focus:border-[#A9740A]"
                    title="Unit weight in kg per meter"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {dimLabels.map((lbl, dimIdx) => (
                  <React.Fragment key={dimIdx}>
                    {dimIdx > 0 && <span className="text-slate-400 text-xs">×</span>}
                    <input
                      type="number"
                      step="any"
                      placeholder={lbl}
                      value={line.dims[dimIdx] ?? ''}
                      onChange={(e) => handleUpdateDimLine(idx, dimIdx, e.target.value)}
                      className="w-16 bg-white border border-[#B9C7D3] rounded px-1.5 py-1 text-xs text-right font-mono-num focus:outline-none focus:border-[#A9740A]"
                      title={lbl}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[110px] mt-1 sm:mt-0">
              <span className="font-mono-num text-xs font-semibold text-[#0F2C4C]">
                {formatNumber(line.result)} {unit}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveLine(idx)}
                className="text-[#B3432B] hover:text-red-700 p-1 rounded"
                title="Remove line"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-[#EBD9A8] flex flex-wrap items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={handleAddLine}
          className="inline-flex items-center gap-1 px-2.5 py-1 border border-dashed border-[#B9C7D3] hover:border-[#A9740A] text-[#4C5C6E] hover:text-[#A9740A] rounded bg-white/70 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add measurement line</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="text-[#455467]">
            {isBar ? 'Total Weight' : 'Take-Off Total'}:{' '}
            <b className="font-mono-num font-bold text-[#2F7D5B] text-sm">
              {formatNumber(total)} {unit}
            </b>{' '}
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Linked to Qty
            </span>
          </div>

          <button
            type="button"
            onClick={onClearTakeoff}
            className="text-xs text-[#7A8A9B] hover:text-[#B3432B] underline inline-flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Clear take-off</span>
          </button>
        </div>
      </div>
    </div>
  );
};
