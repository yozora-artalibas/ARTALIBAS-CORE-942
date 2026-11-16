import React, { useState, useMemo } from 'react';
import {
  Edit3,
  Trash2,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Shield,
  CheckSquare,
  Square,
  Sparkles,
  History,
  Check,
  X,
  UserPen,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
  BookmarkX,
} from 'lucide-react';
import { Personnel, KategoriDinas } from '../types/personnel';
import { getRankBadgeStyle } from '../utils/personnelLogic';
import { buildSyncedApelOptions } from '../utils/mobileHelpers';

interface PersonnelTableProps {
  personnelList: Personnel[];
  onEdit: (p: Personnel) => void;
  onQuickMove: (p: Personnel) => void;
  onDelete: (id: number) => void;
  onUpdatePersonnelName: (id: number, newName: string) => void;
  onUpdatePersonnelPangkat: (id: number, newPangkat: string) => void;
  onUpdatePersonnelSubKet: (id: number, newSubKet: string) => void;
  onUpdatePersonnelPaten: (id: number, newPaten: string) => void;
  onMoveRow: (fromIndex: number, toIndex: number) => void;
  onViewHistory: (p: Personnel) => void;
  patentCategories: string[];
  subKetList?: string[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSortPangkatNama?: () => void;
  onSortKeteranganApel?: () => void;
  onCopyApelToPaten?: () => void;
  isAdmin?: boolean;
}

export const PersonnelTable: React.FC<PersonnelTableProps> = ({
  personnelList,
  onEdit,
  onQuickMove,
  onDelete,
  onUpdatePersonnelName,
  onUpdatePersonnelPangkat,
  onUpdatePersonnelSubKet,
  onUpdatePersonnelPaten,
  onMoveRow,
  onViewHistory,
  patentCategories,
  subKetList = [],
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onSortPangkatNama,
  onSortKeteranganApel,
  onCopyApelToPaten,
  isAdmin = false,
}) => {

  // Dynamic options synchronized across Apel, Sub Keterangan, and Paten (without TMMD)
  const combinedSubKetOptions = useMemo(() => {
    return buildSyncedApelOptions(subKetList, patentCategories).map((o) => o.subKet);
  }, [patentCategories, subKetList]);

  const combinedPatenOptions = useMemo(() => {
    return combinedSubKetOptions.filter((opt) => opt !== 'KOSONG');
  }, [combinedSubKetOptions]);

  // Inline editing states
  const [editingField, setEditingField] = useState<{ id: number; field: 'nama' | 'pangkat' | 'sub_ket' | 'paten' } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Jump to row state
  const [jumpRowId, setJumpRowId] = useState<number | null>(null);
  const [targetRowNumber, setTargetRowNumber] = useState<string>('');

  // Always show all personnel in Apel table
  const totalItems = personnelList.length;
  const paginatedList = personnelList;

  const allSelected =
    paginatedList.length > 0 && paginatedList.every((p) => selectedIds.has(p.id));

  const handleStartEditing = (personId: number, field: 'nama' | 'pangkat' | 'sub_ket' | 'paten', initialVal: string) => {
    if (field === 'paten' && !isAdmin) return;
    setEditingField({ id: personId, field });
    setEditingValue(initialVal);
  };

  const handleCancelEditing = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleSaveEditing = (personId: number) => {
    if (!editingField) return;
    const trimmed = editingValue.trim();

    if (editingField.field === 'nama') {
      if (trimmed) onUpdatePersonnelName(personId, trimmed);
    } else if (editingField.field === 'pangkat') {
      if (trimmed) onUpdatePersonnelPangkat(personId, trimmed);
    } else if (editingField.field === 'sub_ket') {
      onUpdatePersonnelSubKet(personId, trimmed || 'KOSONG');
    } else if (editingField.field === 'paten') {
      onUpdatePersonnelPaten(personId, trimmed || 'LAIN LAIN');
    }

    setEditingField(null);
    setEditingValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, personId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEditing(personId);
    } else if (e.key === 'Escape') {
      handleCancelEditing();
    }
  };

  // Row move handler
  const handleMoveUp = (currentOverallIndex: number) => {
    if (currentOverallIndex > 0) {
      onMoveRow(currentOverallIndex, currentOverallIndex - 1);
    }
  };

  const handleMoveDown = (currentOverallIndex: number) => {
    if (currentOverallIndex < personnelList.length - 1) {
      onMoveRow(currentOverallIndex, currentOverallIndex + 1);
    }
  };

