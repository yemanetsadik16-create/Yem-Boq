import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

interface ConfirmDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

export const ConfirmDialogModal: React.FC<ConfirmDialogModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Yes, Load Blank Template',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-[#B9C7D3] max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#D7E1EA] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-[#0F2C4C]">
            <AlertTriangle className="w-5 h-5 text-[#E3A008]" />
            <h3 className="m-0 text-sm sm:text-base font-bold text-[#0A2038]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
            {message}
          </p>

          <div className="p-3 bg-[#FAFBFD] border border-[#D7E1EA] rounded-lg text-xs text-slate-500">
            The full standardized trade item list (Excavation, Concrete, Masonry, Finishes, MEP) will remain available.
          </div>
        </div>

        {/* Actions */}
        <div className="p-3.5 bg-[#F8FAFC] border-t border-[#D7E1EA] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border border-[#B9C7D3] hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2C4C] hover:bg-[#173A5E] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E3A008]" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
