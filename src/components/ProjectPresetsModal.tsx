import React, { useRef, useState } from 'react';
import { X, RotateCcw, Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { BOQSection, AncillaryItem, ProjectInfo, MarkupSettings } from '../types/boq';

interface ProjectPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadBlank: () => void;
  currentData: {
    sections: BOQSection[];
    ancillary: AncillaryItem[];
    projectInfo: ProjectInfo;
    markup: MarkupSettings;
  };
  onImportData: (data: any) => void;
}

export const ProjectPresetsModal: React.FC<ProjectPresetsModalProps> = ({
  isOpen,
  onClose,
  onLoadBlank,
  currentData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(currentData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (currentData.projectInfo.projectName || 'BOQ_Estimate').replace(/[^a-z0-9]+/gi, '_');
    a.href = url;
    a.download = `${safeName || 'BOQ'}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.sections && parsed.projectInfo) {
          onImportData(parsed);
          onClose();
        } else {
          setErrorMessage('Invalid file structure. Make sure this is a valid BOQ JSON backup.');
        }
      } catch {
        setErrorMessage('Could not parse the backup JSON file. Please check the file formatting.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl border border-[#B9C7D3] max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D7E1EA] flex items-center justify-between bg-[#F8FAFC]">
          <h3 className="m-0 text-base font-bold text-[#0A2038] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F2C4C]" />
            <span>Template Management &amp; Data Backup</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-[#0F2C4C] p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs sm:text-sm">
          {/* Functional Clean Blank Template Card */}
          <div className="p-4 border-2 border-[#0F2C4C] rounded-lg bg-[#FAFBFD] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0F2C4C] text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#0F2C4C]" />
                <span>Standard Blank Estimating Template</span>
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10.5px] px-2 py-0.5 rounded font-bold">
                1-Click Reset
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed m-0">
              Resets all quantities, unit rates, custom items, and measurement take-offs back to a clean blank slate (<span className="font-mono-num">0.00</span>), while retaining the full standardized architectural &amp; civil trade specifications (Excavation, Concrete, Masonry, Blockwork, Finishes, MEP).
            </p>
            <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-slate-500">
                All item inputs cleared and project info reset
              </span>
              <button
                type="button"
                onClick={() => {
                  onLoadBlank();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F2C4C] hover:bg-[#173A5E] text-white rounded-lg font-semibold text-xs cursor-pointer shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E3A008]" />
                <span>Load Blank Template</span>
              </button>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* JSON Export / Import */}
          <div className="pt-2 border-t border-[#D7E1EA]">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#4C5C6E] mb-2">
              Save or Restore Your Project Estimate File
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Export your current bill of quantities to a JSON backup file to save on your computer or share with team members, and restore it at any time.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#B9C7D3] hover:border-[#0F2C4C] text-[#0F2C4C] rounded text-xs font-semibold bg-white cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#0F2C4C]" />
                <span>Save JSON Backup File</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#B9C7D3] hover:border-[#0F2C4C] text-[#0F2C4C] rounded text-xs font-semibold bg-white cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#0F2C4C]" />
                <span>Restore from JSON File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
