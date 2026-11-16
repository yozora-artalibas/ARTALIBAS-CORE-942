import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Edit3,
  History,
  ArrowRightLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import { Personnel, KategoriDinas } from '../types/personnel';
import {
  QUICK_APEL_PRESETS,
  QuickPresetOption,
  getShortRankCode,
  getAvatarColorClasses,
} from '../utils/mobileHelpers';

interface PersonnelActionSheetProps {
  person: Personnel | null;
  personIndex: number;
  totalCount: number;
  onClose: () => void;
  onQuickAssign: (personId: number, subKet: string, cat?: KategoriDinas) => void;
  onOpenFullEdit: (person: Personnel) => void;
  onOpenQuickMove: (person: Personnel) => void;
  onViewHistory: (person: Personnel) => void;
  onMoveRow: (fromIndex: number, toIndex: number) => void;
  onDelete: (personId: number) => void;
  isAdmin: boolean;
  syncedPresets?: QuickPresetOption[];
}

export const PersonnelActionSheet: React.FC<PersonnelActionSheetProps> = ({
  person,
  personIndex,
  totalCount,
  onClose,
  onQuickAssign,
  onOpenFullEdit,
  onOpenQuickMove,
  onViewHistory,
  onMoveRow,
  onDelete,
  isAdmin,
  syncedPresets = QUICK_APEL_PRESETS,
}) => {
  const [customInput, setCustomInput] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    setCustomInput('');
    setConfirmDelete(false);
  }, [person?.id]);

  if (!person) return null;

  const isHadir = person.status_dinas === 'HADIR';
  const shortRank = getShortRankCode(person.pangkat);
  const avatarClasses = getAvatarColorClasses(person.pangkat);

  const handlePresetClick = (subKet: string, cat: KategoriDinas) => {
    onQuickAssign(person.id, subKet, cat);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim().toUpperCase();
    if (!trimmed) return;
    onQuickAssign(person.id, trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Aksi untuk ${person.pangkat} ${person.nama}`}
        className="w-full sm:max-w-lg bg-[#111b21] border-t sm:border border-[#2a3942] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#3b4a54]" />
        </div>

        {/* Person Header */}
        <div className="px-5 py-3.5 border-b border-[#2a3942] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${avatarClasses}`}
            >
              {shortRank}
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-bold text-[#e9edef] truncate">
                {person.pangkat} {person.nama}
              </h3>
              <p className="text-[12px] text-[#8696a0] leading-snug break-words mt-0.5">
                <span className={isHadir ? 'text-[#00a884] font-semibold' : 'text-amber-400 font-semibold'}>
                  {person.status_dinas}
                </span>
                {' · '}
                <span>{person.sub_keterangan_saat_ini}</span>
                {' · '}
                <span>Paten: {person.keterangan_paten}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Panel Aksi"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#8696a0] hover:bg-[#202c33] hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {person.catatan && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#202c33] text-[13px] text-amber-200">
              Catatan: {person.catatan}
            </div>
          )}

          {/* 1-Tap Quick Status Grid */}
          <div>
            <p className="text-[12px] font-semibold text-[#8696a0] mb-2.5">
              Ubah Keterangan Apel (1 Ketuk)
            </p>
            <div className="flex flex-wrap gap-2">
              {syncedPresets.map((preset) => {
                const isCurrent =
                  person.sub_keterangan_saat_ini.toUpperCase() === preset.subKet.toUpperCase();
                return (
                  <button
                    key={preset.subKet}
                    type="button"
                    onClick={() => handlePresetClick(preset.subKet, preset.category)}
                    className={`min-h-[42px] max-w-full px-3.5 py-2 rounded-xl text-[13px] font-semibold text-left inline-flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#00a884] text-[#0b141a]'
                        : preset.subKet === 'SIAP OPS'
                        ? 'bg-[#00a884]/15 text-[#00a884] hover:bg-[#00a884]/25'
                        : preset.subKet === 'KOSONG'
                        ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                        : 'bg-[#202c33] text-[#e9edef] hover:bg-[#2a3942]'
                    }`}
                  >
                    <span className="whitespace-normal break-words leading-snug">{preset.label}</span>
                    {isCurrent && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Free Text Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <label className="block text-[12px] font-semibold text-[#8696a0]">
              Atau Ketik Keterangan Lain
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ketik keterangan lain..."
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#202c33] border border-[#2a3942] text-[14px] text-[#e9edef] placeholder-[#8696a0] placeholder:normal-case uppercase focus:outline-none focus:border-[#00a884]"
              />
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#00bf96] disabled:opacity-40 text-[#0b141a] text-[13px] font-bold cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>

          {/* Other Actions List */}
          <div className="border-t border-[#2a3942] pt-2 divide-y divide-[#202c33]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQuickMove(person);
              }}
              className="w-full min-h-[46px] px-2 py-2.5 flex items-center gap-3 text-[14px] text-[#e9edef] hover:bg-[#202c33] rounded-lg transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-[#00a884] shrink-0" />
              <span>Pilih dari Seksi Paten / Daftar Lengkap</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullEdit(person);
              }}
              className="w-full min-h-[46px] px-2 py-2.5 flex items-center gap-3 text-[14px] text-[#e9edef] hover:bg-[#202c33] rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Edit Data Personel Lengkap</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewHistory(person);
              }}
              className="w-full min-h-[46px] px-2 py-2.5 flex items-center gap-3 text-[14px] text-[#e9edef] hover:bg-[#202c33] rounded-lg transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-[#aebac1] shrink-0" />
              <span>Lihat Riwayat Perubahan</span>
            </button>

            {personIndex >= 0 && (
              <div className="py-2 flex items-center justify-between gap-2 px-2">
                <span className="text-[13px] text-[#8696a0] tabular-nums">
                  Urutan Baris (#{personIndex + 1})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={personIndex <= 0}
                    onClick={() => {
                      onMoveRow(personIndex, personIndex - 1);
                      onClose();
                    }}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] disabled:opacity-40 text-[13px] text-[#e9edef] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Naik</span>
                  </button>
                  <button
                    type="button"
                    disabled={personIndex >= totalCount - 1}
                    onClick={() => {
                      onMoveRow(personIndex, personIndex + 1);
                      onClose();
                    }}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] disabled:opacity-40 text-[13px] text-[#e9edef] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Turun</span>
                  </button>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="pt-2">
                {confirmDelete ? (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                    <span className="text-[13px] text-rose-200 font-medium">
                      Hapus personel ini permanen?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="min-h-[38px] px-3 rounded-lg bg-[#202c33] text-[12px] text-[#e9edef] cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(person.id);
                          onClose();
                        }}
                        className="min-h-[38px] px-3 rounded-lg bg-rose-600 text-[12px] font-bold text-white cursor-pointer"
                      >
                        Ya, Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full min-h-[46px] px-2 py-2.5 flex items-center gap-3 text-[14px] text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>Hapus Personel dari Database</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