  const handleExecuteJump = (currentOverallIndex: number) => {
    const targetNum = parseInt(targetRowNumber, 10);
    if (!isNaN(targetNum) && targetNum >= 1 && targetNum <= personnelList.length) {
      const targetIndex = targetNum - 1;
      onMoveRow(currentOverallIndex, targetIndex);
    }
    setJumpRowId(null);
    setTargetRowNumber('');
  };

  const getCategoryBadgeStyle = (cat: KategoriDinas) => {
    switch (cat) {
      case 'SIAP OPS':
        return 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold';
      case 'DINAS DALAM':
        return 'bg-blue-100 text-blue-900 border-blue-400 font-semibold';
      case 'DINAS LUAR':
        return 'bg-orange-100 text-orange-950 border-orange-400 font-semibold';
      case 'DINAS KHUSUS':
        return 'bg-purple-100 text-purple-950 border-purple-400 font-semibold';
      default:
        return 'bg-slate-200 text-slate-800 border-slate-300 font-semibold';
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
      {/* Dedicated Buttons above personnel columns */}
      <div className="px-3.5 py-2.5 bg-slate-850 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {onSortPangkatNama && (
              <button
                type="button"
                id="btn_sort_pangkat_nama"
                onClick={onSortPangkatNama}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-600 shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/40 active:scale-95 cursor-pointer"
                title="Urutkan personel berdasarkan tingkatan kepangkatan militer (Letda -> Prada) lalu abjad nama"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Urutkan sesuai Pangkat & Nama</span>
              </button>
            )}

            {onSortKeteranganApel && (
              <button
                type="button"
                id="btn_sort_keterangan_apel"
                onClick={onSortKeteranganApel}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-emerald-400/50 active:scale-95 cursor-pointer"
                title="Urutkan sesuai Keterangan Apel (Piket Yon, Piket Kompi, dll) tetap sesuai pangkat dan nama"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Urutkan sesuai Keterangan Apel</span>
              </button>
            )}
          </div>

