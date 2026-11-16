import React from 'react';
import { X, RotateCcw } from 'lucide-react';

interface FilterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRank: string;
  onSelectRank: (rank: string) => void;
  availableRanks: string[];
  selectedSubKet: string;
  onSelectSubKet: (sub: string) => void;
  availableSubKet: string[];
  onResetFilters: () => void;
}

export const FilterSheetModal: React.FC<FilterSheetModalProps> = ({
  isOpen,
  onClose,
  selectedRank,
  onSelectRank,
  availableRanks,
  selectedSubKet,
  onSelectSubKet,
  availableSubKet,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#111b21] border-t sm:border border-[#2a3942] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#3b4a54]" />
        </div>

        <div className="px-5 py-3.5 border-b border-[#2a3942] flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#e9edef]">Filter Pangkat & Keterangan</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Filter"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#8696a0] hover:bg-[#202c33] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Filter Pangkat */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#8696a0] mb-2.5">Pangkat</h4>
            <div className="flex flex-wrap gap-2">
              {availableRanks.map((rank) => {
                const active = selectedRank === rank;
                return (
                  <button
                    key={rank}
                    type="button"
                    onClick={() => onSelectRank(rank)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#00a884] text-[#0b141a] font-bold'
                        : 'bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]'
                    }`}
                  >
                    {rank}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Sub Keterangan */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#8696a0] mb-2.5">Sub Keterangan</h4>
            <div className="flex flex-wrap gap-2">
              {availableSubKet.map((sub) => {
                const active = selectedSubKet === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => onSelectSubKet(sub)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#00a884] text-[#0b141a] font-bold'
                        : 'bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#2a3942] flex items-center gap-3 bg-[#111b21]">
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] text-[14px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#00bf96] text-[#0b141a] text-[14px] font-bold cursor-pointer"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};
