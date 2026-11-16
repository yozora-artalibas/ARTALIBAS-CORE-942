import React from 'react';
import { Check, CheckCheck, Shield, X } from 'lucide-react';
import { Personnel } from '../types/personnel';
import { getShortRankCode, getAvatarColorClasses } from '../utils/mobileHelpers';

interface PersonnelChatListProps {
  personnelList: Personnel[];
  isSelectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onCancelSelectionMode: () => void;
  onSelectPerson: (person: Personnel, index: number) => void;
}

export const PersonnelChatList: React.FC<PersonnelChatListProps> = ({
  personnelList,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onCancelSelectionMode,
  onSelectPerson,
}) => {
  const allDisplayedSelected =
    personnelList.length > 0 && personnelList.every((p) => selectedIds.has(p.id));

  return (
    <div className="bg-[#0b141a]">
      {/* Multi-Select Mode Bar */}
      {isSelectionMode && (
        <div className="sticky top-14 z-20 bg-[#202c33] border-b border-[#2a3942] px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancelSelectionMode}
              aria-label="Batalkan Pilih Banyak"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#aebac1] hover:bg-[#2a3942] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[14px] font-semibold text-[#e9edef] tabular-nums">
              {selectedIds.size} dipilih
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="min-h-[36px] px-3 py-1 rounded-lg bg-[#111b21] text-[13px] font-medium text-[#00a884] hover:bg-[#182229] cursor-pointer"
          >
            {allDisplayedSelected ? 'Batal Semua' : 'Pilih Semua'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {personnelList.length === 0 ? (
        <div className="py-16 px-6 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#202c33] flex items-center justify-center text-[#8696a0]">
            <Shield className="w-7 h-7" />
          </div>
          <p className="text-[15px] font-semibold text-[#e9edef]">
            Personel tidak ditemukan
          </p>
          <p className="text-[13px] text-[#8696a0] max-w-xs">
            Tidak ada personel yang sesuai dengan pencarian atau filter aktif saat ini.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#202c33]">
          {personnelList.map((person, idx) => {
            const isSelected = selectedIds.has(person.id);
            const isHadir = person.status_dinas === 'HADIR';
            const shortRank = getShortRankCode(person.pangkat);
            const avatarClasses = getAvatarColorClasses(person.pangkat);

            return (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  if (isSelectionMode) {
                    onToggleSelect(person.id);
                  } else {
                    onSelectPerson(person, idx);
                  }
                }}
                aria-label={`${person.pangkat} ${person.nama}, ${person.sub_keterangan_saat_ini}, status ${person.status_dinas}`}
                className={`w-full flex items-center gap-3.5 px-4 py-3 text-left transition-colors cursor-pointer min-h-[68px] ${
                  isSelected
                    ? 'bg-[#00a884]/15 hover:bg-[#00a884]/20'
                    : 'hover:bg-[#111b21] active:bg-[#202c33]'
                }`}
              >
                {/* Left Rank Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-[10px] font-bold tracking-tight ${avatarClasses}`}
                  >
                    {shortRank}
                  </div>
                  {isSelectionMode && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0b141a] ${
                        isSelected ? 'bg-[#00a884] text-[#0b141a]' : 'bg-[#202c33] text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Middle: Name & Sub-keterangan metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold text-[#e9edef] truncate">
                      {person.pangkat} {person.nama}
                    </span>
                    <span
                      className={`text-[11px] font-bold shrink-0 inline-flex items-center gap-1 ${
                        isHadir ? 'text-[#00a884]' : 'text-amber-400'
                      }`}
                    >
                      {isHadir ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : null}
                      <span>{person.status_dinas}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-[13px] text-[#8696a0] truncate">
                      <span className="text-[#aebac1] font-medium">{person.sub_keterangan_saat_ini}</span>
                      <span aria-hidden="true"> · </span>
                      <span>Paten: {person.keterangan_paten}</span>
                      {person.catatan ? (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span className="text-amber-300/90">{person.catatan}</span>
                        </>
                      ) : null}
                    </p>
                    <span className="text-[11px] text-[#8696a0] font-mono tabular-nums shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

        </div>
      )}
    </div>
  );
};