          {isAdmin && onCopyApelToPaten && (
            <div className="pt-0.5">
              <button
                type="button"
                id="btn_copy_apel_to_paten"
                onClick={onCopyApelToPaten}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-amber-400/50 active:scale-95 cursor-pointer border border-amber-500/50"
                title="Pindahkan seluruh keterangan apel saat ini ke database keterangan paten organik"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-200" />
                <span>Pindahkan Keterangan apel ke Keterangan Paten</span>
              </button>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-white font-bold">{personnelList.length}</span> Personel
        </div>
      </div>

      {/* Datalists for real-time sub-keterangan & paten options */}
      <datalist id="sub_ket_options_list">
        {combinedSubKetOptions.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>

      <datalist id="paten_options_list">
        {combinedPatenOptions.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>

      {/* Table Container with Freeze Panes (Vertical Scroll Freeze & Horizontal Freeze) */}
      <div className="overflow-x-auto overflow-y-auto max-h-[72vh] relative">
        <table className="w-full text-left text-xs text-slate-900 divide-y divide-slate-200 border-collapse">
          <thead className="bg-slate-900 text-[10px] font-bold text-slate-300 uppercase tracking-tight sticky top-0 z-20 shadow-md">
            <tr>
              {/* Frozen 1: Checkbox */}
              <th scope="col" className="w-[24px] min-w-[24px] max-w-[24px] px-0.5 py-2 text-center sticky top-0 left-0 z-30 bg-slate-900">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  aria-label="Pilih Semua di Halaman Ini"
                  className="text-slate-400 hover:text-white"
                >
                  {allSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>

              {/* Frozen 2: No Urutan (Selebar 3 huruf) */}
              <th scope="col" className="w-[28px] min-w-[28px] max-w-[28px] px-0.5 py-2 text-center sticky top-0 left-[24px] z-30 bg-slate-900">
                <div className="leading-tight text-center">
                  <div>No</div>
                </div>
              </th>

              {/* Frozen 3: Pangkat (Selebar 8 huruf) */}
              <th scope="col" className="w-[52px] min-w-[52px] max-w-[52px] px-0.5 py-2 text-center sticky top-0 left-[52px] z-30 bg-slate-900">
                <div className="leading-tight text-center">
                  <div>Pangkat</div>
                </div>
              </th>

              {/* Frozen 4: Nama Personel (Warp text seperti excel: "Nama" enter "Personel") */}
              <th scope="col" className="w-[105px] min-w-[105px] max-w-[110px] px-1 py-2 sticky top-0 left-[104px] z-30 bg-slate-900 border-r-2 border-slate-700 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.3)]">
                <div className="leading-tight text-center">
                  <div>Nama</div>
                  <div>Personel</div>
                </div>
              </th>

              {/* Scrollable Right Columns */}
              <th scope="col" className="w-[76px] min-w-[76px] px-1 py-2 text-center">
                <div className="leading-tight text-center">
                  <div>Kategori</div>
                  <div>Utama</div>
                </div>
              </th>
              <th scope="col" className="w-[92px] min-w-[92px] px-1 py-2 text-center">
                <div className="leading-tight text-center">
                  <div>Sub</div>
                  <div>Keterangan</div>
                </div>
              </th>
              <th scope="col" className="w-[82px] min-w-[82px] px-1 py-2 text-center">
                <div className="leading-tight text-center">
                  <div>Paten</div>
                  <div>Organik</div>
                </div>
              </th>
              <th scope="col" className="w-[62px] min-w-[62px] px-1 py-2 text-center">
                <div className="leading-tight text-center">
                  <div>Status</div>
                  <div>Dinas</div>
                </div>
              </th>
              <th scope="col" className="w-[85px] min-w-[85px] px-1 py-2 text-center">
                <div className="leading-tight text-center">
                  <div>Keterangan</div>
                  <div>Khusus</div>
                </div>
              </th>
              <th scope="col" className="w-[98px] min-w-[98px] px-1 py-2 text-center">
                <div className="leading-tight text-center">
                  <div>Aksi</div>
                  <div>Personel</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-500 bg-white">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Shield className="w-8 h-8 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">
                      Tidak ada personel yang sesuai kriteria filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedList.map((person, idx) => {
                const overallIndex = idx;
                const autoNumber = overallIndex + 1;
                const isSelected = selectedIds.has(person.id);
                const isDuplicateNote = person.catatan && person.catatan.toLowerCase().includes('duplikat');

                const isEditingName = editingField?.id === person.id && editingField.field === 'nama';
                const isEditingPangkat = editingField?.id === person.id && editingField.field === 'pangkat';
                const isEditingSubKet = editingField?.id === person.id && editingField.field === 'sub_ket';
                const isEditingPaten = editingField?.id === person.id && editingField.field === 'paten';
                const isJumping = jumpRowId === person.id;

                // Alternating white and light-blue zebra striping for easy mobile reading
                const rowBg = isSelected
                  ? 'bg-emerald-100 text-emerald-950 font-semibold'
                  : idx % 2 === 0
                  ? 'bg-white text-slate-900'
                  : 'bg-sky-50 text-slate-900';

                const stickyBg = isSelected
                  ? 'bg-emerald-100'
                  : idx % 2 === 0
                  ? 'bg-white'
                  : 'bg-sky-50';

                return (
                  <tr
                    key={person.id}
                    className={`transition-colors hover:bg-amber-50/70 ${rowBg} ${
                      isDuplicateNote ? 'border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    {/* Frozen 1: Checkbox */}
                    <td className={`w-[24px] min-w-[24px] max-w-[24px] px-0.5 py-1 text-center sticky left-0 z-10 ${stickyBg}`}>
                      <button
                        type="button"
                        onClick={() => onToggleSelect(person.id)}
                        aria-label={`Pilih ${person.nama}`}
                        className="text-slate-500 hover:text-slate-900 p-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* Frozen 2: No Urutan (Selebar 3 huruf) & Compact Row Reordering */}
                    <td className={`w-[28px] min-w-[28px] max-w-[28px] px-0.5 py-1 text-center font-mono font-bold text-slate-900 sticky left-[24px] z-10 ${stickyBg}`}>
                      {isJumping ? (
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min={1}
                            max={personnelList.length}
                            autoFocus
                            value={targetRowNumber}
                            onChange={(e) => setTargetRowNumber(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleExecuteJump(overallIndex);
                              if (e.key === 'Escape') setJumpRowId(null);
                            }}
                            className="w-6 px-0.5 py-0.5 bg-white border border-emerald-500 text-center text-[10px] rounded text-slate-900 font-bold"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setJumpRowId(person.id);
                              setTargetRowNumber(String(autoNumber));
                            }}
                            className="font-extrabold text-slate-900 hover:text-emerald-700 text-[11px] leading-tight font-mono cursor-pointer"
                            title="Klik untuk pindahkan nomor baris"
                          >
                            {autoNumber}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Frozen 3: Pangkat (Selebar 8 huruf, auto-wrap untuk pangkat perwira / 2 suku kata) */}
                    <td className={`w-[52px] min-w-[52px] max-w-[52px] px-0.5 py-1 sticky left-[52px] z-10 ${stickyBg}`}>
                      {isEditingPangkat ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <input
                            type="text"
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, person.id)}
                            className="px-1 py-0.5 bg-white border border-amber-500 rounded text-[9.5px] text-slate-900 w-11 font-bold text-center"
                            placeholder="Pkt..."
                          />
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEditing(person.id)}
                              className="p-0.5 rounded bg-emerald-600 text-white"
                            >
                              <Check className="w-2.5 h-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditing}
                              className="p-0.5 rounded bg-slate-300 text-slate-700"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditing(person.id, 'pangkat', person.pangkat)}
                          className={`w-full py-0.5 px-0.5 rounded text-[10px] border cursor-pointer hover:opacity-90 transition-opacity text-center font-bold ${getRankBadgeStyle(
                            person.pangkat
                          )}`}
                          title="Klik untuk langsung edit pangkat"
                        >
                          {person.pangkat.includes(' ') ? (
                            <div className="leading-[1.1] flex flex-col items-center justify-center">
                              {person.pangkat.split(' ').map((p, pIdx) => (
                                <span key={pIdx} className="block leading-tight truncate max-w-[48px]">{p}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="leading-tight truncate">{person.pangkat}</div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Frozen 4: Nama Personel (Warp text: panjang otomatis enter ke baris kedua tanpa tambah cell) */}
                    <td className={`w-[105px] min-w-[105px] max-w-[110px] px-1.5 py-1 sticky left-[104px] z-10 ${stickyBg} border-r-2 border-slate-300 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.12)]`}>
                      {isEditingName ? (
                        <div className="flex items-center gap-0.5">
                          <input
                            type="text"
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, person.id)}
                            className="px-1 py-0.5 bg-white border-2 border-emerald-500 rounded text-[10px] text-slate-900 w-full font-bold shadow-xs"
                            placeholder="Nama..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditing(person.id)}
                            className="p-0.5 rounded bg-emerald-600 text-white shrink-0"
                            title="Simpan nama"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditing}
                            className="p-0.5 rounded bg-slate-300 text-slate-700 shrink-0"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditing(person.id, 'nama', person.nama)}
                          className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors text-[10.5px] leading-[1.25] break-words whitespace-normal line-clamp-2"
                          title="Klik untuk langsung edit nama personel"
                        >
                          {person.nama}
                        </div>
                      )}
                    </td>

                    {/* Kategori Utama */}
                    <td className="w-[76px] min-w-[76px] px-1 py-1 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] border leading-[1.15] break-words whitespace-normal max-w-[74px] ${getCategoryBadgeStyle(
                          person.kategori_saat_ini
                        )}`}
                      >
                        {person.kategori_saat_ini}
                      </span>
                    </td>

                    {/* Sub Keterangan (Editable & Geser Baris dengan Tombol Panah) */}
                    <td className="w-[115px] min-w-[115px] px-1 py-1">
                      {isEditingSubKet ? (
                        <div className="flex items-center gap-0.5">
                          <input
                            type="text"
                            list="sub_ket_options_list"
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, person.id)}
                            className="px-1 py-0.5 bg-white border border-sky-500 rounded text-[9.5px] text-slate-900 uppercase w-full font-mono font-bold"
                            placeholder="Sub..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditing(person.id)}
                            className="p-0.5 rounded bg-sky-600 text-white shrink-0 cursor-pointer"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditing}
                            className="p-0.5 rounded bg-slate-300 text-slate-700 shrink-0 cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-center justify-between gap-1">
                          <span
                            onClick={() => handleStartEditing(person.id, 'sub_ket', person.sub_keterangan_saat_ini)}
                            className="font-semibold text-slate-800 bg-white/90 px-1 py-0.5 rounded border border-slate-300 cursor-pointer hover:border-sky-500 hover:text-sky-700 transition-colors shadow-2xs text-[9.5px] leading-[1.2] break-words whitespace-normal line-clamp-2 flex-1"
                            title="Klik untuk ubah sub keterangan ini"
                          >
                            {person.sub_keterangan_saat_ini || '-'}
                          </span>

                          <div className="flex items-center gap-0.5 shrink-0">
                            {/* Tombol Geser Baris Sub Keterangan: Baris paling atas otomatis tanda panah ke bawah saja, baris lainnya panah ke atas */}
                            {overallIndex === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleMoveDown(overallIndex)}
                                className="p-0.5 rounded bg-sky-50 hover:bg-sky-200 text-sky-700 border border-sky-300 shadow-2xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title="Baris paling atas: Geser sub keterangan ke bawah (turun 1 baris)"
                                aria-label="Geser sub keterangan ke bawah"
                              >
                                <ArrowDown className="w-3 h-3 text-sky-700" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMoveUp(overallIndex)}
                                className="p-0.5 rounded bg-sky-50 hover:bg-sky-200 text-sky-700 border border-sky-300 shadow-2xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                title="Geser sub keterangan ke atas (naik 1 baris)"
                                aria-label="Geser sub keterangan ke atas"
                              >
                                <ArrowUp className="w-3 h-3 text-sky-700" />
                              </button>
                            )}

                            {person.sub_keterangan_saat_ini && person.sub_keterangan_saat_ini !== 'KOSONG' && (
                              <button
                                type="button"
                                onClick={() => onUpdatePersonnelSubKet(person.id, 'KOSONG')}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                                title="Hapus sub keterangan"
                              >
                                <BookmarkX className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Paten / Organik (Editable & Deletable) */}
                    <td className="w-[82px] min-w-[82px] px-1 py-1">
                      {isEditingPaten ? (
                        <div className="flex items-center gap-0.5">
                          <input
                            type="text"
                            list="paten_options_list"
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, person.id)}
                            className="px-1 py-0.5 bg-white border border-emerald-500 rounded text-[9.5px] text-slate-900 uppercase w-full font-mono font-bold"
                            placeholder="Paten..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditing(person.id)}
                            className="p-0.5 rounded bg-emerald-600 text-white shrink-0 cursor-pointer"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditing}
                            className="p-0.5 rounded bg-slate-300 text-slate-700 shrink-0 cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-center justify-between gap-0.5">
                          <span
                            onClick={() => {
                              if (isAdmin) handleStartEditing(person.id, 'paten', person.keterangan_paten);
                            }}
                            className={`text-slate-800 font-mono text-[9.5px] font-semibold px-1 py-0.5 rounded bg-white/90 border border-slate-300 shadow-xs leading-[1.2] break-words whitespace-normal line-clamp-2 block w-full ${
                              isAdmin ? 'cursor-pointer hover:text-emerald-700 hover:border-emerald-500' : 'cursor-default opacity-90'
                            }`}
                            title={
                              isAdmin
                                ? 'Klik untuk ubah keterangan paten organik ini (Admin)'
                                : 'Keterangan Paten Organik (Terkunci: Khusus Administrator Utama & Admin)'
                            }
                          >
                            {person.keterangan_paten || '-'}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => onUpdatePersonnelPaten(person.id, 'LAIN LAIN')}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                              title="Reset ke LAIN LAIN"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Dinas */}
                    <td className="w-[62px] min-w-[62px] px-1 py-1 text-center">
                      {person.status_dinas === 'HADIR' ? (
                        <span className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-xs leading-none">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
                          <span>HADIR</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-400 shadow-xs leading-none">
                          <AlertCircle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                          <span>KURANG</span>
                        </span>
                      )}
                    </td>

