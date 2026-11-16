import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { DuplicateReport } from '../types/personnel';

interface AlertBannerProps {
  duplicates: DuplicateReport[];
  unaccountedCount: number;
  onOpenDuplicateModal: () => void;
  onQuickResolveAll: () => void;
  onDismiss?: () => void;
  dismissed?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  duplicates,
  unaccountedCount,
  onOpenDuplicateModal,
  onQuickResolveAll,
  onDismiss,
  dismissed,
}) => {
  if (dismissed) return null;
  const hasDuplicates = duplicates.length > 0;
  const hasUnaccounted = unaccountedCount > 0;

  if (!hasDuplicates && !hasUnaccounted) return null;

  const namesList = duplicates.map((d) => d.nama).join(', ');

  return (
    <div className="bg-[#202c33] border-b border-[#2a3942] px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#e9edef] leading-snug">
            {hasDuplicates ? (
              <>
                Ditemukan <strong className="text-amber-300">{duplicates.length} nama ganda</strong> ({namesList}).
              </>
            ) : (
              'Ditemukan personel dengan penugasan belum dialokasikan.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onQuickResolveAll}
            className="min-h-[36px] px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0b141a] text-[12px] font-bold cursor-pointer"
          >
            Selesaikan
          </button>
          <button
            type="button"
            onClick={onOpenDuplicateModal}
            className="min-h-[36px] px-3 py-1 rounded-lg bg-[#111b21] hover:bg-[#182229] text-[#e9edef] text-[12px] font-medium cursor-pointer"
          >
            Detail
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Tutup Peringatan"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#8696a0] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
