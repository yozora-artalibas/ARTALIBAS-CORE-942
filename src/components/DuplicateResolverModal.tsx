import React from 'react';
import { X, AlertTriangle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { DuplicateReport, Personnel } from '../types/personnel';

interface DuplicateResolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: DuplicateReport[];
  onResolveSingle: (nama: string, targetSubKet: string, targetKategori: string, targetStatus: string) => void;
  onResolveAllAutomatic: () => void;
}

export const DuplicateResolverModal: React.FC<DuplicateResolverModalProps> = ({
  isOpen,
  onClose,
  duplicates,
  onResolveSingle,
  onResolveAllAutomatic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Resolusi Audit Duplikasi Nama</h3>
              <p className="text-xs text-slate-400">Penyelarasan catatan kehadiran apel ganda</p>
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

        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed">
            Sistem mendeteksi personel tercatat di dua pos/seksi sekaligus. Pilih posisi riil personel di lapangan apel pagi ini, atau gunakan tombol otomatis.
          </div>

          <div className="space-y-3">
            {duplicates.map((dup) => {
              const isZulfi = dup.nama.toLowerCase().includes('zulfi');
              const isArif = dup.nama.toLowerCase().includes('arif');

              return (
                <div
                  key={dup.nama}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{dup.nama}</span>
                    </span>
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60">
                      Ganda Terdeteksi
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Posisi tercatat: <span className="font-mono text-slate-200">{dup.posisi_tercatat.join(' vs ')}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/60">
                    <span className="text-xs text-slate-400">Pilih Posisi Sah:</span>

                    {/* Option 1: SIAP OPS */}
                    <button
                      type="button"
                      onClick={() =>
                        onResolveSingle(dup.nama, 'SIAP OPS', 'SIAP OPS', 'HADIR')
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                    >
                      Tetapkan di SIAP OPS (Hadir)
                    </button>

                    {/* Option 2: Organik / Staf */}
                    <button
                      type="button"
                      onClick={() =>
                        onResolveSingle(
                          dup.nama,
                          isZulfi ? 'STAF PERS' : 'PAM PALASARI',
                          isZulfi ? 'LAIN LAIN' : 'DINAS LUAR',
                          'KURANG'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors"
                    >
                      Tetapkan di {isZulfi ? 'STAF PERS' : 'PAM PALASARI'} (Kurang)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onResolveAllAutomatic();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selesaikan Semua Otomatis (Tetapkan Siap Ops)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
