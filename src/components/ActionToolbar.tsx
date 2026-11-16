import React from 'react';
import { RotateCcw, UserPlus, FolderPlus, ArrowUpDown, FileText, Sparkles } from 'lucide-react';

interface ActionToolbarProps {
  onResetAllToPaten: () => void;
  onOpenAddPersonnel: () => void;
  onOpenAddCategory: () => void;
  onOpenExport: () => void;
  selectedCount?: number;
  onBatchMove?: () => void;
  isAdmin?: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onResetAllToPaten,
  onOpenAddPersonnel,
  onOpenAddCategory,
  onOpenExport,
  selectedCount = 0,
  onBatchMove,
  isAdmin = false,
}) => {
  return (
    <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Button 1: Reset to Patent */}
        <button
          type="button"
          id="btn_reset_paten"
          onClick={onResetAllToPaten}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-rose-500/40 active:scale-95 cursor-pointer"
          title="Kembalikan seluruh personel ke bagian organik / paten masing-masing"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kembalikan Semua Personel ke Keterangan Paten</span>
        </button>

        {/* Button 2: Primary - Add Total Personnel (Admin Only) */}
        {isAdmin ? (
          <button
            type="button"
            id="btn_add_total"
            onClick={onOpenAddPersonnel}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-blue-500/40 active:scale-95 cursor-pointer"
            title="Tambah personel baru ke database induk Kompi Markas"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Total Paten</span>
          </button>
        ) : (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900/60 text-slate-400 border border-slate-700 cursor-not-allowed"
            title="Akses Dibatasi: Hanya Administrator Utama & Admin yang berhak menambah personel ke database paten"
          >
            <span>🔒 Tambah Paten (Khusus Admin)</span>
          </div>
        )}

        {/* Button 3: Success - Add Patent Category / Sub Keterangan */}
        <button
          type="button"
          id="btn_add_paten_cat"
          onClick={onOpenAddCategory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/40 active:scale-95"
          title="Kelola keterangan paten dan sub keterangan apel"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Kelola Keterangan Paten & Sub Keterangan</span>
        </button>
      </div>

      {/* Military Utility Tools */}
      <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-700/60">
        {selectedCount > 0 && onBatchMove && (
          <button
            type="button"
            onClick={onBatchMove}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pindah {selectedCount} Personel Dipilih</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-700/70 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-sm transition-colors"
          title="Salin rekapitulasi apel harian dalam format pesan TNI / WhatsApp"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>Salin Format Apel</span>
        </button>
      </div>
    </div>
  );
};
