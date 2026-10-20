import React from 'react';
import { ProjectInfo } from '../types/boq';
import { FileSpreadsheet } from 'lucide-react';

interface TitleBlockProps {
  info: ProjectInfo;
  onChange: (updated: Partial<ProjectInfo>) => void;
}

export const TitleBlock: React.FC<TitleBlockProps> = ({ info, onChange }) => {
  return (
    <div className="max-w-[1180px] mx-auto mt-5 px-4">
      <div className="bg-white border border-[#B9C7D3] border-t-4 border-t-[#0F2C4C] rounded shadow-[0_1px_2px_rgba(15,28,36,0.06)] overflow-hidden">
        {/* Header Title Bar */}
        <div className="p-4 sm:p-5 border-b border-[#D7E1EA] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="w-5 h-5 text-[#0F2C4C]" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A2038] m-0">
                Bill of Quantities
              </h2>
            </div>
            <p className="text-xs sm:text-[13.5px] text-[#455467] max-w-3xl leading-relaxed m-0">
              A standardized building specification and measurement item list covering Sub-Structure,
              Super-Structure, Finishes, Mechanical &amp; Electrical Services, and Ancillary Works.
              Enter quantities or use the measurement take-off (📐) &amp; bar schedule (Ø) tools.
            </p>
          </div>

          <div className="shrink-0 font-mono-num text-xs text-[#4C5C6E] border border-[#B9C7D3] bg-[#F8FAFC] rounded px-3 py-2 text-center min-w-[130px]">
            <span className="text-[10.5px] uppercase tracking-wider block text-slate-500 font-sans font-semibold">
              Sheet Date
            </span>
            <b className="text-sm text-[#0F2C4C] font-semibold block mt-0.5">
              {info.sheetDate || '—'}
            </b>
          </div>
        </div>

        {/* Project Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 divide-[#D7E1EA]">
          <div className="p-3 sm:px-4 sm:py-3 sm:border-r border-b border-[#D7E1EA]">
            <label className="block text-[10.5px] uppercase tracking-wider text-[#7A8A9B] font-semibold mb-1">
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. G+2 Micro Cluster Building"
              value={info.projectName}
              onChange={(e) => onChange({ projectName: e.target.value })}
              className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-[#A9740A] text-sm text-[#0F1B24] font-medium py-0.5 outline-none transition-colors"
            />
          </div>

          <div className="p-3 sm:px-4 sm:py-3 sm:border-r md:border-r border-b border-[#D7E1EA]">
            <label className="block text-[10.5px] uppercase tracking-wider text-[#7A8A9B] font-semibold mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="Town / Sub-city / Region"
              value={info.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-[#A9740A] text-sm text-[#0F1B24] py-0.5 outline-none transition-colors"
            />
          </div>

          <div className="p-3 sm:px-4 sm:py-3 border-b border-[#D7E1EA]">
            <label className="block text-[10.5px] uppercase tracking-wider text-[#7A8A9B] font-semibold mb-1">
              Client
            </label>
            <input
              type="text"
              placeholder="Client / Employer Name"
              value={info.client}
              onChange={(e) => onChange({ client: e.target.value })}
              className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-[#A9740A] text-sm text-[#0F1B24] py-0.5 outline-none transition-colors"
            />
          </div>

          <div className="p-3 sm:px-4 sm:py-3 sm:border-r border-b sm:border-b-0 border-[#D7E1EA]">
            <label className="block text-[10.5px] uppercase tracking-wider text-[#7A8A9B] font-semibold mb-1">
              Contractor
            </label>
            <input
              type="text"
              placeholder="Contractor Name"
              value={info.contractor}
              onChange={(e) => onChange({ contractor: e.target.value })}
              className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-[#A9740A] text-sm text-[#0F1B24] py-0.5 outline-none transition-colors"
            />
          </div>

          <div className="p-3 sm:px-4 sm:py-3 sm:border-r border-b sm:border-b-0 border-[#D7E1EA]">
            <label className="block text-[10.5px] uppercase tracking-wider text-[#7A8A9B] font-semibold mb-1">
              Consultant / Engineer
            </label>
            <input
              type="text"
              placeholder="Consulting Architects & Engineers"
              value={info.consultant}
              onChange={(e) => onChange({ consultant: e.target.value })}
              className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-[#A9740A] text-sm text-[#0F1B24] py-0.5 outline-none transition-colors"
            />
          </div>

          <div className="p-3 sm:px-4 sm:py-3">
            <label className="block text-[10.5px] uppercase tracking-wider text-[#7A8A9B] font-semibold mb-1">
              Currency
            </label>
            <input
              type="text"
              placeholder="e.g. ETB, USD, EUR, GBP"
              value={info.currency}
              onChange={(e) => onChange({ currency: e.target.value.toUpperCase() })}
              className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-[#A9740A] text-sm font-mono-num font-bold text-[#0F2C4C] py-0.5 outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