                    {/* Catatan / Keterangan Khusus */}
                    <td className="w-[85px] min-w-[85px] px-1 py-1 text-[9.5px] leading-[1.2]">
                      {person.catatan ? (
                        <span className={`block break-words whitespace-normal line-clamp-2 ${isDuplicateNote ? 'text-amber-900 font-bold bg-amber-100 px-1 py-0.5 rounded border border-amber-300' : 'text-slate-600 italic'}`}>
                          {person.catatan}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions: Compact 4 buttons for HP */}
                    <td className="w-[98px] min-w-[98px] px-1 py-1 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewHistory(person)}
                          title="Lihat Riwayat Perubahan Personel"
                          className="w-5.5 h-5.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                          aria-label={`Riwayat perubahan ${person.nama}`}
                        >
                          <History className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onQuickMove(person)}
                          title="Pindah Keterangan Bebas"
                          className="w-5.5 h-5.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                          aria-label={`Pindah keterangan ${person.nama}`}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(person)}
                          title="Edit Personel Lengkap"
                          className="w-5.5 h-5.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                          aria-label={`Edit ${person.nama}`}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(person.id)}
                          title="Hapus Personel"
                          className="w-5.5 h-5.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                          aria-label={`Hapus ${person.nama}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-900/90 px-4 py-3 border-t border-slate-700/70 flex items-center justify-between gap-3 text-xs text-slate-400">
        <span className="text-slate-400">
          Total Personel Ditampilkan: <strong className="text-slate-200">{totalItems} Personel</strong>
        </span>
      </div>
    </div>
  );
};
