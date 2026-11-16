import React, { useState } from 'react';
import { X, ArrowRightLeft, Check } from 'lucide-react';
import { Personnel, KategoriDinas } from '../types/personnel';
import { inferCategoryAndStatus } from '../utils/personnelLogic';
import { QUICK_APEL_PRESETS, QuickPresetOption } from '../utils/mobileHelpers';

interface QuickMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMove: (newSubKet: string, newCat?: KategoriDinas) => void;
  targetPersonnel: Personnel | null;
  selectedCount: number;
  patentCategories: string[];
  syncedPresets?: QuickPresetOption[];
}

export const QuickMoveModal: React.FC<QuickMoveModalProps> = ({
  isOpen,
  onClose,
  onConfirmMove,
  targetPersonnel,
  selectedCount,
  patentCategories,
  syncedPresets = QUICK_APEL_PRESETS,
}) => {
  const [customSubKet, setCustomSubKet] = useState<string>('');

  if (!isOpen) return null;

  const quickOptions = syncedPresets.filter(
    (p) => p.subKet !== 'KOSONG' && p.subKet !== 'TMMD'
  );
  const filteredPatents = patentCategories.filter(
    (p) => p.trim().toUpperCase() !== 'TMMD'
  );

  const title = targetPersonnel
    ? `Pindahkan Keterangan: ${targetPersonnel.pangkat} ${targetPersonnel.nama}`
    : `Pindahkan ${selectedCount} Personel Terpilih`;

  const handleSelectQuick = (sub: string, cat?: KategoriDinas) => {
    onConfirmMove(sub, cat);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubKet.trim()) return;
    const inferred = inferCategoryAndStatus(customSubKet);
    onConfirmMove(customSubKet.trim().toUpperCase(), inferred.category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Pilih penugasan baru untuk personel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilihan Cepat Posisi Apel / Dinas:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((t) => (
                <button
                  key={t.subKet}
                  type="button"
                  onClick={() => handleSelectQuick(t.subKet, t.category)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border cursor-pointer max-w-full ${
                    t.subKet === 'SIAP OPS'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="whitespace-normal break-words leading-snug">
                      {t.subKet === 'SIAP OPS' ? 'SIAP OPS (HADIR)' : t.label}
                    </span>
                    {targetPersonnel?.sub_keterangan_saat_ini === t.subKet && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Clear from assignment button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleSelectQuick('KOSONG', 'LAIN LAIN')}
              className="w-full py-2 px-3 rounded-lg border border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Hapus / Kosongkan Personel dari Sub Keterangan (Tanpa Penugasan)</span>
            </button>
          </div>

          {/* Patent Categories option */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pindahkan ke Seksi Paten / Staf:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {filteredPatents.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectQuick(p)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 hover:text-white transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-700/80">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Atau Masukkan Keterangan Bebas:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSubKet}
                onChange={(e) => setCustomSubKet(e.target.value)}
                placeholder="Contoh: PAM GUDANG, PATROLI"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={!customSubKet.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-colors"
              >
                Terapkan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
